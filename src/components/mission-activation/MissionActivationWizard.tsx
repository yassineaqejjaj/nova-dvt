import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Rocket, CheckCircle2, Clock } from 'lucide-react';
import { MissionStepIndicator } from './StepIndicator';
import { StepActivate } from './StepActivate';
import { StepVerify } from './StepVerify';
import { StepBrief } from './StepBrief';
import { NovaAgentPanel } from './NovaAgentPanel';
import { MissionStep, MissionConfig, ContextInheritance } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const MissionActivationWizard = () => {
  const [currentStep, setCurrentStep] = useState<MissionStep>('activate');
  const [completedSteps, setCompletedSteps] = useState<MissionStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [activeContextId, setActiveContextId] = useState<string | undefined>();

  const [config, setConfig] = useState<MissionConfig>({
    client: '',
    entity: '',
    country: 'France',
    missionName: '',
    startDate: new Date().toISOString().split('T')[0],
    role: 'PM',
    configuredBy: '',
  });

  const markComplete = (step: MissionStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const trackEvent = async (event: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('analytics_events').insert({
          user_id: user.id,
          event_type: event,
          event_data: { mission: config.missionName, client: config.client, step: currentStep },
        });
      }
    } catch (e) { /* silent */ }
  };

  const handleActivate = async (contextAction: ContextInheritance, contextId?: string) => {
    await trackEvent('ONBOARDING_STARTED');

    if (contextAction === 'inherit' && contextId) {
      setActiveContextId(contextId);
      await trackEvent('CONTEXT_REUSED');
    } else if (contextAction === 'duplicate' && contextId) {
      // Duplicate context
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { data: original } = await supabase.from('product_contexts').select('*').eq('id', contextId).single();
        if (original) {
          const { data: newCtx } = await supabase.from('product_contexts').insert({
            user_id: user.id,
            name: `${original.name} – ${config.missionName}`,
            vision: original.vision,
            objectives: original.objectives,
            target_kpis: original.target_kpis,
            constraints: original.constraints,
            target_audience: original.target_audience,
            metadata: original.metadata,
            is_active: true,
          }).select().single();
          if (newCtx) {
            setActiveContextId(newCtx.id);
            // Deactivate old ones
            await supabase.from('product_contexts').update({ is_active: false }).eq('user_id', user.id).neq('id', newCtx.id);
          }
        }
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors de la duplication du contexte');
      }
    } else {
      // Create new
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { data: newCtx } = await supabase.from('product_contexts').insert({
          user_id: user.id,
          name: config.missionName || 'Nouveau contexte',
          is_active: true,
        }).select().single();
        if (newCtx) {
          setActiveContextId(newCtx.id);
          await supabase.from('product_contexts').update({ is_active: false }).eq('user_id', user.id).neq('id', newCtx.id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    markComplete('activate');
    setCurrentStep('verify');
  };

  const handleVerifyNext = async () => {
    await trackEvent('ONBOARDING_STEP_COMPLETED');
    markComplete('verify');
    setCurrentStep('brief');
  };

  const handleComplete = async () => {
    await trackEvent('ONBOARDING_COMPLETED');
    markComplete('brief');
    setIsComplete(true);
    toast.success('Mission activée avec succès !');
  };

  // Agent suggestions based on current step
  const agentSuggestions = useMemo(() => {
    const suggestions: { type: 'missing' | 'question' | 'action'; text: string }[] = [];
    if (currentStep === 'activate') {
      if (!config.client) suggestions.push({ type: 'missing', text: 'Le nom du client n\'est pas renseigné.' });
      if (!config.missionName) suggestions.push({ type: 'missing', text: 'Le nom de la mission est requis.' });
      suggestions.push({ type: 'action', text: 'Je vous recommande de dupliquer le contexte existant pour le personnaliser.' });
    }
    if (currentStep === 'verify') {
      suggestions.push({ type: 'question', text: 'Avez-vous accès à tous les outils de gestion de backlog ?' });
      suggestions.push({ type: 'action', text: 'Basé sur le contexte actif, je détecte des KPIs manquants.' });
    }
    if (currentStep === 'brief') {
      suggestions.push({ type: 'action', text: 'Le brief est prêt. Vérifiez les risques avant de valider.' });
    }
    return suggestions;
  }, [currentStep, config]);

  const stepIdx = ['activate', 'verify', 'brief'].indexOf(currentStep) + 1;
  const estimatedTime = currentStep === 'activate' ? '~10 min' : currentStep === 'verify' ? '~8 min' : '~12 min';

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Mission activée !</h1>
            <p className="text-muted-foreground mb-2">
              {config.missionName} – {config.client}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Votre brief de mission et votre plan 30-60-90 sont prêts.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => { setIsComplete(false); setCurrentStep('activate'); setCompletedSteps([]); }}>
                Nouvelle mission
              </Button>
              <Button onClick={() => window.location.href = '/'}>Retour au tableau de bord</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimatedTime} restantes
              </Badge>
              {activeContextId && (
                <Badge variant="default" className="text-xs">Contexte actif</Badge>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Rocket className="h-7 w-7 text-primary" />
            Mission Activation
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Activez votre mission en 3 étapes guidées
          </p>
          <Progress value={(stepIdx / 3) * 100} className="mt-4 h-1.5" />
        </div>

        <MissionStepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left – Wizard */}
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {currentStep === 'activate' && (
                <StepActivate config={config} onConfigChange={setConfig} onNext={handleActivate} />
              )}
              {currentStep === 'verify' && (
                <StepVerify contextId={activeContextId} onNext={handleVerifyNext} onBack={() => setCurrentStep('activate')} />
              )}
              {currentStep === 'brief' && (
                <StepBrief config={config} contextId={activeContextId} onComplete={handleComplete} onBack={() => setCurrentStep('verify')} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Right – Nova Agent Panel */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <NovaAgentPanel suggestions={agentSuggestions} contextName={config.missionName || undefined} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
