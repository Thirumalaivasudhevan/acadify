import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  userId: string;
  otp: string;
  type: "registration" | "password_reset";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, otp, type }: VerifyOTPRequest = await req.json();

    if (!userId || !otp || !type) {
      return new Response(
        JSON.stringify({ error: "userId, otp, and type are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("user_id", userId)
      .eq("verification_type", type)
      .eq("is_verified", false)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "No pending verification found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check expiry
    if (new Date(otpRecord.otp_expiry) < new Date()) {
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from("otp_verifications")
      .update({ is_verified: true })
      .eq("id", otpRecord.id);

    // If registration, update profile verification status
    if (type === "registration") {
      await supabase
        .from("profiles")
        .update({ is_verified: true })
        .eq("user_id", userId);
    }

    console.log(`OTP verified successfully for user ${userId}, type: ${type}`);

    return new Response(
      JSON.stringify({ success: true, message: "OTP verified successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
