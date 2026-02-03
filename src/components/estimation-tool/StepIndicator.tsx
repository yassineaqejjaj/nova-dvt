import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const StepIndicator = ({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {stepLabels.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px]",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 mt-[-20px]",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
