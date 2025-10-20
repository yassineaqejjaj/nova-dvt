import React, { useState, useEffect } from 'react';
import { SidebarNav } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AgentGallery } from '@/components/AgentGallery';
import { ChatInterface } from '@/components/ChatInterface';
import { CanvasGenerator } from '@/components/CanvasGenerator';
import { Workflows } from '@/components/Workflows';
import { Artifacts } from '@/components/Artifacts';
import { WorkspaceManager } from '@/components/WorkspaceManager';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { AuthDialog } from '@/components/AuthDialog';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { SquadManager } from '@/components/SquadManager';
import { UserProfile } from '@/components/UserProfile';
import { OnboardingModal } from '@/components/OnboardingModal';
import { InteractiveTutorial } from '@/components/InteractiveTutorial';
import { MagicBar } from '@/components/MagicBar';
import { ShareableMomentCard } from '@/components/ShareableMomentCard';
import { useSessionMemory } from '@/hooks/useSessionMemory';
import { ProductContextPage } from '@/components/ProductContextPage';
import { InstantPRD } from '@/components/InstantPRD';
import { RealityMode } from '@/components/RealityMode';
import { ConfidentialityBanner } from '@/components/ConfidentialityBanner';
import { MeetingMinuteGenerator } from '@/components/MeetingMinuteGenerator';
import { RACIGenerator } from '@/components/RACIGenerator';
import EpicToUserStories from '@/components/EpicToUserStories';
import { DocumentRoadmapGenerator } from '@/components/DocumentRoadmapGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Agent, Squad, UserProfile as UserProfileType, TabType } from '@/types';
import { allAgents } from '@/data/mockData';
import { Users, Star, Zap, Trophy, X, Plus, Menu, Loader2, HelpCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const { user, userProfile, squads, loading, needsOnboarding, refreshUserData, addXP, completeOnboarding } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentSquad, setCurrentSquad] = useState<Squad | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCanvasGenerator, setShowCanvasGenerator] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [shareableMoment, setShareableMoment] = useState<{
    open: boolean;
    type: 'level_up' | 'agent_unlock' | 'workflow_complete';
    title: string;
    description: string;
    shareData?: any;
  }>({
    open: false,
    type: 'level_up',
    title: '',
    description: '',
  });

  const { updateSession } = useSessionMemory(user?.id);
  const [showContextManager, setShowContextManager] = useState(false);
  const [customAgents, setCustomAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuth(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (squads.length > 0 && !currentSquad) {
      const activeSquad = squads.find(s => s.name === 'Product Launch Team') || squads[0];
      setCurrentSquad(activeSquad);
    }
  }, [squads, currentSquad]);

  const handleAddToSquad = async (agent: Agent) => {
    if (!currentSquad || !user || !userProfile) {
      toast.error('Please select a squad first');
      return;
    }

    if (currentSquad.agents.length >= 5) {
      toast.error('Squad is full (max 5 agents)');
      return;
    }

    if (currentSquad.agents.some(a => a.id === agent.id)) {
      toast.error(`${agent.name} is already in your squad`);
      return;
    }

    if (!userProfile.unlockedAgents.includes(agent.id) && userProfile.xp < agent.xpRequired) {
      toast.error(`Need ${agent.xpRequired - userProfile.xp} more XP to unlock ${agent.name}`);
      return;
    }

    try {
      // Add agent to squad
      await supabase.from('squad_agents').insert({
        squad_id: currentSquad.id,
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

      // Unlock agent if not already unlocked
      if (!userProfile.unlockedAgents.includes(agent.id)) {
        await supabase.from('unlocked_agents').insert({
          user_id: user.id,
          agent_id: agent.id
        });
      }

      const xpResult = await addXP(25, 'adding agent to squad');
      if (xpResult?.leveledUp) {
        toast.success(`🎉 Level Up! You've reached Level ${xpResult.newLevel}!`);
      } else {
        toast.success(`+25 XP for adding ${agent.name} to squad!`);
      }

      await refreshUserData();
    } catch (error: any) {
      toast.error('Failed to add agent to squad');
      console.error('Error adding agent to squad:', error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Update session memory
    if (user?.id) {
      updateSession({ lastTab: tab });
    }
  };

  // Listen for milestone events to trigger shareable moments
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('milestone-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setShareableMoment({
            open: true,
            type: 'agent_unlock',
            title: 'New Badge Unlocked!',
            description: payload.new.badge_name,
            shareData: { badge: payload.new },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleMagicBarAction = (action: string, data?: any) => {
    switch (action) {
      case 'create_canvas':
        setShowCanvasGenerator(true);
        break;
      case 'generate_prd':
        setActiveTab('instant-prd');
        break;
      case 'generate_summary':
        // Handle summary generation
        console.log('Generate summary');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleCreateAgent = (newAgent: Agent) => {
    setCustomAgents(prev => [...prev, newAgent]);
  };

  const getAllAgents = () => [...allAgents, ...customAgents];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Squad Mate...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto p-6">
            <div className="bg-white rounded-lg p-4 shadow-sm mx-auto w-fit">
              <img src="/lovable-uploads/420dfc65-a110-4707-9eb4-3ffc08d33dd3.png" alt="Squad Mate" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Welcome to Squad Mate</h1>
              <p className="text-muted-foreground mb-6">
                Assemble custom squads of specialized AI agents for your projects
              </p>
            </div>
            <Button onClick={() => setShowAuth(true)} size="lg">
              Get Started
            </Button>
          </div>
        </div>
        <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  const renderTabContent = () => {
    if (!userProfile) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={userProfile}
            squads={squads}
            onNavigate={setActiveTab}
          />
        );
      
      case 'agents':
        return (
          <AgentGallery
            user={userProfile}
            currentSquadAgents={currentSquad?.agents || []}
            onAddToSquad={handleAddToSquad}
            onViewAgentDetails={setSelectedAgent}
            onAgentCreated={handleCreateAgent}
            customAgents={customAgents}
          />
        );
      
      case 'squads':
        return (
          <SquadManager
            squads={squads}
            currentSquad={currentSquad}
            onSquadChange={setCurrentSquad}
            onSquadUpdate={refreshUserData}
            userId={user!.id}
          />
        );
      
      case 'reality-mode':
        return (
          <RealityMode
            currentSquad={currentSquad?.agents || []}
            squadId={currentSquad?.id}
            userId={user!.id}
            onAddXP={async (amount: number, reason: string) => {
              const result = await addXP(amount, reason);
              if (result?.leveledUp) {
                toast.success(`🎉 Level Up! You've reached Level ${result.newLevel}!`);
              } else {
                toast.success(`+${amount} XP for ${reason}`);
              }
            }}
          />
        );

      case 'chat':
        return (
          <ChatInterface
            currentSquad={currentSquad?.agents || []}
            squadId={currentSquad?.id}
            onAddXP={async (amount: number, reason: string) => {
              const result = await addXP(amount, reason);
              if (result?.leveledUp) {
                toast.success(`🎉 Level Up! You've reached Level ${result.newLevel}!`);
              } else {
                toast.success(`+${amount} XP for ${reason}`);
              }
            }}
          />
        );
      
      case 'workflows':
        return <Workflows />;
      
      case 'instant-prd':
        return <InstantPRD />;
      
      case 'document-roadmap':
        return <DocumentRoadmapGenerator />;
      
      case 'meeting-minutes':
        return <MeetingMinuteGenerator />;
      
      case 'raci-generator':
        return <RACIGenerator />;
      
      case 'product-context':
        return <ProductContextPage />;
      
      case 'epic-to-stories':
        return <EpicToUserStories />;
      
      case 'artifacts':
        return <Artifacts userId={user!.id} />;
      
      case 'analytics':
        return <AnalyticsDashboard userId={user!.id} />;

      case 'gamification':
        return <GamificationDashboard />;

      case 'admin':
        return <AdminPanel />;
      
      default:
        return null;
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-background relative flex w-full">
        <SidebarNav
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          squadCount={squads.length}
          hasActiveChat={!!currentSquad && currentSquad.agents.length > 0}
          onCreateCanvas={() => setShowCanvasGenerator(true)}
          onManageContexts={() => setActiveTab('product-context')}
        />
        
        <div className="flex-1 flex flex-col relative z-10">
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SidebarTrigger className="lg:hidden" />
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <img src="/lovable-uploads/420dfc65-a110-4707-9eb4-3ffc08d33dd3.png" alt="Squad Mate" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Nova</h1>
                  <p className="text-xs text-muted-foreground">Powered by Devoteam</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Tutorial Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTutorial(true)}
                      className="relative"
                    >
                      <Sparkles className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Revoir le tutoriel</p>
                  </TooltipContent>
                </Tooltip>

                {/* XP and Level Display */}
                {userProfile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => setActiveTab('gamification')}
                        className="hidden sm:flex items-center space-x-3 bg-muted/50 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted transition-all"
                      >
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-agent-orange" />
                          <span className="text-sm font-medium">Level {userProfile.level}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{userProfile.xp} XP</span>
                        </div>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary transition-all duration-300"
                            style={{ width: `${((userProfile.xp % 200) / 200) * 100}%` }}
                          />
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cliquez pour voir votre progression</p>
                      <p className="text-xs text-muted-foreground">Prochain niveau: {200 - (userProfile.xp % 200)} XP</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* User Profile */}
                {userProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfile(true)}
                    className="flex items-center space-x-2 hover:bg-muted/50"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userProfile.avatar_url || ''} />
                      <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{userProfile.name}</p>
                      <p className="text-xs text-muted-foreground">{userProfile.role}</p>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8 flex-1">
            <ConfidentialityBanner />
            {renderTabContent()}
          </main>
        </div>
      </div>

      {/* Agent Details Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-md">
          {selectedAgent && userProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedAgent.avatar} />
                    <AvatarFallback>
                      {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedAgent.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAgent.specialty}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedAgent.xpRequired > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">XP Required:</span>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{selectedAgent.xpRequired}</span>
                    </Badge>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Background</h4>
                  <p className="text-sm text-muted-foreground">{selectedAgent.backstory}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.capabilities.map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Expertise Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-2">
                  {userProfile.unlockedAgents.includes(selectedAgent.id) || userProfile.xp >= selectedAgent.xpRequired ? (
                    <Button
                      onClick={() => {
                        handleAddToSquad(selectedAgent);
                        setSelectedAgent(null);
                      }}
                      disabled={currentSquad?.agents.some(a => a.id === selectedAgent.id)}
                      className="flex-1"
                    >
                      {currentSquad?.agents.some(a => a.id === selectedAgent.id) ? (
                        'Already in Squad'
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          Add to Squad
                        </>
                      )}
                    </Button>
                  ) : (
                    <Badge variant="outline" className="flex-1 justify-center py-2">
                      <Zap className="w-3 h-3 mr-1" />
                      Need {selectedAgent.xpRequired - userProfile.xp} more XP
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>


      {/* Canvas Generator Dialog */}
      <CanvasGenerator
        open={showCanvasGenerator}
        onClose={() => setShowCanvasGenerator(false)}
      />

      {/* Context Manager Modal - Deprecated */}

      {/* Canvas Generator Dialog */}
      {userProfile && (
        <UserProfile
            user={userProfile}
            open={showProfile}
            onClose={() => setShowProfile(false)}
            onUserUpdate={refreshUserData}
            onAdminSwitch={() => window.location.href = '/admin'}
          />
      )}

      {/* Onboarding Modal */}
      {needsOnboarding && user && (
        <OnboardingModal
          open={needsOnboarding}
          userId={user.id}
          onComplete={() => {
            completeOnboarding();
            refreshUserData();
            setShowTutorial(true);
          }}
        />
      )}

      {/* Interactive Tutorial */}
      <InteractiveTutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onNavigate={(tab) => setActiveTab(tab as TabType)}
      />

      {/* Magic Bar - AI Command Palette */}
      <MagicBar onNavigate={handleTabChange} onAction={handleMagicBarAction} />

      {/* Shareable Moment Card */}
      <ShareableMomentCard
        open={shareableMoment.open}
        onOpenChange={(open) => setShareableMoment({ ...shareableMoment, open })}
        momentType={shareableMoment.type}
        title={shareableMoment.title}
        description={shareableMoment.description}
        shareData={shareableMoment.shareData}
      />
    </SidebarProvider>
  );
};

export default Index;