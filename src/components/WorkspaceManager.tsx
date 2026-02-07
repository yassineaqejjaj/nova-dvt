import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Workspace, WorkspaceMember, Squad } from '@/types';
import { Users, Plus, Settings, UserPlus, Trash2, Loader2, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WorkspaceManagerProps {
  userId: string;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ userId }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [members, setMembers] = useState<Record<string, WorkspaceMember[]>>({});
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [showAddSquadDialog, setShowAddSquadDialog] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedSquadId, setSelectedSquadId] = useState<string>('');

  useEffect(() => {
    loadWorkspaces();
  }, [userId]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      
      // Load workspaces, members, and squads in parallel
      const [workspacesResponse, squadsResponse] = await Promise.all([
        supabase.from('workspaces').select('*').order('created_at', { ascending: false }),
        supabase.from('squads').select('*').eq('user_id', userId),
      ]);

      if (workspacesResponse.error) throw workspacesResponse.error;
      if (squadsResponse.error) throw squadsResponse.error;

      const workspacesData = workspacesResponse.data || [];
      setWorkspaces(workspacesData);
      
      // Map squads data to match Squad interface
      const squadsData = (squadsResponse.data || []).map(squad => ({
        ...squad,
        agents: [],
        createdAt: new Date(squad.created_at),
      }));
      setSquads(squadsData);

      // Load members for each workspace
      if (workspacesData.length > 0) {
        const membersData: Record<string, WorkspaceMember[]> = {};
        for (const workspace of workspacesData) {
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

  const handleAddSquadToWorkspace = async () => {
    if (!selectedWorkspaceId || !selectedSquadId) return;

    try {
      const { error } = await supabase
        .from('squads')
        .update({ workspace_id: selectedWorkspaceId })
        .eq('id', selectedSquadId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Squad added to workspace!',
      });
      
      setShowAddSquadDialog(false);
      setSelectedWorkspaceId(null);
      setSelectedSquadId('');
      loadWorkspaces();
    } catch (error: any) {
      console.error('Error adding squad to workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to add squad to workspace',
        variant: 'destructive',
      });
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

  const availableSquads = squads.filter(s => !s.workspace_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workspaces</h2>
          <p className="text-muted-foreground">
            Collaborate with your team and agents across different projects
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
          {workspaces.map(workspace => {
            const workspaceSquads = squads.filter(s => s.workspace_id === workspace.id);
            
            return (
              <Card key={workspace.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{workspace.name}</span>
                        {workspace.owner_id === userId && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
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
                      <Badge variant="outline">
                        {workspaceSquads.length} squads
                      </Badge>
                    </div>

                    {/* Display squads in workspace */}
                    {workspaceSquads.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-xs text-muted-foreground mb-2">Squads:</p>
                        <div className="flex flex-wrap gap-1">
                          {workspaceSquads.map(squad => (
                            <Badge key={squad.id} variant="secondary" className="text-xs">
                              {squad.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedWorkspaceId(workspace.id);
                          setShowAddSquadDialog(true);
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Squad
                      </Button>
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Workspace Dialog */}
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

      {/* Add Squad to Workspace Dialog */}
      <Dialog open={showAddSquadDialog} onOpenChange={setShowAddSquadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Squad to Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableSquads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No available squads. All your squads are already assigned to workspaces.
              </p>
            ) : (
              <div className="space-y-2">
                <Label>Select Squad</Label>
                <Select value={selectedSquadId} onValueChange={setSelectedSquadId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a squad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSquads.map(squad => (
                      <SelectItem key={squad.id} value={squad.id}>
                        {squad.name} {squad.purpose && `- ${squad.purpose}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddSquadDialog(false);
              setSelectedSquadId('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSquadToWorkspace} 
              disabled={!selectedSquadId || availableSquads.length === 0}
            >
              Add Squad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
