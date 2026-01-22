import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Agent } from '@/types';
import { toast } from '@/hooks/use-toast';
import { FormattedText } from './ui/formatted-text';
import { 
  Play, Pause, Users, Sparkles, Loader2, UserMinus, Volume2, VolumeX,
  FileText, CheckCircle2, Handshake, GitFork, ListChecks, AlertTriangle,
  ArrowRight, Target, ThumbsUp, AlertCircle, X, Lightbulb, Zap, Map,
  BarChart3, Eye, EyeOff, Shield, Store, Calculator, UserCheck, Plus
} from 'lucide-react';
import { allAgents } from '@/data/mockData';
import { ArtifactSelector, formatArtifactsForContext } from './ArtifactSelector';
import {
  DecisionMemoryPanel,
  CounterfactualPanel,
  ConfidenceMeter,
  AgentSignalScores,
  ValidationPanel,
  FrictionHeatmap,
  ThinkingStyleFeedback,
  SilentModeView,
  TENSION_AGENTS,
  STANCE_LABELS,
  WORD_LIMITS,
  Stance,
  DebateMessage,
  DecisionOption,
  DebateOutcome,
  ConfidenceFactors,
  AgentSignal,
  CounterfactualAnalysis,
  TensionAgent
} from './reality-mode';

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

