import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';
import { CalendarDays, UserCheck, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';

interface AttendanceRecord {
  date: string;
  period: number;
  subject: string;
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

interface AttendanceStats {
  total_classes: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}

const MyAttendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAttendanceData();
    }
  }, [user]);

  const fetchAttendanceData = async () => {
    if (!user) return;

    try {
      // Fetch attendance records
      const { data: records } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', user.id)
        .order('date', { ascending: false });

      if (records) {
        setAttendanceRecords(records.map(record => ({
          date: record.date,
          period: record.period,
          subject: record.subject,
          status: record.status as 'Present' | 'Absent' | 'Late',
          remarks: record.remarks || undefined
        })));
      }

      // Calculate stats
      const totalClasses = records?.length || 0;
      const presentCount = records?.filter(r => r.status === 'Present').length || 0;
      const absentCount = records?.filter(r => r.status === 'Absent').length || 0;
      const lateCount = records?.filter(r => r.status === 'Late').length || 0;
      const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

      setStats({
        total_classes: totalClasses,
        present_count: presentCount,
        absent_count: absentCount,
        late_count: lateCount,
        attendance_percentage: attendancePercentage
      });
    } catch (error) {
      // Error handling without sensitive logging
      console.log('Failed to fetch attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: 'Present' | 'Absent' | 'Late') => {
    switch (status) {
      case 'Present': return 'default';
      case 'Absent': return 'destructive';
      case 'Late': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: 'Present' | 'Absent' | 'Late') => {
    switch (status) {
      case 'Present': return <UserCheck className="h-4 w-4" />;
      case 'Absent': return <AlertCircle className="h-4 w-4" />;
      case 'Late': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Attendance</h2>
        <p className="text-muted-foreground">
          Track your attendance records and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.total_classes || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.present_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.absent_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Attendance %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.attendance_percentage || 0}%
            </div>
            <Progress 
              value={stats?.attendance_percentage || 0} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <span>Attendance Records</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No attendance records found</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record, index) => (
                    <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        Period {record.period}
                      </TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(record.status)} className="flex items-center w-fit">
                          {getStatusIcon(record.status)}
                          <span className="ml-1">{record.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {record.remarks || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAttendance;