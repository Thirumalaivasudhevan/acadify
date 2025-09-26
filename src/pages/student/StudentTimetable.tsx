import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, MapPin, BookOpen, Users } from 'lucide-react';
import { timetableSlots, students } from '../../data/mockData';
import { Day } from '../../types/college';

const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const periods = [1, 2, 3, 4, 5];

const StudentTimetable = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const student = students.find(s => s.id === user.id);
  if (!student) return null;

  // For students, show timetable based on their department
  // In a real app, this would be more sophisticated with class schedules
  const departmentTimetable = timetableSlots;
  
  const getSlot = (day: Day, period: number) => {
    return departmentTimetable.find(slot => slot.day === day && slot.period === period);
  };

  const totalClasses = departmentTimetable.length;
  const todayClasses = departmentTimetable.filter(slot => 
    slot.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) as Day
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Timetable</h2>
          <p className="text-muted-foreground">
            View your class schedule - {student.rollNo}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">Per week</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{todayClasses}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {new Set(departmentTimetable.map(slot => slot.subject)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different subjects</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Weekly Schedule</span>
            <Badge variant="outline" className="ml-auto bg-success/20 text-success">
              {student.rollNo}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-[800px]">
              {/* Header Row */}
              <div className="p-3 font-semibold text-center bg-muted/50 rounded-lg">
                Time / Day
              </div>
              {days.map(day => (
                <div key={day} className="p-3 font-semibold text-center bg-muted/50 rounded-lg">
                  {day}
                </div>
              ))}

              {/* Timetable Grid */}
              {periods.map(period => (
                <React.Fragment key={period}>
                  <div className="p-3 text-center bg-muted/30 rounded-lg flex items-center justify-center">
                    <div>
                      <div className="font-medium">Period {period}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{8 + period}:00 - {9 + period}:00</span>
                      </div>
                    </div>
                  </div>
                  
                  {days.map(day => {
                    const slot = getSlot(day, period);
                    const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const currentHour = new Date().getHours();
                    const isCurrentPeriod = isToday && currentHour >= (8 + period) && currentHour < (9 + period);
                    
                    return (
                      <div 
                        key={`${day}-${period}`} 
                        className={`
                          p-3 border rounded-lg transition-all hover-lift
                          ${slot 
                            ? `bg-primary/10 border-primary/30 ${isCurrentPeriod ? 'ring-2 ring-accent shadow-lg' : ''}` 
                            : 'bg-muted/20 border-border'
                          }
                        `}
                      >
                        {slot ? (
                          <div className="text-center space-y-2">
                            <div className="font-medium text-sm flex items-center justify-center space-x-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{slot.subject}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{slot.room}</span>
                            </div>
                            {isCurrentPeriod && (
                              <Badge className="text-xs status-warning">
                                Current Class
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-xs py-2">
                            Free Period
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-accent" />
            <span>Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentTimetable
              .filter(slot => slot.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) as Day)
              .sort((a, b) => a.period - b.period)
              .map((slot, index) => {
                const currentHour = new Date().getHours();
                const isCurrentClass = currentHour >= (8 + slot.period) && currentHour < (9 + slot.period);
                
                return (
                  <div 
                    key={slot.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border transition-all animate-slide-up
                      ${isCurrentClass 
                        ? 'bg-accent/10 border-accent shadow-md' 
                        : 'bg-card border-border'
                      }
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-2 rounded-full 
                        ${isCurrentClass ? 'bg-accent/20' : 'bg-primary/20'}
                      `}>
                        <BookOpen className={`
                          h-4 w-4 
                          ${isCurrentClass ? 'text-accent' : 'text-primary'}
                        `} />
                      </div>
                      <div>
                        <p className="font-medium">{slot.subject}</p>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{slot.room}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>Faculty</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">{8 + slot.period}:00 - {9 + slot.period}:00</p>
                      <p className="text-sm text-muted-foreground">Period {slot.period}</p>
                      {isCurrentClass && (
                        <Badge className="mt-1 status-warning">
                          Now
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            }
            
            {departmentTimetable.filter(slot => 
              slot.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) as Day
            ).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTimetable;