import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Agent, ChatMessage } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, Users, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  currentSquad: Agent[];
  onAddXP: (amount: number, reason: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentSquad, onAddXP }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add welcome message when squad changes
    if (currentSquad.length > 0) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        squadId: 'current',
        content: `Hello! I'm your AI squad consisting of ${currentSquad.map(agent => agent.name).join(', ')}. How can we help you today?`,
        sender: currentSquad[0],
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [currentSquad]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || currentSquad.length === 0) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      squadId: 'current',
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      mentionedAgents: extractMentions(inputMessage),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for OpenAI
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: inputMessage,
      });

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          messages: conversationHistory,
          agents: currentSquad,
          mentionedAgents: userMessage.mentionedAgents || [],
        },
      });

      if (error) throw error;

      // Add multiple agent responses with staggered timing
      data.responses.forEach((response: any, index: number) => {
        setTimeout(() => {
          const agentMessage: ChatMessage = {
            id: `assistant-${Date.now()}-${index}`,
            squadId: 'current',
            content: response.message,
            sender: response.agent,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, agentMessage]);
        }, (index + 1) * 1500); // Stagger responses by 1.5 seconds
      });

      onAddXP(15 * data.responses.length, 'chatting with AI squad');

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@(\w+)/g);
    return mentions ? mentions.map(mention => mention.slice(1)) : [];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (currentSquad.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chat Interface</h2>
          <p className="text-muted-foreground">
            Create a squad first to start chatting with AI agents
          </p>
        </div>
        
        <Card className="p-8">
          <div className="text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Squad Available</h3>
            <p className="text-muted-foreground mb-4">
              You need to create a squad with AI agents before you can start chatting.
            </p>
            <Button onClick={() => window.location.hash = '#squads'}>
              Go to Squad Builder
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Chat with Your AI Squad</h2>
        <p className="text-muted-foreground">
          Collaborate with {currentSquad.map(agent => agent.name).join(', ')}
        </p>
      </div>

      {/* Current Squad Display */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Active Squad</span>
          </h3>
          <Badge variant="secondary">{currentSquad.length} agents</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentSquad.map(agent => (
            <div key={agent.id} className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={agent.avatar} />
                <AvatarFallback className="text-xs">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{agent.name}</span>
              <Badge variant="outline" className="text-xs">
                {agent.specialty}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Messages */}
      <Card className="flex flex-col h-[500px]">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Conversation</h3>
        </div>
        
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex space-x-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender !== 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={(message.sender as Agent).avatar} />
                    <AvatarFallback>
                      {(message.sender as Agent).name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted'
                  }`}
                >
                  {message.sender !== 'user' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {(message.sender as Agent).name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {(message.sender as Agent).specialty}
                      </Badge>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {message.sender === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex space-x-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentSquad[0]?.avatar} />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        {/* Message Input */}
        <div className="p-4">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (use @AgentName to mention specific agents)"
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Tip: Use @{currentSquad[0]?.name.split(' ')[0]} to mention specific agents in your message
          </p>
        </div>
      </Card>
    </div>
  );
};