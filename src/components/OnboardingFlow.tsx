import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, User, Palette, Code, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle2, Rocket, Wrench, Workflow, FileText, Users, Bot,
  MessageSquare, Target, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingFlowProps {
  open: boolean;
  userId: string;
  onComplete: (navigateTo?: string) => void;
}

type Step = 'welcome' | 'role' | 'mission' | 'tour-tools' | 'tour-workflows' | 'tour-artefacts' | 'tour-squads' | 'tour-agents' | 'tour-chat' | 'ready';

type UserRole = 'PM' | 'Designer' | 'Dev';

const roleOptions = [
  {
    id: 'PM' as UserRole,
    title: 'Product Manager',
    description: 'Vision, backlog, KPIs et stratégie produit',
    icon: <User className="w-6 h-6" />,
    color: 'bg-[#F8485E]/10 text-[#F8485E]'
  },
  {
    id: 'Designer' as UserRole,
    title: 'Designer',
    description: 'Recherche utilisateur, UX/UI et parcours',
    icon: <Palette className="w-6 h-6" />,
    color: 'bg-purple-500/10 text-purple-500'
  },
  {
    id: 'Dev' as UserRole,
    title: 'Developer',
    description: 'Architecture technique, specs et implémentation',
    icon: <Code className="w-6 h-6" />,
    color: 'bg-emerald-500/10 text-emerald-500'
  }
];

const tourSteps = [
  {
    key: 'tour-tools' as Step,
    module: 'Outils',
    title: 'Des outils de production prêts à l\'emploi',
    description: 'Générez des livrables concrets en quelques minutes : PRD, personas, estimations, release notes…',
    icon: <Wrench className="w-10 h-10" />,
    color: 'from-[#F8485E]/20 to-[#F8485E]/5',
    features: [
      'PRD instantané avec structure complète',
      'Générateur de personas enrichi par l\'IA',
      'Estimation T-shirt sizing automatique',
      'RACI, release notes, meeting minutes'
    ],
    navigateTo: 'toolbox'
  },
  {
    key: 'tour-workflows' as Step,
    module: 'Workflows',
    title: 'Des processus guidés de bout en bout',
    description: 'Suivez des workflows structurés : Discovery → Definition → Delivery → QA. Chaque étape produit un livrable.',
    icon: <Workflow className="w-10 h-10" />,
    color: 'from-blue-500/20 to-blue-500/5',
    features: [
      'Smart Discovery Canvas en 6 étapes',
      'Feature Discovery → Epic → User Stories',
      'Sprint Intelligence & planification',
      'Validation et itération continues'
    ],
    navigateTo: 'workflows'
  },
  {
    key: 'tour-artefacts' as Step,
    module: 'Artefacts',
    title: 'Vos livrables, toujours traçables',
    description: 'Chaque artefact est versionné, lié à son contexte, et enrichi par les agents. Pas de documents perdus.',
    icon: <FileText className="w-10 h-10" />,
    color: 'from-amber-500/20 to-amber-500/5',
    features: [
      'Versionnement automatique',
      'Traçabilité complète (contexte → agent → output)',
      'Liens entre artefacts (dépendances, impacts)',
      'Export Word, PDF, partage'
    ],
    navigateTo: 'artifacts'
  },
  {
    key: 'tour-squads' as Step,
    module: 'Squads',
    title: 'Composez votre équipe augmentée',
    description: 'Créez des squads thématiques (Discovery, Delivery, COPIL) et assignez-leur des agents spécialisés.',
    icon: <Users className="w-10 h-10" />,
    color: 'from-violet-500/20 to-violet-500/5',
    features: [
      'Templates de squads prédéfinis',
      'Contexte importé automatiquement',
      'Jusqu\'à 5 agents par squad',
      'Historique d\'activité par squad'
    ],
    navigateTo: 'squads'
  },
  {
    key: 'tour-agents' as Step,
    module: 'Agents',
    title: 'Des experts IA, chacun avec son rôle',
    description: 'PM, Designer, Dev, QA, Data… Chaque agent a ses compétences, son style de raisonnement et ses priorités.',
    icon: <Bot className="w-10 h-10" />,
    color: 'from-emerald-500/20 to-emerald-500/5',
    features: [
      'Agents spécialisés par domaine',
      'Déblocage progressif par XP',
      'Personnalités et styles configurables',
      'Collaboration inter-agents native'
    ],
    navigateTo: 'agents'
  },
  {
    key: 'tour-chat' as Step,
    module: 'Chat Multi-agents',
    title: 'Une salle de réflexion, pas un chatbot',
    description: 'Lancez des discussions structurées entre agents. Ils débattent, challengent et convergent vers des décisions.',
    icon: <MessageSquare className="w-10 h-10" />,
    color: 'from-[#F8485E]/20 to-[#F8485E]/5',
    features: [
      'Coordination par un agent Conductor',
      'Modes : Focus, UX+Biz, Tensions',
      'Synthèse automatique des décisions',
      'Extraction d\'actions et d\'artefacts'
    ],
    navigateTo: 'chat'
  }
];

const allSteps: Step[] = ['welcome', 'role', 'mission', ...tourSteps.map(s => s.key), 'ready'];

export function OnboardingFlow({ open, userId, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [missionName, setMissionName] = useState('');
  const [missionVision, setMissionVision] = useState('');
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentIndex = allSteps.indexOf(step);
  const progress = ((currentIndex + 1) / allSteps.length) * 100;

  const goTo = (target: Step) => {
    const targetIndex = allSteps.indexOf(target);
    setDirection(targetIndex > currentIndex ? 1 : -1);
    setStep(target);
  };

  const next = () => {
    if (currentIndex < allSteps.length - 1) {
      goTo(allSteps[currentIndex + 1]);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      goTo(allSteps[currentIndex - 1]);
    }
  };

  const handleMissionActivation = async () => {
    if (!missionName.trim()) {
      toast.error('Donnez un nom à votre mission');
      return;
    }

    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({
          display_name: displayName || 'Utilisateur Nova',
          role: roleOptions.find(r => r.id === selectedRole)?.title || 'Team Member'
        })
        .eq('user_id', userId);

      await supabase
        .from('product_contexts')
        .insert({
          user_id: userId,
          name: missionName,
          vision: missionVision || null,
          is_active: true
        });

      await supabase
        .from('squads')
        .insert({
          user_id: userId,
          name: `Squad ${missionName}`,
          purpose: `Squad pour la mission : ${missionName}`
        });

      toast.success('Mission activée ! 🚀');
      next();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Erreur lors de l\'activation');
    } finally {
      setLoading(false);
    }
  };

  const currentTour = tourSteps.find(t => t.key === step);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 })
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Progress */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Étape {currentIndex + 1} / {allSteps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="px-6 pb-6"
          >
            {/* WELCOME */}
            {step === 'welcome' && (
              <div className="space-y-6 pt-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F8485E]/20 to-[#F8485E]/5 mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#F8485E]" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Bienvenue sur Nova</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Not Only a Virtual Assistant — votre système d'exploitation pour équipes produit augmentées.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="onb-name">Votre nom</Label>
                  <Input
                    id="onb-name"
                    placeholder="Ex: Marie Dupont"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => onComplete()} className="flex-1 text-muted-foreground">
                    Passer
                  </Button>
                  <Button onClick={next} className="flex-1 bg-[#F8485E] hover:bg-[#F8485E]/90">
                    Commencer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ROLE */}
            {step === 'role' && (
              <div className="space-y-6 pt-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">Quel est votre rôle ?</h2>
                  <p className="text-sm text-muted-foreground">Nova s'adapte à votre profil</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map((role) => (
                    <Card
                      key={role.id}
                      className={`cursor-pointer transition-all hover:scale-[1.02] border-2 ${
                        selectedRole === role.id ? 'border-[#F8485E] shadow-md' : 'border-transparent hover:border-muted-foreground/20'
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <CardContent className="pt-5 pb-4 text-center space-y-3">
                        <div className={`w-12 h-12 rounded-xl ${role.color} mx-auto flex items-center justify-center`}>
                          {role.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{role.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                        </div>
                        {selectedRole === role.id && (
                          <CheckCircle2 className="w-5 h-5 text-[#F8485E] mx-auto" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prev} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    onClick={next}
                    disabled={!selectedRole}
                    className="flex-1 bg-[#F8485E] hover:bg-[#F8485E]/90"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* MISSION ACTIVATION */}
            {step === 'mission' && (
              <div className="space-y-6 pt-4">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F8485E]/20 to-orange-500/10 mx-auto flex items-center justify-center">
                    <Rocket className="w-7 h-7 text-[#F8485E]" />
                  </div>
                  <h2 className="text-xl font-bold">Activez votre première mission</h2>
                  <p className="text-sm text-muted-foreground">
                    Le contexte de mission alimente tous les agents et workflows de Nova.
                  </p>
                </div>

                {selectedRole && (
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F8485E]" />
                    <span className="text-sm">Rôle : <strong>{roleOptions.find(r => r.id === selectedRole)?.title}</strong></span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mission-name">Nom de la mission *</Label>
                    <Input
                      id="mission-name"
                      placeholder="Ex: Refonte App Mobile, Lancement V2, Audit UX…"
                      value={missionName}
                      onChange={(e) => setMissionName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mission-vision">Vision / objectif principal <span className="text-muted-foreground">(optionnel)</span></Label>
                    <Textarea
                      id="mission-vision"
                      placeholder="Ex: Simplifier le parcours d'achat pour augmenter la conversion de 20%…"
                      value={missionVision}
                      onChange={(e) => setMissionVision(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground text-sm">Ce que Nova va créer :</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Un contexte produit actif</li>
                    <li>Une squad dédiée à cette mission</li>
                    <li>L'accès à tous les outils et workflows</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prev} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    onClick={handleMissionActivation}
                    disabled={loading || !missionName.trim()}
                    className="flex-1 bg-[#F8485E] hover:bg-[#F8485E]/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activation…
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Activer la mission
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* TOUR STEPS */}
            {currentTour && (
              <div className="space-y-6 pt-4">
                <div className="text-center space-y-3">
                  <Badge variant="outline" className="text-xs tracking-wider uppercase">
                    {currentTour.module}
                  </Badge>
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentTour.color} mx-auto flex items-center justify-center text-foreground`}>
                    {currentTour.icon}
                  </div>
                  <h2 className="text-xl font-bold">{currentTour.title}</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {currentTour.description}
                  </p>
                </div>

                <Card className="bg-muted/20 border-muted">
                  <CardContent className="pt-5">
                    <ul className="space-y-3">
                      {currentTour.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#F8485E] flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prev} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onComplete(currentTour.navigateTo)}
                    className="flex-1"
                  >
                    Explorer maintenant
                  </Button>
                  <Button onClick={next} className="flex-1 bg-[#F8485E] hover:bg-[#F8485E]/90">
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* READY */}
            {step === 'ready' && (
              <div className="space-y-6 pt-4 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F8485E]/20 to-emerald-500/10 mx-auto flex items-center justify-center">
                  <Zap className="w-10 h-10 text-[#F8485E]" />
                </div>
                <h2 className="text-2xl font-bold">Vous êtes prêt !</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Votre mission est active, votre squad est créée. Nova est à votre service.
                </p>

                <div className="grid grid-cols-3 gap-3 text-left">
                  {[
                    { icon: <Target className="w-5 h-5" />, label: 'Mission active', sub: missionName },
                    { icon: <Users className="w-5 h-5" />, label: 'Squad créée', sub: `Squad ${missionName}` },
                    { icon: <Bot className="w-5 h-5" />, label: 'Agents disponibles', sub: 'Prêts à collaborer' },
                  ].map((item, i) => (
                    <Card key={i} className="bg-muted/30">
                      <CardContent className="pt-4 pb-3 space-y-2">
                        <div className="text-[#F8485E]">{item.icon}</div>
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  onClick={() => onComplete('dashboard')}
                  className="w-full bg-[#F8485E] hover:bg-[#F8485E]/90"
                  size="lg"
                >
                  Commencer à travailler
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
