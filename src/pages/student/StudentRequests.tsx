import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { 
  Plus, MessageSquare, Calendar, Send, Clock, 
  CheckCircle, XCircle, Reply 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { students, studentRequests as mockRequests } from '../../data/mockData';
import { StudentRequest, RequestTarget, RequestStatus } from '../../types/college';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';

const StudentRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!user) return null;

  const student = students.find(s => s.id === user.id);
  if (!student) return null;

  const [requests, setRequests] = useState(
    mockRequests.filter(request => request.studentId === student.id)
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    target: '' as RequestTarget | '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newRequest: StudentRequest = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      target: formData.target as RequestTarget,
      message: formData.message,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setRequests(prev => [newRequest, ...prev]);
    
    toast({
      title: "Request submitted",
      description: `Your request has been sent to ${formData.target}.`,
    });

    setFormData({ target: '', message: '' });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'Answered':
        return <Badge variant="outline" className="status-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Answered
        </Badge>;
      case 'Closed':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">
          <XCircle className="h-3 w-3 mr-1" />
          Closed
        </Badge>;
      default:
        return null;
    }
  };

  const getTargetBadgeVariant = (target: RequestTarget) => {
    switch (target) {
      case 'Faculty': return 'bg-primary/20 text-primary';
      case 'Admin': return 'bg-destructive/20 text-destructive';
      case 'Both': return 'bg-accent/20 text-accent';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const answeredRequests = requests.filter(r => r.status === 'Answered');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Requests</h2>
          <p className="text-muted-foreground">
            Submit requests and track their status - {student.rollNo}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-luxury">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-md">
            <DialogHeader>
              <DialogTitle>Submit New Request</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target">Send To *</Label>
                <Select 
                  value={formData.target} 
                  onValueChange={(value: RequestTarget) => 
                    setFormData(prev => ({ ...prev, target: value }))
                  }
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faculty">Faculty</SelectItem>
                    <SelectItem value="Admin">Administration</SelectItem>
                    <SelectItem value="Both">Faculty & Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Request Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your request in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="min-h-[120px] glass"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="btn-glass"
                >
                  Cancel
                </Button>
                <Button type="submit" className="btn-luxury">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
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
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{requests.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Answered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{answeredRequests.length}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {requests.filter(r => 
                new Date(r.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Recent requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {requests.map((request, index) => (
          <Card 
            key={request.id} 
            className="card-luxury animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="outline" 
                      className={getTargetBadgeVariant(request.target)}
                    >
                      {request.target}
                    </Badge>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(request.createdAt), 'PPP')}</span>
                    <span>•</span>
                    <span>{format(new Date(request.createdAt), 'pp')}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Your Request:</span>
                </h4>
                <p className="text-foreground leading-relaxed pl-6">
                  {request.message}
                </p>
              </div>
              
              {request.reply && (
                <div className="border-l-2 border-success/30 pl-4 bg-success/5 p-4 rounded-r-lg">
                  <h4 className="font-medium mb-2 text-success flex items-center space-x-2">
                    <Reply className="h-4 w-4" />
                    <span>Response:</span>
                  </h4>
                  <p className="text-foreground leading-relaxed">
                    {request.reply}
                  </p>
                </div>
              )}
              
              {request.status === 'Pending' && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-warning/5 p-3 rounded-lg">
                  <Clock className="h-4 w-4 text-warning" />
                  <span>Your request is being reviewed. You'll be notified when there's a response.</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {requests.length === 0 && (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No requests submitted yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your first request to faculty or administration
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="btn-luxury"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentRequests;