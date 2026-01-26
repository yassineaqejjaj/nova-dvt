import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, MessageSquare, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntentEntry {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  workflowIds: string[];
  color: string;
}

const intentEntries: IntentEntry[] = [
  {
    id: 'vague-idea',
    title: "Je pars d'une idée floue",
    description: "Transformer une intuition en feature structurée",
    icon: <Lightbulb className="w-5 h-5" />,
    workflowIds: ['smart-discovery', 'feature-discovery', 'insight-synthesizer'],
    color: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'field-feedback',
    title: "J'ai des retours terrain",
    description: "Analyser et prioriser les feedbacks utilisateurs",
    icon: <MessageSquare className="w-5 h-5" />,
    workflowIds: ['insight-synthesizer', 'user-research', 'requirements-collection'],
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'prepare-decision',
    title: "Je prépare une décision",
    description: "Structurer un argumentaire pour arbitrage",
    icon: <Scale className="w-5 h-5" />,
    workflowIds: ['roadmap-planning', 'comite-pilotage', 'comite-projet'],
    color: 'from-violet-500/20 to-purple-500/20',
  },
];

interface IntentEntryCardsProps {
  selectedIntent: string | null;
  onSelectIntent: (intentId: string | null) => void;
}

export function IntentEntryCards({ selectedIntent, onSelectIntent }: IntentEntryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <CardContent className="p-4">
              <div className={cn(
                "flex items-center gap-3 p-2 rounded-lg bg-gradient-to-br mb-2",
                intent.color
              )}>
                <div className="p-2 rounded-full bg-background/80">
                  {intent.icon}
                </div>
                <span className="font-semibold text-sm">{intent.title}</span>
              </div>
              <p className="text-xs text-muted-foreground pl-1">
                {intent.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function getIntentWorkflowIds(intentId: string | null): string[] {
  if (!intentId) return [];
  const intent = intentEntries.find(e => e.id === intentId);
  return intent?.workflowIds || [];
}
