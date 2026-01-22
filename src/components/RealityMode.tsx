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
import { FormattedText } from './ui/formatted-text';
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
  Target,
  ThumbsUp,
  AlertCircle,
  X,
  Lightbulb,
  Zap,
  Map,
  BarChart3
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

type Stance = 'advisor-first' | 'client-first' | 'hybrid' | 'context-dependent';

interface DebateMessage {
  id: string;
  agent: Agent;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  stance?: Stance;
  reactions?: { agentId: string; reaction: 'agree' | 'risk' | 'disagree' }[];
  isRealityCheck?: boolean;
}

interface DecisionOption {
  id: string;
  title: string;
  description: string;
  whatChanges: string[];
  whatStaysHuman: string[];
  keyRisk: string;
  suggestedKPIs: string[];
}

interface DebateOutcome {
  consensus: string[];
  tensions: { left: string; right: string }[];
  nonNegotiables: string[];
  decisionOptions: DecisionOption[];
}

const STANCE_LABELS: Record<Stance, { label: string; color: string }> = {
  'advisor-first': { label: 'Conseiller d\'abord', color: 'bg-blue-500' },
  'client-first': { label: 'Client d\'abord', color: 'bg-green-500' },
  'hybrid': { label: 'Hybride', color: 'bg-purple-500' },
  'context-dependent': { label: 'Selon contexte', color: 'bg-amber-500' }
};