export const RealityMode: React.FC<RealityModeProps> = ({ 
  currentSquad, 
  squadId, 
  onAddXP,
  userId 
}) => {
  // Core state
  const [prompt, setPrompt] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [workingSquad, setWorkingSquad] = useState<Agent[]>(currentSquad);
  const [isDebateComplete, setIsDebateComplete] = useState(false);
  const [isGeneratingOutcome, setIsGeneratingOutcome] = useState(false);
  const [debateOutcome, setDebateOutcome] = useState<DebateOutcome | null>(null);
  const [selectedArtifacts, setSelectedArtifacts] = useState<Artifact[]>([]);
  
  // New feature state
  const [silentMode, setSilentMode] = useState(false);
  const [showAgentSwap, setShowAgentSwap] = useState(false);
  const [agentToReplace, setAgentToReplace] = useState<Agent | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [activeTensionAgents, setActiveTensionAgents] = useState<TensionAgent[]>([]);
  const [chosenOption, setChosenOption] = useState<DecisionOption | null>(null);
  const [confidenceFactors, setConfidenceFactors] = useState<ConfidenceFactors | null>(null);
  const [agentSignals, setAgentSignals] = useState<AgentSignal[]>([]);
  const [counterfactualAnalysis, setCounterfactualAnalysis] = useState<CounterfactualAnalysis | null>(null);
  const [savedDecisionId, setSavedDecisionId] = useState<string | null>(null);
  const [stanceDistribution, setStanceDistribution] = useState<Record<Stance, number>>({
    'advisor-first': 0, 'client-first': 0, 'hybrid': 0, 'context-dependent': 0
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const debateControllerRef = useRef<{ stop: boolean }>({ stop: false });

  useEffect(() => { setWorkingSquad(currentSquad); }, [currentSquad]);
  useEffect(() => {
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const distribution: Record<Stance, number> = {
      'advisor-first': 0, 'client-first': 0, 'hybrid': 0, 'context-dependent': 0
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

  const addTensionAgent = (tensionAgent: TensionAgent) => {
    if (activeTensionAgents.find(a => a.id === tensionAgent.id)) return;
    setActiveTensionAgents(prev => [...prev, tensionAgent]);
    toast({ title: "Agent de Tension ajouté", description: `${tensionAgent.name} va challenger le débat` });
  };

  const removeTensionAgent = (id: string) => {
    setActiveTensionAgents(prev => prev.filter(a => a.id !== id));
  };

  const startDebate = async () => {
    if (!prompt.trim() || workingSquad.length === 0) {
      toast({ title: "Impossible de démarrer", description: "Entrez un sujet et assurez-vous d'avoir des agents", variant: "destructive" });
      return;
    }
    setIsDebating(true);
    setIsPaused(false);
    setCurrentRound(0);
    setMessages([]);
    setIsDebateComplete(false);
    setDebateOutcome(null);
    setChosenOption(null);
    setConfidenceFactors(null);
    setAgentSignals([]);
    setCounterfactualAnalysis(null);
    setSavedDecisionId(null);
    debateControllerRef.current.stop = false;

    const initialMessage: DebateMessage = {
      id: `user-${Date.now()}`,
      agent: { id: 'user', name: 'Vous', specialty: 'Product Owner', avatar: '', backstory: '', capabilities: [], tags: [], xpRequired: 0, familyColor: 'blue' },
      content: prompt,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    runDebateSimulation(prompt);
  };

  const injectRealityCheck = async (round: number) => {
    const questions = [
      "Qu'est-ce que cela signifierait concrètement demain matin dans une boutique ?",
      "Quelle tâche changerait pour le conseiller dans les 30 prochains jours ?",
      "Qu'est-ce qui ne devrait PAS changer ?"
    ];
    const realityMessage: DebateMessage = {
      id: `reality-${Date.now()}`,
      agent: { id: 'nova', name: 'Nova', specialty: 'Reality Check', avatar: '', backstory: '', capabilities: [], tags: [], xpRequired: 0, familyColor: 'blue' },
      content: `🎯 **REALITY CHECK - Round ${round + 1}**\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
      timestamp: new Date(),
      isRealityCheck: true,
    };
    setMessages(prev => [...prev, realityMessage]);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const injectTensionAgentResponse = async (tensionAgent: TensionAgent, topic: string, conversationContext: string) => {
    const thinkingId = `tension-thinking-${Date.now()}`;
    const tensionAgentAsAgent: Agent = {
      id: tensionAgent.id,
      name: tensionAgent.name,
      specialty: tensionAgent.specialty,
      avatar: tensionAgent.avatar,
      backstory: tensionAgent.directive,
      capabilities: ['challenge', 'critique'],
      tags: ['tension'],
      xpRequired: 0,
      familyColor: 'orange'
    };

    setMessages(prev => [...prev, {
      id: thinkingId,
      agent: tensionAgentAsAgent,
      content: '',
      timestamp: new Date(),
      isThinking: true,
      isTensionAgent: true
    }]);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Sujet: ${topic}\n\nContexte:\n${conversationContext}\n\nTon rôle: ${tensionAgent.directive}\n\nDonne une critique constructive mais ferme en 80 mots max.`,
          systemPrompt: `Tu es ${tensionAgent.name}, un agent de tension. Ta mission: ${tensionAgent.directive}. 
          
RÈGLES:
- Désaccord poli mais FERME
- Maximum 80 mots
- Pose une question provocatrice à la fin
- FRANÇAIS uniquement

Retourne un JSON: { "message": "ton argument" }`
        }
      });

      if (error) throw error;

      let messageContent = data.response;
      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) messageContent = JSON.parse(jsonMatch[0]).message || data.response;
      } catch {}

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== thinkingId);
        return [...filtered, {
          id: `tension-${Date.now()}`,
          agent: tensionAgentAsAgent,
          content: messageContent,
          timestamp: new Date(),
          isTensionAgent: true
        }];
      });
    } catch (error) {
      console.error('Tension agent error:', error);
      setMessages(prev => prev.filter(m => m.id !== thinkingId));
    }
  };

  const runDebateSimulation = async (topic: string, round: number = 0) => {
    if (debateControllerRef.current.stop) return;
    const maxRounds = 3;
    
    if (round === 2) await injectRealityCheck(round);
    
    if (round >= maxRounds) {
      setIsDebating(false);
      setIsDebateComplete(true);
      calculateAgentSignals();
      toast({ title: "Débat Terminé", description: `${workingSquad.length} agents ont complété ${maxRounds} rounds` });
      onAddXP(50, 'completing reality mode simulation');
      return;
    }

    setCurrentRound(round + 1);

    // Inject tension agent after round 1
    if (round === 1 && activeTensionAgents.length > 0) {
      const tensionAgent = activeTensionAgents[Math.floor(Math.random() * activeTensionAgents.length)];
      const context = messages.map(m => `${m.agent.name}: ${m.content}`).join('\n');
      await injectTensionAgentResponse(tensionAgent, topic, context);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

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
        const recentReactions = messages.filter(m => m.reactions && m.reactions.length > 0).slice(-3)
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
1. LIMITE DE MOTS: Maximum ${wordLimit} mots.
2. POSITION OBLIGATOIRE: Choisis une stance parmi: "advisor-first", "client-first", "hybrid", "context-dependent"
3. Round ${round + 1}/${maxRounds} - ${round === 0 ? 'Exprime ta position initiale' : round === 1 ? 'Réagis aux autres et affine' : 'Synthétise et propose une direction'}
${recentReactions.length > 0 ? `\nRÉACTIONS RÉCENTES:\n${recentReactions.join('\n')}\n` : ''}

FORMAT DE RÉPONSE (JSON uniquement):
{
  "stance": "advisor-first|client-first|hybrid|context-dependent",
  "message": "Ton argument en ${wordLimit} mots max."
}

SUJET: ${topic}
Discussion:\n${conversationContext.slice(-6).map(m => m.content).join('\n')}`;

        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: { message: `Round ${round + 1}: Réponds au débat sur "${topic}".`, systemPrompt: debateSystemPrompt }
        });

        if (error) throw error;

        let stance: Stance = 'hybrid';
        let messageContent = data.response;
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            stance = parsed.stance || 'hybrid';
            messageContent = parsed.message || data.response;
          }
        } catch {}

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== thinkingMessage.id);
          return [...filtered, { id: `agent-${Date.now()}-${i}`, agent, content: messageContent, timestamp: new Date(), stance, reactions: [] }];
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Erreur pour ${agent.name}:`, error);
        setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!debateControllerRef.current.stop) runDebateSimulation(topic, round + 1);
  };

  const calculateAgentSignals = () => {
    const signals: AgentSignal[] = workingSquad.map(agent => {
      const agentMessages = messages.filter(m => m.agent.id === agent.id && !m.isThinking);
      const wordCounts = agentMessages.map(m => m.content.split(' ').length);
      const avgWords = wordCounts.length > 0 ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0;
      
      const signalScore = Math.min(100, Math.max(0, 
        50 + (agentMessages.length * 10) - (avgWords > 100 ? 20 : 0) + Math.random() * 20
      ));

      let label: AgentSignal['label'] = 'balanced';
      if (signalScore >= 70) label = 'high_signal';
      else if (avgWords > 100 && signalScore < 50) label = 'verbose_low_impact';
      else if (agent.specialty.toLowerCase().includes('risk')) label = 'risk_focused';

      return {
        agentId: agent.id,
        agentName: agent.name,
        contributionsCount: agentMessages.length,
        survivedSynthesis: Math.floor(agentMessages.length * 0.7),
        influencedDecision: Math.floor(agentMessages.length * 0.5),
        ignoredCount: Math.floor(agentMessages.length * 0.2),
        wordCountAvg: avgWords,
        signalScore: Math.round(signalScore),
        strengths: signalScore > 60 ? ['Arguments concis', 'Impact élevé'] : ['Participation active'],
        weaknesses: avgWords > 100 ? ['Trop verbeux'] : [],
        label
      };
    });
    setAgentSignals(signals);
  };

  const addReaction = (messageId: string, agentId: string, reaction: 'agree' | 'risk' | 'disagree') => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const existingReactions = m.reactions || [];
        const filteredReactions = existingReactions.filter(r => r.agentId !== agentId);
        return { ...m, reactions: [...filteredReactions, { agentId, reaction }] };
      }
      return m;
    }));
  };

  const pauseDebate = () => { setIsPaused(true); debateControllerRef.current.stop = true; };
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
    calculateAgentSignals();
  };

  const handleReplaceAgent = (oldAgent: Agent) => { setAgentToReplace(oldAgent); setShowAgentSwap(true); };
  const confirmAgentSwap = async (newAgent: Agent) => {
    if (!agentToReplace) return;
    const newSquad = workingSquad.map(agent => agent.id === agentToReplace.id ? newAgent : agent);
    setWorkingSquad(newSquad);
    const swapMessage: DebateMessage = {
      id: `swap-${Date.now()}`,
      agent: { id: 'system', name: 'Système', specialty: '', avatar: '', backstory: '', capabilities: [], tags: [], xpRequired: 0, familyColor: 'blue' },
      content: `🔄 ${agentToReplace.name} a été remplacé par ${newAgent.name}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, swapMessage]);
    setShowAgentSwap(false);
    setAgentToReplace(null);
    toast({ title: "Agent Remplacé", description: `${newAgent.name} a rejoint le débat` });
  };

  const generateDebateOutcome = async () => {
    if (messages.length < 2) return;
    setIsGeneratingOutcome(true);

    try {
      const debateContent = messages.filter(m => m.agent.id !== 'system' && !m.isThinking)
        .map(m => `${m.agent.name} (${m.agent.specialty})${m.stance ? ` [${STANCE_LABELS[m.stance].label}]` : ''}: ${m.content}`)
        .join('\n\n');

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: debateContent,
          systemPrompt: `Tu es un expert en synthèse de débats stratégiques. Analyse ce débat et génère des DÉCISIONS ACTIONNABLES.

FORMAT JSON OBLIGATOIRE:
{
  "consensus": ["Point de consensus 1", "Point de consensus 2"],
  "tensions": [{ "left": "Autonomie client", "right": "Exclusivité conseiller" }],
  "nonNegotiables": ["Le conseiller reste central", "Les outils doivent d'abord faire gagner du temps au conseiller"],
  "decisionOptions": [
    {
      "id": "option-a",
      "title": "Conseiller Augmenté d'Abord",
      "description": "Outils digitaux visibles uniquement par le conseiller",
      "whatChanges": ["Accès instantané aux infos produit"],
      "whatStaysHuman": ["Relation client directe"],
      "keyRisk": "Adoption lente par les conseillers seniors",
      "suggestedKPIs": ["Temps d'accès à l'info produit"]
    }
  ],
  "confidenceFactors": {
    "roleAlignment": 75,
    "unresolvedTensions": 2,
    "dataVsOpinionRatio": 40,
    "overallConfidence": "medium",
    "explanation": "Bon alignement sur l'approche mais plusieurs tensions non résolues."
  }
}

Génère 2-3 options de décision concrètes.`
        }
      });

      if (error) throw error;

      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setDebateOutcome(parsed);
          if (parsed.confidenceFactors) setConfidenceFactors(parsed.confidenceFactors);
        }
      } catch { console.error('Failed to parse outcome JSON'); }

      onAddXP(30, 'generating debate decisions');
      toast({ title: "Décisions Générées", description: "Options de décision concrètes disponibles" });
    } catch (error) {
      console.error('Error generating outcome:', error);
      toast({ title: "Erreur", description: "Impossible de générer les décisions", variant: "destructive" });
    } finally {
      setIsGeneratingOutcome(false);
    }
  };

  const selectDecisionOption = async (option: DecisionOption) => {
    setChosenOption(option);
    
    // Save to decision log
    try {
      const insertData = {
        user_id: userId,
        squad_id: squadId || null,
        debate_topic: prompt,
        context: formatArtifactsForContext(selectedArtifacts),
        options_considered: debateOutcome?.decisionOptions || [],
        option_chosen: option,
        assumptions: option.whatChanges,
        kpis_to_watch: option.suggestedKPIs,
        confidence_level: confidenceFactors?.overallConfidence || 'medium',
        confidence_factors: confidenceFactors || {},
        debate_messages: messages.map(m => ({ agent: m.agent.name, content: m.content, stance: m.stance })),
        outcome: debateOutcome,
        tensions_remaining: debateOutcome?.tensions || [],
        non_negotiables: debateOutcome?.nonNegotiables || [],
        consensus_points: debateOutcome?.consensus || []
      };
      const { data, error } = await supabase.from('decision_log').insert(insertData as any).select().single();

      if (error) throw error;
      setSavedDecisionId(data.id);
      
      // Update friction patterns
      if (debateOutcome?.tensions) {
        for (const tension of debateOutcome.tensions) {
          const signature = `${tension.left}::${tension.right}`.toLowerCase();
          const { data: existing } = await supabase
            .from('friction_patterns')
            .select('*')
            .eq('tension_signature', signature)
            .single();

          if (existing) {
            await supabase.from('friction_patterns').update({
              occurrence_count: existing.occurrence_count + 1,
              decision_ids: [...(existing.decision_ids as string[]), data.id],
              last_occurred: new Date().toISOString(),
              is_structural: existing.occurrence_count >= 6
            }).eq('id', existing.id);
          } else {
            await supabase.from('friction_patterns').insert({
              tension_signature: signature,
              tension_left: tension.left,
              tension_right: tension.right,
              occurrence_count: 1,
              decision_ids: [data.id]
            });
          }
        }
      }

      // Save agent analytics
      for (const signal of agentSignals) {
        await supabase.from('agent_analytics').insert({
          agent_id: signal.agentId,
          agent_name: signal.agentName,
          decision_id: data.id,
          contributions_count: signal.contributionsCount,
          survived_synthesis: signal.survivedSynthesis,
          influenced_decision: signal.influencedDecision,
          ignored_count: signal.ignoredCount,
          word_count_avg: signal.wordCountAvg,
          signal_score: signal.signalScore / 100,
          strengths: signal.strengths,
          weaknesses: signal.weaknesses
        });
      }

      toast({ title: "Décision Enregistrée", description: "Sauvegardée dans le journal des décisions" });
      onAddXP(40, 'making a decision');
    } catch (error) {
      console.error('Error saving decision:', error);
    }
  };

  const createNextArtifact = async (type: 'discovery' | 'epic' | 'journey' | 'kpis') => {
    if (!debateOutcome) {
      toast({ title: "Erreur", description: "Générez d'abord les décisions du débat", variant: "destructive" });
      return;
    }

    toast({ title: "Création en cours...", description: `Génération de l'artefact ${type}` });

    try {
      const debateContext = messages.filter(m => m.agent.id !== 'system' && !m.isThinking)
        .map(m => `${m.agent.name}: ${m.content}`).join('\n\n');

      const outcomeContext = `
## Résultat du Débat
### Consensus\n${debateOutcome.consensus.map(c => `- ${c}`).join('\n')}
### Tensions\n${debateOutcome.tensions.map(t => `- ${t.left} vs ${t.right}`).join('\n')}
### Non-négociables\n${debateOutcome.nonNegotiables.map(n => `- ${n}`).join('\n')}
### Option Choisie\n${chosenOption ? `**${chosenOption.title}**: ${chosenOption.description}` : 'Aucune'}
`;

      const artifactContext = formatArtifactsForContext(selectedArtifacts);
      const fullContext = `${debateContext}\n\n${outcomeContext}\n\n${artifactContext}`;

      let artifactPrompt = '';
      let artifactType = '';
      let artifactTitle = '';

      switch (type) {
        case 'discovery':
          artifactType = 'canvas';
          artifactTitle = `Discovery - ${prompt.substring(0, 50)}`;
          artifactPrompt = `Génère un résumé Discovery structuré en JSON avec: problem_statement, hypotheses, target_personas, key_insights, constraints, success_metrics, recommended_approach, risks_to_monitor, next_validation_steps`;
          break;
        case 'epic':
          artifactType = 'epic';
          artifactTitle = `Epic - ${chosenOption?.title || prompt.substring(0, 30)}`;
          artifactPrompt = `Génère un Epic structuré en JSON: title, objective, value_proposition, target_persona, acceptance_criteria, user_stories (avec title, priority, estimation), success_metrics, dependencies, risks, non_negotiables`;
          break;
        case 'journey':
          artifactType = 'canvas';
          artifactTitle = `Parcours Conseiller - ${prompt.substring(0, 40)}`;
          artifactPrompt = `Génère un parcours utilisateur en JSON: persona, context, stages (avec name, actions, touchpoints, emotions, pain_points, opportunities, tools_needed), moments_of_truth, what_stays_human, what_changes, success_metrics`;
          break;
        case 'kpis':
          artifactType = 'canvas';
          artifactTitle = `KPIs à Valider - ${prompt.substring(0, 40)}`;
          artifactPrompt = `Génère une liste de KPIs en JSON: validation_context, primary_kpis (avec name, description, measurement_method, target, frequency, owner), secondary_kpis, qualitative_indicators, validation_timeline, success_criteria, risks_if_not_measured`;
          break;
      }

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `${artifactPrompt}\n\nContexte:\n${fullContext}`,
          systemPrompt: `Tu es un expert en product management. Génère des artefacts structurés. Réponds UNIQUEMENT avec le JSON demandé, sans texte additionnel.`
        }
      });

      if (error) throw error;

      let artifactContent: any = {};
      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) artifactContent = JSON.parse(jsonMatch[0]);
      } catch { artifactContent = { raw_content: data.response }; }

      artifactContent.source = {
        type: 'reality_mode_debate',
        debate_topic: prompt,
        decision_id: savedDecisionId,
        squad_members: workingSquad.map(a => ({ name: a.name, specialty: a.specialty })),
        chosen_option: chosenOption?.title,
        consensus_points: debateOutcome.consensus,
        non_negotiables: debateOutcome.nonNegotiables
      };

      const validArtifactType = artifactType === 'epic' ? 'epic' : 'canvas';
      const { error: saveError } = await supabase.from('artifacts').insert({
        title: artifactTitle,
        artifact_type: validArtifactType as 'canvas' | 'epic' | 'story' | 'impact_analysis',
        content: artifactContent,
        user_id: userId
      });

      if (saveError) throw saveError;
      onAddXP(30, `creating ${type} from debate`);
      toast({ title: "Artefact Créé", description: `${artifactTitle} a été sauvegardé` });
    } catch (error) {
      console.error('Error creating artifact:', error);
      toast({ title: "Erreur", description: "Impossible de créer l'artefact", variant: "destructive" });
    }
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
            return <div key={stance} className={`h-full ${STANCE_LABELS[stance].color}`} style={{ width: `${(count / total) * 100}%` }} title={`${STANCE_LABELS[stance].label}: ${count}`} />;
          })}
        </div>
        <div className="flex gap-1">
          {(Object.entries(stanceDistribution) as [Stance, number][]).map(([stance, count]) => {
            if (count === 0) return null;
            return <Badge key={stance} variant="outline" className="text-[10px] px-1.5">{STANCE_LABELS[stance].label.split(' ')[0]}: {count}</Badge>;
          })}
        </div>
      </div>
    );
  };

  const DecisionOptionCard = ({ option, index }: { option: DecisionOption; index: number }) => (
    <Card className={`p-4 border-2 transition-colors cursor-pointer ${chosenOption?.id === option.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`} onClick={() => selectDecisionOption(option)}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{String.fromCharCode(65 + index)}</div>
        <div className="flex-1">
          <h5 className="font-bold text-sm">{option.title}</h5>
          <p className="text-xs text-muted-foreground">{option.description}</p>
        </div>
        {chosenOption?.id === option.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium mb-1"><Zap className="w-3 h-3" />Ce qui change</div>
          <ul className="space-y-0.5">{option.whatChanges.map((item, i) => <li key={i} className="text-muted-foreground">• {item}</li>)}</ul>
        </div>
        <div>
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium mb-1"><Users className="w-3 h-3" />Ce qui reste humain</div>
          <ul className="space-y-0.5">{option.whatStaysHuman.map((item, i) => <li key={i} className="text-muted-foreground">• {item}</li>)}</ul>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs"><AlertTriangle className="w-3 h-3" /><span className="font-medium">Risque:</span><span className="text-muted-foreground">{option.keyRisk}</span></div>
      </div>
      {option.suggestedKPIs?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">{option.suggestedKPIs.map((kpi, i) => <Badge key={i} variant="secondary" className="text-[10px]">📊 {kpi}</Badge>)}</div>
      )}
    </Card>
  );

  if (workingSquad.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10"><Sparkles className="w-10 h-10 text-primary" /></div>
          <div><h3 className="text-xl font-semibold mb-2">Reality Mode Indisponible</h3><p className="text-muted-foreground">Vous devez créer une squad avec des agents IA pour utiliser Reality Mode</p></div>
          <Button onClick={() => window.location.hash = '#squads'}>Créer Votre Squad</Button>
        </div>
      </Card>
    );
  }

  // Silent Mode View
  if (silentMode && debateOutcome && chosenOption && confidenceFactors) {
    return (
      <SilentModeView
        debateTopic={prompt}
        outcome={debateOutcome}
        chosenOption={chosenOption}
        confidenceFactors={confidenceFactors}
        onExitSilentMode={() => setSilentMode(false)}
        onCreateArtifact={createNextArtifact}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Reality Mode</h2>
        </div>
        <div className="flex items-center gap-3">
          {debateOutcome && chosenOption && (
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Mode Silencieux</span>
              <Switch checked={silentMode} onCheckedChange={setSilentMode} />
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="arena" className="space-y-4">
        <TabsList>
          <TabsTrigger value="arena">Arène</TabsTrigger>
          <TabsTrigger value="memory">Mémoire</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="friction">Frictions</TabsTrigger>
        </TabsList>

        <TabsContent value="arena">
          <div className="flex gap-4">
            {/* Left Sidebar - Agents */}
            <div className="w-52 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2"><Users className="w-4 h-4" /><h3 className="font-semibold text-sm">Squad</h3></div>
                <Badge variant="secondary" className="text-xs">{workingSquad.length}</Badge>
              </div>
              
              <div className="space-y-2">
                {workingSquad.map(agent => (
                  <Card key={agent.id} className="p-2 relative group">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8"><AvatarImage src={agent.avatar} /><AvatarFallback className="text-xs">{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{agent.name}</p><p className="text-[10px] text-muted-foreground truncate">{agent.specialty}</p></div>
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1">Max {getWordLimit(agent)} mots</div>
                    {isDebating && !isPaused && (
                      <Button size="sm" variant="ghost" className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleReplaceAgent(agent)}><UserMinus className="w-3 h-3" /></Button>
                    )}
                  </Card>
                ))}
              </div>

              {/* Tension Agents */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Agents de Tension</span>
                  <Badge variant="outline" className="text-[10px]">{activeTensionAgents.length}</Badge>
                </div>
                <div className="space-y-1">
                  {TENSION_AGENTS.map(ta => {
                    const isActive = activeTensionAgents.some(a => a.id === ta.id);
                    return (
                      <Button key={ta.id} size="sm" variant={isActive ? "secondary" : "ghost"} className="w-full justify-start text-xs h-8" onClick={() => isActive ? removeTensionAgent(ta.id) : addTensionAgent(ta)}>
                        {ta.role === 'brand_guardian' && <Shield className="w-3 h-3 mr-1" />}
                        {ta.role === 'store_manager' && <Store className="w-3 h-3 mr-1" />}
                        {ta.role === 'finance_reality' && <Calculator className="w-3 h-3 mr-1" />}
                        {ta.role === 'customer_advocate' && <UserCheck className="w-3 h-3 mr-1" />}
                        {ta.name}
                        {isActive && <X className="w-3 h-3 ml-auto" />}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {currentRound > 0 && <Badge variant="outline" className="w-full justify-center">Round {currentRound}/3</Badge>}
            </div>

            {/* Main Debate Arena */}
            <Card className="flex-1 overflow-hidden flex flex-col min-h-[600px]">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="font-semibold">Arène de Débat</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsSoundOn(!isSoundOn)}>{isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</Button>
                  {isDebating && !isPaused && <Badge variant="default" className="animate-pulse"><span className="w-2 h-2 rounded-full bg-white mr-2" />En Direct</Badge>}
                  {isDebateComplete && <Badge variant="secondary" className="bg-green-500/20 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Terminé</Badge>}
                </div>
              </div>

              {messages.length > 0 && <div className="px-4 pt-3"><StanceBar /></div>}

              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex space-x-3 ${message.agent.id === 'user' ? 'justify-end' : message.agent.id === 'system' ? 'justify-center' : message.isRealityCheck ? 'justify-center' : 'justify-start'}`}>
                      {message.agent.id !== 'user' && message.agent.id !== 'system' && !message.isRealityCheck && (
                        <Avatar className="w-10 h-10 flex-shrink-0"><AvatarImage src={message.agent.avatar} /><AvatarFallback>{message.agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      )}
                      
                      {message.isRealityCheck ? (
                        <Card className="max-w-[90%] p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
                          <div className="flex items-center gap-2 mb-2"><Target className="w-5 h-5 text-amber-500" /><span className="font-bold text-amber-600 dark:text-amber-400">Reality Check</span></div>
                          <FormattedText content={message.content} className="text-sm" />
                        </Card>
                      ) : (
                        <div className={`max-w-[80%] rounded-lg p-4 ${message.agent.id === 'user' ? 'bg-primary text-primary-foreground' : message.agent.id === 'system' ? 'bg-muted/50 text-muted-foreground text-center' : message.isTensionAgent ? 'bg-red-500/10 border-2 border-red-500/30' : 'bg-card border-2 border-primary/20'}`}>
                          {message.agent.id !== 'user' && message.agent.id !== 'system' && (
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold">{message.agent.name}</span>
                                <Badge variant="outline" className="text-xs">{message.agent.specialty}</Badge>
                                {message.isTensionAgent && <Badge className="bg-red-500/20 text-red-700 text-[10px]">Tension</Badge>}
                              </div>
                              {message.stance && <Badge className={`text-[10px] text-white ${STANCE_LABELS[message.stance].color}`}>{STANCE_LABELS[message.stance].label}</Badge>}
                            </div>
                          )}
                          
                          {message.isThinking ? (
                            <div className="flex items-center space-x-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Formulation...</span></div>
                          ) : (
                            <>
                              <FormattedText content={message.content} className="text-sm leading-relaxed" />
                              {message.agent.id !== 'user' && message.agent.id !== 'system' && !message.isThinking && isDebating && (
                                <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                                  <span className="text-[10px] text-muted-foreground">Réagir:</span>
                                  {workingSquad.filter(a => a.id !== message.agent.id).slice(0, 2).map(agent => (
                                    <div key={agent.id} className="flex items-center gap-1">
                                      <span className="text-[9px] text-muted-foreground">{agent.name.split(' ')[0]}:</span>
                                      <button className={`p-1 rounded hover:bg-green-500/20 ${message.reactions?.find(r => r.agentId === agent.id && r.reaction === 'agree') ? 'bg-green-500/30' : ''}`} onClick={() => addReaction(message.id, agent.id, 'agree')}><ThumbsUp className="w-3 h-3 text-green-500" /></button>
                                      <button className={`p-1 rounded hover:bg-amber-500/20 ${message.reactions?.find(r => r.agentId === agent.id && r.reaction === 'risk') ? 'bg-amber-500/30' : ''}`} onClick={() => addReaction(message.id, agent.id, 'risk')}><AlertCircle className="w-3 h-3 text-amber-500" /></button>
                                      <button className={`p-1 rounded hover:bg-red-500/20 ${message.reactions?.find(r => r.agentId === agent.id && r.reaction === 'disagree') ? 'bg-red-500/30' : ''}`} onClick={() => addReaction(message.id, agent.id, 'disagree')}><X className="w-3 h-3 text-red-500" /></button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <span className="text-xs opacity-70 mt-2 block">{message.timestamp.toLocaleTimeString()}</span>
                            </>
                          )}
                        </div>
                      )}

                      {message.agent.id === 'user' && <Avatar className="w-10 h-10 flex-shrink-0"><AvatarFallback>Vous</AvatarFallback></Avatar>}
                    </div>
                  ))}

                  {/* Debate Outcome Panel */}
                  {debateOutcome && (
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10"><Target className="w-6 h-6 text-primary" /></div>
                        <h4 className="text-lg font-bold">Résultat du Débat</h4>
                        {chosenOption && <Badge className="bg-green-500 text-white">Décision prise</Badge>}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Card className="p-3 bg-green-500/5 border-green-500/20">
                          <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400"><Handshake className="w-4 h-4" /><span className="font-semibold text-sm">Consensus</span></div>
                          <ul className="space-y-1">{debateOutcome.consensus.map((item, i) => <li key={i} className="text-xs text-muted-foreground">• {item}</li>)}</ul>
                        </Card>
                        <Card className="p-3 bg-amber-500/5 border-amber-500/20">
                          <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400"><GitFork className="w-4 h-4" /><span className="font-semibold text-sm">Tensions</span></div>
                          <ul className="space-y-1">{debateOutcome.tensions.map((tension, i) => <li key={i} className="text-xs text-muted-foreground flex items-center gap-1"><span>{tension.left}</span><ArrowRight className="w-3 h-3 text-amber-500" /><span>{tension.right}</span></li>)}</ul>
                        </Card>
                        <Card className="p-3 bg-red-500/5 border-red-500/20">
                          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400"><AlertTriangle className="w-4 h-4" /><span className="font-semibold text-sm">Non-négociables</span></div>
                          <ul className="space-y-1">{debateOutcome.nonNegotiables.map((item, i) => <li key={i} className="text-xs text-muted-foreground">🔒 {item}</li>)}</ul>
                        </Card>
                      </div>

                      {/* Confidence Meter */}
                      {confidenceFactors && <ConfidenceMeter factors={confidenceFactors} />}

                      {/* Decision Options */}
                      <div className="space-y-3">
                        <h5 className="font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" />Options de Décision <span className="text-xs text-muted-foreground">(cliquez pour choisir)</span></h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {debateOutcome.decisionOptions.map((option, index) => <DecisionOptionCard key={option.id} option={option} index={index} />)}
                        </div>
                      </div>

                      {/* Counterfactual Analysis */}
                      {chosenOption && debateOutcome.decisionOptions.length > 1 && (
                        <CounterfactualPanel
                          chosenOption={chosenOption}
                          alternativeOptions={debateOutcome.decisionOptions.filter(o => o.id !== chosenOption.id)}
                          debateContext={messages.map(m => `${m.agent.name}: ${m.content}`).join('\n')}
                          onAnalysisComplete={setCounterfactualAnalysis}
                        />
                      )}

                      {/* Next Actions */}
                      <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                        <h5 className="font-semibold mb-3 flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" />Prochaine Action</h5>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => createNextArtifact('discovery')}><FileText className="w-4 h-4 mr-1" />Créer Discovery</Button>
                          <Button size="sm" variant="outline" onClick={() => createNextArtifact('epic')}><ListChecks className="w-4 h-4 mr-1" />Créer 1 Epic</Button>
                          <Button size="sm" variant="outline" onClick={() => createNextArtifact('journey')}><Map className="w-4 h-4 mr-1" />Parcours Conseiller</Button>
                          <Button size="sm" variant="outline" onClick={() => createNextArtifact('kpis')}><BarChart3 className="w-4 h-4 mr-1" />KPIs à Valider</Button>
                        </div>
                      </Card>

                      {/* Validation Panel */}
                      {savedDecisionId && (
                        <ValidationPanel
                          decisionId={savedDecisionId}
                          userId={userId}
                          assumptions={chosenOption?.whatChanges || []}
                        />
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Controls */}
              <div className="p-4 border-t bg-muted/30">
                {!isDebating && !isDebateComplete ? (
                  <div className="space-y-3">
                    <ArtifactSelector selectedArtifacts={selectedArtifacts} onSelectionChange={setSelectedArtifacts} maxSelection={5} />
                    <Input placeholder="Entrez le sujet de débat..." value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && startDebate()} className="text-base" />
                    <Button onClick={startDebate} className="w-full" disabled={!prompt.trim()}><Play className="w-4 h-4 mr-2" />Démarrer le Débat</Button>
                  </div>
                ) : isDebating ? (
                  <div className="flex items-center space-x-2">
                    {!isPaused ? <Button onClick={pauseDebate} variant="outline" className="flex-1"><Pause className="w-4 h-4 mr-2" />Pause</Button> : <Button onClick={resumeDebate} className="flex-1"><Play className="w-4 h-4 mr-2" />Reprendre</Button>}
                    <Button onClick={stopDebate} variant="destructive">Arrêter</Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button onClick={generateDebateOutcome} className="flex-1" disabled={isGeneratingOutcome || !!debateOutcome}>
                      {isGeneratingOutcome ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération...</> : debateOutcome ? <><CheckCircle2 className="w-4 h-4 mr-2" />Décisions Générées</> : <><Target className="w-4 h-4 mr-2" />Générer les Décisions</>}
                    </Button>
                    <Button onClick={() => { setIsDebateComplete(false); setMessages([]); setDebateOutcome(null); setPrompt(''); setChosenOption(null); setConfidenceFactors(null); }} variant="outline">Nouveau Débat</Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memory">
          <div className="grid grid-cols-2 gap-4">
            <DecisionMemoryPanel userId={userId} currentTopic={prompt} />
            <ThinkingStyleFeedback userId={userId} />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AgentSignalScores agents={workingSquad} signals={agentSignals} />
        </TabsContent>

        <TabsContent value="friction">
          <FrictionHeatmap userId={userId} />
        </TabsContent>
      </Tabs>

      {/* Agent Swap Dialog */}
      <Dialog open={showAgentSwap} onOpenChange={setShowAgentSwap}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader><DialogTitle>Remplacer {agentToReplace?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Rechercher des agents..." className="w-full" />
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
                {allAgents.filter(a => !workingSquad.some(sa => sa.id === a.id) || a.id === agentToReplace?.id).map((agent) => (
                  <div key={agent.id} className="p-4 rounded-lg border hover:bg-muted/30 cursor-pointer transition-all" onClick={() => confirmAgentSwap(agent)}>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12"><AvatarImage src={agent.avatar} /><AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1"><h4 className="font-semibold text-sm truncate">{agent.name}</h4><Badge variant="outline" className="text-xs">{agent.specialty}</Badge></div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{agent.backstory}</p>
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
