import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, Eye, Target, BarChart3, FileText, Workflow, 
  CheckCircle2, AlertTriangle, Info, ArrowRight, Edit 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AccessCategory, CompletenessScore, ConfidenceIndicator } from './types';

interface Props {
  contextId?: string;
  onNext: () => void;
  onBack: () => void;
}

export const StepVerify = ({ contextId, onNext, onBack }: Props) => {
  const [contextData, setContextData] = useState<any>(null);
  const [artefactsCount, setArtefactsCount] = useState(0);
  const [workflowsCount, setWorkflowsCount] = useState(0);
  const [decisionLogsCount, setDecisionLogsCount] = useState(0);
  const [accessCategories, setAccessCategories] = useState<AccessCategory[]>([
    { id: 'docs', label: 'Plateforme de documentation', checked: false },
    { id: 'backlog', label: 'Outil de gestion de backlog', checked: false },
    { id: 'communication', label: 'Plateforme de communication', checked: false },
    { id: 'tech', label: 'Environnements techniques', checked: false },
    { id: 'analytics', label: 'Outils Analytics / Data', checked: false },
  ]);

  useEffect(() => {
    loadData();
  }, [contextId]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load context
    if (contextId) {
      const { data: ctx } = await supabase
        .from('product_contexts')
        .select('*')
        .eq('id', contextId)
        .single();
      if (ctx) {
        setContextData(ctx);
        // Detect tools from metadata
        const meta = ctx.metadata as any;
        if (meta?.tools) {
          setAccessCategories(prev => prev.map(cat => {
            if (cat.id === 'backlog' && meta.tools.backlog) return { ...cat, tool: meta.tools.backlog };
            if (cat.id === 'docs' && meta.tools.docs) return { ...cat, tool: meta.tools.docs };
            return cat;
          }));
        }
      }
    }

    // Count artefacts
    const { count: artCount } = await supabase
      .from('artifacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setArtefactsCount(artCount || 0);

    // Count decision logs
    const { count: decCount } = await supabase
      .from('decision_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setDecisionLogsCount(decCount || 0);
  };

  const objectives = useMemo(() => {
    if (!contextData?.objectives) return [];
    return Array.isArray(contextData.objectives) ? contextData.objectives as string[] : [];
  }, [contextData]);

  const kpis = useMemo(() => {
    if (!contextData?.target_kpis) return [];
    return Array.isArray(contextData.target_kpis) ? contextData.target_kpis as string[] : [];
  }, [contextData]);

  // Completeness score
  const completeness = useMemo<CompletenessScore>(() => {
    const details = {
      objectivesDefined: objectives.length > 0,
      kpisDefined: kpis.length > 0,
      stakeholdersFilled: !!contextData?.target_audience,
      artefactsCount,
      activeWorkflows: workflowsCount,
    };
    let score = 0;
    if (details.objectivesDefined) score += 25;
    if (details.kpisDefined) score += 25;
    if (details.stakeholdersFilled) score += 20;
    if (details.artefactsCount > 0) score += 15;
    if (details.activeWorkflows > 0) score += 15;
    return { score, details };
  }, [objectives, kpis, contextData, artefactsCount, workflowsCount]);

  // Confidence indicator
  const confidence = useMemo<ConfidenceIndicator>(() => {
    const factors = {
      linkedArtefacts: artefactsCount,
      recentActivity: artefactsCount > 2,
      decisionLogsAvailable: decisionLogsCount > 0,
    };
    let level: ConfidenceIndicator['level'] = 'low';
    const fScore = (factors.linkedArtefacts > 3 ? 1 : 0) + (factors.recentActivity ? 1 : 0) + (factors.decisionLogsAvailable ? 1 : 0);
    if (fScore >= 3) level = 'high';
    else if (fScore >= 1) level = 'medium';
    return { level, factors };
  }, [artefactsCount, decisionLogsCount]);

  const scoreColor = completeness.score >= 80 ? 'text-emerald-500' : completeness.score >= 50 ? 'text-amber-500' : 'text-destructive';
  const confidenceLabel = { high: 'Haute', medium: 'Moyenne', low: 'Faible' };
  const confidenceColor = { high: 'text-emerald-500', medium: 'text-amber-500', low: 'text-destructive' };

  const toggleAccess = (id: string) => {
    setAccessCategories(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  return (
    <Card className="min-h-[60vh] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Vérifier le périmètre & accès
        </CardTitle>
        <p className="text-sm text-muted-foreground">Vérifiez ce que Nova connaît déjà et complétez les accès nécessaires.</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <ScrollArea className="h-[55vh] pr-4">
          {/* Section 1 – What Nova knows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Ce que Nova sait déjà
              </h3>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <Edit className="w-3 h-3" />
                Modifier le contexte
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" />Objectifs</p>
                {objectives.length > 0 ? (
                  <ul className="text-sm space-y-1">{objectives.map((o, i) => <li key={i}>• {String(o)}</li>)}</ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Non définis</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><BarChart3 className="w-3 h-3" />KPIs</p>
                {kpis.length > 0 ? (
                  <ul className="text-sm space-y-1">{kpis.map((k, i) => <li key={i}>• {String(k)}</li>)}</ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Non définis</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-xs text-muted-foreground">Audience cible</p>
                <p className="text-sm">{contextData?.target_audience || <span className="italic text-muted-foreground">Non défini</span>}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" />Artefacts existants</p>
                <p className="text-sm font-medium">{artefactsCount} artefact(s)</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Section 2 – Access checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Checklist d'accès</h3>
            <div className="space-y-2">
              {accessCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 p-2.5 rounded-md border hover:bg-muted/30 transition-colors">
                  <Checkbox
                    checked={cat.checked}
                    onCheckedChange={() => toggleAccess(cat.id)}
                    id={cat.id}
                  />
                  <label htmlFor={cat.id} className="flex-1 text-sm cursor-pointer">
                    {cat.label}
                    {cat.tool && (
                      <Badge variant="secondary" className="ml-2 text-xs">{cat.tool}</Badge>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Section 3 – Completeness score */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Score de complétude</h3>
            <div className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mission Completeness</span>
                <span className={`text-2xl font-bold ${scoreColor}`}>{completeness.score}%</span>
              </div>
              <Progress value={completeness.score} className="h-2" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {completeness.details.objectivesDefined ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  Objectifs
                </div>
                <div className="flex items-center gap-1.5">
                  {completeness.details.kpisDefined ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  KPIs
                </div>
                <div className="flex items-center gap-1.5">
                  {completeness.details.stakeholdersFilled ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  Stakeholders
                </div>
                <div className="flex items-center gap-1.5">
                  {completeness.details.artefactsCount > 0 ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  Artefacts ({completeness.details.artefactsCount})
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Section 4 – AI Confidence */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Confiance de synthèse IA</h3>
            <div className="p-4 rounded-lg border flex items-center gap-4">
              <Info className={`w-5 h-5 ${confidenceColor[confidence.level]}`} />
              <div>
                <p className={`text-sm font-medium ${confidenceColor[confidence.level]}`}>
                  Confiance : {confidenceLabel[confidence.level]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {confidence.factors.linkedArtefacts} artefacts liés •{' '}
                  {confidence.factors.recentActivity ? 'Activité récente' : 'Pas d\'activité récente'} •{' '}
                  {confidence.factors.decisionLogsAvailable ? 'Logs de décision disponibles' : 'Aucun log de décision'}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 mt-auto">
          <Button variant="outline" onClick={onBack}>Retour</Button>
          <Button onClick={onNext}>
            Continuer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
