import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2, ArrowLeft, KeyRound, CheckCircle2, Lock } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
}

type Step = 'email' | 'otp' | 'newPassword' | 'success';

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Timer for resend
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if user exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();

      if (!profile) {
        toast({
          title: "Email not found",
          description: "No account exists with this email address.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      setUserId(profile.user_id);

      // Send OTP
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { email, type: 'password_reset', userId: profile.user_id }
      });

      if (error) throw error;

      toast({
        title: "OTP Sent!",
        description: "Check your email for the verification code.",
      });
      setStep('otp');
      setTimer(60);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!userId) throw new Error('User not found');

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { userId, otp, type: 'password_reset' }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "OTP Verified!",
        description: "Now set your new password.",
      });
      setStep('newPassword');
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive"
      });
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 14) {
      toast({
        title: "Password too short",
        description: "Password must be at least 14 characters.",
        variant: "destructive"
      });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};:,.<>])/.test(newPassword)) {
      toast({
        title: "Weak password",
        description: "Password must contain uppercase, lowercase, number, and special character.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use Supabase's password reset via magic link approach
      // First send a password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`
      });

      if (error) throw error;

      setStep('success');
      toast({
        title: "Reset Link Sent!",
        description: "Check your email to complete the password reset.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();

      if (!profile) throw new Error('User not found');

      const { error } = await supabase.functions.invoke('send-otp', {
        body: { email, type: 'password_reset', userId: profile.user_id }
      });

      if (error) throw error;

      toast({
        title: "OTP Resent!",
        description: "Check your email for the new code.",
      });
      setTimer(60);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
      
      <Card className="glass w-full max-w-md animate-scale-in relative">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/20 animate-glow">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {step === 'email' && 'Reset Password'}
              {step === 'otp' && 'Verify Email'}
              {step === 'newPassword' && 'New Password'}
              {step === 'success' && 'Success!'}
            </CardTitle>
            <CardDescription>
              {step === 'email' && 'Enter your email to receive a verification code'}
              {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
              {step === 'newPassword' && 'Create a strong new password'}
              {step === 'success' && 'Your password has been reset'}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full btn-luxury" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Send Verification Code
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                <Button
                  onClick={handleVerifyOTP}
                  className="w-full btn-luxury"
                  disabled={otp.length !== 6 || isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Verify Code
                </Button>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-sm text-muted-foreground">Resend in {timer}s</p>
                  ) : (
                    <Button variant="link" onClick={handleResendOTP} disabled={isLoading}>
                      Resend Code
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Password must be 14+ characters with uppercase, lowercase, number, and special character.
              </p>
              
              <Button type="submit" className="w-full btn-luxury" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Reset Password
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <p className="text-muted-foreground">You can now log in with your new password.</p>
              <Button onClick={onBack} className="w-full btn-luxury">
                Back to Login
              </Button>
            </div>
          )}

          {step !== 'success' && (
            <Button variant="ghost" onClick={onBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
