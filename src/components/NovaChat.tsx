import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, Wand2, Users, Layout, ThumbsUp, ThumbsDown, Share2, BarChart, FileSearch, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TabType } from '@/types';
import { VoiceInput } from '@/components/nova/VoiceInput';
import { ArtifactPreview } from '@/components/nova/ArtifactPreview';
import { ConversationHistory } from '@/components/nova/ConversationHistory';
import { useWorkflowProgress } from '@/hooks/useWorkflowProgress';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Array<{
    label: string;
    action: string;
    type: 'tool' | 'workflow' | 'navigation';
  }>;
  artifacts?: any[];
  analysis?: any;
  workflowStep?: {
    current: string;
    total: number;
    progress: number;
  };
}

interface NovaChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: TabType) => void;
  onAction?: (action: string, data?: any) => void;
}

const WORKFLOWS = {
  feature_discovery: {
    name: 'Feature Discovery',
    steps: [
      { id: 'context', label: 'Définir le contexte produit', action: 'create_context' },
      { id: 'research', label: 'Étude de marché', action: 'market_research' },
      { id: 'canvas', label: 'Créer un canvas stratégique', action: 'canvas_generator' },
      { id: 'roadmap', label: 'Planifier la roadmap', action: 'roadmap_planner' },
      { id: 'squad', label: 'Construire la squad', action: 'squad_builder' }
    ]
  },
  story_to_test: {
    name: 'Story to Test',
    steps: [
      { id: 'story', label: 'Créer user story', action: 'story_writer' },
      { id: 'acceptance', label: 'Critères d\'acceptation', action: 'story_writer' },
      { id: 'tests', label: 'Générer test cases', action: 'test_generator' }
    ]
  }
};

