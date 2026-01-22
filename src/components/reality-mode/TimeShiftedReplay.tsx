import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  History, 
  Play, 
  MessageSquare,
  Target,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { FormattedText } from '../ui/formatted-text';

interface ReplayData {
  id: string;
  debateTopic: string;
  createdAt: Date;
  optionChosen: {
    title: string;
    description: string;
  };
  keyArguments: string[];
  outcome?: {
    whatHappened: string;
    kpiResults: { name: string; result: 'positive' | 'negative' | 'neutral' }[];
    lessonsLearned: string[];
  };
}

interface TimeShiftedReplayProps {
  decision: ReplayData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TimeShiftedReplay: React.FC<TimeShiftedReplayProps> = ({
  decision,
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState<'question' | 'arguments' | 'decision' | 'outcome'>('question');

  const steps = [
    { id: 'question', label: 'Question', icon: HelpCircle },
    { id: 'arguments', label: 'Arguments', icon: MessageSquare },
    { id: 'decision', label: 'Décision', icon: Target },
    { id: 'outcome', label: 'Résultat', icon: TrendingUp }
  ];

  const getStepIndex = () => steps.findIndex(s => s.id === currentStep);

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Replay: {decision.debateTopic}
          </DialogTitle>
        </DialogHeader>

        {/* Timeline */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setCurrentStep(step.id as any)}
                className={`flex flex-col items-center gap-1 ${
                  getStepIndex() >= i ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  currentStep === step.id 
                    ? 'bg-primary text-white' 
                    : getStepIndex() > i 
                    ? 'bg-primary/20' 
                    : 'bg-muted'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className="text-xs">{step.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  getStepIndex() > i ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <Card className="p-4">
          {currentStep === 'question' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <HelpCircle className="w-5 h-5" />
                <h4 className="font-semibold">Question Originale</h4>
              </div>
              <p className="text-lg">{decision.debateTopic}</p>
              <div className="text-sm text-muted-foreground">
                Débattu le {decision.createdAt.toLocaleDateString('fr-FR')}
              </div>
            </div>
          )}

          {currentStep === 'arguments' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <MessageSquare className="w-5 h-5" />
                <h4 className="font-semibold">Arguments Clés</h4>
              </div>
              <ScrollArea className="h-[200px]">
                <ul className="space-y-2">
                  {decision.keyArguments.map((arg, i) => (
                    <li key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                      {arg}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {currentStep === 'decision' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Target className="w-5 h-5" />
                <h4 className="font-semibold">Décision Prise</h4>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-bold">{decision.optionChosen.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {decision.optionChosen.description}
                </p>
              </div>
            </div>
          )}

          {currentStep === 'outcome' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                <h4 className="font-semibold">Ce qui s'est passé</h4>
              </div>
              
              {decision.outcome ? (
                <>
                  <p className="text-sm">{decision.outcome.whatHappened}</p>
                  
                  {/* KPI Results */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Résultats KPIs
                    </p>
                    {decision.outcome.kpiResults.map((kpi, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{kpi.name}</span>
                        {getResultIcon(kpi.result)}
                      </div>
                    ))}
                  </div>

                  {/* Lessons Learned */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Leçons apprises
                    </p>
                    <ul className="space-y-1">
                      {decision.outcome.lessonsLearned.map((lesson, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          💡 {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Résultats non encore documentés</p>
                  <p className="text-xs mt-1">
                    Ajoutez des validations terrain pour compléter l'historique
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const idx = getStepIndex();
              if (idx > 0) setCurrentStep(steps[idx - 1].id as any);
            }}
            disabled={getStepIndex() === 0}
          >
            Précédent
          </Button>
          <Button
            onClick={() => {
              const idx = getStepIndex();
              if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id as any);
            }}
            disabled={getStepIndex() === steps.length - 1}
          >
            Suivant
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
