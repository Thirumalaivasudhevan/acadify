import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { 
  Plus, ClipboardList, Calendar, Users, BookOpen, CheckCircle, 
  Clock, Edit, FileText, User, GraduationCap 
} from 'lucide-react';
import { departments, students, facultyWorks, studentWorkStatuses } from '../../data/mockData';
import { FacultyWork, StudentWorkStatus, WorkType } from '../../types/college';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';

const AssignWorks = () => {
  const { user } = useAuth();
  const [worksList, setWorksList] = useState(facultyWorks.filter(work => work.facultyId === user?.id));
  const [statusList, setStatusList] = useState(studentWorkStatuses);
  const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<FacultyWork | null>(null);
  const { toast } = useToast();

  const [workFormData, setWorkFormData] = useState({
    deptId: '',
    type: '' as WorkType | '',
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 0,
  });

  if (!user) return null;

  const handleCreateWork = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workFormData.deptId || !workFormData.type || !workFormData.title) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const work: FacultyWork = {
      id: Date.now().toString(),
      deptId: workFormData.deptId,
      facultyId: user.id,
      facultyName: user.name,
      type: workFormData.type as WorkType,
      title: workFormData.title,
      description: workFormData.description,
      dueDate: workFormData.dueDate,
      maxMarks: workFormData.maxMarks,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    setWorksList(prev => [work, ...prev]);
    setWorkFormData({
      deptId: '',
      type: '' as WorkType | '',
      title: '',
      description: '',
      dueDate: '',
      maxMarks: 0,
    });
    setIsWorkDialogOpen(false);

    toast({
      title: "Work assigned",
      description: `${work.type} has been assigned to ${departments.find(d => d.id === work.deptId)?.name} department.`,
    });
  };

  const handleStatusUpdate = (workId: string, studentId: string, completed: boolean, marks?: number, extras?: string) => {
    setStatusList(prev => {
      const existingStatus = prev.find(s => s.workId === workId && s.studentId === studentId);
      
      if (existingStatus) {
        return prev.map(s => 
          s.workId === workId && s.studentId === studentId
            ? { ...s, completed, marks, extras }
            : s
        );
      } else {
        const student = students.find(s => s.id === studentId);
        if (!student) return prev;
        
        const newStatus: StudentWorkStatus = {
          id: Date.now().toString(),
          workId,
          studentId,
          studentName: student.name,
          rollNo: student.rollNo,
          completed,
          marks,
          extras,
        };
        return [...prev, newStatus];
      }
    });

    toast({
      title: "Status updated",
      description: `Student work status has been updated.`,
    });
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

  const getStudentsForWork = (work: FacultyWork) => {
    return students.filter(student => student.deptId === work.deptId);
  };

  const getStudentStatus = (workId: string, studentId: string) => {
    return statusList.find(s => s.workId === workId && s.studentId === studentId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assign Works</h2>
          <p className="text-muted-foreground">
            Create and manage assignments for your departments
          </p>
        </div>
        
        <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-luxury">
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Work</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateWork} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deptId">Department *</Label>
                <Select 
                  value={workFormData.deptId} 
                  onValueChange={(value) => setWorkFormData(prev => ({ ...prev, deptId: value }))}
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Work Type *</Label>
                <Select 
                  value={workFormData.type} 
                  onValueChange={(value: WorkType) => setWorkFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Imposition">Imposition</SelectItem>
                    <SelectItem value="Weekly Test">Weekly Test</SelectItem>
                    <SelectItem value="Daily Test">Daily Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={workFormData.title}
                  onChange={(e) => setWorkFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter work title"
                  className="glass"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={workFormData.description}
                  onChange={(e) => setWorkFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter work description"
                  className="glass"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={workFormData.dueDate}
                    onChange={(e) => setWorkFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="glass"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMarks">Max Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    value={workFormData.maxMarks}
                    onChange={(e) => setWorkFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="glass"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsWorkDialogOpen(false)}
                  className="btn-glass"
                >
                  Cancel
                </Button>
                <Button type="submit" className="btn-luxury">
                  Create Work
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{worksList.length}</div>
            <p className="text-xs text-muted-foreground">Assigned</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {worksList.filter(w => w.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">Ongoing</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {statusList.filter(s => s.completed).length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {statusList.filter(s => !s.completed).length}
            </div>
            <p className="text-xs text-muted-foreground">To review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="works" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="works" className="flex items-center space-x-2">
            <ClipboardList className="h-4 w-4" />
            <span>My Works</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Student Progress</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="works" className="space-y-4">
          {worksList.map((work, index) => (
            <Card 
              key={work.id} 
              className="card-luxury animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Badge className={getWorkTypeColor(work.type)}>
                        {work.type}
                      </Badge>
                      <Badge variant="outline" className="status-success">
                        {work.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{work.title}</CardTitle>
                    <p className="text-muted-foreground">
                      {departments.find(d => d.id === work.deptId)?.name} Department
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWork(work)}
                    className="btn-glass"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {work.description && (
                  <p className="text-foreground mb-4">{work.description}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {work.dueDate ? format(new Date(work.dueDate), 'PPP') : 'No due date'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Marks</p>
                    <p className="font-medium">{work.maxMarks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Students</p>
                    <p className="font-medium">
                      {getStudentsForWork(work).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="font-medium text-success">
                      {statusList.filter(s => s.workId === work.id && s.completed).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="students">
          {selectedWork ? (
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>{selectedWork.title} - Student Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getStudentsForWork(selectedWork).map(student => {
                    const status = getStudentStatus(selectedWork.id, student.id);
                    
                    return (
                      <div 
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover-lift"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-primary/20">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">Roll: {student.rollNo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {status?.marks ? `${status.marks}/${selectedWork.maxMarks}` : 'Not graded'}
                            </p>
                            {status?.extras && (
                              <p className="text-xs text-muted-foreground">{status.extras}</p>
                            )}
                          </div>
                          
                          <Switch
                            checked={status?.completed || false}
                            onCheckedChange={(checked) => 
                              handleStatusUpdate(selectedWork.id, student.id, checked, status?.marks, status?.extras)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Select a work to manage students
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a work from the "My Works" tab to view and manage student progress
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignWorks;