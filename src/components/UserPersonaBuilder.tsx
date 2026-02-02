import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles } from "lucide-react";
import {
  StepIndicator,
  StepContext,
  StepIntent,
  StepConfig,
  StepGenerate,
  StepFinalize,
  ProductContext,
  ResearchIntent,
  PersonaConfig,
  GeneratedPersona,
} from "@/components/user-persona";

interface UserPersonaBuilderProps {
  activeWorkflow?: { type: string; currentStep: number } | null;
  onStepComplete?: (nextStep: number, context: any) => void;
  workflowContext?: Record<string, any>;
}

const initialConfig: PersonaConfig = {
  personaCount: 2,
  detailLevel: 'standard',
  orientation: 'needs',
};

export const UserPersonaBuilder = ({ 
  activeWorkflow, 
  onStepComplete, 
  workflowContext 
}: UserPersonaBuilderProps = {}) => {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState<ProductContext | null>(null);
  const [intent, setIntent] = useState<ResearchIntent | null>(null);
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [config, setConfig] = useState<PersonaConfig>(initialConfig);
  const [personas, setPersonas] = useState<GeneratedPersona[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleReset = () => {
    setStep(1);
    setContext(null);
    setIntent(null);
    setProductDescription("");
    setTargetAudience("");
    setConfig(initialConfig);
    setPersonas([]);
    setIsGenerating(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepContext
            context={context}
            onContextChange={setContext}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <StepIntent
            intent={intent}
            productDescription={productDescription}
            targetAudience={targetAudience}
            onIntentChange={setIntent}
            onProductDescriptionChange={setProductDescription}
            onTargetAudienceChange={setTargetAudience}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <StepConfig
            config={config}
            onConfigChange={setConfig}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        );
      case 4:
        return (
          <StepGenerate
            context={context}
            intent={intent!}
            productDescription={productDescription}
            targetAudience={targetAudience}
            config={config}
            personas={personas}
            isGenerating={isGenerating}
            onPersonasChange={setPersonas}
            onGeneratingChange={setIsGenerating}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        );
      case 5:
        return (
          <StepFinalize
            context={context}
            intent={intent!}
            config={config}
            personas={personas}
            productDescription={productDescription}
            onBack={() => setStep(4)}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Users className="w-8 h-8" />
            Recherche Utilisateur — Personas
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez des personas actionnables, guidés par le contexte et votre intention de recherche
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          IA
        </Badge>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Current Step Content */}
      {renderStep()}
    </div>
  );
};
