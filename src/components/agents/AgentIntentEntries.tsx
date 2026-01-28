import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, MessageSquare, Lightbulb, BarChart3, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntentEntry {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  agentIds: string[];
  color: string;
}

const intentEntries: IntentEntry[] = [
  {
    id: 'roadmap',
    title: "Construire une roadmap",
    description: "Vision produit → backlog priorisé",
    icon: <Map className="w-5 h-5" />,
    agentIds: ['sarah-pm', 'roadmap-visualizer', 'impact-effort-plotter', 'scenario-simulator'],
    color: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    id: 'decision',
    title: "Préparer une décision",
    description: "Analyser, débattre, trancher",
    icon: <MessageSquare className="w-5 h-5" />,
    agentIds: ['sarah-pm', 'lisa-analytics', 'user-insight', 'scenario-simulator'],
    color: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'idea-to-dev',
    title: "Passer de l'idée au dev",
    description: "Feature → stories prêtes à coder",
    icon: <Lightbulb className="w-5 h-5" />,
    agentIds: ['alex-ux', 'story-writer', 'david-fullstack', 'refinement-assistant'],
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'analyze-data',
    title: "Analyser des données produit",
    description: "Métriques → insights actionnables",
    icon: <BarChart3 className="w-5 h-5" />,
    agentIds: ['lisa-analytics', 'auto-kpi-dashboard', 'experiment-tracker', 'outcome-analyzer'],
    color: 'from-violet-500/20 to-purple-500/20',
  },
];

interface AgentIntentEntriesProps {
  selectedIntent: string | null;
  onSelectIntent: (intentId: string | null) => void;
}

export function AgentIntentEntries({ selectedIntent, onSelectIntent }: AgentIntentEntriesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Qu'avez-vous besoin de faire ?
        </h3>
        {selectedIntent && (
          <button
            onClick={() => onSelectIntent(null)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Effacer
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {intentEntries.map((intent) => {
          const isSelected = selectedIntent === intent.id;
          
          return (
            <Card
              key={intent.id}
              className={cn(
                "cursor-pointer transition-all duration-200 border-2 hover:scale-[1.02]",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-transparent hover:border-primary/30"
              )}
              onClick={() => onSelectIntent(isSelected ? null : intent.id)}
            >
              <CardContent className="p-3">
                <div className={cn(
                  "flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br mb-2",
                  intent.color
                )}>
                  <div className="p-1.5 rounded-full bg-background/80">
                    {intent.icon}
                  </div>
                  <span className="font-medium text-sm">{intent.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {intent.description}
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {intent.agentIds.length} agents
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function getIntentAgentIds(intentId: string | null): string[] {
  if (!intentId) return [];
  const intent = intentEntries.find(e => e.id === intentId);
  return intent?.agentIds || [];
}
