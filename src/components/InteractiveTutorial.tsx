import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Database,
  Workflow,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';

interface InteractiveTutorialProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

interface TutorialStep {
  id: string;
  module: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  features: string[];
}

  const tutorialSteps: TutorialStep[] = [
  {
    id: 'core',
    module: 'NOVA CORE',
    title: 'Fondations & Gouvernance',
    description: 'Centralisez vos contextes produit et gérez tous vos artefacts de manière structurée',
    icon: <Database className="w-8 h-8" />,
    action: 'dashboard',
    features: [
      '📋 Context Manager - Créez et gérez multiples contextes produit avec secteur d\'activité',
      '🗂️ Artefacts Engine - Versionnement automatique et historique complet',
      '🔍 Dashboard centralisé avec recherche full-text performante',
      '⚙️ Admin Panel pour la gouvernance et les paramètres'
    ]
  },
  {
    id: 'workflows',
    module: 'NOVA WORKFLOWS',
    title: 'Processus IA-Guidés',
    description: 'Créez vos livrables en 4 étapes maximum avec validation humaine à chaque étape',
    icon: <Workflow className="w-8 h-8" />,
    action: 'workflows',
    features: [
      '🚀 Feature Discovery - De l\'idée à l\'Epic complet avec roadmap',
      '🗺️ Strategic Roadmap Planning avec vision produit intégrée',
      '⏱️ Sprint Planning avec priorisation et estimation automatiques',
      '📊 KPI Generator intégré avec métriques SMART et OKRs'
    ]
  },
  {
    id: 'agent',
    module: 'NOVA AGENT',
    title: 'Assistant IA Adaptatif',
    description: 'Un agent contextuel qui s\'adapte à votre rôle et connaît votre historique de projet',
    icon: <MessageSquare className="w-8 h-8" />,
    action: 'chat',
    features: [
      '🎭 Multi-Rôle (PM, Designer, Dev) avec suggestions personnalisées',
      '🧠 Conscience du contexte (RAG) et mémoire conversationnelle',
      '💡 Suggestions d\'actions intelligentes et proactives',
      '📚 Citations des sources et traçabilité des recommandations'
    ]
  }
];

export function InteractiveTutorial({ open, onClose, onNavigate }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExplore = () => {
    const step = tutorialSteps[currentStep];
    if (step.action && onNavigate) {
      onNavigate(step.action);
      onClose();
    }
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Tour Guidé Nova
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Module {currentStep + 1} sur {tutorialSteps.length}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Module Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-sm px-4 py-1">
              {currentStepData.module}
            </Badge>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-agent-blue/20 flex items-center justify-center text-primary">
              {currentStepData.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">{currentStepData.title}</h3>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>

          {/* Features */}
          <Card className="bg-gradient-to-br from-muted/30 to-muted/50">
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {currentStepData.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            {currentStepData.action && (
              <Button
                variant="secondary"
                onClick={handleExplore}
                className="flex-1"
              >
                Explorer maintenant
              </Button>
            )}

            <Button onClick={handleNext} className="flex-1">
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Terminer
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip */}
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
              Passer le tutoriel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
