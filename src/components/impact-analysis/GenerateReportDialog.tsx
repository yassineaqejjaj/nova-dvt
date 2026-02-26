import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormattedText } from '@/components/ui/formatted-text';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ImpactRun, ImpactItem, ArtefactLink } from './types';
import { Loader2, FileDown, FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  run: ImpactRun;
  items: ImpactItem[];
  links: ArtefactLink[];
  artefactTitle: string;
  artefactType: string;
  productContextName?: string;
}

export const GenerateReportDialog: React.FC<GenerateReportDialogProps> = ({
  open, onOpenChange, run, items, links, artefactTitle, artefactType, productContextName,
}) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [savedArtifactId, setSavedArtifactId] = useState<string | null>(null);
  const [step, setStep] = useState<string>('');

  const generateReport = async () => {
    if (!user?.id) return;
    setIsGenerating(true);
    setReport(null);
    setSavedArtifactId(null);

    const steps = [
      'Préparation des données d\'analyse…',
      'Génération du rapport par Nova AI…',
      'Structuration du document…',
      'Sauvegarde de l\'artefact…',
    ];

    for (const s of steps.slice(0, 2)) {
      setStep(s);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      setStep(steps[1]);
      const { data, error } = await supabase.functions.invoke('generate-impact-report', {
        body: {
          impactRunId: run.id,
          artefactId: run.artefact_id,
          artefactTitle,
          artefactType,
          impactScore: run.impact_score,
          summary: run.summary,
          impactItems: items.map(i => ({
            item_name: i.item_name,
            item_type: i.item_type,
            impact_score: i.impact_score,
            impact_reason: i.impact_reason,
            review_status: i.review_status,
            related_artefact_id: i.related_artefact_id,
          })),
          links: links.map(l => ({
            link_type: l.link_type,
            target_type: l.target_type,
            target_id: l.target_id,
            confidence_score: l.confidence_score,
          })),
          userId: user.id,
          productContextName,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setStep(steps[3]);
      setReport(data.report);
      setSavedArtifactId(data.artifactId);
      toast.success('Rapport généré et sauvegardé comme artefact');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
      setStep('');
    }
  };

  const downloadPDF = () => {
    if (!report) return;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    // Header
    pdf.setFillColor(30, 30, 40);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rapport d\'Analyse d\'Impact', margin, 15);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${artefactTitle} — ${new Date().toLocaleDateString('fr-FR')}`, margin, 25);
    pdf.setTextColor(255, 180, 0);
    pdf.text(`Score: ${run.impact_score} | ${run.impact_score >= 15 ? 'CRITIQUE' : run.impact_score >= 8 ? 'ÉLEVÉ' : run.impact_score >= 3 ? 'MODÉRÉ' : 'FAIBLE'}`, pageWidth - margin - 60, 25);

    y = 45;
    pdf.setTextColor(40, 40, 40);

    // Parse markdown-like content into PDF
    const lines = report.split('\n');

    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }

      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('## ')) {
        y += 4;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 30, 40);
        const headerText = trimmed.replace(/^## /, '').replace(/\*\*/g, '');
        pdf.text(headerText, margin, y);
        y += 3;
        pdf.setDrawColor(60, 60, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, margin + 50, y);
        y += 6;
        continue;
      }

      if (trimmed.startsWith('### ')) {
        y += 3;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 80);
        const subText = trimmed.replace(/^### /, '').replace(/\*\*/g, '');
        pdf.text(subText, margin, y);
        y += 6;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        y += 5;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 30, 40);
        const h1Text = trimmed.replace(/^# /, '').replace(/\*\*/g, '');
        pdf.text(h1Text, margin, y);
        y += 4;
        pdf.setDrawColor(60, 60, 200);
        pdf.setLineWidth(0.8);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 7;
        continue;
      }

      // Empty line
      if (!trimmed) {
        y += 3;
        continue;
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(40, 40, 40);
        const bulletText = trimmed.replace(/^[-*] /, '').replace(/\*\*/g, '');
        const wrappedLines = pdf.splitTextToSize(`• ${bulletText}`, maxWidth - 5);
        for (const wl of wrappedLines) {
          if (y > pageHeight - margin) { pdf.addPage(); y = margin; }
          pdf.text(wl, margin + 5, y);
          y += 5;
        }
        continue;
      }

      // Regular text
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      const cleanText = trimmed.replace(/\*\*/g, '');
      const wrappedLines = pdf.splitTextToSize(cleanText, maxWidth);
      for (const wl of wrappedLines) {
        if (y > pageHeight - margin) { pdf.addPage(); y = margin; }
        pdf.text(wl, margin, y);
        y += 5;
      }
    }

    // Footer on each page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Nova — Rapport d'Impact | Page ${i}/${totalPages}`, margin, pageHeight - 10);
      pdf.text('Confidentiel', pageWidth - margin - 20, pageHeight - 10);
    }

    const fileName = `rapport-impact-${artefactTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'analyse'}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
    toast.success('PDF téléchargé');
  };

  const downloadMarkdown = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-impact-${artefactTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'analyse'}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown téléchargé');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Rapport d'Analyse d'Impact
          </DialogTitle>
          <DialogDescription>
            Génération d'un rapport professionnel basé sur l'analyse en cours
          </DialogDescription>
        </DialogHeader>

        {!report && !isGenerating && (
          <div className="space-y-4 py-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-5 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{run.impact_score}</p>
                    <p className="text-xs text-muted-foreground">Score global</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{items.length}</p>
                    <p className="text-xs text-muted-foreground">Éléments impactés</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{items.filter(i => i.impact_score >= 4).length}</p>
                    <p className="text-xs text-muted-foreground">Critiques</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{links.length}</p>
                    <p className="text-xs text-muted-foreground">Relations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
              Nova va analyser l'ensemble des données de cette analyse d'impact et rédiger un rapport structuré 
              de qualité consultant, incluant résumé exécutif, cartographie des risques, matrice de décision et plan d'action.
            </p>
            <p className="text-sm text-muted-foreground">
              Le rapport sera automatiquement sauvegardé comme artefact et téléchargeable en PDF.
            </p>
            <Button onClick={generateReport} className="w-full" size="lg">
              <FileText className="w-4 h-4 mr-2" />
              Générer le rapport
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Nova rédige votre rapport…</p>
              <p className="text-sm text-muted-foreground mt-1">{step}</p>
            </div>
          </div>
        )}

        {report && (
          <div className="flex flex-col flex-1 min-h-0 gap-4">
            {/* Actions bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {savedArtifactId && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-500/10">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Sauvegardé comme artefact
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                  <FileDown className="w-4 h-4 mr-1" />
                  Markdown
                </Button>
                <Button size="sm" onClick={downloadPDF}>
                  <FileDown className="w-4 h-4 mr-1" />
                  Télécharger PDF
                </Button>
              </div>
            </div>

            {/* Report preview */}
            <ScrollArea className="flex-1 min-h-0 max-h-[55vh] border rounded-lg">
              <div className="p-6">
                <FormattedText content={report} className="text-sm leading-relaxed" />
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
