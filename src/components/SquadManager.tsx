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
import { SquadCard } from './squad/SquadCard';
import { SquadTemplates, SquadTemplate } from './squad/SquadTemplates';
import { supabase } from '@/integrations/supabase/client';
import { Squad, Agent } from '@/types';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  MessageCircle, 
  Sparkles,
  Loader2,
  Lightbulb
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

  // Separate active and inactive squads
  const activeSquads = squads.filter(s => currentSquad?.id === s.id);
  const inactiveSquads = squads.filter(s => currentSquad?.id !== s.id);

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

  const handleSelectTemplate = (template: SquadTemplate) => {
    setNewSquadData({
      name: template.name,
      purpose: template.suggestedPurpose,
      context: ''
    });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Gestion des Squads</h2>
          <p className="text-muted-foreground">
            Créez une squad par projet, client ou type de travail.
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Créer une Squad</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Nouvelle Squad</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSquad} className="space-y-6">
              {/* Squad Templates */}
              <SquadTemplates onSelectTemplate={handleSelectTemplate} />
              
              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="squad-name">Nom de la Squad *</Label>
                  <Input
                    id="squad-name"
                    placeholder="ex: Discovery Checkout, COPIL IA Retail..."
                    value={newSquadData.name}
                    onChange={(e) => setNewSquadData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Utilisez un nom orienté objectif, pas générique
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="squad-purpose">Rôle de la Squad *</Label>
                  <Textarea
                    id="squad-purpose"
                    placeholder="Décrivez le rôle de cette squad... ex: Explorer les besoins utilisateurs et définir le périmètre produit"
                    value={newSquadData.purpose}
                    onChange={(e) => setNewSquadData(prev => ({ ...prev, purpose: e.target.value }))}
                    rows={2}
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="squad-context" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Contexte projet (optionnel)
                  </Label>
                  <Textarea
                    id="squad-context"
                    placeholder="Décrivez votre projet pour obtenir des recommandations d'agents personnalisées..."
                    value={newSquadData.context}
                    onChange={(e) => setNewSquadData(prev => ({ ...prev, context: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetSuggestions}
                  disabled={isGettingSuggestions || !newSquadData.context.trim()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isGettingSuggestions ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyse en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Obtenir des recommandations IA</span>
                    </>
                  )}
                </Button>
              </div>

              {recommendations && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold text-sm">Recommandations IA</h4>
                      <p className="text-sm text-muted-foreground">{recommendations.reasoning}</p>
                      
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs">Agents recommandés ({recommendations.recommendedAgents.length})</Label>
                        <ScrollArea className="h-48">
                          <div className="grid grid-cols-1 gap-2 pr-4">
                            {recommendations.recommendedAgents.map((agentId) => {
                              const agent = allAgents.find(a => a.id === agentId);
                              if (!agent) return null;
                              
                              return (
                                <div key={agent.id} className="flex items-center gap-3 p-2 bg-background rounded border">
                                  <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage src={agent.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {agent.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{agent.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{agent.specialty}</p>
                                  </div>
                                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                                    {agent.familyColor}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isLoading || !newSquadData.name.trim() || !newSquadData.purpose.trim()} className="flex-1">
                  {isLoading ? 'Création...' : 'Créer la Squad'}
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
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {squads.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <Users className="w-16 h-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Aucune squad créée</h3>
              <p className="text-muted-foreground mb-4">
                Créez une squad par projet, client ou type de travail.
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Créer votre première Squad
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Squad Section */}
          {activeSquads.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Squad active</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeSquads.map((squad) => (
                  <SquadCard
                    key={squad.id}
                    squad={squad}
                    isActive={true}
                    onSetActive={() => {}}
                    onManage={() => {
                      setManagingSquad(squad);
                      setShowAgentSelector(true);
                    }}
                    onChat={() => onSquadChange(squad)}
                    onEdit={() => setEditingSquad(squad)}
                    onDelete={() => handleDeleteSquad(squad)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Squads Section */}
          {inactiveSquads.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Autres squads ({inactiveSquads.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveSquads.map((squad) => (
                  <SquadCard
                    key={squad.id}
                    squad={squad}
                    isActive={false}
                    onSetActive={() => handleSetActiveSquad(squad)}
                    onManage={() => {
                      setManagingSquad(squad);
                      setShowAgentSelector(true);
                    }}
                    onChat={() => onSquadChange(squad)}
                    onEdit={() => setEditingSquad(squad)}
                    onDelete={() => handleDeleteSquad(squad)}
                  />
                ))}
              </div>
            </div>
          )}
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
            <AlertDialogTitle>Retirer l'agent ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cet agent sera retiré de la squad. Vous pourrez l'ajouter à nouveau plus tard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAgent}>Retirer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Squad Dialog */}
      <Dialog open={!!editingSquad} onOpenChange={() => setEditingSquad(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la Squad</DialogTitle>
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
                <Label htmlFor="edit-squad-name">Nom de la Squad</Label>
                <Input
                  id="edit-squad-name"
                  name="name"
                  defaultValue={editingSquad.name}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-squad-purpose">Rôle de la Squad</Label>
                <Textarea
                  id="edit-squad-purpose"
                  name="purpose"
                  defaultValue={editingSquad.purpose}
                  rows={3}
                  placeholder="Décrivez le rôle de cette squad..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingSquad(null)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};