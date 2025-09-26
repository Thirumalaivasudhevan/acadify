import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Plus, Megaphone, Calendar, Users, FileText, Edit, Trash2 } from 'lucide-react';
import { announcements } from '../../data/mockData';
import { Announcement, AnnouncementTarget } from '../../types/college';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';

const AdminAnnouncements = () => {
  const [announcementsList, setAnnouncementsList] = useState(announcements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    target: '' as AnnouncementTarget | '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const announcement: Announcement = {
      id: editingAnnouncement?.id || Date.now().toString(),
      target: formData.target as AnnouncementTarget,
      message: formData.message,
      createdAt: editingAnnouncement?.createdAt || new Date().toISOString(),
      createdBy: 'Admin User',
    };

    if (editingAnnouncement) {
      setAnnouncementsList(prev => 
        prev.map(a => a.id === announcement.id ? announcement : a)
      );
      toast({
        title: "Announcement updated",
        description: "The announcement has been successfully updated.",
      });
    } else {
      setAnnouncementsList(prev => [announcement, ...prev]);
      toast({
        title: "Announcement created",
        description: "The announcement has been successfully created.",
      });
    }

    setFormData({ target: '', message: '' });
    setEditingAnnouncement(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      target: announcement.target,
      message: announcement.message,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncementsList(prev => prev.filter(a => a.id !== id));
    toast({
      title: "Announcement deleted",
      description: "The announcement has been successfully deleted.",
    });
  };

  const getTargetBadgeVariant = (target: AnnouncementTarget) => {
    switch (target) {
      case 'Faculty': return 'bg-primary/20 text-primary';
      case 'Student': return 'bg-success/20 text-success';
      case 'Both': return 'bg-accent/20 text-accent';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const resetDialog = () => {
    setFormData({ target: '', message: '' });
    setEditingAnnouncement(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">
            Create and manage announcements for faculty and students
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-luxury">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target">Target Audience *</Label>
                <Select 
                  value={formData.target} 
                  onValueChange={(value: AnnouncementTarget) => 
                    setFormData(prev => ({ ...prev, target: value }))
                  }
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faculty">Faculty Only</SelectItem>
                    <SelectItem value="Student">Students Only</SelectItem>
                    <SelectItem value="Both">Faculty & Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your announcement message..."
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
                  onClick={resetDialog}
                  className="btn-glass"
                >
                  Cancel
                </Button>
                <Button type="submit" className="btn-luxury">
                  {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{announcementsList.length}</div>
            <p className="text-xs text-muted-foreground">All announcements</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              For Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {announcementsList.filter(a => a.target === 'Faculty' || a.target === 'Both').length}
            </div>
            <p className="text-xs text-muted-foreground">Faculty announcements</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              For Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {announcementsList.filter(a => a.target === 'Student' || a.target === 'Both').length}
            </div>
            <p className="text-xs text-muted-foreground">Student announcements</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {announcementsList.map((announcement, index) => (
          <Card 
            key={announcement.id} 
            className="card-luxury animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getTargetBadgeVariant(announcement.target)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {announcement.target}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(announcement.createdAt), 'PPP')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                    className="btn-glass"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                    className="text-destructive hover:text-destructive btn-glass"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {announcement.message}
              </p>
              
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Posted by {announcement.createdBy}</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(announcement.createdAt), 'pp')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {announcementsList.length === 0 && (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No announcements yet
              </p>
              <p className="text-sm text-muted-foreground">
                Create your first announcement to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;