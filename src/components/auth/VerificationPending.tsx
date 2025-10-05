import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, XCircle, CheckCircle2 } from 'lucide-react';
import type { AppRole } from '@/types/auth';

interface VerificationPendingProps {
  role: AppRole;
  status: 'pending' | 'rejected';
  onLogout: () => void;
}

const VerificationPending: React.FC<VerificationPendingProps> = ({ role, status, onLogout }) => {
  const approverRole: Record<AppRole, string> = {
    master_owner: 'System Access',
    super_admin: 'Master Owner',
    admin: 'Super Admin',
    staff: 'Admin',
    student: 'Faculty',
    parent: 'Faculty (via Student)',
    support: 'Super Admin',
  };

  const roleNames: Record<AppRole, string> = {
    master_owner: 'Master Owner',
    super_admin: 'Super Admin',
    admin: 'Admin',
    staff: 'Faculty/Staff',
    student: 'Student',
    parent: 'Parent',
    support: 'Support',
  };

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
      
      <Card className="glass w-full max-w-md animate-scale-in relative">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`p-3 rounded-full ${status === 'rejected' ? 'bg-red-500/20' : 'bg-amber-500/20'} animate-glow`}>
              {status === 'rejected' ? (
                <XCircle className="h-12 w-12 text-red-500" />
              ) : (
                <Clock className="h-12 w-12 text-amber-500" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {status === 'rejected' ? 'Registration Rejected' : 'Verification Processing'}
            </CardTitle>
            <CardDescription className="text-base">
              {status === 'rejected' 
                ? 'Your registration request has been rejected'
                : `Your ${roleNames[role]} account is under verification`
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === 'pending' ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Email Verified</p>
                    <p className="text-xs text-muted-foreground">Your email has been successfully verified</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Awaiting Approval</p>
                    <p className="text-xs text-muted-foreground">
                      Your registration is pending approval from {approverRole[role]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-center">
                  You will be notified via email once your account is approved. This usually takes 24-48 hours.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-center">
                  Your registration request was rejected. Please contact your institution's {approverRole[role]} for more information.
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationPending;
