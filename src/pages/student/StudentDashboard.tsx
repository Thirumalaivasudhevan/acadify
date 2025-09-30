import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { GraduationCap, BookOpen, Trophy, TrendingUp, Calendar, Award } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudentProfile();
    }
  }, [user]);

  const loadStudentProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const { data: studentData } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setStudentProfile({ ...profile, ...studentData });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Welcome Back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here's your academic overview
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-luxury hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {studentProfile?.cgpa || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current Semester
            </p>
          </CardContent>
        </Card>

        <Card className="card-luxury hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {studentProfile?.attendance_percentage ? `${studentProfile.attendance_percentage}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This Semester
            </p>
          </CardContent>
        </Card>

        <Card className="card-luxury hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year/Semester</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentProfile?.year_semester || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current Academic Period
            </p>
          </CardContent>
        </Card>

        <Card className="card-luxury hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentProfile?.achievements?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Certificates & Awards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Academic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{studentProfile?.roll_number || 'Not Set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{studentProfile?.department || 'Not Set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year of Study</p>
                <p className="font-medium">{studentProfile?.year_of_study || 'Not Set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-medium">{studentProfile?.student_id || 'Not Set'}</p>
              </div>
            </div>

            {studentProfile?.courses_enrolled && studentProfile.courses_enrolled.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Enrolled Courses</p>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.courses_enrolled.map((course: string, index: number) => (
                    <Badge key={index} variant="secondary">{course}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span>Skills & Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentProfile?.skills_interests && studentProfile.skills_interests.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills & Interests</p>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.skills_interests.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {studentProfile?.achievements && studentProfile.achievements.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Recent Achievements</p>
                <ul className="space-y-2">
                  {studentProfile.achievements.map((achievement: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Award className="h-4 w-4 text-accent mt-0.5" />
                      <span className="text-sm">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(!studentProfile?.achievements || studentProfile.achievements.length === 0) && 
             (!studentProfile?.skills_interests || studentProfile.skills_interests.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Update your profile to add skills and achievements
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;