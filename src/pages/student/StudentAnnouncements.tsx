import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Megaphone, Calendar, Users } from 'lucide-react';
import { announcements } from '../../data/mockData';
import { format } from 'date-fns';

const StudentAnnouncements = () => {
  const studentAnnouncements = announcements.filter(
    announcement => announcement.target === 'Student' || announcement.target === 'Both'
  );

  const getTargetBadgeVariant = (target: string) => {
    switch (target) {
      case 'Student': return 'bg-success/20 text-success';
      case 'Both': return 'bg-accent/20 text-accent';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">
            Stay updated with important college announcements
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{studentAnnouncements.length}</div>
            <p className="text-xs text-muted-foreground">For students</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {studentAnnouncements.filter(a => 
                new Date(a.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Recent</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Important
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {studentAnnouncements.filter(a => 
                a.message.toLowerCase().includes('important') || 
                a.message.toLowerCase().includes('exam') ||
                a.message.toLowerCase().includes('urgent')
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Priority updates</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {studentAnnouncements.map((announcement, index) => {
          const isImportant = announcement.message.toLowerCase().includes('important') || 
                             announcement.message.toLowerCase().includes('exam') ||
                             announcement.message.toLowerCase().includes('urgent');
          
          return (
            <Card 
              key={announcement.id} 
              className={`
                card-luxury animate-slide-up
                ${isImportant ? 'border-accent/50 shadow-lg' : ''}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`
                      p-2 rounded-lg 
                      ${isImportant ? 'bg-accent/20' : 'bg-primary/20'}
                    `}>
                      <Megaphone className={`
                        h-5 w-5 
                        ${isImportant ? 'text-accent' : 'text-primary'}
                      `} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={getTargetBadgeVariant(announcement.target)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {announcement.target === 'Student' ? 'Students Only' : 'General'}
                        </Badge>
                        {isImportant && (
                          <Badge className="bg-accent/20 text-accent">
                            Important
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(announcement.createdAt), 'PPP')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className={`
                  ${isImportant ? 'border-l-4 border-accent pl-4' : ''}
                `}>
                  <p className="text-foreground leading-relaxed mb-4">
                    {announcement.message}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Posted by {announcement.createdBy}</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(announcement.createdAt), 'pp')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {studentAnnouncements.length === 0 && (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No announcements available
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later for new announcements from the administration
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;