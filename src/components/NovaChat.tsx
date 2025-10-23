import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, Wand2, Users, Layout } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TabType } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Array<{
    label: string;
    action: string;
    type: 'tool' | 'workflow' | 'navigation';
  }>;
}

interface NovaChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: TabType) => void;
  onAction?: (action: string, data?: any) => void;
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load workspace context when dialog opens
  useEffect(() => {
    if (open) {
      loadWorkspaceContext();
      initializeChat();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadWorkspaceContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch workspace data in parallel
      const [artifacts, contexts, squads, pinnedItems] = await Promise.all([
        supabase.from('artifacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('product_contexts').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('squads').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('pinned_items').select('*').eq('user_id', user.id).order('position')
      ]);

      setWorkspaceContext({
        recentArtifacts: artifacts.data || [],
        activeContexts: contexts.data || [],
        squads: squads.data || [],
        pinnedItems: pinnedItems.data || []
      });
    } catch (error) {
      console.error('Failed to load workspace context:', error);
    }
  };

  const initializeChat = async () => {
    // Generate dynamic initial suggestions based on workspace state
    const suggestions = await generateSuggestions('dashboard');
    
    setMessages([{
      role: 'assistant',
      content: "Bonjour ! Je suis Nova, votre assistant IA produit. J'ai analysé votre espace de travail et je peux vous aider avec vos projets en cours.\n\nQue souhaitez-vous faire aujourd'hui ?",
      suggestions
    }]);
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
    { label: 'Construire une Squad', action: 'squad_builder', type: 'workflow' as const },
    { label: 'Générer un PRD', action: 'instant_prd', type: 'tool' as const },
    { label: 'Voir mes Projets', action: 'dashboard', type: 'navigation' as const }
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

Vous aidez avec:
- Stratégie produit et planification
- Création de canvases, PRD, user stories
- Construction d'équipes efficaces
- Guidance sur les workflows
- Analyses et recommandations personnalisées

Soyez concis (2-4 phrases), amical, et proposez des actions suivantes basées sur leur contexte actuel.`
      })
    });

    if (!response.ok || !response.body) throw new Error('Stream failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantMessage = '';

    // Add empty assistant message that we'll update
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
            // Update the last message with accumulated content
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
          // Partial JSON, buffer it
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
      // Detect intent
      const intent = await detectIntent(userMessage);
      
      let responseContent = '';
      let suggestions: Message['suggestions'] = [];

      // Build context string
      const contextData = workspaceContext ? `
Artéfacts récents: ${workspaceContext.recentArtifacts?.length || 0}
Contextes actifs: ${workspaceContext.activeContexts?.length || 0}
Squads: ${workspaceContext.squads?.length || 0}
      ` : 'Nouveau utilisateur';

      if (intent !== 'none') {
        // Tool-specific responses
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
      } else {
        // Stream general conversation with context
        responseContent = await streamResponse(userMessage, contextData);
      }

      // Generate contextual suggestions if not from tool intent
      if (suggestions.length === 0) {
        suggestions = await generateSuggestions();
      }

      // Add or update assistant message with suggestions
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === 'assistant' && !lastMsg.suggestions) {
          // Update existing message with suggestions
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, suggestions }
          ];
        }
        // Intent-based response, add new message
        if (intent !== 'none') {
          return [...prev, { role: 'assistant', content: responseContent, suggestions }];
        }
        return prev;
      });

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'envoi du message. Réessayez.",
        variant: "destructive"
      });
      // Remove empty assistant message on error
      setMessages(prev => prev.filter((msg, idx) => !(idx === prev.length - 1 && msg.role === 'assistant' && !msg.content)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (action: string, type: string) => {
    const toolMapping: Record<string, () => void> = {
      canvas_generator: () => onAction?.('create_canvas'),
      instant_prd: () => onAction?.('generate_prd'),
      test_generator: () => onNavigate('test-generator' as TabType),
      critical_path_analyzer: () => onNavigate('critical-path' as TabType),
      story_writer: () => onAction?.('create_story'),
      roadmap_planner: () => onNavigate('roadmap' as TabType),
      sprint_planner: () => onNavigate('sprint' as TabType),
      squad_builder: () => onNavigate('squads' as TabType),
      dashboard: () => onNavigate('dashboard' as TabType),
      artifacts_view: () => onNavigate('artifacts' as TabType)
    };

    const handler = toolMapping[action];
    if (handler) {
      handler();
      onOpenChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogTitle className="sr-only">Nova AI Assistant</DialogTitle>
        <DialogDescription className="sr-only">
          Chat with Nova to get help with product management, create canvases, build squads, and navigate workflows.
        </DialogDescription>
        
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Assistant IA Nova</h2>
            <p className="text-sm text-muted-foreground">
              {workspaceContext ? 'Analyse de votre espace en cours...' : 'Votre compagnon produit intelligent'}
            </p>
          </div>
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
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
      </DialogContent>
    </Dialog>
  );
};
