import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { MessageSquare, Calendar, User, Reply, Clock, CheckCircle, XCircle } from 'lucide-react';
import { studentRequests } from '../../data/mockData';
import { StudentRequest, RequestStatus } from '../../types/college';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';

const FacultyRequests = () => {
  const [requests, setRequests] = useState(
    studentRequests.filter(request => 
      request.target === 'Faculty' || request.target === 'Both'
    )
  );
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequest || !replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }

    setRequests(prev =>
      prev.map(request =>
        request.id === selectedRequest.id
          ? { ...request, status: 'Answered' as RequestStatus, reply: replyText }
          : request
      )
    );

    toast({
      title: "Reply sent",
      description: `Your reply has been sent to ${selectedRequest.studentName}.`,
    });

    setReplyText('');
    setSelectedRequest(null);
    setIsReplyDialogOpen(false);
  };

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    setRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: newStatus }
          : request
      )
    );

    const request = requests.find(r => r.id === requestId);
    toast({
      title: "Status updated",
      description: `Request from ${request?.studentName} has been marked as ${newStatus.toLowerCase()}.`,
    });
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

  const openReplyDialog = (request: StudentRequest) => {
    setSelectedRequest(request);
    setReplyText(request.reply || '');
    setIsReplyDialogOpen(true);
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const answeredRequests = requests.filter(r => r.status === 'Answered');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Requests</h2>
          <p className="text-muted-foreground">
            Manage and respond to student requests
          </p>
        </div>
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
            <p className="text-xs text-muted-foreground">Needs response</p>
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
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {requests.filter(r => 
                new Date(r.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Recent requests</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>
              Reply to {selectedRequest?.studentName}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleReply} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="originalMessage">Original Message</Label>
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                {selectedRequest?.message}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply *</Label>
              <Textarea
                id="reply"
                placeholder="Enter your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[100px] glass"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsReplyDialogOpen(false)}
                className="btn-glass"
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-luxury">
                Send Reply
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {requests.map((request, index) => (
          <Card 
            key={request.id} 
            className="card-luxury animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20">
                      {request.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{request.studentName}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(request.createdAt), 'PPP')}</span>
                      <span>•</span>
                      <span>Target: {request.target}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {request.status === 'Pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReplyDialog(request)}
                        className="btn-glass"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, 'Closed')}
                        className="text-muted-foreground hover:text-foreground btn-glass"
                      >
                        Close
                      </Button>
                    </>
                  )}
                  
                  {request.status === 'Answered' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReplyDialog(request)}
                      className="btn-glass"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Edit Reply
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Request:</h4>
                <p className="text-foreground leading-relaxed">
                  {request.message}
                </p>
              </div>
              
              {request.reply && (
                <div className="border-l-2 border-primary/30 pl-4 bg-primary/5 p-3 rounded-r-lg">
                  <h4 className="font-medium mb-2 text-primary">Your Reply:</h4>
                  <p className="text-foreground leading-relaxed">
                    {request.reply}
                  </p>
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
                No requests yet
              </p>
              <p className="text-sm text-muted-foreground">
                Student requests will appear here when submitted
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FacultyRequests;