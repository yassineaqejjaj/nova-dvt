import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Squad, Agent } from '@/types';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  X, 
  MessageCircle, 
  Calendar,
  Trash2,
  Edit,
  CheckCircle
} from 'lucide-react';

interface SquadManagerProps {
  squads: Squad[];
  currentSquad: Squad | null;
  onSquadChange: (squad: Squad) => void;
  onSquadUpdate: () => void;
  userId: string;
}

export const SquadManager: React.FC<SquadManagerProps> = ({
  squads,
  currentSquad,
  onSquadChange,
  onSquadUpdate,
  userId
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newSquadData, setNewSquadData] = useState({
    name: '',
    purpose: ''
  });

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('squads')
        .insert({
          user_id: userId,
          name: newSquadData.name,
          purpose: newSquadData.purpose,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Squad created!",
        description: `${newSquadData.name} is ready for action.`,
      });

      setNewSquadData({ name: '', purpose: '' });
      setShowCreateDialog(false);
      onSquadUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to create squad",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSquad = async (squad: Squad, updates: Partial<Squad>) => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('squads')
        .update({
          name: updates.name,
          purpose: updates.purpose
        })
        .eq('id', squad.id);

      if (error) throw error;

      toast({
        title: "Squad updated!",
        description: "Changes saved successfully.",
      });

      setEditingSquad(null);
      onSquadUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to update squad",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSquad = async (squad: Squad) => {
    if (!confirm(`Are you sure you want to delete "${squad.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('squads')
        .delete()
        .eq('id', squad.id);

      if (error) throw error;

      toast({
        title: "Squad deleted",
        description: `${squad.name} has been removed.`,
      });

      if (currentSquad?.id === squad.id) {
        const remainingSquads = squads.filter(s => s.id !== squad.id);
        if (remainingSquads.length > 0) {
          onSquadChange(remainingSquads[0]);
        }
      }
      
      onSquadUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to delete squad",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActiveSquad = async (squad: Squad) => {
    try {
      // Set all squads to inactive first
      await supabase
        .from('squads')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Set the selected squad as active
      await supabase
        .from('squads')
        .update({ is_active: true })
        .eq('id', squad.id);

      onSquadChange(squad);
      onSquadUpdate();
      
      toast({
        title: "Active squad changed",
        description: `Switched to ${squad.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to switch squad",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Squad Management</h2>
          <p className="text-muted-foreground">
            Create and manage multiple AI squads for different projects.
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Squad</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Squad</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSquad} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="squad-name">Squad Name</Label>
                <Input
                  id="squad-name"
                  placeholder="e.g., Product Launch Team"
                  value={newSquadData.name}
                  onChange={(e) => setNewSquadData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="squad-purpose">Purpose</Label>
                <Textarea
                  id="squad-purpose"
                  placeholder="Describe what this squad will work on..."
                  value={newSquadData.purpose}
                  onChange={(e) => setNewSquadData(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Creating...' : 'Create Squad'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {squads.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Squads Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first squad to start building AI teams.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Squad
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {squads.map((squad) => (
            <Card 
              key={squad.id} 
              className={`relative transition-all hover:shadow-md ${
                currentSquad?.id === squad.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{squad.name}</span>
                      {currentSquad?.id === squad.id && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                    </CardTitle>
                    {squad.purpose && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {squad.purpose}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSquad(squad)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSquad(squad)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{squad.agents?.length || 0} agents</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(squad.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {squad.agents && squad.agents.length > 0 && (
                    <div className="flex -space-x-2">
                      {squad.agents.slice(0, 4).map((agent, index) => (
                        <Avatar key={agent.id} className="w-8 h-8 border-2 border-background">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback className="text-xs">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {squad.agents.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs font-medium">+{squad.agents.length - 4}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex space-x-2">
                    {currentSquad?.id !== squad.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActiveSquad(squad)}
                        className="flex-1 text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Make Active
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSquadChange(squad)}
                      disabled={!squad.agents || squad.agents.length === 0}
                      className="flex-1 text-xs"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Squad Dialog */}
      <Dialog open={!!editingSquad} onOpenChange={() => setEditingSquad(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Squad</DialogTitle>
          </DialogHeader>
          {editingSquad && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateSquad(editingSquad, {
                  name: formData.get('name') as string,
                  purpose: formData.get('purpose') as string
                });
              }} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-squad-name">Squad Name</Label>
                <Input
                  id="edit-squad-name"
                  name="name"
                  defaultValue={editingSquad.name}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-squad-purpose">Purpose</Label>
                <Textarea
                  id="edit-squad-purpose"
                  name="purpose"
                  defaultValue={editingSquad.purpose}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingSquad(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};