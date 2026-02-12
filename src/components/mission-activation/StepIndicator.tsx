import { CheckCircle2 } from 'lucide-react';
import { MissionStep } from './types';

const steps: { id: MissionStep; label: string; description: string }[] = [
  { id: 'activate', label: 'Activer la mission', description: 'Confirmer la configuration' },
  { id: 'verify', label: 'Vérifier le périmètre', description: 'Accès et complétude' },
  { id: 'brief', label: 'Brief de mission', description: 'Générer le plan' },
];

interface Props {
  currentStep: MissionStep;
  completedSteps: MissionStep[];
}

export const MissionStepIndicator = ({ currentStep, completedSteps }: Props) => {
  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                isCompleted ? 'bg-primary text-primary-foreground' :
                isCurrent ? 'bg-primary/20 text-primary ring-2 ring-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${idx < currentIdx ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
