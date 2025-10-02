import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { GraduationCap, UserCog, Users, UserCheck, Shield, Headphones } from 'lucide-react';
import type { AppRole } from '@/types/auth';

interface RoleSelectionProps {
  onSelectRole: (role: AppRole) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  const roles = [
    {
      role: 'super_admin' as AppRole,
      title: 'Super Admin',
      description: 'Organization-wide management',
      icon: Shield,
      color: 'text-red-500',
      disabled: true, // Created at org setup only
    },
    {
      role: 'admin' as AppRole,
      title: 'Admin',
      description: 'Department management',
      icon: UserCog,
      color: 'text-purple-500',
    },
    {
      role: 'staff' as AppRole,
      title: 'Faculty/Staff',
      description: 'Teaching and management',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      role: 'student' as AppRole,
      title: 'Student',
      description: 'Student portal access',
      icon: GraduationCap,
      color: 'text-green-500',
    },
    {
      role: 'parent' as AppRole,
      title: 'Parent',
      description: 'Monitor child progress',
      icon: UserCheck,
      color: 'text-orange-500',
    },
    {
      role: 'support' as AppRole,
      title: 'Support',
      description: 'Technical assistance',
      icon: Headphones,
      color: 'text-cyan-500',
      disabled: true, // Created by Super Admin only
    },
  ];

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
      
      <Card className="glass w-full max-w-4xl animate-scale-in relative">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/20 animate-glow">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">Welcome to Acadify</CardTitle>
            <CardDescription className="text-lg">
              Select your role to continue registration
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((roleItem) => {
            const Icon = roleItem.icon;
            return (
              <Button
                key={roleItem.role}
                variant="outline"
                className={`h-auto p-6 flex flex-col items-center gap-3 hover:scale-105 transition-all ${
                  roleItem.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !roleItem.disabled && onSelectRole(roleItem.role)}
                disabled={roleItem.disabled}
              >
                <Icon className={`h-12 w-12 ${roleItem.color}`} />
                <div className="text-center">
                  <div className="font-semibold text-lg">{roleItem.title}</div>
                  <div className="text-sm text-muted-foreground">{roleItem.description}</div>
                  {roleItem.disabled && (
                    <div className="text-xs text-amber-500 mt-1">Admin Creation Only</div>
                  )}
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;
