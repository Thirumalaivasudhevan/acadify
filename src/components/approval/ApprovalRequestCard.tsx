import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, User, Mail, Calendar, Building } from 'lucide-react';
import type { ApprovalRequest } from '@/types/auth';

interface ApprovalRequestCardProps {
  request: ApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
}

const ApprovalRequestCard: React.FC<ApprovalRequestCardProps> = ({
  request,
  onApprove,
  onReject,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const { toast } = useToast();

  const roleNames: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    staff: 'Faculty/Staff',
    student: 'Student',
    parent: 'Parent',
    support: 'Support',
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('approve_user', {
        _user_id: request.user_id,
        _approver_id: user.id,
        _request_id: request.id,
      });

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: "User has been approved and can now access the system.",
      });
      onApprove();
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectRemarks.trim()) {
      toast({
        title: "Remarks Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('reject_user', {
        _user_id: request.user_id,
        _approver_id: user.id,
        _request_id: request.id,
        _remarks: rejectRemarks,
      });

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "User has been notified of the rejection.",
      });
      onReject();
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {roleNames[request.requested_role]} Registration
          </CardTitle>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Name:</span>
            <span>{request.user_profile?.full_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Email:</span>
            <span>{request.user_profile?.email}</span>
          </div>
          
          {request.user_profile?.department && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Department:</span>
              <span>{request.user_profile.department}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Requested:</span>
            <span>{new Date(request.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {!showRejectForm ? (
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => setShowRejectForm(true)}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              className="glass"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
              >
                Confirm Rejection
              </Button>
              <Button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectRemarks('');
                }}
                disabled={isProcessing}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalRequestCard;
