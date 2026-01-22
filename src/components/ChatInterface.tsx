import { useState, useEffect, useRef, type FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Agent, ChatMessage, ResponseMode, SteeringCommand, LiveSynthesis, ThreadConclusion as ThreadConclusionType, Disagreement } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, Users, Loader2, AtSign, Grid3X3, FileText, TrendingUp, Sparkles, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { CanvasGenerator } from './CanvasGenerator';
import { StoryWriter } from './StoryWriter';
import { ImpactPlotter } from './ImpactPlotter';
import { ArtifactPreviewDialog } from './ArtifactPreviewDialog';
import { ArtifactSelector, formatArtifactsForContext } from './ArtifactSelector';
import { DeliverableCreator, DeliverableCreatorButton } from './tools/DeliverableCreator';
import {
  RoleBadge,
  ResponseModeToggle,
  MessageBubble,
  LiveSynthesisPanel,
  ThreadConclusion,
  inferRoleFromSpecialty,
  ConversationStatusPill,
  NextStepRail,
  ModeSwitcher,
  ArtifactDropZone,
} from './chat';

type Artifact = {
  id: string;
  title: string;
  artifact_type: string;
  content: any;
  metadata?: any;
  created_at: string;
};

interface ExtendedChatMessage extends ChatMessage {
  stance?: string;
  isReaction?: boolean;
  reactionType?: 'agree' | 'disagree' | 'risk' | 'idea';
  isLeadResponse?: boolean;
  isConductor?: boolean;
}

