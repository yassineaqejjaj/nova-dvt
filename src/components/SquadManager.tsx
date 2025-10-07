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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AgentSelector } from './AgentSelector';
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
  CheckCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { allAgents } from '@/data/mockData';

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
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [managingSquad, setManagingSquad] = useState<Squad | null>(null);
  const [userProfile, setUserProfile] = useState<{ xp: number; unlockedAgents: string[] }>({ xp: 0, unlockedAgents: [] });
  const [removeAgentId, setRemoveAgentId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<{
    recommendedAgents: string[];
    reasoning: string;
    squadName: string;
  } | null>(null);
  
  const [newSquadData, setNewSquadData] = useState({
    name: '',
    purpose: '',
    context: ''
  });

  React.useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileResult, unlockedResult] = await Promise.all([
        supabase.from('profiles').select('xp').eq('user_id', user.id).single(),
        supabase.from('unlocked_agents').select('agent_id').eq('user_id', user.id)
      ]);

      if (profileResult.data && unlockedResult.data) {
        setUserProfile({
          xp: profileResult.data.xp,
          unlockedAgents: unlockedResult.data.map((a: any) => a.agent_id)
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: squadData, error: squadError } = await supabase
        .from('squads')
        .insert({
          user_id: userId,
          name: newSquadData.name,
          purpose: newSquadData.purpose,
          is_active: true
        })
        .select()
        .single();

      if (squadError) throw squadError;

      // If we have recommendations, add the recommended agents to the squad
      if (recommendations && recommendations.recommendedAgents.length > 0) {
        const agentsToAdd = recommendations.recommendedAgents
          .map(agentId => allAgents.find(a => a.id === agentId))
          .filter(Boolean);

        const squadAgentsData = agentsToAdd.map(agent => ({
          squad_id: squadData.id,
          agent_id: agent!.id,
          agent_name: agent!.name,
          agent_specialty: agent!.specialty,
          agent_avatar: agent!.avatar,
          agent_backstory: agent!.backstory,
          agent_capabilities: agent!.capabilities,
          agent_tags: agent!.tags,
          agent_xp_required: agent!.xpRequired,
          agent_family_color: agent!.familyColor
        }));

        const { error: agentsError } = await supabase
          .from('squad_agents')
          .insert(squadAgentsData);

        if (agentsError) throw agentsError;
      }

      toast({
        title: "Squad created!",
        description: recommendations 
          ? `${newSquadData.name} is ready with ${recommendations.recommendedAgents.length} AI-recommended agents.`
          : `${newSquadData.name} is ready for action.`,
      });

      setNewSquadData({ name: '', purpose: '', context: '' });
      setRecommendations(null);
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

  const handleGetSuggestions = async () => {
    if (!newSquadData.context.trim()) {
      toast({
        title: "Context required",
        description: "Please describe your project context to get AI recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-squad', {
        body: {
          context: newSquadData.context,
          availableAgents: allAgents
        }
      });

      if (error) throw error;

      setRecommendations(data);
      
      // Auto-fill squad name if not already set
      if (!newSquadData.name && data.squadName) {
        setNewSquadData(prev => ({ ...prev, name: data.squadName }));
      }

      toast({
        title: "Recommendations ready!",
        description: `Found ${data.recommendedAgents.length} optimal agents for your squad.`,
      });
    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "Failed to get suggestions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGettingSuggestions(false);
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

  const handleAddAgent = async (agent: Agent) => {
    if (!managingSquad) return;

    try {
      const { error } = await supabase.from('squad_agents').insert({
        squad_id: managingSquad.id,
        agent_id: agent.id,
        agent_name: agent.name,
        agent_specialty: agent.specialty,
        agent_avatar: agent.avatar,
        agent_backstory: agent.backstory,
        agent_capabilities: agent.capabilities,
        agent_tags: agent.tags,
        agent_xp_required: agent.xpRequired,
        agent_family_color: agent.familyColor
      });

      if (error) throw error;

      // Unlock agent if not already unlocked
      if (!userProfile.unlockedAgents.includes(agent.id)) {
        await supabase.from('unlocked_agents').insert({
          user_id: userId,
          agent_id: agent.id
        });
      }

      toast({
        title: "Agent added",
        description: `${agent.name} has been added to ${managingSquad.name}`,
      });

      await onSquadUpdate();
      await loadUserProfile();
    } catch (error: any) {
      toast({
        title: "Failed to add agent",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveAgent = async () => {
    if (!removeAgentId || !managingSquad) return;

    try {
      const { error} = await supabase
        .from('squad_agents')
        .delete()
        .eq('squad_id', managingSquad.id)
        .eq('agent_id', removeAgentId);

      if (error) throw error;

      toast({
        title: "Agent removed",
        description: "Agent has been removed from the squad",
      });

      setRemoveAgentId(null);
      await onSquadUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to remove agent",
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Create New Squad</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSquad} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="squad-context">Project Context</Label>
                  <Textarea
                    id="squad-context"
                    placeholder="Describe your project... e.g., 'Building a SaaS app for project management with real-time collaboration features'"
                    value={newSquadData.context}
                    onChange={(e) => setNewSquadData(prev => ({ ...prev, context: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    AI will analyze this to recommend the best agents for your needs
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetSuggestions}
                  disabled={isGettingSuggestions || !newSquadData.context.trim()}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  {isGettingSuggestions ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Get AI Squad Recommendations</span>
                    </>
                  )}
                </Button>
              </div>

              {recommendations && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold text-sm">AI Recommendations</h4>
                      <p className="text-sm text-muted-foreground">{recommendations.reasoning}</p>
                      
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs">Recommended Agents ({recommendations.recommendedAgents.length})</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {recommendations.recommendedAgents.map((agentId) => {
                            const agent = allAgents.find(a => a.id === agentId);
                            if (!agent) return null;
                            
                            return (
                              <div key={agent.id} className="flex items-center space-x-3 p-2 bg-background rounded border">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={agent.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {agent.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{agent.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{agent.specialty}</p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {agent.familyColor}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />
              
              <div className="space-y-4">
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
                  <Label htmlFor="squad-purpose">Purpose (Optional)</Label>
                  <Textarea
                    id="squad-purpose"
                    placeholder="Describe what this squad will work on..."
                    value={newSquadData.purpose}
                    onChange={(e) => setNewSquadData(prev => ({ ...prev, purpose: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Creating...' : 'Create Squad'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    setRecommendations(null);
                    setNewSquadData({ name: '', purpose: '', context: '' });
                  }}
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
                      onClick={() => {
                        setManagingSquad(squad);
                        setShowAgentSelector(true);
                      }}
                      className="flex-1 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Manage
                    </Button>
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

      {/* Agent Selector Dialog */}
      <AgentSelector
        open={showAgentSelector}
        onClose={() => {
          setShowAgentSelector(false);
          setManagingSquad(null);
        }}
        currentAgents={managingSquad?.agents || []}
        onAddAgent={handleAddAgent}
        userXP={userProfile.xp}
        unlockedAgents={userProfile.unlockedAgents}
      />

      {/* Remove Agent Confirmation Dialog */}
      <AlertDialog open={!!removeAgentId} onOpenChange={() => setRemoveAgentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the agent from the squad. You can add them back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAgent}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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