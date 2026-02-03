import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Sparkles } from "lucide-react";
import {
  StepIndicator,
  StepContext,
  StepType,
  StepInput,
  StepGenerate,
  StepFinalize,
  EstimationContext,
  EstimationType,
  FeatureInput,
  Estimation,
  ConfidenceLevel
} from "@/components/estimation-tool";

const STEP_LABELS = ['Contexte', 'Type', 'Saisie', 'Analyse', 'Finalisation'];

export const EstimationTool = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [context, setContext] = useState<EstimationContext | null>(null);
  const [estimationType, setEstimationType] = useState<EstimationType | null>(null);
  const [features, setFeatures] = useState<FeatureInput[]>([]);
  const [rawInput, setRawInput] = useState("");
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>('medium');

  const handleContextLoaded = (ctx: EstimationContext) => {
    setContext(ctx);
  };

  const handleTypeSelected = (type: EstimationType) => {
    setEstimationType(type);
  };

  const handleFeaturesUpdated = (newFeatures: FeatureInput[], input: string) => {
    setFeatures(newFeatures);
    setRawInput(input);
  };

  const handleEstimationsGenerated = (newEstimations: Estimation[], confidence: ConfidenceLevel) => {
    setEstimations(newEstimations);
    setConfidenceLevel(confidence);
  };

  const handleComplete = () => {
    // Reset to start
    setCurrentStep(1);
    setContext(null);
    setEstimationType(null);
    setFeatures([]);
    setRawInput("");
    setEstimations([]);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepContext
            context={context}
            onContextLoaded={handleContextLoaded}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <StepType
            selectedType={estimationType}
            onTypeSelected={handleTypeSelected}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <StepInput
            estimationType={estimationType!}
            features={features}
            rawInput={rawInput}
            context={context}
            onFeaturesUpdated={handleFeaturesUpdated}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <StepGenerate
            estimationType={estimationType!}
            features={features}
            context={context}
            estimations={estimations}
            onEstimationsGenerated={handleEstimationsGenerated}
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        );
      case 5:
        return (
          <StepFinalize
            estimations={estimations}
            context={context}
            confidenceLevel={confidenceLevel}
            onBack={() => setCurrentStep(4)}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Calculator className="w-8 h-8" />
            Estimation & Sizing Tool
          </h1>
          <p className="text-muted-foreground mt-2">
            Structurez et dimensionnez vos éléments avant de prendre des décisions de delivery
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          IA
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={5}
            stepLabels={STEP_LABELS}
          />
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};
