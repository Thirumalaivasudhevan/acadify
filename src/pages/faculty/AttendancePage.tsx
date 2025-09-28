import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, Users, Download, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { students, departments, faculties } from '../../data/mockData';
import { Student, Department } from '../../types/college';

interface AttendanceRecord {
  studentId: string;
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<any>(null);
  const [department, setDepartment] = useState<Department | null>(null);

  // Initialize faculty and department data
  useEffect(() => {
    if (user && user.role === 'Faculty') {
      // Find faculty by user ID (mock data uses user.id)
      const currentFaculty = faculties.find(f => f.id === user.id);
      setFaculty(currentFaculty);
      
      if (currentFaculty) {
        const dept = departments.find(d => d.name === currentFaculty.department);
        setDepartment(dept);
      }
    }
  }, [user]);

  // Filter students by faculty's department
  useEffect(() => {
    if (department) {
      const deptStudents = students.filter(student => student.deptId === department.id);
      const filtered = deptStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
      
      // Initialize attendance records for filtered students
      const initialRecords: Record<string, AttendanceRecord> = {};
      filtered.forEach(student => {
        initialRecords[student.id] = {
          studentId: student.id,
          status: 'Present'
        };
      });
      setAttendanceRecords(initialRecords);
    }
  }, [department, searchTerm]);

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const markAllPresent = () => {
    const newRecords: Record<string, AttendanceRecord> = {};
    filteredStudents.forEach(student => {
      newRecords[student.id] = {
        studentId: student.id,
        status: 'Present'
      };
    });
    setAttendanceRecords(newRecords);
  };

  const markAllAbsent = () => {
    const newRecords: Record<string, AttendanceRecord> = {};
    filteredStudents.forEach(student => {
      newRecords[student.id] = {
        studentId: student.id,
        status: 'Absent'
      };
    });
    setAttendanceRecords(newRecords);
  };

  const submitAttendance = () => {
    // Here you would typically save to database
    console.log('Submitting attendance:', {
      date: selectedDate,
      period: selectedPeriod,
      subject: selectedSubject,
      records: attendanceRecords
    });
    
    // Show success message
    alert('Attendance submitted successfully!');
  };

  const exportAttendance = () => {
    // Export functionality
    const csvData = filteredStudents.map(student => {
      const record = attendanceRecords[student.id];
      return `${student.rollNo},${student.name},${record?.status || 'Present'},${record?.remarks || ''}`;
    }).join('\n');
    
    const header = 'Roll No,Name,Status,Remarks\n';
    const blob = new Blob([header + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(selectedDate, 'yyyy-MM-dd')}_period${selectedPeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Absent':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'Late':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Present':
        return 'default' as const;
      case 'Absent':
        return 'destructive' as const;
      case 'Late':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const presentCount = Object.values(attendanceRecords).filter(r => r.status === 'Present').length;
  const absentCount = Object.values(attendanceRecords).filter(r => r.status === 'Absent').length;
  const lateCount = Object.values(attendanceRecords).filter(r => r.status === 'Late').length;

  if (!department || !faculty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Attendance Management</h1>
          <p className="text-muted-foreground">
            Department: {department.name} | Faculty: {faculty.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={exportAttendance} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date and Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Class Details
          </CardTitle>
          <CardDescription>
            Select the date, period, and subject for attendance tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Period Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                    <SelectItem key={period} value={period.toString()}>
                      Period {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter subject name"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              />
            </div>

            {/* Total Students */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Students</label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{filteredStudents.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-success">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-destructive">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-warning">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List and Attendance */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Student Attendance</CardTitle>
              <CardDescription>
                Mark attendance for {department.name} department students
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={markAllPresent} variant="outline" size="sm">
                Mark All Present
              </Button>
              <Button onClick={markAllAbsent} variant="outline" size="sm">
                Mark All Absent
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const record = attendanceRecords[student.id];
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(record?.status || 'Present')}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(record?.status || 'Present')}
                            {record?.status || 'Present'}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={record?.status === 'Present' ? 'default' : 'outline'}
                            onClick={() => handleAttendanceChange(student.id, 'Present')}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={record?.status === 'Absent' ? 'destructive' : 'outline'}
                            onClick={() => handleAttendanceChange(student.id, 'Absent')}
                          >
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={record?.status === 'Late' ? 'secondary' : 'outline'}
                            onClick={() => handleAttendanceChange(student.id, 'Late')}
                          >
                            Late
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Add remarks..."
                          value={record?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={submitAttendance} className="min-w-[150px]">
              Submit Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;