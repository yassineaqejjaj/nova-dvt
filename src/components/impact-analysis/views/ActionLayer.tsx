import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImpactRun, ImpactItem } from '../types';
import {
  ClipboardList, TestTube2, CheckCircle2, Download,
  ListChecks, FileDown, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ActionLayerProps {
  run: ImpactRun;
  items: ImpactItem[];
}

export const ActionLayer: React.FC<ActionLayerProps> = ({ run, items }) => {
  const [generating, setGenerating] = useState<string | null>(null);

  const reviewRequired = items.filter(i => i.review_status === 'review_required');
  const codeItems = items.filter(i => i.item_type === 'code');
  const testItems = items.filter(i => i.item_type === 'test');
  const dataItems = items.filter(i => i.item_type === 'data');
  const kpiItems = items.filter(i => i.item_type === 'kpi');

  const generateChecklist = () => {
    setGenerating('checklist');
    const lines = [
      `# Checklist d'Impact — Score: ${run.impact_score}`,
      `Date: ${new Date(run.created_at).toLocaleDateString('fr-FR')}`,
      `Changements: ${run.summary?.total_changes || 0}`,
      '',
      '## À revoir',
      ...reviewRequired.map(i => `- [ ] [${i.item_type.toUpperCase()}] ${i.item_name} — ${i.impact_reason}`),
      '',
      '## Code impacté',
      ...codeItems.map(i => `- [ ] ${i.item_name} (score: ${i.impact_score})`),
      '',
      '## Tests à revalider',
      ...testItems.map(i => `- [ ] ${i.item_name} (score: ${i.impact_score})`),
      '',
      '## Données à vérifier',
      ...dataItems.map(i => `- [ ] ${i.item_name} — ${i.impact_reason}`),
      '',
      '## KPIs à surveiller',
      ...kpiItems.map(i => `- [ ] ${i.item_name} — ${i.impact_reason}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impact-checklist-${run.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerating(null);
    toast.success('Checklist générée et téléchargée');
  };

  const generateTestPlan = () => {
    setGenerating('testplan');
    const lines = [
      `# Plan de Test — Impact Analysis`,
      `Score: ${run.impact_score} | Date: ${new Date(run.created_at).toLocaleDateString('fr-FR')}`,
      '',
      '## Tests existants à revalider',
      ...testItems.map(i => [
        `### ${i.item_name}`,
        `- Raison: ${i.impact_reason}`,
        `- Score d'impact: ${i.impact_score}/5`,
        i.metadata?.test_type ? `- Type: ${i.metadata.test_type}` : '',
        i.metadata?.test_file ? `- Fichier: \`${i.metadata.test_file}\`` : '',
        '',
      ].filter(Boolean).join('\n')),
      '',
      '## Code à couvrir par de nouveaux tests',
      ...codeItems.filter(i => i.impact_score >= 3).map(i => [
        `### ${i.item_name}`,
        `- Impact: ${i.impact_reason}`,
        `- Score: ${i.impact_score}/5`,
        `- Couplage: ${i.metadata?.coupling ? Math.round(i.metadata.coupling * 100) + '%' : 'N/A'}`,
        '',
      ].join('\n')),
      '',
      '## Données à valider',
      ...dataItems.map(i => `- ${i.item_name}: ${i.impact_reason}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-plan-${run.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerating(null);
    toast.success('Plan de test généré et téléchargé');
  };

  const exportPDF = () => {
    setGenerating('pdf');
    // Generate a comprehensive markdown report as a text file
    const lines = [
      `# Rapport d'Impact Complet`,
      `Score global: ${run.impact_score} | Statut: ${run.status}`,
      `Date: ${new Date(run.created_at).toLocaleDateString('fr-FR')}`,
      '',
      '## Résumé Exécutif',
      `- Changements détectés: ${run.summary?.total_changes || 0}`,
      `- Sévérité haute: ${run.summary?.high_severity_count || 0}`,
      `- Éléments impactés: ${items.length}`,
      `- Fichiers code: ${run.summary?.code_files_impacted || 0}`,
      `- Tests: ${run.summary?.tests_impacted || 0}`,
      `- Tables données: ${(run.summary as any)?.data_tables_impacted || 0}`,
      `- KPIs: ${(run.summary as any)?.data_kpis_impacted || 0}`,
      '',
      '## Détail par catégorie',
      '',
      ...Object.entries(
        items.reduce<Record<string, ImpactItem[]>>((acc, i) => {
          acc[i.item_type] = acc[i.item_type] || [];
          acc[i.item_type].push(i);
          return acc;
        }, {})
      ).flatMap(([type, typeItems]) => [
        `### ${type.charAt(0).toUpperCase() + type.slice(1)} (${typeItems.length})`,
        ...typeItems.map(i => `- [${i.review_status}] ${i.item_name} (score: ${i.impact_score}) — ${i.impact_reason}`),
        '',
      ]),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impact-report-${run.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerating(null);
    toast.success('Rapport exporté');
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Actions disponibles</CardTitle>
          <CardDescription>
            Générez des livrables à partir de l'analyse d'impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Checklist */}
            <button
              onClick={generateChecklist}
              disabled={generating === 'checklist'}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors text-center"
            >
              {generating === 'checklist' ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : (
                <ListChecks className="w-8 h-8 text-primary" />
              )}
              <div>
                <p className="font-medium text-sm">Générer Checklist</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reviewRequired.length} items à revoir
                </p>
              </div>
            </button>

            {/* Test plan */}
            <button
              onClick={generateTestPlan}
              disabled={generating === 'testplan'}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors text-center"
            >
              {generating === 'testplan' ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : (
                <TestTube2 className="w-8 h-8 text-emerald-500" />
              )}
              <div>
                <p className="font-medium text-sm">Plan de Test</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {testItems.length} tests + {codeItems.filter(i => i.impact_score >= 3).length} fichiers à couvrir
                </p>
              </div>
            </button>

            {/* Export report */}
            <button
              onClick={exportPDF}
              disabled={generating === 'pdf'}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors text-center"
            >
              {generating === 'pdf' ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : (
                <FileDown className="w-8 h-8 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">Exporter Rapport</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rapport complet en Markdown
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-destructive">{reviewRequired.length}</p>
            <p className="text-xs text-muted-foreground">À revoir</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{codeItems.length}</p>
            <p className="text-xs text-muted-foreground">Fichiers code</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{testItems.length}</p>
            <p className="text-xs text-muted-foreground">Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{dataItems.length + kpiItems.length}</p>
            <p className="text-xs text-muted-foreground">Data & KPIs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
