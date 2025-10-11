import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Agent } from '@/types';
import { toast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Send, 
  Users, 
  Sparkles, 
  Loader2,
  UserMinus,
  UserPlus,
  Volume2,
  VolumeX
} from 'lucide-react';
import { allAgents } from '@/data/mockData';

interface RealityModeProps {
  currentSquad: Agent[];
  squadId?: string;
  onAddXP: (amount: number, reason: string) => void;
  userId: string;
}

interface DebateMessage {
  id: string;
  agent: Agent;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export const RealityMode: React.FC<RealityModeProps> = ({ 
  currentSquad, 
  squadId, 
  onAddXP,
  userId 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [showAgentSwap, setShowAgentSwap] = useState(false);
  const [agentToReplace, setAgentToReplace] = useState<Agent | null>(null);
  const [workingSquad, setWorkingSquad] = useState<Agent[]>(currentSquad);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const debateControllerRef = useRef<{ stop: boolean }>({ stop: false });

  useEffect(() => {
    setWorkingSquad(currentSquad);
  }, [currentSquad]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const startDebate = async () => {
    if (!prompt.trim() || workingSquad.length === 0) {
      toast({
        title: "Cannot start simulation",
        description: "Please enter a prompt and ensure you have agents in your squad",
        variant: "destructive",
      });
      return;
    }

    setIsDebating(true);
    setIsPaused(false);
    setCurrentRound(0);
    setMessages([]);
    debateControllerRef.current.stop = false;

    // Add initial prompt as a user message
    const initialMessage: DebateMessage = {
      id: `user-${Date.now()}`,
      agent: { 
        id: 'user', 
        name: 'You', 
        specialty: 'Product Owner',
        avatar: '',
        backstory: '',
        capabilities: [],
        tags: [],
        xpRequired: 0,
        familyColor: 'blue'
      },
      content: prompt,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);

    // Start the debate simulation
    runDebateSimulation(prompt);
  };

  const runDebateSimulation = async (topic: string, round: number = 0) => {
    if (debateControllerRef.current.stop) return;

    const maxRounds = 3;
    if (round >= maxRounds) {
      setIsDebating(false);
      toast({
        title: "Simulation Complete",
        description: `${workingSquad.length} agents completed ${maxRounds} rounds of discussion`,
      });
      onAddXP(50, 'completing reality mode simulation');
      return;
    }

    setCurrentRound(round + 1);

    // Each agent responds in sequence with their perspective
    for (let i = 0; i < workingSquad.length; i++) {
      if (debateControllerRef.current.stop) return;

      const agent = workingSquad[i];
      
      // Show thinking state
      const thinkingMessage: DebateMessage = {
        id: `thinking-${Date.now()}-${i}`,
        agent,
        content: '',
        timestamp: new Date(),
        isThinking: true,
      };
      setMessages(prev => [...prev, thinkingMessage]);

      // Get agent response
      try {
        const conversationContext = messages.map(m => ({
          role: m.agent.id === 'user' ? 'user' : 'assistant',
          content: `${m.agent.name}: ${m.content}`
        }));

        const debateSystemPrompt = `You are ${agent.name}, a ${agent.specialty} specialist participating in a live product strategy debate.

CONTEXT: ${agent.backstory}
CAPABILITIES: ${agent.capabilities.join(', ')}
EXPERTISE: ${agent.tags.join(', ')}

DEBATE RULES:
- This is Round ${round + 1} of ${maxRounds}
- Challenge other perspectives respectfully but firmly
- Bring your unique expertise to the discussion
- Reference specific points made by other agents
- Be passionate about your viewpoint
- Keep responses concise (3-4 sentences)
- End with a provocative question or statement

TOPIC: ${topic}

Previous discussion:
${conversationContext.slice(-6).map(m => m.content).join('\n')}

Respond with conviction and expertise:`;

        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: {
            message: `Round ${round + 1}: Respond to the ongoing debate about: "${topic}"`,
            systemPrompt: debateSystemPrompt
          }
        });

        if (error) throw error;

        // Remove thinking message and add actual response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== thinkingMessage.id);
          return [...filtered, {
            id: `agent-${Date.now()}-${i}`,
            agent,
            content: data.response,
            timestamp: new Date(),
          }];
        });

        // Wait between agents for theatrical effect
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error getting response from ${agent.name}:`, error);
        setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      }
    }

    // Continue to next round after a pause
    await new Promise(resolve => setTimeout(resolve, 3000));
    if (!debateControllerRef.current.stop) {
      runDebateSimulation(topic, round + 1);
    }
  };

  const pauseDebate = () => {
    setIsPaused(true);
    debateControllerRef.current.stop = true;
  };

  const resumeDebate = () => {
    setIsPaused(false);
    debateControllerRef.current.stop = false;
    const lastTopic = messages.find(m => m.agent.id === 'user')?.content || prompt;
    runDebateSimulation(lastTopic, currentRound);
  };

  const stopDebate = () => {
    setIsDebating(false);
    setIsPaused(false);
    debateControllerRef.current.stop = true;
  };

  const handleReplaceAgent = (oldAgent: Agent) => {
    setAgentToReplace(oldAgent);
    setShowAgentSwap(true);
  };

  const confirmAgentSwap = async (newAgent: Agent) => {
    if (!agentToReplace) return;

    const newSquad = workingSquad.map(agent => 
      agent.id === agentToReplace.id ? newAgent : agent
    );
    setWorkingSquad(newSquad);
    
    // Add system message about swap
    const swapMessage: DebateMessage = {
      id: `swap-${Date.now()}`,
      agent: { 
        id: 'system', 
        name: 'System', 
        specialty: '',
        avatar: '',
        backstory: '',
        capabilities: [],
        tags: [],
        xpRequired: 0,
        familyColor: 'blue'
      },
      content: `🔄 ${agentToReplace.name} has been replaced by ${newAgent.name}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, swapMessage]);
    
