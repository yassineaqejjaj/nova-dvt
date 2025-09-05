import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { AgentGallery } from '@/components/AgentGallery';
import { ChatInterface } from '@/components/ChatInterface';
import { UserProfile, Agent, Squad, TabType } from '@/types';
import { createDemoUser, allAgents } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import heroBackground from '@/assets/hero-background.jpg';
import { 
  Sparkles, 
  Users, 
  MessageCircle,
  Star,
  Zap,
  X
} from 'lucide-react';

const Index = () => {
  // State Management
  const [user, setUser] = useState<UserProfile>(createDemoUser());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [squads, setSquads] = useState<Squad[]>([]);
  const [currentSquad, setCurrentSquad] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDetails, setShowAgentDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Initialize demo data
  useEffect(() => {
    // Create a demo squad for better demonstration
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
    setCurrentSquad(demoSquad.agents);
  }, []);

  // Helper Functions
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
      toast({
        title: "🎉 Level Up!",
        description: `Congratulations! You've reached Level ${newLevel}!`,
      });
    } else {
      toast({
        title: "XP Earned!",
        description: `+${amount} XP for ${reason}`,
      });
    }
  };

  const unlockAgent = (agent: Agent) => {
    if (user.xp >= agent.xpRequired && !user.unlockedAgents.includes(agent.id)) {
      setUser(prev => ({
        ...prev,
        unlockedAgents: [...prev.unlockedAgents, agent.id]
      }));
      
      toast({
        title: "🎯 Agent Unlocked!",
        description: `${agent.name} is now available in your gallery!`,
      });
    }
  };

  const handleAddToSquad = (agent: Agent) => {
    // Check if squad is full (max 5 agents)
    if (currentSquad.length >= 5) {
      toast({
        title: "Squad Full",
        description: "You can only have 5 agents in a squad at a time.",
        variant: "destructive"
      });
      return;
    }

    // Check if agent is already in squad
    if (currentSquad.some(a => a.id === agent.id)) {
      toast({
        title: "Agent Already in Squad",
        description: `${agent.name} is already part of your current squad.`,
        variant: "destructive"
      });
      return;
    }

    // Unlock agent if user has enough XP
    if (!user.unlockedAgents.includes(agent.id)) {
      if (user.xp >= agent.xpRequired) {
        unlockAgent(agent);
      } else {
        toast({
          title: "Insufficient XP",
          description: `You need ${agent.xpRequired - user.xp} more XP to unlock ${agent.name}.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Add agent to current squad
    setCurrentSquad(prev => [...prev, agent]);
    addXP(25, 'adding agent to squad');
    
    toast({
      title: "Agent Added!",
      description: `${agent.name} has joined your squad!`,
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'chat' && currentSquad.length === 0) {
      toast({
        title: "No Squad Available",
        description: "Create a squad with agents first to start chatting.",
        variant: "destructive"
      });
      setActiveTab('squads');
    }
  };

  // Render Current Tab Content
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
            currentSquadAgents={currentSquad}
            onAddToSquad={handleAddToSquad}
            onViewAgentDetails={(agent) => {
              setSelectedAgent(agent);
              setShowAgentDetails(true);
            }}
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
            
            {/* Current Squad */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Current Squad ({currentSquad.length}/5)</span>
                </h3>
                {currentSquad.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('chat')}
                    className="flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Start Chatting</span>
                  </Button>
                )}
              </div>
              
              {currentSquad.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentSquad.map((agent) => (
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
                          setCurrentSquad(prev => prev.filter(a => a.id !== agent.id));
                          toast({
                            title: "Agent Removed",
                            description: `${agent.name} has been removed from your squad.`,
                          });
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
            currentSquad={currentSquad}
            onAddXP={addXP}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <Header 
        user={user} 
        onOpenProfile={() => setShowProfile(true)} 
      />
      
      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        squadCount={squads.length}
        hasActiveChat={currentSquad.length > 0}
      />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </main>

      {/* Agent Details Modal */}
      <Dialog open={showAgentDetails} onOpenChange={setShowAgentDetails}>
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
                {/* XP Requirement */}
                {selectedAgent.xpRequired > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">XP Required:</span>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{selectedAgent.xpRequired}</span>
                    </Badge>
                  </div>
                )}
                
                {/* Backstory */}
                <div>
                  <h4 className="font-medium mb-2">Background</h4>
                  <p className="text-sm text-muted-foreground">{selectedAgent.backstory}</p>
                </div>
                
                {/* Capabilities */}
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
                
                {/* Tags */}
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
                
                {/* Actions */}
                <div className="flex gap-2">
                  {user.unlockedAgents.includes(selectedAgent.id) || user.xp >= selectedAgent.xpRequired ? (
                    <Button
                      onClick={() => {
                        handleAddToSquad(selectedAgent);
                        setShowAgentDetails(false);
                      }}
                      disabled={currentSquad.some(a => a.id === selectedAgent.id)}
                      className="flex-1"
                    >
                      {currentSquad.some(a => a.id === selectedAgent.id) ? (
                        <>Already in Squad</>
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

      {/* Profile Modal Placeholder */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Profile management coming soon!</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;