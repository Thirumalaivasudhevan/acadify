import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { GraduationCap, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import type { AppRole } from '../../types/auth';
import RoleSelection from './RoleSelection';
import RegistrationForm, { RegistrationData } from './RegistrationForm';
import OTPVerification from './OTPVerification';
import VerificationPending from './VerificationPending';

const LoginPage = () => {
  const [view, setView] = useState<'login' | 'role-select' | 'register' | 'otp' | 'pending'>('login');
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signUp, isLoading, approvalStatus } = useAuth();
  const { toast } = useToast();


  // If user is logged in but not approved, show verification pending
  if (approvalStatus === 'pending' || approvalStatus === 'rejected') {
    return (
      <VerificationPending
        role={selectedRole || 'student'}
        status={approvalStatus}
        onLogout={() => {
          // Implement logout
          setView('login');
        }}
      />
    );
  }

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setView('register');
  };

  const handleRegistrationSubmit = async (data: RegistrationData) => {
    setRegistrationData(data);
    
    // For now, skip OTP and proceed directly to signup
    // In production, you would send OTP here
    const result = await signUp(
      data.email,
      data.password,
      data.fullName,
      selectedRole!,
      data.institutionCode,
      data.department
    );
    
    if (result.success) {
      toast({
        title: "Registration Successful!",
        description: "Your registration is pending approval. You'll be notified via email.",
      });
      setView('pending');
    } else {
      throw new Error(result.error || 'Registration failed');
    }
  };

  const handleOTPVerify = async (otp: string): Promise<boolean> => {
    // Implement OTP verification logic
    // For now, always return true
    return true;
  };

  const handleOTPResend = async () => {
    // Implement OTP resend logic
    toast({
      title: "OTP Sent",
      description: "A new OTP has been sent to your email.",
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password);
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in."
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show appropriate view based on state
  if (view === 'role-select') {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  if (view === 'register' && selectedRole) {
    return (
      <RegistrationForm
        role={selectedRole}
        onBack={() => setView('role-select')}
        onSubmit={handleRegistrationSubmit}
      />
    );
  }

  if (view === 'otp' && registrationData) {
    return (
      <OTPVerification
        email={registrationData.email}
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
      />
    );
  }

  if (view === 'pending' && selectedRole) {
    return (
      <VerificationPending
        role={selectedRole}
        status="pending"
        onLogout={() => setView('login')}
      />
    );
  }

  // Login view
  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
      
      <Card className="glass w-full max-w-md animate-scale-in relative">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/20 animate-glow">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center animate-fade-in">Acadify</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your dashboard
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 glass"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 glass"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full btn-luxury" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-center space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  New user?
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setView('role-select')}
              className="w-full"
            >
              Register for an Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;