    setShowAgentSwap(false);
    setAgentToReplace(null);
    
    toast({
      title: "Agent Swapped",
      description: `${newAgent.name} has joined the debate`,
    });
  };

  if (workingSquad.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Reality Mode Unavailable</h3>
            <p className="text-muted-foreground">
              You need to create a squad with AI agents to use Reality Mode
            </p>
          </div>
          <Button onClick={() => window.location.hash = '#squads'}>
            Build Your Squad
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Reality Mode</h2>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Watch your AI squad debate and collaborate in real-time
        </p>
      </div>

      {/* Squad Display */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <h3 className="font-semibold">Active Squad</h3>
            <Badge variant="secondary">{workingSquad.length} agents</Badge>
          </div>
          {currentRound > 0 && (
            <Badge variant="outline">Round {currentRound}/3</Badge>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {workingSquad.map(agent => (
            <Card key={agent.id} className="p-3 relative group">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={agent.avatar} />
                  <AvatarFallback>
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.specialty}</p>
                </div>
              </div>
              {isDebating && !isPaused && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleReplaceAgent(agent)}
                >
                  <UserMinus className="w-3 h-3" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      </Card>

      {/* Debate Arena */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Debate Arena</h3>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsSoundOn(!isSoundOn)}
              >
                {isSoundOn ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
              {isDebating && !isPaused && (
                <Badge variant="default" className="animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white mr-2" />
                  Live
                </Badge>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex space-x-3 ${
                  message.agent.id === 'user' ? 'justify-end' : 
                  message.agent.id === 'system' ? 'justify-center' : 'justify-start'
                }`}
              >
                {message.agent.id !== 'user' && message.agent.id !== 'system' && (
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={message.agent.avatar} />
                    <AvatarFallback>
                      {message.agent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.agent.id === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.agent.id === 'system'
                      ? 'bg-muted/50 text-muted-foreground text-center'
                      : 'bg-card border-2 border-primary/20'
                  }`}
                >
                  {message.agent.id !== 'user' && message.agent.id !== 'system' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-bold">{message.agent.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.agent.specialty}
                      </Badge>
                    </div>
                  )}
                  
                  {message.isThinking ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Formulating response...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </>
                  )}
                </div>

                {message.agent.id === 'user' && (
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="p-4 border-t bg-muted/30">
          {!isDebating ? (
            <div className="space-y-3">
              <Input
                placeholder="Enter your debate topic... (e.g., Build me a product launch plan for a new fitness app)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && startDebate()}
              />
              <Button
                onClick={startDebate}
                className="w-full"
                disabled={!prompt.trim()}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Simulation
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {!isPaused ? (
                <Button onClick={pauseDebate} variant="outline" className="flex-1">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeDebate} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={stopDebate} variant="destructive">
                Stop
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Agent Swap Dialog */}
      <Dialog open={showAgentSwap} onOpenChange={setShowAgentSwap}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Replace {agentToReplace?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search agents..."
              className="w-full"
            />
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
                {allAgents
                  .filter(a => !workingSquad.some(sa => sa.id === a.id) || a.id === agentToReplace?.id)
                  .map((agent) => (
                    <div
                      key={agent.id}
                      className="p-4 rounded-lg border hover:bg-muted/30 cursor-pointer transition-all"
                      onClick={() => confirmAgentSwap(agent)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate">{agent.name}</h4>
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {agent.specialty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {agent.backstory}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
