import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SidebarNav } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AgentGallery } from '@/components/AgentGallery';
import { ChatInterface } from '@/components/ChatInterface';

import { CanvasGenerator } from '@/components/CanvasGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Agent, Squad, UserProfile, TabType } from '@/types';
import { allAgents, createDemoUser } from '@/data/mockData';
import { Users, Star, Zap, Trophy, X, Plus, Menu } from 'lucide-react';
import { toast } from 'sonner';
import heroBackground from '@/assets/hero-background.jpg';

const Index = () => {
  const [user, setUser] = useState<UserProfile>(createDemoUser());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [squads, setSquads] = useState<Squad[]>([]);
  const [currentSquad, setCurrentSquad] = useState<Squad | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  
  const [showCanvasGenerator, setShowCanvasGenerator] = useState(false);
  const [customAgents, setCustomAgents] = useState<Agent[]>([]);

  // Initialize demo data
  useEffect(() => {
    const demoSquad: Squad = {
      id: 'demo-squad-1',
      name: 'Product Launch Team',
      purpose: 'Plan and execute the launch of our new AI-powered platform',
      agents: [
        allAgents.find(a => a.id === 'sarah-pm')!,
        allAgents.find(a => a.id === 'alex-ux')!,
        allAgents.find(a => a.id === 'david-fullstack')!,
        allAgents.find(a => a.id === 'emma-growth')!
      ].filter(Boolean),
      createdAt: new Date()
    };
    setSquads([demoSquad]);
    setCurrentSquad(demoSquad);
  }, []);

  const addXP = (amount: number, reason: string) => {
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 200) + 1;
    const leveledUp = newLevel > user.level;

    setUser(prev => ({
      ...prev,
      xp: newXP,
      level: newLevel
    }));

    if (leveledUp) {
      toast.success(`🎉 Level Up! You've reached Level ${newLevel}!`);
    } else {
      toast.success(`+${amount} XP for ${reason}`);
    }
  };

  const unlockAgent = (agent: Agent) => {
    if (user.xp >= agent.xpRequired && !user.unlockedAgents.includes(agent.id)) {
      setUser(prev => ({
        ...prev,
        unlockedAgents: [...prev.unlockedAgents, agent.id]
      }));
      toast.success(`🎯 ${agent.name} unlocked!`);
    }
  };

  const handleAddToSquad = (agent: Agent) => {
    if (!currentSquad) {
      toast.error('Please create a squad first');
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

    if (!user.unlockedAgents.includes(agent.id)) {
      if (user.xp >= agent.xpRequired) {
        unlockAgent(agent);
      } else {
        toast.error(`Need ${agent.xpRequired - user.xp} more XP to unlock ${agent.name}`);
        return;
      }
    }

    const updatedSquad = {
      ...currentSquad,
      agents: [...currentSquad.agents, agent]
    };
    setCurrentSquad(updatedSquad);
    setSquads(prev => prev.map(s => s.id === currentSquad.id ? updatedSquad : s));
    addXP(25, 'adding agent to squad');
    toast.success(`${agent.name} added to squad!`);
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'chat' && !currentSquad) {
      toast.error('Please create a squad first to start chatting');
      return;
    }
    setActiveTab(tab);
  };

  const handleCreateAgent = (newAgent: Agent) => {
    setCustomAgents(prev => [...prev, newAgent]);
    setUser(prev => ({
      ...prev,
      unlockedAgents: [...prev.unlockedAgents, newAgent.id]
    }));
  };

  const getAllAgents = () => [...allAgents, ...customAgents];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            squads={squads}
            onNavigate={setActiveTab}
          />
        );
      
        case 'agents':
          return (
            <AgentGallery
              user={user}
              currentSquadAgents={currentSquad?.agents || []}
              onAddToSquad={handleAddToSquad}
              onViewAgentDetails={setSelectedAgent}
              onAgentCreated={handleCreateAgent}
              customAgents={customAgents}
            />
          );
      
      case 'squads':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Squad Builder</h2>
              <p className="text-muted-foreground mb-6">
                Assemble your perfect team of AI agents
              </p>
            </div>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Current Squad ({currentSquad?.agents.length || 0}/5)</span>
                </h3>
                {currentSquad && currentSquad.agents.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('chat')}
                    className="flex items-center space-x-2"
                  >
                    <span>Start Chatting</span>
                  </Button>
                )}
              </div>
              
              {currentSquad && currentSquad.agents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentSquad.agents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.specialty}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (currentSquad) {
                            const updatedSquad = {
                              ...currentSquad,
                              agents: currentSquad.agents.filter(a => a.id !== agent.id)
                            };
                            setCurrentSquad(updatedSquad);
                            setSquads(prev => prev.map(s => s.id === currentSquad.id ? updatedSquad : s));
                            toast.success(`${agent.name} removed from squad`);
                          }
                        }}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No agents in your squad yet</p>
                  <Button onClick={() => setActiveTab('agents')}>
                    Browse Agent Gallery
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );
      
      case 'chat':
        return (
          <ChatInterface
            currentSquad={currentSquad?.agents || []}
            onAddXP={addXP}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-background relative flex w-full">
        <div className="absolute inset-0 bg-white" />
        
        <SidebarNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          squadCount={squads.length}
          hasActiveChat={!!currentSquad && currentSquad.agents.length > 0}
          onCreateCanvas={() => setShowCanvasGenerator(true)}
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
                  <h1 className="text-xl font-bold gradient-text">Squad Mate</h1>
                  <p className="text-xs text-muted-foreground">Powered by Devoteam</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* XP and Level Display */}
                <div className="hidden sm:flex items-center space-x-3 bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-agent-orange" />
                    <span className="text-sm font-medium">Level {user.level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{user.xp} XP</span>
                  </div>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary transition-all duration-300"
                      style={{ width: `${((user.xp % 200) / 200) * 100}%` }}
                    />
                  </div>
                </div>

                {/* User Profile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2 hover:bg-muted/50"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </Button>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8 flex-1">
            {renderTabContent()}
          </main>
        </div>
      </div>

      {/* Agent Details Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-md">
          {selectedAgent && (
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
                  {user.unlockedAgents.includes(selectedAgent.id) || user.xp >= selectedAgent.xpRequired ? (
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
                      Need {selectedAgent.xpRequired - user.xp} more XP
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

      {/* User Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Your progress and achievements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Profile management coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Index;