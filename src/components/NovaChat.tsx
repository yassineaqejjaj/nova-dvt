import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, Wand2, Users, Layout, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TabType } from '@/types';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Array<{
    label: string;
    action: string;
    type: 'tool' | 'workflow' | 'squad';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Nova, your AI product assistant. I can help you with:\n\n• Creating canvases and PRDs\n• Building and optimizing squads\n• Navigating workflows\n• Market research and analytics\n\nWhat would you like to work on today?",
      suggestions: [
        { label: 'Create a Canvas', action: 'canvas', type: 'tool' },
        { label: 'Build a Squad', action: 'squad', type: 'squad' },
        { label: 'Generate PRD', action: 'prd', type: 'tool' },
        { label: 'Start Discovery', action: 'discovery', type: 'workflow' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const detectIntent = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('detect-tool-intent', {
        body: { 
          message: userMessage,
          conversationHistory: messages.slice(-3).map(m => ({
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

  const suggestSquad = async (context: string) => {
    try {
      // Get available agents (you'll need to fetch this from your agents data)
      const availableAgents = [
        {
          id: 'sarah-chen',
          name: 'Sarah Chen',
          specialty: 'Product Strategy',
          capabilities: ['Market Analysis', 'Roadmapping', 'Stakeholder Management'],
          tags: ['strategy', 'planning', 'vision'],
          backstory: 'Former startup founder turned product strategist'
        },
        // Add more agents...
      ];

      const { data, error } = await supabase.functions.invoke('suggest-squad', {
        body: { context, availableAgents }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Squad suggestion failed:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Detect intent
      const intent = await detectIntent(userMessage);
      
      // Check for squad building intent
      const isSquadIntent = userMessage.toLowerCase().includes('squad') || 
                           userMessage.toLowerCase().includes('team') ||
                           userMessage.toLowerCase().includes('agents');

      let response = '';
      let suggestions: Message['suggestions'] = [];

      if (isSquadIntent) {
        // Squad building flow
        const squadSuggestion = await suggestSquad(userMessage);
        
        if (squadSuggestion) {
          response = `${squadSuggestion.reasoning}\n\nI recommend the "${squadSuggestion.squadName}" squad. Would you like me to create this squad for you?`;
          suggestions = [
            { label: 'Create This Squad', action: 'create_squad', type: 'squad' },
            { label: 'Suggest Different Squad', action: 'suggest_different', type: 'squad' },
            { label: 'View All Agents', action: 'agents', type: 'workflow' }
          ];
        } else {
          response = "I can help you build the perfect squad. Tell me about your project goals and I'll recommend the best agents for your team.";
        }
      } else if (intent === 'canvas_generator') {
        // Canvas tool flow
        response = "I'll help you create a canvas. What type of canvas would you like to create? I can help with Business Model Canvas, Lean Canvas, Value Proposition Canvas, and more.";
        suggestions = [
          { label: 'Open Canvas Generator', action: 'canvas', type: 'tool' },
          { label: 'Business Model Canvas', action: 'canvas_business', type: 'tool' }
        ];
      } else if (intent === 'instant_prd') {
        // PRD tool flow
        response = "I'll help you create a Product Requirements Document. I can generate user stories, feature specifications, and technical requirements.";
        suggestions = [
          { label: 'Generate PRD', action: 'prd', type: 'tool' },
          { label: 'Create User Story', action: 'user_story', type: 'tool' }
        ];
      } else {
        // General conversation
        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: { 
            message: userMessage,
            systemPrompt: `You are Nova, a helpful AI product management assistant. 
            You help users with:
            - Product strategy and planning
            - Creating canvases and PRDs
            - Building effective teams
            - Workflow guidance
            
            Be concise (2-3 sentences), friendly, and always suggest next actions.`
          }
        });

        if (error) throw error;
        response = data.response;

        // Add contextual suggestions
        if (userMessage.toLowerCase().includes('start') || userMessage.toLowerCase().includes('begin')) {
          suggestions = [
            { label: 'Discovery Workflow', action: 'discovery', type: 'workflow' },
            { label: 'Create Canvas', action: 'canvas', type: 'tool' }
          ];
        }
      }

      // Add assistant response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        suggestions 
      }]);

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (action: string, type: string) => {
    if (type === 'tool') {
      if (action === 'canvas' || action.startsWith('canvas_')) {
        onAction?.('create_canvas');
      } else if (action === 'prd' || action === 'user_story') {
        onAction?.('generate_prd');
      }
    } else if (type === 'workflow') {
      if (action === 'discovery') {
        onNavigate('dashboard');
      } else if (action === 'agents') {
        onNavigate('agents');
      }
    } else if (type === 'squad') {
      if (action === 'create_squad') {
        onNavigate('squads');
        onAction?.('create_squad');
      } else if (action === 'suggest_different') {
        setInput('Suggest a different squad composition');
      }
    }
    
    onOpenChange(false);
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
            <h2 className="text-lg font-semibold">Nova AI Assistant</h2>
            <p className="text-sm text-muted-foreground">Your intelligent product companion</p>
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
                                   suggestion.type === 'squad' ? Users : Layout;
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
              placeholder="Ask Nova anything..."
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
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
