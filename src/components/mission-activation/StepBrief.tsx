import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  FileText, CheckCircle2, ChevronDown, Edit, Save, Loader2,
  AlertTriangle, Target, Calendar, ArrowRight, Rocket, Map
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MissionConfig, MissionBrief } from './types';

interface Props {
  config: MissionConfig;
  contextId?: string;
  isReplacement?: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const loaderSteps = [
  'Analyse du contexte actif',
  'Revue des artefacts liés',
  'Identification des risques',
  'Structuration des priorités',
  'Préparation du plan semaine 1',
];

export const StepBrief = ({ config, contextId, isReplacement, onComplete, onBack }: Props) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [loaderStep, setLoaderStep] = useState(0);
  const [brief, setBrief] = useState<MissionBrief | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  // Cognitive staged loader
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoaderStep(prev => {
        if (prev >= loaderSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => generateBrief(), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateBrief = async () => {
    // Load context data for generation
    let contextData: any = null;
    if (contextId) {
      const { data } = await supabase
        .from('product_contexts')
        .select('*')
        .eq('id', contextId)
        .single();
      contextData = data;
    }

    const objectives = contextData?.objectives ? (Array.isArray(contextData.objectives) ? contextData.objectives as string[] : []) : [];
    const kpis = contextData?.target_kpis ? (Array.isArray(contextData.target_kpis) ? contextData.target_kpis as string[] : []) : [];

    const generatedBrief: MissionBrief = {
      executiveSummary: {
        vision: contextData?.vision || `Mission ${config.missionName} pour ${config.client}`,
        topPriorities: objectives.length > 0
          ? objectives.slice(0, 3).map(String)
          : ['Comprendre l\'existant', 'Identifier les quick wins', 'Établir la roadmap'],
        primaryRisk: 'Manque de documentation existante sur les processus métier',
        week1Focus: 'Immersion client, rencontres stakeholders clés, audit de l\'existant',
      },
      structuredBrief: {
        visionObjectives: contextData?.vision || 'Accompagner la transformation digitale du client',
        scopeIn: ['Audit de l\'existant', 'Définition de la roadmap produit', 'Mise en place des processus agiles'],
        scopeOut: ['Développement technique', 'Formation des équipes opérationnelles'],
        stakeholders: contextData?.target_audience ? [contextData.target_audience] : ['Product Owner', 'Tech Lead', 'Business Analyst'],
        timeline: ['S1-S2 : Immersion & Audit', 'S3-S4 : Cadrage & Roadmap', 'S5+ : Exécution'],
        risks: [
          { risk: 'Résistance au changement', mitigation: 'Ateliers collaboratifs et communication régulière' },
          { risk: 'Dépendances techniques non identifiées', mitigation: 'Audit technique approfondi en semaine 1' },
          { risk: 'Manque de disponibilité des stakeholders', mitigation: 'Planification anticipée et rituels fixes' },
        ],
        artefactSummary: 'Artefacts existants à consolider et compléter',
        openDecisions: ['Choix de la méthodologie projet', 'Périmètre exact du MVP'],
      },
      plan3060_90: {
        days30: {
          title: 'Stabiliser',
          focusAreas: ['Immersion client & métier', 'Audit de l\'existant', 'Quick wins identifiés'],
          kpis: kpis.length > 0 ? kpis.slice(0, 2).map(String) : ['Nombre de stakeholders rencontrés', 'Documentation complétée'],
          suggestedWorkflows: ['Discovery & Strategy', 'User Research'],
        },
        days60: {
          title: 'Structurer',
          focusAreas: ['Roadmap produit définie', 'Backlog priorisé', 'Rituels en place'],
          kpis: ['Stories prêtes pour développement', 'Roadmap validée par les stakeholders'],
          suggestedWorkflows: ['Roadmap Planning', 'Sprint Planning'],
        },
        days90: {
          title: 'Optimiser',
          focusAreas: ['Premiers livrables produits', 'Métriques de succès en place', 'Processus optimisés'],
          kpis: ['Vélocité de l\'équipe', 'Satisfaction stakeholders'],
          suggestedWorkflows: ['Release Notes', 'Impact Analysis'],
        },
      },
    };

    setBrief(generatedBrief);
    setEditedSummary(generatedBrief.executiveSummary.vision);
    setIsGenerating(false);
  };

  const handleSave = async () => {
    if (!brief) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'tech_spec' as any, // Using tech_spec as closest type for mission_brief
        title: `Mission Brief – ${config.missionName}`,
        content: brief as any,
        metadata: {
          type: 'mission_brief',
          client: config.client,
          role: config.role,
          contextId,
          isReplacement,
        },
        product_context_id: contextId,
      });

      toast.success('Brief de mission sauvegardé !');
      setShowPlan(true);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Generating state with cognitive loader
  if (isGenerating) {
    return (
      <Card className="min-h-[60vh] flex items-center justify-center">
        <CardContent className="text-center space-y-8 py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Rocket className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Nova prépare votre brief de mission…</h2>
            <p className="text-sm text-muted-foreground">Cela prend quelques instants</p>
          </div>
          <div className="max-w-sm mx-auto space-y-3">
            {loaderSteps.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${idx <= loaderStep ? 'opacity-100' : 'opacity-30'}`}>
                {idx < loaderStep ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : idx === loaderStep ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                )}
                <span className="text-sm text-left">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!brief) return null;

  // Show 30-60-90 plan after save
  if (showPlan) {
    return (
      <Card className="min-h-[60vh] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Plan 30-60-90 jours proposé
          </CardTitle>
          <p className="text-sm text-muted-foreground">Modifiable selon vos besoins</p>
        </CardHeader>
        <CardContent className="flex-1 space-y-6">
          <ScrollArea className="h-[50vh] pr-4">
            {[
              { data: brief.plan3060_90.days30, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: '30 jours' },
              { data: brief.plan3060_90.days60, color: 'text-amber-500', bg: 'bg-amber-500/10', label: '60 jours' },
              { data: brief.plan3060_90.days90, color: 'text-primary', bg: 'bg-primary/10', label: '90 jours' },
            ].map(({ data, color, bg, label }) => (
              <div key={label} className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className={`${color}`}>{label}</Badge>
                  <h3 className="font-semibold">{data.title}</h3>
                </div>
                <div className={`p-4 rounded-lg ${bg} space-y-3`}>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Focus</p>
                    <ul className="text-sm space-y-1">{data.focusAreas.map((f, i) => <li key={i}>• {f}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">KPIs</p>
                    <ul className="text-sm space-y-1">{data.kpis.map((k, i) => <li key={i}>• {k}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Workflows suggérés</p>
                    <div className="flex flex-wrap gap-2">{data.suggestedWorkflows.map((w, i) => <Badge key={i} variant="secondary">{w}</Badge>)}</div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="flex items-center justify-between pt-4 mt-auto">
            <Button variant="outline" onClick={() => setShowPlan(false)}>Voir le brief</Button>
            <Button onClick={onComplete}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Terminer l'activation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main brief display
  return (
    <Card className="min-h-[60vh] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Brief de mission
        </CardTitle>
        <p className="text-sm text-muted-foreground">Revue et validation de votre brief généré</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <ScrollArea className="h-[50vh] pr-4">
          {/* Layer 1 – Executive summary */}
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-4 mb-6">
            <h3 className="font-semibold">Résumé exécutif</h3>
            {isEditing ? (
              <Textarea
                value={editedSummary}
                onChange={e => setEditedSummary(e.target.value)}
                className="min-h-[80px]"
              />
            ) : (
              <p className="text-sm">{brief.executiveSummary.vision}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Target className="w-3 h-3" />Top 3 Priorités</p>
                <ul className="text-sm space-y-1">{brief.executiveSummary.topPriorities.map((p, i) => <li key={i}>{i + 1}. {p}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Risque principal</p>
                <p className="text-sm">{brief.executiveSummary.primaryRisk}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Focus semaine 1</p>
                <p className="text-sm">{brief.executiveSummary.week1Focus}</p>
              </div>
            </div>
          </div>

          {/* Layer 2 – Structured brief */}
          <div className="space-y-3">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-muted/50">
                <span className="text-sm font-medium">Vision & Objectifs</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0">
                <p className="text-sm">{brief.structuredBrief.visionObjectives}</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-muted/50">
                <span className="text-sm font-medium">Périmètre (In / Out)</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-emerald-500 mb-1">In Scope</p>
                    <ul className="text-sm space-y-1">{brief.structuredBrief.scopeIn.map((s, i) => <li key={i}>✓ {s}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-destructive mb-1">Out of Scope</p>
                    <ul className="text-sm space-y-1">{brief.structuredBrief.scopeOut.map((s, i) => <li key={i}>✗ {s}</li>)}</ul>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-muted/50">
                <span className="text-sm font-medium">Risques & Mitigations</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0 space-y-2">
                {brief.structuredBrief.risks.map((r, i) => (
                  <div key={i} className="flex gap-3 p-2 rounded-md bg-muted/30">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{r.risk}</p>
                      <p className="text-xs text-muted-foreground">→ {r.mitigation}</p>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-muted/50">
                <span className="text-sm font-medium">Timeline & Jalons</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0">
                <ul className="text-sm space-y-1">{brief.structuredBrief.timeline.map((t, i) => <li key={i}>📅 {t}</li>)}</ul>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-muted/50">
                <span className="text-sm font-medium">Décisions ouvertes</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0">
                <ul className="text-sm space-y-1">{brief.structuredBrief.openDecisions.map((d, i) => <li key={i}>❓ {d}</li>)}</ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 mt-auto">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>Retour</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-1" />
              {isEditing ? 'Aperçu' : 'Modifier'}
            </Button>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Valider & Sauvegarder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
