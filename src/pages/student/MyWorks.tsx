import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { 
  BookOpen, Calendar, Clock, CheckCircle, AlertCircle, 
  FileText, Trophy, User, Star 
} from 'lucide-react';
import { facultyWorks, studentWorkStatuses, students } from '../../data/mockData';
import { WorkType } from '../../types/college';
import { format, isAfter, parseISO } from 'date-fns';

const MyWorks = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const student = students.find(s => s.id === user.id);
  if (!student) return null;

  // Get works for student's department
  const myWorks = facultyWorks.filter(work => work.deptId === student.deptId);
  
  // Get student's work statuses
  const myStatuses = studentWorkStatuses.filter(status => status.studentId === student.id);

  const getWorkStatus = (workId: string) => {
    return myStatuses.find(status => status.workId === workId);
  };

  const getWorkTypeColor = (type: WorkType) => {
    switch (type) {
      case 'Assignment': return 'bg-primary/20 text-primary';
      case 'Imposition': return 'bg-destructive/20 text-destructive';
      case 'Weekly Test': return 'bg-accent/20 text-accent';
      case 'Daily Test': return 'bg-success/20 text-success';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const isOverdue = (dueDate: string) => {
    return dueDate && isAfter(new Date(), parseISO(dueDate));
  };

  const getWorkStatusInfo = (work: any, status: any) => {
    if (!status) {
      return {
        label: 'Not Started',
        color: 'bg-muted text-muted-foreground',
        icon: AlertCircle
      };
    }
    
    if (status.completed) {
      return {
        label: 'Completed',
        color: 'status-success',
        icon: CheckCircle,
        marks: status.marks,
        maxMarks: work.maxMarks
      };
    }
    
    if (work.dueDate && isOverdue(work.dueDate)) {
      return {
        label: 'Overdue',
        color: 'bg-destructive/20 text-destructive',
        icon: AlertCircle
      };
    }
    
    return {
      label: 'In Progress',
      color: 'bg-warning/20 text-warning',
      icon: Clock
    };
  };

  const completedWorks = myStatuses.filter(s => s.completed).length;
  const totalWorks = myWorks.length;
  const averageMarks = myStatuses.filter(s => s.completed && s.marks).reduce((acc, s) => acc + (s.marks || 0), 0) / 
    myStatuses.filter(s => s.completed && s.marks).length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Works</h2>
          <p className="text-muted-foreground">
            Track your assignments and academic progress - {student.rollNo}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalWorks}</div>
            <p className="text-xs text-muted-foreground">Assigned</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedWorks}</div>
            <p className="text-xs text-muted-foreground">
              {totalWorks > 0 ? `${Math.round((completedWorks / totalWorks) * 100)}%` : '0%'} completion
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {averageMarks ? Math.round(averageMarks) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Points average</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalWorks - completedWorks}</div>
            <p className="text-xs text-muted-foreground">To complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-accent" />
            <span>Overall Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-muted-foreground">
                {completedWorks} of {totalWorks} works completed
              </span>
            </div>
            <Progress 
              value={totalWorks > 0 ? (completedWorks / totalWorks) * 100 : 0} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {myWorks.map((work, index) => {
          const status = getWorkStatus(work.id);
          const statusInfo = getWorkStatusInfo(work, status);
          const StatusIcon = statusInfo.icon;

          return (
            <Card 
              key={work.id} 
              className="card-luxury animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={getWorkTypeColor(work.type)}>
                        {work.type}
                      </Badge>
                      <Badge variant="outline" className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{work.title}</CardTitle>
                      <p className="text-muted-foreground flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>By {work.facultyName}</span>
                      </p>
                    </div>
                  </div>
                  
                  {statusInfo.marks !== undefined && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {statusInfo.marks}/{statusInfo.maxMarks}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3" />
                        <span>{Math.round((statusInfo.marks / statusInfo.maxMarks) * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {work.description && (
                  <p className="text-foreground leading-relaxed">
                    {work.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {work.dueDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className={`font-medium ${isOverdue(work.dueDate) ? 'text-destructive' : ''}`}>
                          {format(parseISO(work.dueDate), 'PPP')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Max Marks</p>
                      <p className="font-medium">{work.maxMarks}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Assigned</p>
                      <p className="font-medium">
                        {format(parseISO(work.createdAt), 'PP')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {status?.extras && (
                  <div className="border-l-2 border-primary/30 pl-4 bg-primary/5 p-3 rounded-r-lg">
                    <h4 className="font-medium mb-1 text-primary">Faculty Feedback:</h4>
                    <p className="text-sm text-foreground">
                      {status.extras}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {myWorks.length === 0 && (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No works assigned yet
              </p>
              <p className="text-sm text-muted-foreground">
                Your assignments and tests will appear here once assigned by faculty
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyWorks;