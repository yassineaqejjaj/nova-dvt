import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Signal, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Zap,
  MessageSquare,
  Target
} from 'lucide-react';
import { AgentSignal } from './types';
import { Agent } from '@/types';

interface AgentSignalScoresProps {
  agents: Agent[];
  signals: AgentSignal[];
}

export const AgentSignalScores: React.FC<AgentSignalScoresProps> = ({
  agents,
  signals
}) => {
  const getLabelBadge = (label: AgentSignal['label']) => {
    switch (label) {
      case 'high_signal':
        return <Badge className="bg-green-500/20 text-green-700 text-[10px]">Signal fort</Badge>;
      case 'verbose_low_impact':
        return <Badge className="bg-amber-500/20 text-amber-700 text-[10px]">Verbeux</Badge>;
      case 'risk_focused':
        return <Badge className="bg-blue-500/20 text-blue-700 text-[10px]">Risques</Badge>;
      case 'balanced':
        return <Badge className="bg-purple-500/20 text-purple-700 text-[10px]">Équilibré</Badge>;
    }
  };

  const getSignalIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-amber-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getAgent = (agentId: string) => agents.find(a => a.id === agentId);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Signal className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Score Signal/Bruit</h4>
      </div>

      <div className="space-y-3">
        {signals.map((signal) => {
          const agent = getAgent(signal.agentId);
          
          return (
            <div 
              key={signal.agentId} 
              className="p-3 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={agent?.avatar} />
                  <AvatarFallback className="text-xs">
                    {signal.agentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{signal.agentName}</p>
                      {getLabelBadge(signal.label)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getSignalIcon(signal.signalScore)}
                      <span className="font-bold text-sm">{signal.signalScore}%</span>
                    </div>
                  </div>

                  <Progress value={signal.signalScore} className="h-1.5 mb-2" />

                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{signal.contributionsCount} contrib.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{signal.survivedSynthesis} retenues</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{signal.influencedDecision} influentes</span>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {signal.strengths.slice(0, 2).map((s, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-700 rounded">
                        ✓ {s}
                      </span>
                    ))}
                    {signal.weaknesses.slice(0, 1).map((w, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-700 rounded">
                        △ {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {signals.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Signal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Les scores seront calculés après le débat</p>
          </div>
        )}
      </div>
    </Card>
  );
};
