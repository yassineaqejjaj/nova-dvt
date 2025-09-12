import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Agent, ChatMessage } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Send, MessageCircle, Users, Loader2, AtSign } from 'lucide-react';

interface ChatInterfaceProps {
  currentSquad: Agent[];
  squadId?: string;
  onAddXP: (amount: number, reason: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentSquad, squadId, onAddXP }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing messages when squad changes
    if (squadId && currentSquad.length > 0) {
      loadChatMessages();
    } else if (currentSquad.length > 0) {
      // Add welcome message for squads without database ID
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        squadId: 'current',
        content: `Hello! I'm your AI squad consisting of ${currentSquad.map(agent => agent.name).join(', ')}. How can we help you today?`,
        sender: currentSquad[0],
        timestamp: new Date(),
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

      const transformedMessages: ChatMessage[] = data?.map(msg => ({
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
        // Add welcome message if no messages exist
        const welcomeMessage: ChatMessage = {
          id: `welcome-${Date.now()}`,
          squadId: squadId,
          content: `Hello! I'm your AI squad consisting of ${currentSquad.map(agent => agent.name).join(', ')}. How can we help you today?`,
          sender: currentSquad[0],
          timestamp: new Date(),
        };
        
        // Save welcome message to database
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
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || currentSquad.length === 0) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      squadId: squadId || 'current',
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      mentionedAgents: extractMentions(inputMessage),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message to database if we have a squad ID
      if (squadId) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('chat_messages').insert({
            squad_id: squadId,
            user_id: userData.user.id,
            content: inputMessage,
            sender_type: 'user',
            mentioned_agents: userMessage.mentionedAgents || []
          });
        }
      }

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
        setTimeout(async () => {
          const agentMessage: ChatMessage = {
            id: `assistant-${Date.now()}-${index}`,
            squadId: squadId || 'current',
            content: response.message,
            sender: response.agent,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, agentMessage]);

          // Save agent message to database if we have a squad ID
          if (squadId) {
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              await supabase.from('chat_messages').insert({
                squad_id: squadId,
                user_id: userData.user.id,
                content: response.message,
                sender_type: 'agent',
                sender_agent_id: response.agent.id,
                sender_agent_name: response.agent.name
              });
            }
          }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setInputMessage(value);
    
    // Check for @ mention
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
    
    // Focus input and set cursor after the mention
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
        setSelectedMentionIndex(prev => 
          prev < filteredAgents.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredAgents.length - 1
        );
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
        <div className="p-4 relative">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message... (type @ to mention agents)"
                disabled={isLoading}
                className="flex-1"
              />
              
              {/* Mention Dropdown */}
              {showMentionDropdown && filteredAgents.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-full max-w-xs bg-background border rounded-md shadow-lg z-50">
                  <div className="p-2 border-b">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <AtSign className="w-3 h-3" />
                      <span>Mention an agent</span>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredAgents.map((agent, index) => (
                      <div
                        key={agent.id}
                        className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                          index === selectedMentionIndex 
                            ? 'bg-accent text-accent-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => selectMention(agent)}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback className="text-xs">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">
                              {agent.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {agent.specialty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
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
            Tip: Type @ to mention specific agents in your message
          </p>
        </div>
      </Card>
    </div>
  );
};