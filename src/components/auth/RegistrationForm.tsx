import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Loader2, ArrowLeft, Building } from 'lucide-react';
import type { AppRole } from '@/types/auth';

interface RegistrationFormProps {
  role: AppRole;
  onBack: () => void;
  onSubmit: (data: RegistrationData) => Promise<void>;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  institutionCode: string;
  department?: string;
  rollNumber?: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ role, onBack, onSubmit }) => {
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    institutionCode: '',
    department: '',
    rollNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const roleNames: Record<AppRole, string> = {
    master_owner: 'Master Owner',
    super_admin: 'Super Admin',
    admin: 'Admin',
    staff: 'Faculty/Staff',
    student: 'Student',
    parent: 'Parent',
    support: 'Support',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const needsDepartment = ['admin', 'staff', 'student'].includes(role);
  const needsRollNumber = role === 'student';

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
      
      <Card className="glass w-full max-w-md animate-scale-in relative">
        <CardHeader className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-2xl font-bold">
            Register as {roleNames[role]}
          </CardTitle>
          <CardDescription>
            Create your account to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="pl-10 glass"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 glass"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionCode">College/Institution Code</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="institutionCode"
                  type="text"
                  placeholder="Enter college code (e.g., bru4j)"
                  value={formData.institutionCode}
                  onChange={(e) => setFormData({ ...formData, institutionCode: e.target.value.toLowerCase() })}
                  className="pl-10 glass"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {role === 'super_admin' 
                  ? 'Create a unique code for your institution'
                  : 'Enter the code provided by your institution'}
              </p>
            </div>

            {needsDepartment && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="department"
                    type="text"
                    placeholder="Enter your department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="pl-10 glass"
                    required
                  />
                </div>
              </div>
            )}

            {needsRollNumber && (
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  placeholder="Enter your roll number"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="glass"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 glass"
                  required
                  minLength={6}
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
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 glass"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full btn-luxury" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Creating Account...' : 'Continue to Verification'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