interface ChatInterfaceProps {
  currentSquad: Agent[];
  squadId?: string;
  onAddXP: (amount: number, reason: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentSquad, squadId, onAddXP }) => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [showCanvasGenerator, setShowCanvasGenerator] = useState(false);
  const [showStoryWriter, setShowStoryWriter] = useState(false);
  const [showImpactPlotter, setShowImpactPlotter] = useState(false);
  const [showDeliverableCreator, setShowDeliverableCreator] = useState(false);
  const [selectedArtifacts, setSelectedArtifacts] = useState<Artifact[]>([]);
  const [showArtifactPreview, setShowArtifactPreview] = useState(false);
  const [previewArtifact, setPreviewArtifact] = useState<Artifact | null>(null);
  
  // UX Enhancement states
  const [responseMode, setResponseMode] = useState<ResponseMode>('short');
  const [showSynthesisPanel, setShowSynthesisPanel] = useState(true);
  const [activeSteeringMode, setActiveSteeringMode] = useState<SteeringCommand | null>(null);
  const [liveSynthesis, setLiveSynthesis] = useState<LiveSynthesis>({
    options: [],
    openPoints: [],
    disagreements: [],
    lastUpdated: new Date(),
  });
  const [threadConclusion, setThreadConclusion] = useState<ThreadConclusionType | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (squadId && currentSquad.length > 0) {
      loadChatMessages();
    } else if (currentSquad.length > 0) {
      const welcomeMessage: ExtendedChatMessage = {
        id: `welcome-${Date.now()}`,
        squadId: 'current',
        content: `Bonjour ! Votre squad est composée de ${currentSquad.map(a => a.name).join(', ')}. Comment pouvons-nous vous aider ?`,
        sender: currentSquad[0],
        timestamp: new Date(),
        stance: 'Prêt à collaborer',
        isLeadResponse: true,
      };
      setMessages([welcomeMessage]);
    }
  }, [currentSquad, squadId]);

  const loadChatMessages = async () => {
    if (!squadId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('squad_id', squadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages: ExtendedChatMessage[] = data?.map(msg => ({
        id: msg.id,
        squadId: msg.squad_id,
        content: msg.content,
        sender: msg.sender_type === 'user' ? 'user' : {
          id: msg.sender_agent_id || '',
          name: msg.sender_agent_name || '',
          specialty: '',
          avatar: '',
          backstory: '',
          capabilities: [],
          tags: [],
          xpRequired: 0,
          familyColor: 'blue' as const
        },
        timestamp: new Date(msg.created_at),
        mentionedAgents: msg.mentioned_agents || []
      })) || [];

      if (transformedMessages.length === 0 && currentSquad.length > 0) {
        const welcomeMessage: ExtendedChatMessage = {
          id: `welcome-${Date.now()}`,
          squadId: squadId,
          content: `Bonjour ! Votre squad est composée de ${currentSquad.map(a => a.name).join(', ')}. Comment pouvons-nous vous aider ?`,
          sender: currentSquad[0],
          timestamp: new Date(),
          stance: 'Prêt à collaborer',
          isLeadResponse: true,
        };
        
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('chat_messages').insert({
            squad_id: squadId,
            user_id: userData.user.id,
            content: welcomeMessage.content,
            sender_type: 'agent',
            sender_agent_id: currentSquad[0].id,
            sender_agent_name: currentSquad[0].name,
            mentioned_agents: []
          });
        }

        setMessages([welcomeMessage]);
      } else {
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSteeringModeChange = async (mode: SteeringCommand | null) => {
    // If clicking the same mode, deactivate it
    if (mode === activeSteeringMode) {
      setActiveSteeringMode(null);
      toast({
        title: "Mode standard",
        description: "Tous les agents participent normalement",
      });
      return;
    }

    // Handle summarize immediately
    if (mode === 'summarize') {
      setIsLoading(true);
      try {
        const conversationContext = messages.slice(-15).map(m => 
          `${m.sender === 'user' ? 'User' : (m.sender as Agent).name}: ${m.content}`
        ).join('\n');

        const { data } = await supabase.functions.invoke('chat-ai', {
          body: {
            message: `En tant que facilitateur, recentre cette discussion en 3 points:\n\n${conversationContext}`,
            systemPrompt: 'Tu es un facilitateur. Fournis un résumé structuré pour remettre le groupe sur les rails.',
          }
        });

        if (data?.response) {
          const conductorMessage: ExtendedChatMessage = {
            id: `conductor-${Date.now()}`,
            squadId: squadId || 'current',
            content: data.response,
            sender: { 
              id: 'conductor', 
              name: 'Nova', 
              specialty: 'Facilitation', 
              avatar: '', 
              backstory: '', 
              capabilities: [], 
              tags: [], 
              xpRequired: 0, 
              familyColor: 'blue' 
            },
            timestamp: new Date(),
            isConductor: true,
          };
          setMessages(prev => [...prev, conductorMessage]);
        }
      } catch (error) {
        console.error('Error summarizing:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Set the new active mode
    setActiveSteeringMode(mode);
    
    const modeDescriptions: Record<SteeringCommand, string> = {
      pause_others: 'Un seul agent répond à la fois',
      only_ux_business: 'Dialogue UX-Business uniquement',
      tradeoffs_only: 'Focus sur les risques et compromis',
      summarize: '',
    };

    if (mode) {
      toast({
        title: "Mode activé",
        description: modeDescriptions[mode],
      });
    }
  };

  const handleResolveDisagreement = async (disagreementId: string) => {
    const disagreement = liveSynthesis.disagreements.find(d => d.id === disagreementId);
    if (!disagreement) return;

    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `${disagreement.agentA} pense "${disagreement.positionA}" tandis que ${disagreement.agentB} pense "${disagreement.positionB}" concernant "${disagreement.topic}". Propose une position de compromis.`,
          systemPrompt: 'Tu es un médiateur. Trouve un terrain d\'entente constructif en une réponse courte.',
        }
      });

      if (data?.response) {
        const resolutionMessage: ExtendedChatMessage = {
          id: `resolution-${Date.now()}`,
          squadId: squadId || 'current',
          content: `**Résolution du désaccord sur "${disagreement.topic}":**\n\n${data.response}`,
          sender: { 
            id: 'conductor', 
            name: 'Conducteur', 
            specialty: 'Médiation', 
            avatar: '', 
            backstory: '', 
            capabilities: [], 
            tags: [], 
            xpRequired: 0, 
            familyColor: 'blue' 
          },
          timestamp: new Date(),
          isConductor: true,
        };
        setMessages(prev => [...prev, resolutionMessage]);

        // Mark as resolved
        setLiveSynthesis(prev => ({
          ...prev,
          disagreements: prev.disagreements.map(d => 
            d.id === disagreementId ? { ...d, resolved: true } : d
          ),
          lastUpdated: new Date(),
        }));
      }
    } catch (error) {
      console.error('Error resolving disagreement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || currentSquad.length === 0) return;

    const userMessage: ExtendedChatMessage = {
      id: `user-${Date.now()}`,
      squadId: squadId || 'current',
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      mentionedAgents: extractMentions(inputMessage),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setThreadConclusion(null);

    try {
      if (squadId) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('chat_messages').insert({
            squad_id: squadId,
            user_id: userData.user.id,
            content: messageToSend,
            sender_type: 'user',
            mentioned_agents: userMessage.mentionedAgents || []
          });
        }
      }

      // Detect tool intent
      const conversationHistory = messages.slice(-3).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const { data: intentData } = await supabase.functions.invoke('detect-tool-intent', {
        body: { message: messageToSend, conversationHistory }
      });

      if (intentData?.detectedIntent === 'canvas_generator') {
        setShowCanvasGenerator(true);
        setIsLoading(false);
        return;
      } else if (intentData?.detectedIntent === 'instant_prd') {
        toast({ title: "Ouverture Instant PRD", description: "Redirection..." });
        setTimeout(() => { window.location.href = '/?tab=instant-prd'; }, 1000);
        setIsLoading(false);
        return;
      }

      // Build full conversation
      const fullConversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
      fullConversationHistory.push({ role: 'user', content: messageToSend });

      const artifactContext = formatArtifactsForContext(selectedArtifacts);

      // Filter agents based on steering mode
      let respondingAgents = [...currentSquad];
      if (activeSteeringMode === 'only_ux_business') {
        respondingAgents = currentSquad.filter(a => {
          const role = inferRoleFromSpecialty(a.specialty);
          return role === 'ux' || role === 'business';
        });
      }
      if (activeSteeringMode === 'pause_others' && userMessage.mentionedAgents?.length) {
        respondingAgents = currentSquad.filter(a => 
          userMessage.mentionedAgents?.some(m => a.name.toLowerCase().includes(m.toLowerCase()))
        );
      }

      // Build response mode instructions
      const modeInstructions = getResponseModeInstructions(responseMode);

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          messages: fullConversationHistory,
          agents: respondingAgents,
          mentionedAgents: userMessage.mentionedAgents || [],
          artifactContext: artifactContext || undefined,
          responseMode: responseMode,
          modeInstructions: modeInstructions,
        },
      });

      if (error) throw error;

      // Process responses with coordinated turns
      const responses = data.responses || [];
      const leadAgent = responses[0];
      
      // Lead agent responds fully
      if (leadAgent) {
        const stance = generateStance(leadAgent.agent, messageToSend);
        const agentMessage: ExtendedChatMessage = {
          id: `lead-${Date.now()}`,
          squadId: squadId || 'current',
          content: leadAgent.message,
          sender: leadAgent.agent,
          timestamp: new Date(),
          stance: stance,
          isLeadResponse: true,
        };
        setMessages(prev => [...prev, agentMessage]);

        if (squadId) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            await supabase.from('chat_messages').insert({
              squad_id: squadId,
              user_id: userData.user.id,
              content: leadAgent.message,
              sender_type: 'agent',
              sender_agent_id: leadAgent.agent.id,
              sender_agent_name: leadAgent.agent.name
            });
          }
        }
      }

      // Other agents provide micro-reactions
      const otherResponses = responses.slice(1);
      for (let i = 0; i < otherResponses.length; i++) {
        const response = otherResponses[i];
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const reactionType = detectReactionType(response.message);
        const shortContent = extractReactionContent(response.message, reactionType);
        
        const reactionMessage: ExtendedChatMessage = {
          id: `reaction-${Date.now()}-${i}`,
          squadId: squadId || 'current',
          content: shortContent,
          sender: response.agent,
          timestamp: new Date(),
          isReaction: true,
          reactionType: reactionType,
        };
        setMessages(prev => [...prev, reactionMessage]);
      }

      // Update live synthesis
      updateLiveSynthesis(messageToSend, responses);

      // Generate thread conclusion after a few exchanges
      if (messages.length > 6) {
        await generateThreadConclusion();
      }

      onAddXP(15 * responses.length, 'chatting with AI squad');

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Échec de l'envoi. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResponseModeInstructions = (mode: ResponseMode): string => {
    switch (mode) {
      case 'short':
        return 'Réponds en 2-3 phrases maximum. Sois direct et concis.';
      case 'structured':
        return 'Réponds avec des bullet points. Maximum 4 points clés.';
      case 'detailed':
        return 'Tu peux développer ta réponse. Inclus exemples et nuances.';
    }
  };

  const generateStance = (agent: Agent, question: string): string => {
    const role = inferRoleFromSpecialty(agent.specialty);
    const stances: Record<string, string[]> = {
      ux: ['Protéger l\'expérience utilisateur', 'Simplicité avant tout', 'L\'humain d\'abord'],
      product: ['Vision long-terme', 'Équilibrer les besoins', 'Créer de la valeur'],
      tech: ['Faisabilité technique', 'Dette technique maîtrisée', 'Scalabilité'],
      business: ['ROI et impact business', 'Croissance durable', 'Avantage compétitif'],
      data: ['Décision basée sur les données', 'Mesurer l\'impact', 'Insights actionnables'],
      strategy: ['Alignement stratégique', 'Vision d\'ensemble', 'Priorités claires'],
    };
    const roleStances = role ? stances[role] : stances.product;
    return roleStances[Math.floor(Math.random() * roleStances.length)];
  };

  const detectReactionType = (message: string): 'agree' | 'disagree' | 'risk' | 'idea' => {
    const lower = message.toLowerCase();
    if (lower.includes('risque') || lower.includes('attention') || lower.includes('danger')) return 'risk';
    if (lower.includes('désaccord') || lower.includes('mais') || lower.includes('cependant')) return 'disagree';
    if (lower.includes('idée') || lower.includes('suggestion') || lower.includes('pourrait')) return 'idea';
    return 'agree';
  };

  const extractReactionContent = (message: string, type: 'agree' | 'disagree' | 'risk' | 'idea'): string => {
    // Extract first meaningful sentence, max 100 chars
    const sentences = message.split(/[.!?]/);
    const meaningful = sentences.find(s => s.trim().length > 10) || sentences[0];
    return meaningful.trim().slice(0, 100) + (meaningful.length > 100 ? '...' : '');
  };

  const updateLiveSynthesis = (question: string, responses: any[]) => {
    const newDisagreements: Disagreement[] = [];
    
    // Detect disagreements between agents
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const contentI = responses[i].message.toLowerCase();
        const contentJ = responses[j].message.toLowerCase();
        
        if ((contentI.includes('mais') || contentI.includes('cependant')) && 
            (contentJ.includes('mais') || contentJ.includes('cependant'))) {
          newDisagreements.push({
            id: `disagreement-${Date.now()}-${i}-${j}`,
            agentA: responses[i].agent.name,
            agentB: responses[j].agent.name,
            topic: question.slice(0, 50),
            positionA: extractReactionContent(responses[i].message, 'disagree'),
            positionB: extractReactionContent(responses[j].message, 'disagree'),
          });
        }
      }
    }

    setLiveSynthesis(prev => ({
      ...prev,
      disagreements: [...prev.disagreements, ...newDisagreements].slice(-5),
      openPoints: [...prev.openPoints, question].slice(-3),
      lastUpdated: new Date(),
    }));
  };

  const generateThreadConclusion = async () => {
    const recentMessages = messages.slice(-8);
    const summary = recentMessages.map(m => 
      `${m.sender === 'user' ? 'User' : (m.sender as Agent).name}: ${m.content.slice(0, 100)}`
    ).join('\n');

    // Detect mentioned agents in recent messages
    const mentionedAgentNames = currentSquad
      .filter(agent => summary.toLowerCase().includes(agent.name.toLowerCase()))
      .map(a => a.name);

    try {
      const { data } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Basé sur cette discussion, génère UNE conclusion actionnable:\n\n${summary}\n\nAgents mentionnés: ${mentionedAgentNames.join(', ') || 'aucun'}\n\nFormat: Soit une recommandation claire avec l'agent à solliciter, soit 2 options avec impact, soit une question à trancher, soit une action que Nova peut exécuter.`,
          systemPrompt: `Tu es un facilitateur. Fournis une conclusion courte et actionnable. 
IMPORTANT: Réponds UNIQUEMENT en JSON valide (pas de markdown):
{
  "type": "recommendation|options|question|action",
  "content": "texte de la conclusion",
  "actionable": {
    "label": "texte du bouton d'action",
    "handler": "trigger_agent:nom_agent:task OU save_decision OU open_tool:tool_name"
  },
  "options": [{"label": "...", "impact": "..."}, ...] // si type=options
}

Pour le handler actionable:
- Si un agent doit agir: "trigger_agent:NomAgent:résumer|proposer|analyser"
- Pour sauvegarder: "save_decision"
- Pour ouvrir un outil: "open_tool:canvas|story|impact"`,
        }
      });

      if (data?.response) {
        try {
          // Clean markdown if present
          const cleanResponse = data.response.replace(/```json\s*/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanResponse);
          setThreadConclusion(parsed);
        } catch {
          setThreadConclusion({
            type: 'recommendation',
            content: data.response,
            actionable: {
              label: 'Enregistrer la décision',
              handler: 'save_decision'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error generating conclusion:', error);
    }
  };

  const handleConclusionAction = async (handler: string) => {
    const [action, ...params] = handler.split(':');
    
    switch (action) {
      case 'trigger_agent': {
        const [agentName, task] = params;
        const agent = currentSquad.find(a => 
          a.name.toLowerCase().includes(agentName.toLowerCase())
        );
        if (agent) {
          const taskPrompts: Record<string, string> = {
            'résumer': 'peux-tu résumer les points clés de notre discussion ?',
            'proposer': 'quelles seraient tes propositions concrètes ?',
            'analyser': 'peux-tu analyser cette situation en détail ?',
          };
          const prompt = taskPrompts[task] || `peux-tu ${task} ?`;
          setInputMessage(`@${agent.name} ${prompt}`);
          // Focus input to let user send
          inputRef.current?.focus();
          toast({
            title: `Question préparée pour ${agent.name}`,
            description: "Appuyez sur Entrée pour envoyer",
          });
        }
        break;
      }
      case 'save_decision': {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast({ title: "Connectez-vous pour sauvegarder", variant: "destructive" });
            return;
          }
          
          await supabase.from('decision_log').insert({
            user_id: user.id,
            squad_id: squadId || null,
            debate_topic: threadConclusion?.content || 'Discussion',
            options_considered: messages.slice(-5).map(m => ({
              agent: m.sender === 'user' ? 'User' : (m.sender as Agent).name,
              content: m.content.slice(0, 200)
            })),
            option_chosen: { content: threadConclusion?.content },
            confidence_level: 'medium',
          });
          
          toast({
            title: "Décision enregistrée",
            description: "Retrouvez-la dans votre historique des décisions",
          });
          onAddXP(25, 'decision saved');
        } catch (error) {
          console.error('Error saving decision:', error);
          toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
        }
        break;
      }
      case 'open_tool': {
        const [toolName] = params;
        switch (toolName) {
          case 'canvas':
            setShowCanvasGenerator(true);
            break;
          case 'story':
            setShowStoryWriter(true);
            break;
          case 'impact':
            setShowImpactPlotter(true);
            break;
        }
        break;
      }
      case 'open_artifact': {
        // Find artifact by name in selected artifacts or search
        const artifactName = params.join(':'); // Rejoin in case name contains ':'
        const matchingArtifact = selectedArtifacts.find(a => 
          a.title.toLowerCase().includes(artifactName.toLowerCase())
        );
        
        if (matchingArtifact) {
          // Open artifact preview dialog
          setPreviewArtifact(matchingArtifact);
          setShowArtifactPreview(true);
        } else {
          // Search for artifact in database
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: artifacts } = await supabase
                .from('artifacts')
                .select('*')
                .eq('user_id', user.id)
                .ilike('title', `%${artifactName}%`)
                .limit(1);
              
              if (artifacts && artifacts.length > 0) {
                setPreviewArtifact(artifacts[0]);
                setShowArtifactPreview(true);
              } else {
                toast({
                  title: "Artefact non trouvé",
                  description: `L'artefact "${artifactName}" n'a pas été trouvé`,
                  variant: "destructive",
                });
              }
            }
          } catch (error) {
            console.error('Error fetching artifact:', error);
            toast({ title: "Erreur de chargement", variant: "destructive" });
          }
        }
        break;
      }
      default:
        console.warn('Unknown action handler:', handler);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@(\w+)/g);
    return mentions ? mentions.map(mention => mention.slice(1)) : [];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setInputMessage(value);
    
    const beforeCursor = value.slice(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = beforeCursor.slice(atIndex + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setMentionStartPos(atIndex);
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const filteredAgents = currentSquad.filter(agent =>
    agent.name.toLowerCase().includes(mentionSearch) ||
    agent.specialty.toLowerCase().includes(mentionSearch)
  );

  const selectMention = (agent: Agent) => {
    const beforeMention = inputMessage.slice(0, mentionStartPos);
    const afterMention = inputMessage.slice(inputRef.current?.selectionStart || inputMessage.length);
    const newValue = beforeMention + `@${agent.name} ` + afterMention;
    
    setInputMessage(newValue);
    setShowMentionDropdown(false);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = beforeMention.length + agent.name.length + 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (showMentionDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => prev < filteredAgents.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : filteredAgents.length - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredAgents[selectedMentionIndex]) {
          selectMention(filteredAgents[selectedMentionIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionDropdown(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Empty state
  if (currentSquad.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chat Multi-Agents</h2>
          <p className="text-muted-foreground">
            Construisez une squad pour collaborer avec plusieurs agents IA
          </p>
        </div>
        
        <Card className="p-8 border-2 border-dashed">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Prêt à collaborer ?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Créez une squad avec des agents IA spécialisés pour obtenir des perspectives multiples.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => window.location.hash = '#squads'}>
                <Users className="w-4 h-4 mr-2" />
                Créer une Squad
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Chat Multi-Agents</h2>
        <p className="text-muted-foreground">
          {currentSquad.length} agents: {currentSquad.map(a => a.name).join(', ')}
        </p>
      </div>

      {/* Squad Display with Role Badges */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Squad Active
          </h3>
          <Badge variant="secondary" className="text-xs">{currentSquad.length} agents</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentSquad.map(agent => (
            <div key={agent.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1.5">
              <Avatar className="w-5 h-5">
                <AvatarImage src={agent.avatar} />
                <AvatarFallback className="text-xs">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{agent.name}</span>
              <RoleBadge specialty={agent.specialty} size="sm" />
            </div>
          ))}
        </div>
      </Card>

      {/* Main Chat Layout */}
      <div className="flex gap-4">
        {/* Chat Area */}
        <Card className={`flex flex-col h-[650px] ${showSynthesisPanel ? 'flex-1' : 'w-full'}`}>
          {/* Header with Controls */}
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-sm">Conversation</h3>
                <ConversationStatusPill synthesis={liveSynthesis} messageCount={messages.length} />
              </div>
              <div className="flex items-center gap-3">
                <ResponseModeToggle mode={responseMode} onChange={setResponseMode} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSynthesisPanel(!showSynthesisPanel)}
                  className="h-7 px-2"
                >
                  {showSynthesisPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <ModeSwitcher 
              activeMode={activeSteeringMode} 
              onModeChange={handleSteeringModeChange}
              disabled={isLoading}
            />
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  id={message.id}
                  content={message.content}
                  sender={message.sender}
                  timestamp={message.timestamp}
                  stance={message.stance}
                  isReaction={message.isReaction}
                  reactionType={message.reactionType}
                  isLeadResponse={message.isLeadResponse}
                  isConductor={message.isConductor}
                />
              ))}
              
              {isLoading && (
                <div className="flex space-x-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Réflexion en cours...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Thread Conclusion */}
              {threadConclusion && !isLoading && (
                <ThreadConclusion 
                  conclusion={threadConclusion}
                  onActionClick={handleConclusionAction}
                />
              )}
            </div>
          </ScrollArea>

          <Separator />
          
          {/* Input Area */}
          <div className="p-3 relative">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <ArtifactSelector 
                selectedArtifacts={selectedArtifacts}
                onSelectionChange={setSelectedArtifacts}
                maxSelection={5}
              />
              <div className="h-5 w-px bg-border" />
              {/* Main deliverable creation button - contextual */}
              <DeliverableCreatorButton 
                variant="compact"
                onClick={() => setShowDeliverableCreator(true)}
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Votre message... (@ pour mentionner)"
                  disabled={isLoading}
                  className="pr-10"
                />
                
                {/* Mention Dropdown */}
                {showMentionDropdown && filteredAgents.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-1 w-full max-w-xs bg-background border rounded-md shadow-lg z-50">
                    <div className="p-2 border-b">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <AtSign className="w-3 h-3" />
                        <span>Mentionner un agent</span>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredAgents.map((agent, index) => (
                        <div
                          key={agent.id}
                          className={`flex items-center gap-2 p-2 cursor-pointer transition-colors ${
                            index === selectedMentionIndex ? 'bg-accent' : 'hover:bg-muted'
                          }`}
                          onClick={() => selectMention(agent)}
                        >
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={agent.avatar} />
                            <AvatarFallback className="text-xs">
                              {agent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{agent.name}</span>
                          <RoleBadge specialty={agent.specialty} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} size="icon">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Synthesis Panel */}
        {showSynthesisPanel && (
          <div className="w-80">
            <LiveSynthesisPanel 
              synthesis={liveSynthesis}
              onResolveDisagreement={handleResolveDisagreement}
            />
          </div>
        )}
      </div>

      {/* Tool Dialogs */}
      <CanvasGenerator open={showCanvasGenerator} onClose={() => setShowCanvasGenerator(false)} />
      <StoryWriter open={showStoryWriter} onClose={() => setShowStoryWriter(false)} />
      <ImpactPlotter open={showImpactPlotter} onClose={() => setShowImpactPlotter(false)} />
      
      {/* Contextual Deliverable Creator */}
      <DeliverableCreator
        open={showDeliverableCreator}
        onClose={() => setShowDeliverableCreator(false)}
        onSelectTool={(toolId) => {
          setShowDeliverableCreator(false);
          // Route to appropriate tool
          switch (toolId) {
            case 'canvas':
              setShowCanvasGenerator(true);
              break;
            case 'epic-stories':
              setShowStoryWriter(true);
              break;
            case 'prd':
              // Will be handled by parent navigation
              break;
            default:
              toast({ title: 'Outil sélectionné', description: `Ouverture de ${toolId}` });
          }
        }}
        context="all"
      />
      
      {/* Artifact Preview Dialog */}
      <ArtifactPreviewDialog
        open={showArtifactPreview}
        onOpenChange={setShowArtifactPreview}
        artifact={previewArtifact}
      />
    </div>
  );
};
