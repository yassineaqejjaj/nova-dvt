import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  StepIndicator,
  StepSource,
  StepContext,
  StepConfig,
  StepGenerate,
  StepFinalize,
  Epic,
  UserStory,
  GenerationConfig,
  ProductContextSummary,
  FlowStep,
  StoryGenerationResult
} from './epic-to-stories';

const EpicToUserStories = () => {
  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>('source');
  const [completedSteps, setCompletedSteps] = useState<FlowStep[]>([]);

  // Data state
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [selectedContext, setSelectedContext] = useState<ProductContextSummary | null>(null);
  const [config, setConfig] = useState<GenerationConfig>({
    granularity: 'standard',
    format: 'with_ac',
    orientation: 'balanced',
    focusAreas: []
  });
  const [generatedStories, setGeneratedStories] = useState<UserStory[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const markStepComplete = (step: FlowStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const goToStep = (step: FlowStep) => {
    setCurrentStep(step);
  };

  const handleSourceNext = () => {
    if (selectedEpic) {
      markStepComplete('source');
      goToStep('context');
    }
  };

  const handleContextNext = () => {
    markStepComplete('context');
    goToStep('config');
  };

  const handleConfigNext = () => {
    markStepComplete('config');
    goToStep('generate');
  };

  const handleGenerateNext = () => {
    markStepComplete('generate');
    goToStep('finalize');
  };

  const handleStoriesGenerated = (result: StoryGenerationResult) => {
    setGeneratedStories(result.stories);
  };

  const handleComplete = () => {
    markStepComplete('finalize');
    setIsComplete(true);
  };

  const handleReset = () => {
    setCurrentStep('source');
    setCompletedSteps([]);
    setSelectedEpic(null);
    setSelectedContext(null);
    setConfig({
      granularity: 'standard',
      format: 'with_ac',
      orientation: 'balanced',
      focusAreas: []
    });
    setGeneratedStories([]);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Stories enregistrées !</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Vos {generatedStories.length} User Stories ont été ajoutées à vos artefacts et sont prêtes 
            à être utilisées dans vos workflows.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleReset} variant="outline">
              Générer d'autres stories
            </Button>
            <Button onClick={() => window.location.href = '/'}>
              Retour au tableau de bord
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Epic vers User Stories
            </h1>
            <p className="text-muted-foreground mt-2">
              Transformez vos Epics en User Stories actionnables et alignées avec votre contexte
            </p>
          </div>
          {selectedEpic && (
            <Badge variant="secondary" className="shrink-0">
              {selectedEpic.title.slice(0, 25)}...
            </Badge>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      {/* Current step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 'source' && (
            <StepSource
              selectedEpic={selectedEpic}
              onSelectEpic={setSelectedEpic}
              onNext={handleSourceNext}
            />
          )}

          {currentStep === 'context' && (
            <StepContext
              selectedContext={selectedContext}
              onSelectContext={setSelectedContext}
              onNext={handleContextNext}
              onBack={() => goToStep('source')}
            />
          )}

          {currentStep === 'config' && (
            <StepConfig
              config={config}
              onUpdateConfig={setConfig}
              onNext={handleConfigNext}
              onBack={() => goToStep('context')}
            />
          )}

          {currentStep === 'generate' && selectedEpic && (
            <StepGenerate
              epic={selectedEpic}
              context={selectedContext}
              config={config}
              generatedStories={generatedStories}
              onStoriesGenerated={handleStoriesGenerated}
              onNext={handleGenerateNext}
              onBack={() => goToStep('config')}
            />
          )}

          {currentStep === 'finalize' && selectedEpic && (
            <StepFinalize
              epic={selectedEpic}
              context={selectedContext}
              stories={generatedStories}
              onComplete={handleComplete}
              onBack={() => goToStep('generate')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EpicToUserStories;
