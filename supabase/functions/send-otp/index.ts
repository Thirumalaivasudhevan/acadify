import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  type: "registration" | "password_reset";
  userId?: string;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, userId }: OTPRequest = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: "Email and type are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store OTP in database if userId provided
    if (userId) {
      // Delete any existing OTPs for this user and type
      await supabase
        .from("otp_verifications")
        .delete()
        .eq("user_id", userId)
        .eq("verification_type", type);

      // Insert new OTP
      const { error: insertError } = await supabase
        .from("otp_verifications")
        .insert({
          user_id: userId,
          otp_code: otp,
          otp_expiry: expiresAt.toISOString(),
          verification_type: type,
          is_verified: false,
        });

      if (insertError) {
        console.error("Failed to store OTP:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to generate OTP" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Send email
    const subject = type === "registration" 
      ? "Verify your Acadify account" 
      : "Reset your Acadify password";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #6366f1; margin: 0; font-size: 28px; }
            .otp-box { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; }
            .otp-code { font-size: 36px; letter-spacing: 8px; font-weight: bold; margin: 0; }
            .message { color: #52525b; line-height: 1.6; }
            .footer { text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 30px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 20px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>🎓 Acadify</h1>
            </div>
            <p class="message">
              ${type === "registration" 
                ? "Welcome to Acadify! Please verify your email address using the code below:" 
                : "We received a request to reset your password. Use the code below to proceed:"}
            </p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
            </div>
            <p class="message">This code will expire in <strong>10 minutes</strong>.</p>
            <div class="warning">
              ⚠️ If you didn't request this, please ignore this email or contact support.
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Acadify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "Acadify <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`OTP sent successfully to ${email} for ${type}`);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
