import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionMemory';
import { TabType } from '@/types';

interface ContinueFlowProps {
  session: SessionData;
  userName?: string;
  onContinue: (tab: TabType, squadId?: string) => void;
}

export const ContinueFlow: React.FC<ContinueFlowProps> = ({ session, userName, onContinue }) => {
  const getWorkflowLabel = (type?: string) => {
    const labels: Record<string, string> = {
      'feature_discovery': 'Feature Discovery',
      'roadmap': 'Roadmap Planning',
      'sprint': 'Sprint Planning',
      'tech_spec': 'Technical Specification',
    };
    return type ? labels[type] || type : 'your last workflow';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>{getGreeting()}, {userName || 'there'}!</CardTitle>
        </div>
        <CardDescription>
          {session.lastWorkflowType 
            ? `Last time you were working on ${getWorkflowLabel(session.lastWorkflowType)}`
            : 'Welcome back to Nova'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => onContinue(
            (session.lastTab || 'dashboard') as TabType,
            session.lastSquadId
          )}
          className="w-full"
          size="lg"
        >
          <Play className="mr-2 h-4 w-4" />
          Continue where you left off
        </Button>
      </CardContent>
    </Card>
  );
};