const WORD_LIMITS: Record<string, number> = {
  'strategy': 120,
  'product': 120,
  'ux': 100,
  'design': 100,
  'tech': 80,
  'engineering': 80,
  'default': 100
};

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
  const [isGeneratingOutcome, setIsGeneratingOutcome] = useState(false);
  const [debateOutcome, setDebateOutcome] = useState<DebateOutcome | null>(null);
  const [selectedArtifacts, setSelectedArtifacts] = useState<Artifact[]>([]);
  const [stanceDistribution, setStanceDistribution] = useState<Record<Stance, number>>({
    'advisor-first': 0,
    'client-first': 0,
    'hybrid': 0,
    'context-dependent': 0
  });
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

  // Update stance distribution when messages change
  useEffect(() => {
    const distribution: Record<Stance, number> = {
      'advisor-first': 0,
      'client-first': 0,
      'hybrid': 0,
      'context-dependent': 0
    };
    messages.forEach(m => {
      if (m.stance && !m.isRealityCheck && m.agent.id !== 'user' && m.agent.id !== 'system') {
        distribution[m.stance]++;
      }
    });
    setStanceDistribution(distribution);
  }, [messages]);

  const getWordLimit = (agent: Agent): number => {
    const specialty = agent.specialty.toLowerCase();
    for (const [key, limit] of Object.entries(WORD_LIMITS)) {
      if (specialty.includes(key)) return limit;
    }
    return WORD_LIMITS.default;
  };

  const startDebate = async () => {
    if (!prompt.trim() || workingSquad.length === 0) {
      toast({
        title: "Impossible de démarrer",
        description: "Entrez un sujet et assurez-vous d'avoir des agents dans votre squad",
        variant: "destructive",
      });
      return;
    }

    setIsDebating(true);
    setIsPaused(false);
    setCurrentRound(0);
    setMessages([]);
    setIsDebateComplete(false);
    setDebateOutcome(null);
    debateControllerRef.current.stop = false;

    const initialMessage: DebateMessage = {
      id: `user-${Date.now()}`,
      agent: { 
        id: 'user', 
        name: 'Vous', 
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

  const injectRealityCheck = async (round: number) => {
    const realityCheckQuestions = [
      "Qu'est-ce que cela signifierait concrètement demain matin dans une boutique ?",
      "Quelle tâche changerait pour le conseiller dans les 30 prochains jours ?",
      "Qu'est-ce qui ne devrait PAS changer ?"
    ];

    const realityMessage: DebateMessage = {
      id: `reality-${Date.now()}`,
      agent: { 
        id: 'nova', 
        name: 'Nova', 
        specialty: 'Reality Check',
        avatar: '',
        backstory: '',
        capabilities: [],
        tags: [],
        xpRequired: 0,
        familyColor: 'blue'
      },
      content: `🎯 **REALITY CHECK - Round ${round + 1}**\n\n${realityCheckQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
      timestamp: new Date(),
      isRealityCheck: true,
    };
    
    setMessages(prev => [...prev, realityMessage]);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const runDebateSimulation = async (topic: string, round: number = 0) => {
    if (debateControllerRef.current.stop) return;

    const maxRounds = 3;
    
    // Inject Reality Check after round 1 (before round 2)
    if (round === 2) {
      await injectRealityCheck(round);
    }
    
    if (round >= maxRounds) {
      setIsDebating(false);
      setIsDebateComplete(true);
      toast({
        title: "Débat Terminé",
        description: `${workingSquad.length} agents ont complété ${maxRounds} rounds`,
      });
      onAddXP(50, 'completing reality mode simulation');
      return;
    }

    setCurrentRound(round + 1);

    for (let i = 0; i < workingSquad.length; i++) {
      if (debateControllerRef.current.stop) return;

      const agent = workingSquad[i];
      const wordLimit = getWordLimit(agent);
      
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
          content: `${m.agent.name}${m.stance ? ` [${STANCE_LABELS[m.stance].label}]` : ''}: ${m.content}`
        }));

        const artifactContext = formatArtifactsForContext(selectedArtifacts);

        // Check for recent reactions to incorporate
        const recentReactions = messages
          .filter(m => m.reactions && m.reactions.length > 0)
          .slice(-3)
          .map(m => {
            const reactionSummary = m.reactions!.map(r => {
              const reactingAgent = workingSquad.find(a => a.id === r.agentId);
              return `${reactingAgent?.name || 'Agent'}: ${r.reaction === 'agree' ? '👍' : r.reaction === 'risk' ? '⚠️' : '❌'}`;
            }).join(', ');
            return `Réactions à "${m.content.substring(0, 50)}...": ${reactionSummary}`;
          });

        const debateSystemPrompt = `Tu es ${agent.name}, expert en ${agent.specialty} participant à un débat stratégique.

LANGUE: Réponds UNIQUEMENT en français.

CONTEXTE: ${agent.backstory}
${artifactContext ? `\n${artifactContext}\n` : ''}

RÈGLES STRICTES:
1. LIMITE DE MOTS: Maximum ${wordLimit} mots. Sois concis et percutant.
2. POSITION OBLIGATOIRE: Tu DOIS choisir une stance parmi:
   - "advisor-first" (outils pour le conseiller d'abord)
   - "client-first" (autonomie client prioritaire)
   - "hybrid" (approche mixte équilibrée)
   - "context-dependent" (dépend du contexte spécifique)

3. Round ${round + 1}/${maxRounds} - ${round === 0 ? 'Exprime ta position initiale' : round === 1 ? 'Réagis aux autres et affine' : 'Synthétise et propose une direction'}

${recentReactions.length > 0 ? `\nRÉACTIONS RÉCENTES:\n${recentReactions.join('\n')}\n` : ''}

4. FORMAT DE RÉPONSE (JSON uniquement):
{
  "stance": "advisor-first|client-first|hybrid|context-dependent",
  "message": "Ton argument en ${wordLimit} mots max. Sois direct, pas poli. Termine par une affirmation forte ou une question provocatrice."
}

SUJET: ${topic}

Discussion:
${conversationContext.slice(-6).map(m => m.content).join('\n')}`;

        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: {
            message: `Round ${round + 1}: Réponds au débat sur "${topic}". Retourne un JSON avec stance et message.`,
            systemPrompt: debateSystemPrompt
          }
        });

        if (error) throw error;

        // Parse response
        let stance: Stance = 'hybrid';
        let messageContent = data.response;

        try {
          // Try to parse JSON response
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            stance = parsed.stance || 'hybrid';
            messageContent = parsed.message || data.response;
          }
        } catch {
          // If parsing fails, use the raw response
          messageContent = data.response;
        }

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== thinkingMessage.id);
          return [...filtered, {
            id: `agent-${Date.now()}-${i}`,
            agent,
            content: messageContent,
            timestamp: new Date(),
            stance,
            reactions: []
          }];
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Erreur pour ${agent.name}:`, error);
        setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!debateControllerRef.current.stop) {
      runDebateSimulation(topic, round + 1);
    }
  };

  const addReaction = (messageId: string, agentId: string, reaction: 'agree' | 'risk' | 'disagree') => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const existingReactions = m.reactions || [];
        const filteredReactions = existingReactions.filter(r => r.agentId !== agentId);
        return {
          ...m,
          reactions: [...filteredReactions, { agentId, reaction }]
        };
      }
      return m;
    }));
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
        name: 'Système', 
        specialty: '',
        avatar: '',
        backstory: '',
        capabilities: [],
        tags: [],
        xpRequired: 0,
        familyColor: 'blue'
      },
      content: `🔄 ${agentToReplace.name} a été remplacé par ${newAgent.name}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, swapMessage]);
    
    setShowAgentSwap(false);
    setAgentToReplace(null);
    
    toast({
      title: "Agent Remplacé",
      description: `${newAgent.name} a rejoint le débat`,
    });
  };

  const generateDebateOutcome = async () => {
    if (messages.length < 2) return;

    setIsGeneratingOutcome(true);

    try {
      const debateContent = messages
        .filter(m => m.agent.id !== 'system' && !m.isThinking)
        .map(m => `${m.agent.name} (${m.agent.specialty})${m.stance ? ` [${STANCE_LABELS[m.stance].label}]` : ''}: ${m.content}`)
        .join('\n\n');

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: debateContent,
          systemPrompt: `Tu es un expert en synthèse de débats stratégiques. Analyse ce débat et génère des DÉCISIONS ACTIONNABLES, pas un résumé.

