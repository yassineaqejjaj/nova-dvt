import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';
import { DiscoveryStep } from './types';

interface DiscoveryProgressProps {
  currentStep: DiscoveryStep;
  onStepClick?: (step: DiscoveryStep) => void;
}

const steps: { id: DiscoveryStep; label: string; shortLabel: string }[] = [
  { id: 'input', label: 'Idée', shortLabel: '1' },
  { id: 'discovery', label: 'Cadrage', shortLabel: '2' },
  { id: 'personas', label: 'Personas', shortLabel: '3' },
  { id: 'journeys', label: 'Parcours', shortLabel: '4' },
  { id: 'epics', label: 'Epics', shortLabel: '5' },
  { id: 'stories', label: 'Stories', shortLabel: '6' },
];

const stepOrder: DiscoveryStep[] = ['input', 'discovery', 'personas', 'journeys', 'epics', 'stories', 'summary'];

export const DiscoveryProgress = ({ currentStep, onStepClick }: DiscoveryProgressProps) => {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepIndex = stepOrder.indexOf(step.id);
          const isCompleted = stepIndex < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && stepIndex < currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isClickable && "cursor-pointer hover:opacity-80",
                  !isClickable && "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent && "text-primary",
                    !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    stepIndex < currentIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
