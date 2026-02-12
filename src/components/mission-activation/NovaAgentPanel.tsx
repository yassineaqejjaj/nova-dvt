import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, AlertCircle, Lightbulb } from 'lucide-react';

interface Suggestion {
  type: 'missing' | 'question' | 'action';
  text: string;
}

interface Props {
  suggestions: Suggestion[];
  contextName?: string;
}

export const NovaAgentPanel = ({ suggestions, contextName }: Props) => {
  const [messages, setMessages] = useState<{ role: 'agent' | 'user'; text: string }[]>([
    { role: 'agent', text: `Bienvenue ! Je suis là pour vous guider dans l'activation de votre mission.${contextName ? ` Basé sur le contexte actif "${contextName}", voici mes observations.` : ''}` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', text: input },
      { role: 'agent', text: 'Basé sur le contexte actif, je recommande de compléter les KPIs manquants avant de poursuivre.' }
    ]);
    setInput('');
  };

  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'missing': return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      case 'question': return <Bot className="w-3.5 h-3.5 text-primary" />;
      case 'action': return <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <Card className="h-full flex flex-col border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          Nova Agent
          <Badge variant="outline" className="text-xs ml-auto">Contexte actif</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 pt-0 min-h-0">
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Observations</p>
            {suggestions.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs">
                {getIcon(s.type)}
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chat */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-3 pr-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-lg px-3 py-2 text-xs ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 mt-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Poser une question..."
            className="text-xs h-8"
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleSend}>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
