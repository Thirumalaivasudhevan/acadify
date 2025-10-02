import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, Building2, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ApprovalRequestCard from '@/components/approval/ApprovalRequestCard';
import type { ApprovalRequest } from '@/types/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminDashboard = () => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovalRequests();
  }, []);

  const fetchApprovalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          user_profile:profiles!approval_requests_user_id_fkey(full_name, email, department)
        `)
        .eq('status', 'pending')
        .in('requested_role', ['staff', 'admin'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests: ApprovalRequest[] = (data || []).map((req: any) => ({
        id: req.id,
        user_id: req.user_id,
        approver_id: req.approver_id,
        requested_role: req.requested_role,
        status: req.status,
        remarks: req.remarks,
        created_at: req.created_at,
        updated_at: req.updated_at,
        user_profile: req.user_profile,
      }));

      setApprovalRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching approval requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your organization</p>
      </div>

      {approvalRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Pending Approvals</h2>
          </div>
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              You have {approvalRequests.length} registration request{approvalRequests.length !== 1 ? 's' : ''} awaiting approval
            </AlertDescription>
          </Alert>
          <div className="grid gap-4 md:grid-cols-2">
            {approvalRequests.map((request) => (
              <ApprovalRequestCard
                key={request.id}
                request={request}
                onApprove={fetchApprovalRequests}
                onReject={fetchApprovalRequests}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active faculty</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <button className="btn-luxury text-left p-4">
            <h3 className="font-semibold">Manage Departments</h3>
            <p className="text-sm text-muted-foreground">Add or edit departments</p>
          </button>
          <button className="btn-luxury text-left p-4">
            <h3 className="font-semibold">Manage Faculty</h3>
            <p className="text-sm text-muted-foreground">Add or edit faculty members</p>
          </button>
          <button className="btn-luxury text-left p-4">
            <h3 className="font-semibold">View Analytics</h3>
            <p className="text-sm text-muted-foreground">Performance insights</p>
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
