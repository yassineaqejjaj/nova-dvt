import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Workspace, WorkspaceMember } from '@/types';
import { Users, Plus, Settings, UserPlus, Trash2, Loader2, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WorkspaceManagerProps {
  userId: string;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ userId }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [members, setMembers] = useState<Record<string, WorkspaceMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, [userId]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);

      // Load members for each workspace
      if (data) {
        const membersData: Record<string, WorkspaceMember[]> = {};
        for (const workspace of data) {
          const { data: workspaceMembers } = await supabase
            .from('workspace_members')
            .select('*')
            .eq('workspace_id', workspace.id);
          membersData[workspace.id] = workspaceMembers || [];
        }
        setMembers(membersData);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workspaces',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workspace name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspace.name,
          description: newWorkspace.description,
          owner_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setWorkspaces([data, ...workspaces]);
      setShowCreateDialog(false);
      setNewWorkspace({ name: '', description: '' });
      
      // Track analytics
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'workspace_created',
        event_data: { workspace_name: data.name },
      });

      toast({
        title: 'Success',
        description: 'Workspace created successfully',
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workspace',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
      toast({
        title: 'Success',
        description: 'Workspace deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workspace',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workspaces</h2>
          <p className="text-muted-foreground">
            Collaborate with your team across different projects
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create a workspace to collaborate with your team
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(workspace => (
            <Card key={workspace.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{workspace.name}</span>
                      {workspace.owner_id === userId && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {workspace.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {members[workspace.id]?.length || 0} members
                      </span>
                    </div>
                    {workspace.owner_id === userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name *</Label>
              <Input
                id="name"
                placeholder="My Team Workspace"
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What's this workspace for?"
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkspace} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Workspace'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};