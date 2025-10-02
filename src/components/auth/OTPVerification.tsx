import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onVerify, onResend }) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const success = await onVerify(otp);
      if (success) {
        toast({
          title: "Verified!",
          description: "Your email has been verified successfully.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid OTP. Please try again.",
          variant: "destructive"
        });
        setOtp('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during verification.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setTimer(60);
      setCanResend(false);
      toast({
        title: "OTP Sent",
        description: "A new OTP has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
      
      <Card className="glass w-full max-w-md animate-scale-in relative">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/20 animate-glow">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to<br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
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
              onClick={handleVerify}
              className="w-full btn-luxury"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify OTP
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              {canResend ? (
                <Button
                  variant="link"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend in {timer}s
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
