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
  Users, 
  Sparkles, 
  Loader2,
  UserMinus,
  Volume2,
  VolumeX,
  FileText,
  CheckCircle2,
  Handshake,
  GitFork,
  ListChecks,
  AlertTriangle,
  ArrowRight,
  Target
} from 'lucide-react';
import { allAgents } from '@/data/mockData';
import { ArtifactSelector, formatArtifactsForContext } from './ArtifactSelector';

interface Artifact {
  id: string;
  title: string;
  artifact_type: string;
  content: any;
  created_at: string;
}

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

interface ParsedSummary {
  consensus: string[];
  divergences: string[];
  recommendations: string[];
  risks: string[];
  nextSteps: string[];
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
  const [isDebateComplete, setIsDebateComplete] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [parsedSummary, setParsedSummary] = useState<ParsedSummary | null>(null);
  const [selectedArtifacts, setSelectedArtifacts] = useState<Artifact[]>([]);
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
    setIsDebateComplete(false);
    setParsedSummary(null);
    debateControllerRef.current.stop = false;

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

    runDebateSimulation(prompt);
  };

  const runDebateSimulation = async (topic: string, round: number = 0) => {
    if (debateControllerRef.current.stop) return;

    const maxRounds = 3;
    if (round >= maxRounds) {
      setIsDebating(false);
      setIsDebateComplete(true);
      toast({
        title: "Simulation Complete",
        description: `${workingSquad.length} agents completed ${maxRounds} rounds of discussion`,
      });
      onAddXP(50, 'completing reality mode simulation');
      return;
    }

    setCurrentRound(round + 1);

    for (let i = 0; i < workingSquad.length; i++) {
      if (debateControllerRef.current.stop) return;

      const agent = workingSquad[i];
      
      const thinkingMessage: DebateMessage = {
        id: `thinking-${Date.now()}-${i}`,
        agent,
        content: '',
        timestamp: new Date(),
        isThinking: true,
      };
      setMessages(prev => [...prev, thinkingMessage]);

      try {
        const conversationContext = messages.map(m => ({
          role: m.agent.id === 'user' ? 'user' : 'assistant',
          content: `${m.agent.name}: ${m.content}`
        }));

        // Build artifact context
        const artifactContext = formatArtifactsForContext(selectedArtifacts);

        const debateSystemPrompt = `You are ${agent.name}, a ${agent.specialty} specialist participating in a live product strategy debate.

CONTEXT: ${agent.backstory}
CAPABILITIES: ${agent.capabilities.join(', ')}
EXPERTISE: ${agent.tags.join(', ')}
${artifactContext ? `\n${artifactContext}\n` : ''}
DEBATE RULES:
- This is Round ${round + 1} of ${maxRounds}
- Challenge other perspectives respectfully but firmly
- Bring your unique expertise to the discussion
- Reference specific points made by other agents
${selectedArtifacts.length > 0 ? '- IMPORTANT: Reference and cite the provided artifacts when relevant to ground your arguments' : ''}
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

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== thinkingMessage.id);
          return [...filtered, {
            id: `agent-${Date.now()}-${i}`,
            agent,
            content: data.response,
            timestamp: new Date(),
          }];
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error getting response from ${agent.name}:`, error);
        setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      }
    }

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
    setIsDebateComplete(messages.length > 1);
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

  const parseSummaryResponse = (response: string): ParsedSummary => {
    const lines = response.split('\n');
    const summary: ParsedSummary = {
      consensus: [],
      divergences: [],
      recommendations: [],
      risks: [],
      nextSteps: []
    };
    
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Detect sections
      if (trimmed.toLowerCase().includes('consensus')) {
        currentSection = 'consensus';
      } else if (trimmed.toLowerCase().includes('divergence') || trimmed.toLowerCase().includes('désaccord')) {
        currentSection = 'divergences';
      } else if (trimmed.toLowerCase().includes('recommandation') || trimmed.toLowerCase().includes('priorit')) {
        currentSection = 'recommendations';
      } else if (trimmed.toLowerCase().includes('risque')) {
        currentSection = 'risks';
      } else if (trimmed.toLowerCase().includes('étape') || trimmed.toLowerCase().includes('prochaine')) {
        currentSection = 'nextSteps';
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed)) {
        const content = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
        if (content && currentSection) {
          summary[currentSection as keyof ParsedSummary].push(content);
        }
      }
    }
    
    return summary;
  };

  const generateSummary = async () => {
    if (messages.length < 2) return;

    setIsGeneratingSummary(true);

    try {
      const debateContent = messages
        .filter(m => m.agent.id !== 'system' && !m.isThinking)
        .map(m => `${m.agent.name} (${m.agent.specialty}): ${m.content}`)
        .join('\n\n');

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: debateContent,
          systemPrompt: `Tu es un expert en synthèse de débats produit. Analyse le débat suivant entre plusieurs experts et génère un résumé structuré.

FORMAT DE SORTIE OBLIGATOIRE (respecte exactement ce format):

### Consensus
- [Point 1 sur lequel les experts sont d'accord]
- [Point 2 sur lequel les experts sont d'accord]

### Points de Divergence
- [Point 1 de désaccord]
- [Point 2 de désaccord]

### Recommandations Prioritaires
1. [Action prioritaire 1]
2. [Action prioritaire 2]
3. [Action prioritaire 3]

### Risques Identifiés
- [Risque 1]
- [Risque 2]

### Prochaines Étapes
- [Étape 1]
- [Étape 2]

Sois concis et actionnable. Maximum 3-4 points par section.`
        }
      });

      if (error) throw error;

      const parsed = parseSummaryResponse(data.response);
      setParsedSummary(parsed);
      onAddXP(25, 'generating debate summary');
      
      toast({
        title: "Résumé généré",
        description: "Les points essentiels du débat ont été synthétisés",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le résumé",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const SummarySection = ({ 
    icon: Icon, 
    title, 
    items, 
    colorClass 
  }: { 
    icon: React.ElementType; 
    title: string; 
    items: string[]; 
    colorClass: string; 
  }) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className={`flex items-center gap-2 ${colorClass}`}>
          <Icon className="w-5 h-5" />
          <h5 className="font-semibold">{title}</h5>
        </div>
        <ul className="space-y-1.5 pl-7">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (workingSquad.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Reality Mode Indisponible</h3>
            <p className="text-muted-foreground">
              Vous devez créer une squad avec des agents IA pour utiliser Reality Mode
            </p>
          </div>
          <Button onClick={() => window.location.hash = '#squads'}>
            Créer Votre Squad
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Reality Mode</h2>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Regardez votre squad IA débattre et collaborer en temps réel
        </p>
      </div>

      {/* Main Layout: Sidebar + Debate Arena */}
      <div className="flex gap-4">
        {/* Left Sidebar - Agents */}
        <div className="w-48 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Squad</h3>
            </div>
            <Badge variant="secondary" className="text-xs">{workingSquad.length}</Badge>
          </div>
          
          <div className="space-y-2">
            {workingSquad.map(agent => (
              <Card key={agent.id} className="p-2 relative group">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={agent.avatar} />
                    <AvatarFallback className="text-xs">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{agent.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{agent.specialty}</p>
                  </div>
                </div>
                {isDebating && !isPaused && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleReplaceAgent(agent)}
                  >
                    <UserMinus className="w-3 h-3" />
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {currentRound > 0 && (
            <Badge variant="outline" className="w-full justify-center">
              Round {currentRound}/3
            </Badge>
          )}
        </div>

        {/* Main Debate Arena */}
        <Card className="flex-1 overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
            <h3 className="font-semibold">Arène de Débat</h3>
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
                  En Direct
                </Badge>
              )}
              {isDebateComplete && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Terminé
                </Badge>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                    className={`max-w-[80%] rounded-lg p-4 ${
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
                        <span className="text-sm">Formulation de la réponse...</span>
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

              {/* Summary Section */}
              {parsedSummary && (
                <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-bold">Synthèse du Débat</h4>
                  </div>
                  
                  <div className="space-y-5">
                    <SummarySection 
                      icon={Handshake} 
                      title="Points de Consensus" 
                      items={parsedSummary.consensus}
                      colorClass="text-green-600 dark:text-green-400"
                    />
                    
                    <SummarySection 
                      icon={GitFork} 
                      title="Points de Divergence" 
                      items={parsedSummary.divergences}
                      colorClass="text-amber-600 dark:text-amber-400"
                    />
                    
                    <SummarySection 
                      icon={ListChecks} 
                      title="Recommandations Prioritaires" 
                      items={parsedSummary.recommendations}
                      colorClass="text-primary"
                    />
                    
                    <SummarySection 
                      icon={AlertTriangle} 
                      title="Risques Identifiés" 
                      items={parsedSummary.risks}
                      colorClass="text-red-600 dark:text-red-400"
                    />
                    
                    <SummarySection 
                      icon={ArrowRight} 
                      title="Prochaines Étapes" 
                      items={parsedSummary.nextSteps}
                      colorClass="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="p-4 border-t bg-muted/30">
            {!isDebating && !isDebateComplete ? (
              <div className="space-y-3">
                {/* Artifact Selector */}
                <ArtifactSelector 
                  selectedArtifacts={selectedArtifacts}
                  onSelectionChange={setSelectedArtifacts}
                  maxSelection={5}
                />
                
                <Input
                  placeholder="Entrez le sujet de débat... (ex : Créez-moi un plan de lancement pour une nouvelle app fitness)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && startDebate()}
                  className="text-base"
                />
                <Button
                  onClick={startDebate}
                  className="w-full"
                  disabled={!prompt.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Démarrer la Simulation
                </Button>
              </div>
            ) : isDebating ? (
              <div className="flex items-center space-x-2">
                {!isPaused ? (
                  <Button onClick={pauseDebate} variant="outline" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeDebate} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Reprendre
                  </Button>
                )}
                <Button onClick={stopDebate} variant="destructive">
                  Arrêter
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={generateSummary} 
                  className="flex-1"
                  disabled={isGeneratingSummary || !!parsedSummary}
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : parsedSummary ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Résumé Généré
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Générer le Résumé
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setIsDebateComplete(false);
                    setMessages([]);
                    setParsedSummary(null);
                    setPrompt('');
                  }} 
                  variant="outline"
                >
                  Nouveau Débat
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Agent Swap Dialog */}
      <Dialog open={showAgentSwap} onOpenChange={setShowAgentSwap}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Remplacer {agentToReplace?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Rechercher des agents..."
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