FORMAT JSON OBLIGATOIRE:
{
  "consensus": [
    "Point de consensus 1 (phrase courte et directe)",
    "Point de consensus 2"
  ],
  "tensions": [
    { "left": "Autonomie client", "right": "Exclusivité conseiller" },
    { "left": "Rapidité", "right": "Touche humaine" }
  ],
  "nonNegotiables": [
    "Le conseiller reste central",
    "Les outils doivent d'abord faire gagner du temps au conseiller"
  ],
  "decisionOptions": [
    {
      "id": "option-a",
      "title": "Conseiller Augmenté d'Abord",
      "description": "Outils digitaux visibles uniquement par le conseiller",
      "whatChanges": [
        "Accès instantané aux infos produit",
        "Suggestions personnalisées en temps réel"
      ],
      "whatStaysHuman": [
        "Relation client directe",
        "Conseil personnalisé"
      ],
      "keyRisk": "Adoption lente par les conseillers seniors",
      "suggestedKPIs": [
        "Temps d'accès à l'info produit",
        "Satisfaction conseiller"
      ]
    },
    {
      "id": "option-b", 
      "title": "Autonomie Client Guidée",
      "description": "Le client utilise le digital uniquement en présence du conseiller",
      "whatChanges": [
        "Interface client tactile en boutique",
        "Navigation assistée par le conseiller"
      ],
      "whatStaysHuman": [
        "Présence du conseiller obligatoire",
        "Validation humaine des choix"
      ],
      "keyRisk": "Perception de friction additionnelle",
      "suggestedKPIs": [
        "Temps par interaction",
        "Perception d'exclusivité"
      ]
    }
  ]
}