export const NovaChat: React.FC<NovaChatProps> = ({ 
  open, 
  onOpenChange, 
  onNavigate,
  onAction 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceContext, setWorkspaceContext] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<{ type: string; currentStep: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Workflow progress hook
  const handleWorkflowStepComplete = useCallback(async (newStep: number, context: any) => {
    if (!activeWorkflow) return;

    const workflow = WORKFLOWS[activeWorkflow.type as keyof typeof WORKFLOWS];
    
    if (newStep >= workflow.steps.length) {
      // Workflow complete
      setActiveWorkflow(null);
      const completionSuggestions = await generateSuggestions();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🎉 Workflow "${workflow.name}" terminé ! Vous avez créé ${Object.keys(context).length} artéfacts. Que voulez-vous faire ensuite ?`,
        suggestions: completionSuggestions
      }]);
      await saveConversation();
      return;
    }

    // Move to next step
    setActiveWorkflow({ ...activeWorkflow, currentStep: newStep });
    const step = workflow.steps[newStep];
    
    // Build context message
    const previousArtifact = context.lastArtifact;
    const contextMessage = previousArtifact 
      ? `J'ai détecté que vous avez créé "${previousArtifact.title}". ` 
      : '';

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `${contextMessage}Étape ${newStep + 1}/${workflow.steps.length}: ${step.label}`,
      workflowStep: { 
        current: step.label, 
        total: workflow.steps.length, 
        progress: Math.round((newStep / workflow.steps.length) * 100) 
      },
      suggestions: [
        { label: step.label, action: step.action, type: 'tool' }
      ]
    }]);
    
    await saveConversation();
  }, [activeWorkflow]);

  useWorkflowProgress(activeWorkflow, handleWorkflowStepComplete);
  const [localWorkflowContext, setLocalWorkflowContext] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      loadWorkspaceContext();
      if (!currentConversationId) {
        initializeChat();
      } else {
        loadConversation(currentConversationId);
      }
    }
  }, [open, currentConversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadWorkspaceContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [artifacts, contexts, squads, pinnedItems] = await Promise.all([
        supabase.from('artifacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('product_contexts').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('squads').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('pinned_items').select('*').eq('user_id', user.id).order('position')
      ]);

      setWorkspaceContext({
        userId: user.id,
        recentArtifacts: artifacts.data || [],
        activeContexts: contexts.data || [],
        squads: squads.data || [],
        pinnedItems: pinnedItems.data || []
      });
    } catch (error) {
      console.error('Failed to load workspace context:', error);
    }
  };

  const saveConversation = async () => {
    if (!workspaceContext?.userId || messages.length === 0) return;

    try {
      const title = messages[0]?.role === 'user' 
        ? messages[0].content.substring(0, 50) 
        : 'Conversation Nova';

      const conversationData = {
        user_id: workspaceContext.userId,
        title,
        messages: JSON.stringify(messages),
        context_snapshot: JSON.stringify(workspaceContext),
        workflow_state: JSON.stringify(activeWorkflow || {}),
        updated_at: new Date().toISOString()
      };

      if (currentConversationId) {
        await supabase
          .from('nova_conversations')
          .update(conversationData)
          .eq('id', currentConversationId);
      } else {
        const { data } = await supabase
          .from('nova_conversations')
          .insert([conversationData])
          .select()
          .single();
        
        if (data) {
          setCurrentConversationId(data.id);
        }
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('nova_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      if (data) {
        setMessages(JSON.parse(data.messages as string));
        setActiveWorkflow(JSON.parse(data.workflow_state as string));
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const initializeChat = async () => {
    const suggestions = await generateSuggestions('dashboard');
    
    const welcomeMessage = workspaceContext?.recentArtifacts?.length > 0
      ? `Bonjour ! J'ai analysé votre espace de travail. Vous avez ${workspaceContext.recentArtifacts.length} artéfacts récents. Je peux vous aider à les analyser ou créer de nouveaux éléments.`
      : "Bonjour ! Je suis Nova, votre assistant IA produit. Commençons par créer votre premier projet !";

    setMessages([{
      role: 'assistant',
      content: welcomeMessage,
      suggestions
    }]);

    // Save the conversation immediately so it appears in history
    await saveConversation();
  };

  const generateSuggestions = async (currentPage: string = 'unknown') => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: { 
          workspaceContext,
          currentPage,
          recentActivity: messages.length > 0 ? messages[messages.length - 1].content : null
        }
      });

      if (error) throw error;
      return data?.suggestions || getDefaultSuggestions();
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return getDefaultSuggestions();
    }
  };

  const getDefaultSuggestions = () => [
    { label: 'Créer un Canvas', action: 'canvas_generator', type: 'tool' as const },
    { label: 'Analyser mes Artéfacts', action: 'analyze_artifacts', type: 'tool' as const },
    { label: 'Workflow Discovery', action: 'workflow_discovery', type: 'workflow' as const }
  ];

  const detectIntent = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('detect-tool-intent', {
        body: { 
          message: userMessage,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;
      return data?.detectedIntent || 'none';
    } catch (error) {
      console.error('Intent detection failed:', error);
      return 'none';
    }
  };

  const analyzeArtifact = async (artifactId: string, analysisType: string = 'quality') => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { artifactId, analysisType }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Artifact analysis failed:', error);
      return null;
    }
  };

  const analyzeCrossArtifacts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-cross-artifacts', {
        body: { 
          userId: workspaceContext?.userId,
          contextId: workspaceContext?.activeContexts?.[0]?.id
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Cross-artifact analysis failed:', error);
      return null;
    }
  };

  const streamResponse = async (userMessage: string, contextData: string) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        message: userMessage,
        stream: true,
        systemPrompt: `Vous êtes Nova, assistant IA de product management.

CONTEXTE UTILISATEUR:
${contextData}

${activeWorkflow ? `
WORKFLOW EN COURS: ${WORKFLOWS[activeWorkflow.type as keyof typeof WORKFLOWS]?.name}
Étape actuelle: ${activeWorkflow.currentStep + 1}/${WORKFLOWS[activeWorkflow.type as keyof typeof WORKFLOWS]?.steps.length}
` : ''}

Vous aidez avec:
- Stratégie produit et planification
- Création de canvases, PRD, user stories
- Analyse d'artéfacts et intelligence cross-artifact
- Construction d'équipes efficaces
- Guidance sur les workflows multi-étapes
- Analyses et recommandations personnalisées

Soyez concis (2-4 phrases), amical, et proposez des actions suivantes basées sur leur contexte actuel.`
      })
    });

    if (!response.ok || !response.body) throw new Error('Stream failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantMessage = '';

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantMessage += content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: assistantMessage
              };
              return newMessages;
            });
          }
        } catch (e) {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    return assistantMessage;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Check for special commands
      if (userMessage.toLowerCase().includes('analyze') && userMessage.toLowerCase().includes('artifact')) {
        // Cross-artifact analysis
        const analysis = await analyzeCrossArtifacts();
        
        if (analysis) {
          const responseMsg: Message = {
            role: 'assistant',
            content: `J'ai analysé ${analysis.artifactCount} artéfacts. Voici ce que j'ai trouvé :\n\n**Lacunes identifiées:** ${analysis.analysis.gaps?.length || 0}\n**Relations détectées:** ${analysis.analysis.relationships?.length || 0}\n\nVoulez-vous voir les détails ?`,
            analysis: analysis.analysis,
            suggestions: [
              { label: 'Voir les détails', action: 'show_analysis', type: 'tool' },
              { label: 'Combler les lacunes', action: 'fill_gaps', type: 'workflow' }
            ]
          };
          
          setMessages(prev => [...prev, responseMsg]);
          setIsLoading(false);
          await saveConversation();
          return;
        }
      }

      // Workflow handling
      if (userMessage.toLowerCase().includes('workflow') || activeWorkflow) {
        if (!activeWorkflow) {
          // Start workflow
          const workflowType = userMessage.toLowerCase().includes('discovery') 
            ? 'feature_discovery' 
            : 'story_to_test';
          
          setActiveWorkflow({ type: workflowType, currentStep: 0 });
          
          const workflow = WORKFLOWS[workflowType as keyof typeof WORKFLOWS];
          const step = workflow.steps[0];
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Commençons le workflow "${workflow.name}". Étape 1/${workflow.steps.length}: ${step.label}\n\nCette étape va créer le contexte de base pour les étapes suivantes. Une fois que vous aurez créé cet artéfact, je vous guiderai automatiquement vers l'étape suivante.`,
            workflowStep: { current: step.label, total: workflow.steps.length, progress: 0 },
            suggestions: [
              { label: step.label, action: step.action, type: 'tool' }
            ]
          }]);
          
          setIsLoading(false);
          await saveConversation();
          return;
        } else if (userMessage.toLowerCase().includes('next') || userMessage.toLowerCase().includes('continue')) {
          // Manually advance workflow (in addition to auto-advance)
          await handleWorkflowStepComplete(activeWorkflow.currentStep + 1, localWorkflowContext);
          setIsLoading(false);
          return;
        }
      }

      const intent = await detectIntent(userMessage);
      
      let responseContent = '';
      let suggestions: Message['suggestions'] = [];
      let artifacts: any[] = [];

      const contextData = workspaceContext ? `
Artéfacts récents: ${workspaceContext.recentArtifacts?.length || 0}
Contextes actifs: ${workspaceContext.activeContexts?.length || 0}
Squads: ${workspaceContext.squads?.length || 0}

${activeWorkflow && localWorkflowContext.lastArtifact ? `
WORKFLOW EN COURS - Contexte de l'étape précédente:
Dernier artéfact créé: ${localWorkflowContext.lastArtifact.title}
Type: ${localWorkflowContext.lastArtifact.artifact_type}
Contenu: ${JSON.stringify(localWorkflowContext.lastArtifact.content).substring(0, 200)}...

