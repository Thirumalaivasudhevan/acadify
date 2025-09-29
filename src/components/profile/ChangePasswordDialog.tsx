import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { passwordValidation } from '../../lib/validations';

const ChangePasswordDialog: React.FC = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    try {
      // Validate passwords
      const validation = passwordValidation.safeParse({
        password: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.issues[0].message,
          variant: "destructive"
        });
        return;
      }

      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully!"
      });

      setOpen(false);
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your new password below. Make sure it's strong and memorable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordChange} 
            disabled={loading || !passwords.newPassword || !passwords.confirmPassword}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;