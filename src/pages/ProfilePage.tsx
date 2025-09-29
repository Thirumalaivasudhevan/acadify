import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Camera, 
  Edit, 
  Save, 
  X, 
  LogOut,
  GraduationCap,
  BookOpen,
  Trophy,
  Shield,
  Star,
  Calendar
} from 'lucide-react';
import ChangePasswordDialog from '../components/profile/ChangePasswordDialog';

interface ProfileData {
  // Common fields
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  profile_photo_url?: string;
  role: string;
  
  // Student fields
  student_id?: string;
  roll_number?: string;
  year_semester?: string;
  cgpa?: number;
  attendance_percentage?: number;
  achievements?: string[];
  
  // Faculty fields
  faculty_id?: string;
  designation?: string;
  subjects_taught?: string[];
  years_experience?: number;
  research_publications?: string[];
  
  // Admin fields
  admin_id?: string;
  role_title?: string;
  access_level?: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Get main profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      let roleSpecificData = {};

      // Get role-specific data
      if (profile.role === 'Student') {
        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();
        roleSpecificData = studentData || {};
      } else if (profile.role === 'Faculty') {
        const { data: facultyData } = await supabase
          .from('faculty_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();
        roleSpecificData = facultyData || {};
      }

      setProfileData({
        ...profile,
        ...roleSpecificData
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingPhoto(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => prev ? { ...prev, profile_photo_url: publicUrl } : null);
      
      toast({
        title: "Success",
        description: "Profile photo updated successfully!"
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData || !user) return;

    try {
      setSaving(true);

      // Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          department: profileData.department
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update role-specific data
      if (profileData.role === 'Student') {
        const { error: studentError } = await supabase
          .from('student_profiles')
          .upsert({
            user_id: user.id,
            student_id: profileData.student_id,
            roll_number: profileData.roll_number,
            year_semester: profileData.year_semester,
            cgpa: profileData.cgpa,
            achievements: profileData.achievements || []
          });
        if (studentError) throw studentError;
      } else if (profileData.role === 'Faculty') {
        const { error: facultyError } = await supabase
          .from('faculty_profiles')
          .upsert({
            user_id: user.id,
            faculty_id: profileData.faculty_id,
            designation: profileData.designation,
            subjects_taught: profileData.subjects_taught || [],
            years_experience: profileData.years_experience,
            research_publications: profileData.research_publications || []
          });
        if (facultyError) throw facultyError;
      }

      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Student': return <User className="h-4 w-4" />;
      case 'Faculty': return <GraduationCap className="h-4 w-4" />;
      case 'Admin': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Student': return 'bg-success/10 text-success border-success/20';
      case 'Faculty': return 'bg-primary/10 text-primary border-primary/20';
      case 'Admin': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">Profile data not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={profileData.profile_photo_url} />
              <AvatarFallback className="text-xl font-bold bg-primary/10">
                {profileData.full_name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{profileData.full_name}</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getRoleColor(profileData.role)}>
                {getRoleIcon(profileData.role)}
                <span className="ml-1">{profileData.role}</span>
              </Badge>
              {profileData.department && (
                <Badge variant="outline">
                  <Building className="h-3 w-3 mr-1" />
                  {profileData.department}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
          <Button variant="destructive" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <ChangePasswordDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name || ''}
                  disabled={!editing}
                  onChange={(e) => setProfileData(prev => prev ? {...prev, full_name: e.target.value} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.email || ''}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone || ''}
                  disabled={!editing}
                  onChange={(e) => setProfileData(prev => prev ? {...prev, phone: e.target.value} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profileData.department || ''}
                  disabled={!editing}
                  onChange={(e) => setProfileData(prev => prev ? {...prev, department: e.target.value} : null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-Specific Information */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center">
              {profileData.role === 'Student' && <BookOpen className="h-5 w-5 mr-2" />}
              {profileData.role === 'Faculty' && <GraduationCap className="h-5 w-5 mr-2" />}
              {profileData.role === 'Admin' && <Shield className="h-5 w-5 mr-2" />}
              {profileData.role} Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.role === 'Student' && (
              <>
                <div>
                  <Label htmlFor="roll_number">Roll Number</Label>
                  <Input
                    id="roll_number"
                    value={profileData.roll_number || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, roll_number: e.target.value} : null)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="year_semester">Year / Semester</Label>
                  <Input
                    id="year_semester"
                    value={profileData.year_semester || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, year_semester: e.target.value} : null)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cgpa">CGPA</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      max="10"
                      value={profileData.cgpa || ''}
                      disabled={!editing}
                      onChange={(e) => setProfileData(prev => prev ? {...prev, cgpa: parseFloat(e.target.value)} : null)}
                    />
                  </div>
                  
                  <div>
                    <Label>Attendance</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="px-3 py-1">
                        {profileData.attendance_percentage || 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}

            {profileData.role === 'Faculty' && (
              <>
                <div>
                  <Label htmlFor="faculty_id">Faculty ID</Label>
                  <Input
                    id="faculty_id"
                    value={profileData.faculty_id || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, faculty_id: e.target.value} : null)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={profileData.designation || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, designation: e.target.value} : null)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={profileData.years_experience || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, years_experience: parseInt(e.target.value)} : null)}
                  />
                </div>
                
                <div>
                  <Label>Subjects Taught</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.subjects_taught?.map((subject, index) => (
                      <Badge key={index} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {profileData.role === 'Admin' && (
              <>
                <div>
                  <Label htmlFor="admin_id">Admin ID</Label>
                  <Input
                    id="admin_id"
                    value={profileData.admin_id || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, admin_id: e.target.value} : null)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role_title">Role Title</Label>
                  <Input
                    id="role_title"
                    value={profileData.role_title || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, role_title: e.target.value} : null)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="access_level">Access Level</Label>
                  <Input
                    id="access_level"
                    value={profileData.access_level || ''}
                    disabled={!editing}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, access_level: e.target.value} : null)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Additional Information for Students */}
        {profileData.role === 'Student' && (
          <Card className="card-luxury lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Achievements & Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.achievements?.length ? (
                  profileData.achievements.map((achievement, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No achievements added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information for Faculty */}
        {profileData.role === 'Faculty' && (
          <Card className="card-luxury lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Research & Publications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profileData.research_publications?.length ? (
                  profileData.research_publications.map((publication, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">{publication}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No publications added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;