Utilisez ce contexte pour guider l'utilisateur dans l'étape actuelle.
` : ''}
      ` : 'Nouveau utilisateur';

      if (intent !== 'none') {
        const toolResponses: Record<string, string> = {
          canvas_generator: "Je vous aide à créer un canvas stratégique. Quel type souhaitez-vous ?",
          instant_prd: "Je vais générer un PRD détaillé pour vous avec spécifications et user stories.",
          test_generator: "Je peux générer des test cases pour vos stories. Sélectionnez les artéfacts à tester.",
          critical_path_analyzer: "J'analyse les chemins critiques de votre projet pour identifier les dépendances.",
          story_writer: "Créons une user story avec critères d'acceptation détaillés.",
          epic_to_stories: "Je décompose votre epic en user stories atomiques et testables.",
          roadmap_planner: "Planifions votre roadmap produit avec priorités et timelines.",
          sprint_planner: "Organisons votre sprint avec estimation et capacité d'équipe.",
          kpi_generator: "Définissons des KPIs mesurables et alignés avec vos objectifs.",
          raci_matrix: "Créons une matrice RACI pour clarifier les responsabilités.",
          meeting_minutes: "J'extrais les éléments clés et action items de votre réunion."
        };
        
        responseContent = toolResponses[intent] || "Je peux vous aider avec cet outil.";
        suggestions = [
          { label: `Ouvrir ${intent.replace('_', ' ')}`, action: intent, type: 'tool' }
        ];

        // Add recent artifacts if relevant
        if (['test_generator', 'story_writer'].includes(intent) && workspaceContext?.recentArtifacts) {
          artifacts = workspaceContext.recentArtifacts.slice(0, 3);
        }
      } else {
        responseContent = await streamResponse(userMessage, contextData);
      }

      if (suggestions.length === 0) {
        suggestions = await generateSuggestions();
      }

      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.suggestions) {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, suggestions, artifacts }
          ];
        }
        if (intent !== 'none') {
          return [...prev, { role: 'assistant', content: responseContent, suggestions, artifacts }];
        }
        return prev;
      });

      await saveConversation();

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'envoi du message. Réessayez.",
        variant: "destructive"
      });
      setMessages(prev => prev.filter((msg, idx) => !(idx === prev.length - 1 && msg.role === 'assistant' && !msg.content)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = useCallback((action: string, type: string) => {
    console.log('Suggestion clicked:', action, type);
    
    // Handle workflow suggestions by type or action key
    if (type === 'workflow' || action in WORKFLOWS) {
      const wfKey = (action in WORKFLOWS)
        ? action
        : action.includes('discovery')
          ? 'feature_discovery'
          : action.includes('story') || action.includes('test')
            ? 'story_to_test'
            : 'feature_discovery';

      // Reuse existing workflow-start flow via input to keep logic centralized
      setInput(`Start ${wfKey.replace(/_/g, ' ')} workflow`);
      handleSendMessage();
      return;
    }

    // Handle analyze actions
    if (action.includes('analyze')) {
      setInput(action === 'analyze_artifacts' ? 'Analyze my artifacts' : 'Analyze');
      handleSendMessage();
      return;
    }

    const toolMapping: Record<string, () => void> = {
      create_context: () => {
        console.log('Create context action triggered');
        onNavigate('context' as TabType);
        onOpenChange(false);
      },
      market_research: () => {
        console.log('Market research action triggered');
        onNavigate('research' as TabType);
        onOpenChange(false);
      },
      canvas_generator: () => {
        console.log('Canvas generator action triggered');
        onAction?.('create_canvas');
        onOpenChange(false);
      },
      instant_prd: () => {
        console.log('Instant PRD action triggered');
        onAction?.('generate_prd');
        onOpenChange(false);
      },
      test_generator: () => {
        console.log('Test generator navigation');
        onNavigate('test-generator' as TabType);
        onOpenChange(false);
      },
      critical_path_analyzer: () => {
        onNavigate('critical-path' as TabType);
        onOpenChange(false);
      },
      story_writer: () => {
        onAction?.('create_story');
        onOpenChange(false);
      },
      epic_to_stories: () => {
        onAction?.('epic_to_stories');
        onOpenChange(false);
      },
      roadmap_planner: () => {
        onNavigate('roadmap' as TabType);
        onOpenChange(false);
      },
      sprint_planner: () => {
        onNavigate('sprint' as TabType);
        onOpenChange(false);
      },
      kpi_generator: () => {
        onAction?.('generate_kpis');
        onOpenChange(false);
      },
      raci_matrix: () => {
        onAction?.('create_raci');
        onOpenChange(false);
      },
      meeting_minutes: () => {
        onAction?.('extract_minutes');
        onOpenChange(false);
      },
      squad_builder: () => {
        onNavigate('squads' as TabType);
        onOpenChange(false);
      },
      dashboard: () => {
        onNavigate('dashboard' as TabType);
        onOpenChange(false);
      },
      artifacts_view: () => {
        onNavigate('artifacts' as TabType);
        onOpenChange(false);
      },
      show_analysis: () => {
        toast({
          title: "Analyse disponible",
          description: "Les détails de l'analyse sont affichés ci-dessus."
        });
      },
      fill_gaps: () => {
        setInput('Help me fill the gaps in my artifacts');
        handleSendMessage();
      }
    };

    const handler = toolMapping[action];
    if (handler) {
      console.log('Executing handler for:', action);
      handler();
    } else {
      // Fallbacks based on suggestion type
      if (type === 'tool') {
        setInput(action.replace(/_/g, ' '));
        handleSendMessage();
        return;
      }

      console.warn('No handler found for action:', action);
      toast({
        title: "Action non disponible",
        description: `L'action "${action}" n'est pas encore implémentée.`,
        variant: "destructive"
      });
    }
  }, [onAction, onNavigate, onOpenChange, toast]);

  const handleFeedback = async (messageIndex: number, rating: number) => {
    if (!currentConversationId) return;

    try {
      await supabase.from('nova_feedback').insert([{
        conversation_id: currentConversationId,
        message_index: messageIndex,
        rating
      }]);

      toast({
        title: "Merci !",
        description: "Votre feedback nous aide à améliorer Nova."
      });
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(text);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setActiveWorkflow(null);
    initializeChat();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[700px] flex flex-col p-0">
        <DialogTitle className="sr-only">Nova AI Assistant</DialogTitle>
        <DialogDescription className="sr-only">
          Chat with Nova to get help with product management, create canvases, build squads, and navigate workflows.
        </DialogDescription>
        
        <div className="flex h-full">
          {/* Conversation History Sidebar */}
          {showHistory && (
            <div className="w-64 shrink-0">
              <ConversationHistory
                currentConversationId={currentConversationId || undefined}
                onSelectConversation={setCurrentConversationId}
                onNewConversation={handleNewConversation}
              />
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
                title="Historique des conversations"
              >
                <Layout className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewConversation}
                title="Nouvelle conversation"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Assistant IA Nova</h2>
                <p className="text-sm text-muted-foreground">
                  {activeWorkflow 
                    ? `Workflow: ${WORKFLOWS[activeWorkflow.type as keyof typeof WORKFLOWS]?.name}`
                    : workspaceContext ? 'Analyse de votre espace en cours...' : 'Votre compagnon produit intelligent'
                  }
                </p>
              </div>

              {workspaceContext?.recentArtifacts?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    analyzeCrossArtifacts().then((analysis) => {
                      if (analysis) {
                        setMessages(prev => [...prev, {
                          role: 'assistant',
                          content: `Analyse de ${analysis.artifactCount} artéfacts terminée !`,
                          analysis: analysis.analysis
                        }]);
                      }
                    });
                  }}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Analyser
                </Button>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[80%] space-y-2">
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert">
                          {message.content.split('\n').map((line, idx) => {
                            // Handle bold text
                            const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            // Handle lists
                            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                              return <li key={idx} dangerouslySetInnerHTML={{ __html: boldFormatted.replace(/^[-*]\s/, '') }} />;
                            }
                            return <p key={idx} dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
                          })}
                        </div>
                        
                        {/* Workflow Progress */}
                        {message.workflowStep && (
                          <div className="mt-3 p-2 bg-background/50 rounded">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Étape: {message.workflowStep.current}</span>
                              <span>{message.workflowStep.progress}%</span>
                            </div>
                            <div className="h-1 bg-background rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ width: `${message.workflowStep.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Artifact Previews */}
                      {message.artifacts && message.artifacts.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {message.artifacts.map((artifact) => (
                            <ArtifactPreview
                              key={artifact.id}
                              artifact={artifact}
                              onView={() => onNavigate('artifacts' as TabType)}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, idx) => {
                            const Icon = suggestion.type === 'tool' ? Wand2 :
                                       suggestion.type === 'workflow' ? Users : Layout;
                            return (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion.action, suggestion.type)}
                                className="text-xs"
                              >
                                <Icon className="h-3 w-3 mr-1" />
                                {suggestion.label}
                              </Button>
                            );
                          })}
                        </div>
                      )}

                      {/* Feedback buttons for assistant messages */}
                      {message.role === 'assistant' && message.content && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleFeedback(index, 1)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleFeedback(index, -1)}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="px-6 py-4 border-t bg-muted/30">
              <div className="flex gap-2">
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading}
                />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Demandez tout à Nova..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Appuyez sur Entrée pour envoyer • Shift+Entrée pour une nouvelle ligne
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
