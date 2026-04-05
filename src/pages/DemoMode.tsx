import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import { WorkSidebar } from '@/components/navigation/WorkSidebar';
import { ActionDashboard } from '@/components/dashboard/ActionDashboard';
import { AgentGallery } from '@/components/AgentGallery';
import { ChatInterface } from '@/components/ChatInterface';
import { Workflows } from '@/components/Workflows';
import { Artifacts } from '@/components/Artifacts';
import { SquadManager } from '@/components/SquadManager';
import { InstantPRD } from '@/components/InstantPRD';
import { Toolbox } from '@/components/tools/Toolbox';
import EpicToUserStories from '@/components/EpicToUserStories';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Agent, TabType } from '@/types';
import { X, Play, ChevronRight, CheckCircle2, Sparkles, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const DemoContent: React.FC = () => {
  const navigate = useNavigate();
  const demo = useDemo();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showGuide, setShowGuide] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleTabChange = (tab: TabType) => {
    if (!demo.isTabAllowed(tab)) {
      toast.info('This feature is available in the full version.', {
        action: { label: 'Sign up', onClick: () => navigate('/?auth=login') },
      });
      return;
    }
    setActiveTab(tab);

    // Mark guided step as completed
    const stepIndex = demo.guidedSteps.findIndex(s => s.targetTab === tab);
    if (stepIndex >= 0) {
      demo.setCurrentStep(stepIndex + 1);
    }
  };

  const handleAddToSquad = async (agent: Agent) => {
    const ok = demo.addAgentToSquad(agent);
    if (ok) {
      toast.success(`${agent.name} added to squad!`);
    } else {
      toast.error('Squad is full (max 5 agents in demo).');
    }
  };

  const completedCount = demo.guidedSteps.filter(s => s.completed).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ActionDashboard
            user={demo.demoProfile}
            squads={demo.demoSquads}
            onNavigate={handleTabChange}
            session={null}
          />
        );
      case 'agents':
        return (
          <AgentGallery
            user={demo.demoProfile}
            currentSquadAgents={demo.demoSquad?.agents || []}
            onAddToSquad={handleAddToSquad}
            onViewAgentDetails={setSelectedAgent}
            onAgentCreated={() => {}}
            customAgents={[]}
          />
        );
      case 'squads':
        return (
          <SquadManager
            squads={demo.demoSquads}
            currentSquad={demo.demoSquad}
            onSquadChange={() => {}}
            onSquadUpdate={() => {}}
            userId="demo-user"
          />
        );
      case 'chat':
        return (
          <ChatInterface
            currentSquad={demo.demoSquad?.agents || []}
            squadId={demo.demoSquad?.id}
            onAddXP={async () => {}}
          />
        );
      case 'workflows':
        return <Workflows />;
      case 'instant-prd':
        return <InstantPRD />;
      case 'epic-to-stories':
        return <EpicToUserStories />;
      case 'toolbox':
        return (
          <Toolbox
            onSelectTool={(toolId) => {
              const routes: Record<string, TabType> = {
                'prd': 'instant-prd',
                'epic-stories': 'epic-to-stories',
              };
              if (routes[toolId]) {
                handleTabChange(routes[toolId]);
              } else {
                toast.info('This tool is available in the full version.');
              }
            }}
          />
        );
      case 'artifacts':
        return <Artifacts userId="demo-user" />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Lock className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Available in the full version</h2>
            <p className="text-muted-foreground mb-6">Sign up to unlock all features.</p>
            <Button onClick={() => navigate('/?auth=login')} style={{ background: '#F8485E', borderRadius: 50 }} className="text-white">
              Get started
            </Button>
          </div>
        );
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-background relative flex w-full">
        <WorkSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          squadCount={1}
          hasActiveChat={true}
          onCreateCanvas={() => toast.info('Available in full version')}
          onManageContexts={() => toast.info('Available in full version')}
        />

        <div className="flex-1 flex flex-col relative z-10">
          {/* Demo header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nova</h1>
                  <p className="text-xs text-muted-foreground">Demo Mode</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="hidden sm:flex gap-1 border-[#F8485E]/30 text-[#F8485E]">
                  <Play className="w-3 h-3" /> Demo
                </Badge>
                <Button
                  size="sm"
                  onClick={() => navigate('/?auth=login')}
                  style={{ background: '#F8485E', borderRadius: 50 }}
                  className="text-white text-sm font-semibold"
                >
                  Sign up — Full access
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Main content */}
            {activeTab === 'chat' ? (
              <main className="flex-1 overflow-hidden">
                {renderContent()}
              </main>
            ) : (
              <main className="flex-1 container mx-auto px-4 py-8 overflow-auto">
                {renderContent()}
              </main>
            )}

            {/* Guided tour panel */}
            <AnimatePresence>
              {showGuide && (
                <motion.aside
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-80 border-l bg-card overflow-y-auto hidden lg:block"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>Guided Tour</h3>
                        <p className="text-xs text-muted-foreground mt-1">{completedCount}/{demo.guidedSteps.length} completed</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setShowGuide(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${(completedCount / demo.guidedSteps.length) * 100}%`, background: '#F8485E' }}
                      />
                    </div>

                    <div className="space-y-3">
                      {demo.guidedSteps.map((step, i) => (
                        <button
                          key={step.id}
                          onClick={() => handleTabChange(step.targetTab)}
                          className={`w-full text-left p-4 border transition-all ${
                            step.completed
                              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                              : activeTab === step.targetTab
                              ? 'bg-[#F8485E]/5 border-[#F8485E]/30'
                              : 'hover:bg-muted/50 border-border'
                          }`}
                          style={{ borderRadius: 0 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {step.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                  {i + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${step.completed ? 'text-green-700 dark:text-green-400' : ''}`}>
                                {step.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>

                    {completedCount === demo.guidedSteps.length && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-4 text-center border"
                        style={{ background: 'linear-gradient(135deg, #F8485E10, #F8485E05)', borderColor: '#F8485E30', borderRadius: 0 }}
                      >
                        <Sparkles className="w-8 h-8 mx-auto mb-2" style={{ color: '#F8485E' }} />
                        <p className="font-bold text-sm mb-1">Tour complete!</p>
                        <p className="text-xs text-muted-foreground mb-4">Ready to unlock the full Nova experience?</p>
                        <Button
                          onClick={() => navigate('/?auth=login')}
                          className="w-full text-white font-semibold"
                          style={{ background: '#F8485E', borderRadius: 50 }}
                        >
                          Create your account
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile guide toggle */}
          {!showGuide && (
            <Button
              className="fixed bottom-6 right-6 lg:flex hidden shadow-lg text-white font-semibold"
              style={{ background: '#F8485E', borderRadius: 50 }}
              onClick={() => setShowGuide(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Tour Guide
            </Button>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

const DemoMode: React.FC = () => (
  <DemoProvider>
    <DemoContent />
  </DemoProvider>
);

export default DemoMode;
