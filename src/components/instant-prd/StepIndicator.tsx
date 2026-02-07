 import { Check } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { FlowStep } from './types';
 
 interface StepIndicatorProps {
   currentStep: FlowStep;
   completedSteps: FlowStep[];
 }
 
 const STEPS: { key: FlowStep; label: string; number: number }[] = [
   { key: 'context', label: 'Contexte', number: 1 },
   { key: 'config', label: 'Configuration', number: 2 },
   { key: 'generate', label: 'Génération', number: 3 },
   { key: 'preview', label: 'Prévisualisation', number: 4 },
   { key: 'finalize', label: 'Finalisation', number: 5 },
 ];
 
 const StepIndicator = ({ currentStep, completedSteps }: StepIndicatorProps) => {
   const currentIndex = STEPS.findIndex(s => s.key === currentStep);
 
   return (
     <div className="flex items-center justify-between mb-8">
       {STEPS.map((step, index) => {
         const isCompleted = completedSteps.includes(step.key);
         const isCurrent = step.key === currentStep;
         const isPast = index < currentIndex;
 
         return (
           <div key={step.key} className="flex items-center flex-1">
             <div className="flex flex-col items-center">
               <div
                 className={cn(
                   "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                   isCompleted && "bg-primary text-primary-foreground",
                   isCurrent && !isCompleted && "bg-primary/20 text-primary border-2 border-primary",
                   !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                 )}
               >
                 {isCompleted ? <Check className="h-5 w-5" /> : step.number}
               </div>
               <span
                 className={cn(
                   "text-xs mt-2 text-center max-w-[80px]",
                   isCurrent && "text-primary font-medium",
                   !isCurrent && "text-muted-foreground"
                 )}
               >
                 {step.label}
               </span>
             </div>
             {index < STEPS.length - 1 && (
               <div
                 className={cn(
                   "flex-1 h-0.5 mx-2 mt-[-20px]",
                   isPast || isCompleted ? "bg-primary" : "bg-muted"
                 )}
               />
             )}
           </div>
         );
       })}
     </div>
   );
 };
 
 export default StepIndicator;