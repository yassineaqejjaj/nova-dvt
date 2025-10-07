import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile as UserProfileType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Trophy, 
  Zap, 
  TrendingUp, 
  Award, 
  Edit, 
  LogOut,
  Calendar,
  Settings,
  Shield
} from 'lucide-react';

interface UserProfileProps {
  user: UserProfileType;
  open: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
  onAdminSwitch?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  open,
  onClose,
  onUserUpdate,
  onAdminSwitch
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editData, setEditData] = useState({
    display_name: user.name,
    role: user.role
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const progressToNextLevel = ((user.xp % 200) / 200) * 100;
  const nextLevelXP = Math.ceil(user.xp / 200) * 200;
  const xpToNextLevel = nextLevelXP - user.xp;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editData.display_name,
          role: editData.role
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });

      setIsEditing(false);
      onUserUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>User Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.role}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-agent-orange" />
                  <span>Level</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.level}</div>
                <p className="text-xs text-muted-foreground">
                  {xpToNextLevel} XP to next level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.xp}</div>
                <p className="text-xs text-muted-foreground">Total XP earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-agent-green" />
                  <span>Streak</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center space-x-1">
                  <span>{user.streak}</span>
                  <span className="text-lg">🔥</span>
                </div>
                <p className="text-xs text-muted-foreground">Days active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Award className="w-4 h-4 text-agent-blue" />
                  <span>Badges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.badges.length}</div>
                <p className="text-xs text-muted-foreground">Achievements unlocked</p>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Level Progress</CardTitle>
              <CardDescription>
                Your progress to Level {user.level + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {user.level}</span>
                  <span>{user.xp} / {nextLevelXP} XP</span>
                </div>
                <Progress value={progressToNextLevel} className="h-3" />
                <p className="text-xs text-muted-foreground text-center">
                  {xpToNextLevel} XP needed to reach Level {user.level + 1}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(badge.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No achievements yet. Start using Squad Mate to earn badges!
                </p>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex space-x-3">
            {isAdmin && onAdminSwitch && (
              <Button
                variant="default"
                onClick={() => {
                  onAdminSwitch();
                  onClose();
                }}
                className="flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Switch to Admin</span>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Display Name</Label>
                <Input
                  id="edit-name"
                  value={editData.display_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Input
                  id="edit-role"
                  value={editData.role}
                  onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value }))}
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};