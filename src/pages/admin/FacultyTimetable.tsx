import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Save, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import { faculties, timetableSlots } from '../../data/mockData';
import { TimetableSlot, Day } from '../../types/college';
import { useToast } from '../../hooks/use-toast';

const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const periods = [1, 2, 3, 4, 5];

const FacultyTimetable = () => {
  const { facultyId } = useParams<{ facultyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [faculty, setFaculty] = useState(faculties.find(f => f.id === facultyId));
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<{ day: Day; period: number } | null>(null);
  const [formData, setFormData] = useState({ subject: '', room: '' });

  useEffect(() => {
    if (facultyId) {
      const facultyTimetable = timetableSlots.filter(slot => slot.facultyId === facultyId);
      setTimetable(facultyTimetable);
    }
  }, [facultyId]);

  const getSlot = (day: Day, period: number) => {
    return timetable.find(slot => slot.day === day && slot.period === period);
  };

  const handleSlotClick = (day: Day, period: number) => {
    const slot = getSlot(day, period);
    setEditingSlot({ day, period });
    setFormData({
      subject: slot?.subject || '',
      room: slot?.room || ''
    });
  };

  const handleSaveSlot = () => {
    if (!editingSlot || !facultyId) return;

    const newSlot: TimetableSlot = {
      id: `${facultyId}-${editingSlot.day}-${editingSlot.period}`,
      facultyId,
      day: editingSlot.day,
      period: editingSlot.period,
      subject: formData.subject,
      room: formData.room
    };

    const updatedTimetable = timetable.filter(
      slot => !(slot.day === editingSlot.day && slot.period === editingSlot.period)
    );

    if (formData.subject && formData.room) {
      updatedTimetable.push(newSlot);
    }

    setTimetable(updatedTimetable);
    setEditingSlot(null);
    setFormData({ subject: '', room: '' });

    toast({
      title: "Timetable updated",
      description: `Successfully updated ${editingSlot.day} Period ${editingSlot.period}`,
    });
  };

  const handleCancel = () => {
    setEditingSlot(null);
    setFormData({ subject: '', room: '' });
  };

  if (!faculty) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Faculty not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/faculty')}
          className="btn-glass"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Faculty List
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faculty Timetable</h2>
          <p className="text-muted-foreground">
            Configure timetable for {faculty.name} - {faculty.department}
          </p>
        </div>
      </div>

      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Weekly Schedule</span>
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
                      <div className="text-xs text-muted-foreground">
                        {8 + period}:00 - {9 + period}:00
                      </div>
                    </div>
                  </div>
                  
                  {days.map(day => {
                    const slot = getSlot(day, period);
                    const isEditing = editingSlot?.day === day && editingSlot?.period === period;
                    
                    return (
                      <div 
                        key={`${day}-${period}`} 
                        className={`
                          p-3 border border-border rounded-lg cursor-pointer transition-all hover-lift
                          ${slot ? 'bg-primary/10 border-primary/30' : 'bg-card hover:bg-muted/30'}
                          ${isEditing ? 'ring-2 ring-primary' : ''}
                        `}
                        onClick={() => handleSlotClick(day, period)}
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              placeholder="Subject"
                              value={formData.subject}
                              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                              className="h-8 text-xs"
                            />
                            <Input
                              placeholder="Room"
                              value={formData.room}
                              onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                              className="h-8 text-xs"
                            />
                            <div className="flex space-x-1">
                              <Button size="sm" onClick={handleSaveSlot} className="h-7 px-2 text-xs">
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancel} className="h-7 px-2 text-xs">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : slot ? (
                          <div className="text-center">
                            <div className="font-medium text-sm flex items-center justify-center space-x-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{slot.subject}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center justify-center space-x-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{slot.room}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-xs">
                            Click to assign
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

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Click on any time slot to assign subjects and rooms
          </p>
          <p className="text-xs text-muted-foreground">
            Leave subject empty to remove a slot
          </p>
        </div>
        
        <Badge variant="outline" className="status-success">
          {timetable.length} slots assigned
        </Badge>
      </div>
    </div>
  );
};

export default FacultyTimetable;