Génère 2-3 options de décision concrètes basées sur le débat. Chaque option doit être actionnable demain.`
        }
      });

      if (error) throw error;

      // Parse response
      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setDebateOutcome(parsed);
        }
      } catch {
        console.error('Failed to parse outcome JSON');
        toast({
          title: "Erreur",
          description: "Format de réponse invalide",
          variant: "destructive",
        });
      }

      onAddXP(30, 'generating debate decisions');
      
      toast({
        title: "Décisions Générées",
        description: "Options de décision concrètes disponibles",
      });
    } catch (error) {
      console.error('Error generating outcome:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les décisions",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingOutcome(false);
    }
  };

  const createNextArtifact = async (type: 'discovery' | 'epic' | 'journey' | 'kpis') => {
    toast({
      title: "Création en cours...",
      description: `Génération de l'artefact ${type}`,
    });
    // This would integrate with the artifact creation system
    // For now, we show a toast indicating the action
    onAddXP(20, `creating ${type} from debate`);
  };

  // Stance distribution bar
  const StanceBar = () => {
    const total = Object.values(stanceDistribution).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    return (
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Positions:</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-muted flex">
          {(Object.entries(stanceDistribution) as [Stance, number][]).map(([stance, count]) => {
            if (count === 0) return null;
            const percentage = (count / total) * 100;
            return (
              <div
                key={stance}
                className={`h-full ${STANCE_LABELS[stance].color}`}
                style={{ width: `${percentage}%` }}
                title={`${STANCE_LABELS[stance].label}: ${count}`}
              />
            );
          })}
        </div>
        <div className="flex gap-1">
          {(Object.entries(stanceDistribution) as [Stance, number][]).map(([stance, count]) => {
            if (count === 0) return null;
            return (
              <Badge key={stance} variant="outline" className="text-[10px] px-1.5">
                {STANCE_LABELS[stance].label.split(' ')[0]}: {count}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  // Decision Option Card
  const DecisionOptionCard = ({ option, index }: { option: DecisionOption; index: number }) => (
    <Card className="p-4 border-2 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
          {String.fromCharCode(65 + index)}
        </div>
        <div className="flex-1">
          <h5 className="font-bold text-sm">{option.title}</h5>
          <p className="text-xs text-muted-foreground">{option.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium mb-1">
            <Zap className="w-3 h-3" />
            Ce qui change
          </div>
          <ul className="space-y-0.5">
            {option.whatChanges.map((item, i) => (
              <li key={i} className="text-muted-foreground">• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium mb-1">
            <Users className="w-3 h-3" />
            Ce qui reste humain
          </div>
          <ul className="space-y-0.5">
            {option.whatStaysHuman.map((item, i) => (
              <li key={i} className="text-muted-foreground">• {item}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span className="font-medium">Risque:</span>
          <span className="text-muted-foreground">{option.keyRisk}</span>
        </div>
      </div>
      
      {option.suggestedKPIs && option.suggestedKPIs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {option.suggestedKPIs.map((kpi, i) => (
            <Badge key={i} variant="secondary" className="text-[10px]">
              📊 {kpi}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );

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
          Débat structuré → Décisions actionnables
        </p>
      </div>

      {/* Main Layout */}
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
                <div className="text-[9px] text-muted-foreground mt-1">
                  Max {getWordLimit(agent)} mots
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
                {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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

          {/* Stance Distribution Bar */}
          {messages.length > 0 && (
            <div className="px-4 pt-3">
              <StanceBar />
            </div>
          )}

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex space-x-3 ${
                    message.agent.id === 'user' ? 'justify-end' : 
                    message.agent.id === 'system' ? 'justify-center' : 
                    message.isRealityCheck ? 'justify-center' : 'justify-start'
                  }`}
                >
                  {message.agent.id !== 'user' && message.agent.id !== 'system' && !message.isRealityCheck && (
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={message.agent.avatar} />
                      <AvatarFallback>
                        {message.agent.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {message.isRealityCheck ? (
                    <Card className="max-w-[90%] p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-amber-600 dark:text-amber-400">Reality Check</span>
                      </div>
                      <FormattedText content={message.content} className="text-sm" />
                    </Card>
                  ) : (
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
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold">{message.agent.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {message.agent.specialty}
                            </Badge>
                          </div>
                          {message.stance && (
                            <Badge className={`text-[10px] text-white ${STANCE_LABELS[message.stance].color}`}>
                              {STANCE_LABELS[message.stance].label}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {message.isThinking ? (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Formulation...</span>
                        </div>
                      ) : (
                        <>
                          <FormattedText content={message.content} className="text-sm leading-relaxed" />
                          
                          {/* Reaction buttons for agent messages */}
                          {message.agent.id !== 'user' && message.agent.id !== 'system' && !message.isThinking && isDebating && (
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                              <span className="text-[10px] text-muted-foreground">Réagir:</span>
                              {workingSquad.filter(a => a.id !== message.agent.id).slice(0, 2).map(agent => (
                                <div key={agent.id} className="flex items-center gap-1">
                                  <span className="text-[9px] text-muted-foreground">{agent.name.split(' ')[0]}:</span>
                                  <button
                                    className={`p-1 rounded hover:bg-green-500/20 ${message.reactions?.find(r => r.agentId === agent.id && r.reaction === 'agree') ? 'bg-green-500/30' : ''}`}
                                    onClick={() => addReaction(message.id, agent.id, 'agree')}
                                  >
                                    <ThumbsUp className="w-3 h-3 text-green-500" />
                                  </button>
                                  <button
                                    className={`p-1 rounded hover:bg-amber-500/20 ${message.reactions?.find(r => r.agentId === agent.id && r.reaction === 'risk') ? 'bg-amber-500/30' : ''}`}
                                    onClick={() => addReaction(message.id, agent.id, 'risk')}
                                  >
                                    <AlertCircle className="w-3 h-3 text-amber-500" />
                                  </button>
                                  <button
                                    className={`p-1 rounded hover:bg-red-500/20 ${message.reactions?.find(r => r.agentId === agent.id && r.reaction === 'disagree') ? 'bg-red-500/30' : ''}`}
                                    onClick={() => addReaction(message.id, agent.id, 'disagree')}
                                  >
                                    <X className="w-3 h-3 text-red-500" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {message.agent.id === 'user' && (
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback>Vous</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Debate Outcome Panel */}
              {debateOutcome && (
                <div className="space-y-4 mt-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-bold">Résultat du Débat</h4>
                  </div>

                  {/* Consensus, Tensions, Non-negotiables */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Consensus */}
                    <Card className="p-3 bg-green-500/5 border-green-500/20">
                      <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                        <Handshake className="w-4 h-4" />
                        <span className="font-semibold text-sm">Consensus</span>
                      </div>
                      <ul className="space-y-1">
                        {debateOutcome.consensus.map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {item}</li>
                        ))}
                      </ul>
                    </Card>

                    {/* Tensions */}
                    <Card className="p-3 bg-amber-500/5 border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                        <GitFork className="w-4 h-4" />
                        <span className="font-semibold text-sm">Tensions</span>
                      </div>
                      <ul className="space-y-1">
                        {debateOutcome.tensions.map((tension, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>{tension.left}</span>
                            <ArrowRight className="w-3 h-3 text-amber-500" />
                            <span>{tension.right}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {/* Non-negotiables */}
                    <Card className="p-3 bg-red-500/5 border-red-500/20">
                      <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-semibold text-sm">Non-négociables</span>
                      </div>
                      <ul className="space-y-1">
                        {debateOutcome.nonNegotiables.map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground">🔒 {item}</li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {/* Decision Options */}
                  <div className="space-y-3">
                    <h5 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Options de Décision
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {debateOutcome.decisionOptions.map((option, index) => (
                        <DecisionOptionCard key={option.id} option={option} index={index} />
                      ))}
                    </div>
                  </div>

                  {/* Next Artifact Actions */}
                  <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      Prochaine Action
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => createNextArtifact('discovery')}>
                        <FileText className="w-4 h-4 mr-1" />
                        Créer Discovery
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => createNextArtifact('epic')}>
                        <ListChecks className="w-4 h-4 mr-1" />
                        Créer 1 Epic
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => createNextArtifact('journey')}>
                        <Map className="w-4 h-4 mr-1" />
                        Parcours Conseiller
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => createNextArtifact('kpis')}>
                        <BarChart3 className="w-4 h-4 mr-1" />
                        KPIs à Valider
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="p-4 border-t bg-muted/30">
            {!isDebating && !isDebateComplete ? (
              <div className="space-y-3">
                <ArtifactSelector 
                  selectedArtifacts={selectedArtifacts}
                  onSelectionChange={setSelectedArtifacts}
                  maxSelection={5}
                />
                
                <Input
                  placeholder="Entrez le sujet de débat... (ex: Faut-il digitaliser l'expérience client en boutique ?)"
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
                  Démarrer le Débat
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
                  onClick={generateDebateOutcome} 
                  className="flex-1"
                  disabled={isGeneratingOutcome || !!debateOutcome}
                >
                  {isGeneratingOutcome ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : debateOutcome ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Décisions Générées
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Générer les Décisions
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setIsDebateComplete(false);
                    setMessages([]);
                    setDebateOutcome(null);
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
                            <Badge variant="outline" className="text-xs">
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
