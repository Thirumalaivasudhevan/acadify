import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Switch } from '../../components/ui/switch';
import { Search, UserCheck, Shield, GraduationCap, Users } from 'lucide-react';
import { User, UserRole } from '../../types/auth';
import { useToast } from '../../hooks/use-toast';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    active: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Dr. John Smith',
    email: 'faculty@example.com',
    role: 'Faculty',
    active: true,
    createdAt: '2024-01-01',
    deptId: '1',
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'student@example.com',
    role: 'Student',
    active: true,
    createdAt: '2024-01-01',
    deptId: '1',
    rollNo: 'CS001',
  },
  {
    id: '4',
    name: 'Prof. Sarah Wilson',
    email: 'sarah@college.edu',
    role: 'Faculty',
    active: true,
    createdAt: '2024-01-02',
    deptId: '2',
  },
  {
    id: '5',
    name: 'Bob Davis',
    email: 'bob@college.edu',
    role: 'Student',
    active: false,
    createdAt: '2024-01-03',
    deptId: '1',
    rollNo: 'CS002',
  },
];

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.rollNo && user.rollNo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, active: !user.active }
          : user
      )
    );

    const user = users.find(u => u.id === userId);
    toast({
      title: "User status updated",
      description: `${user?.name} has been ${user?.active ? 'deactivated' : 'activated'}.`,
    });
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin': return <Shield className="h-4 w-4" />;
      case 'Faculty': return <UserCheck className="h-4 w-4" />;
      case 'Student': return <GraduationCap className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'bg-destructive/20 text-destructive';
      case 'Faculty': return 'bg-primary/20 text-primary';
      case 'Student': return 'bg-success/20 text-success';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active 
      ? <Badge className="status-success">Active</Badge>
      : <Badge variant="destructive">Inactive</Badge>;
  };

  const userCounts = {
    total: users.length,
    admin: users.filter(u => u.role === 'Admin').length,
    faculty: users.filter(u => u.role === 'Faculty').length,
    student: users.filter(u => u.role === 'Student').length,
    active: users.filter(u => u.active).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userCounts.total}</div>
            <p className="text-xs text-muted-foreground">All accounts</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{userCounts.admin}</div>
            <p className="text-xs text-muted-foreground">Administrators</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userCounts.faculty}</div>
            <p className="text-xs text-muted-foreground">Faculty members</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{userCounts.student}</div>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent>
        </Card>
        
        <Card className="glass hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{userCounts.active}</div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-luxury">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span>User Directory</span>
            </CardTitle>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass w-full sm:w-64"
                />
              </div>
              
              <div className="flex space-x-2">
                {(['All', 'Admin', 'Faculty', 'Student'] as const).map((role) => (
                  <Button
                    key={role}
                    variant={roleFilter === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter(role)}
                    className={roleFilter === role ? "btn-luxury" : "btn-glass"}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow 
                    key={user.id} 
                    className="hover:bg-muted/50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/20">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          {user.rollNo && (
                            <p className="text-sm text-muted-foreground">Roll: {user.rollNo}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getRoleBadgeClass(user.role)}
                      >
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.email}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.active)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                        <Switch
                          checked={user.active}
                          onCheckedChange={() => handleToggleUserStatus(user.id)}
                          disabled={user.role === 'Admin'} // Don't allow deactivating admins
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;