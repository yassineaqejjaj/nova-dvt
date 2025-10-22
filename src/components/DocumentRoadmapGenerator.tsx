import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Upload, Sparkles, FileText, Loader2, Download, Save, FileUp, ClipboardPaste } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ThematicRoadmapView } from './roadmap-views/ThematicRoadmapView';
import { ChronologicalRoadmapView } from './roadmap-views/ChronologicalRoadmapView';
import { NowNextLaterView } from './roadmap-views/NowNextLaterView';
import { OKRRoadmapView } from './roadmap-views/OKRRoadmapView';

interface RoadmapItem {
  quarter?: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  timeline?: string;
}

interface ThematicPillar {
  name: string;
  description: string;
  initiatives: RoadmapItem[];
}

interface OKRItem {
  objective: string;
  keyResults: string[];
  initiatives: RoadmapItem[];
  status: 'not-started' | 'in-progress' | 'completed';
}

type RoadmapFormat = 'chronological' | 'thematic' | 'now-next-later' | 'okr';

interface RoadmapResult {
  items?: RoadmapItem[];
  summary: string;
  pillars?: ThematicPillar[];
  now?: RoadmapItem[];
  next?: RoadmapItem[];
  later?: RoadmapItem[];
  okrs?: OKRItem[];
}

export const DocumentRoadmapGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [startDate, setStartDate] = useState('');
  const [periodType, setPeriodType] = useState<'quarter' | 'month'>('quarter');
  const [roadmapFormat, setRoadmapFormat] = useState<RoadmapFormat>('chronological');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Type de fichier non supporté. Veuillez uploader un PDF, DOCX ou TXT');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 10MB)');
        return;
      }
      
      setFile(selectedFile);
      toast.success('Fichier chargé avec succès');
    }
  };

  const handleGenerateRoadmap = async () => {
    if (inputMode === 'file' && !file) {
      toast.error('Veuillez uploader un document');
      return;
    }
    
    if (inputMode === 'text' && !pastedText.trim()) {
      toast.error('Veuillez coller du texte');
      return;
    }
    
    if (!startDate) {
      toast.error('Veuillez sélectionner une date de début');
      return;
    }

    setIsGenerating(true);

    try {
      if (inputMode === 'file' && file) {
        // Read file as base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Content = e.target?.result as string;
          
          // Call edge function to generate roadmap
          const { data, error } = await supabase.functions.invoke('generate-roadmap-from-document', {
            body: {
              documentContent: base64Content.split(',')[1], // Remove data:...;base64, prefix
              documentName: file.name,
              startDate,
              periodType,
              roadmapFormat,
              inputType: 'file'
            }
          });

          if (error) {
            console.error('Error generating roadmap:', error);
            toast.error('Erreur lors de la génération de la roadmap');
            setIsGenerating(false);
            return;
          }

          setRoadmap(data);
          toast.success('Roadmap générée avec succès !');
          setIsGenerating(false);
        };

        reader.onerror = () => {
          toast.error('Erreur lors de la lecture du fichier');
          setIsGenerating(false);
        };

        reader.readAsDataURL(file);
      } else if (inputMode === 'text') {
        // Call edge function with pasted text
        const { data, error } = await supabase.functions.invoke('generate-roadmap-from-document', {
          body: {
            textContent: pastedText,
            documentName: 'Texte collé',
            startDate,
            periodType,
            roadmapFormat,
            inputType: 'text'
          }
        });

        if (error) {
          console.error('Error generating roadmap:', error);
          toast.error('Erreur lors de la génération de la roadmap');
          setIsGenerating(false);
          return;
        }

        setRoadmap(data);
        toast.success('Roadmap générée avec succès !');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la génération de la roadmap');
      setIsGenerating(false);
    }
  };

  const handleSaveToArtifacts = async () => {
    if (!roadmap) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      const sourceName = inputMode === 'file' ? file?.name : 'Texte collé';
      const { error } = await supabase.from('artifacts').insert([{
        user_id: user.id,
        artifact_type: 'epic',
        title: `Roadmap ${roadmapFormat} - ${sourceName || 'Document'}`,
        content: roadmap as any,
        metadata: {
          generatedAt: new Date().toISOString(),
          startDate,
          periodType,
          roadmapFormat,
          documentName: sourceName,
          artifactSubtype: 'roadmap'
        } as any
      }]);

      if (error) throw error;

      toast.success('Roadmap enregistrée dans les artefacts !');
    } catch (error) {
      console.error('Error saving to artifacts:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDownloadPDF = () => {
    if (!roadmap) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      const pdfSourceName = inputMode === 'file' ? file?.name : 'Texte collé';
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      const formatLabels = {
        chronological: 'Chronologique',
        thematic: 'Thématique',
        'now-next-later': 'Now/Next/Later',
        okr: 'OKR'
      };
      doc.text(`Roadmap ${formatLabels[roadmapFormat]} - ${pdfSourceName || 'Document'}`, pageWidth / 2, 20, { align: 'center' });
      
      let yPos = 30;

      // Summary
      if (roadmap.summary && typeof roadmap.summary === 'string') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Résumé', 15, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(roadmap.summary, pageWidth - 30);
        doc.text(summaryLines, 15, yPos);
        yPos += summaryLines.length * 5 + 10;
      }

      // Format-specific content
      if (roadmapFormat === 'chronological' && roadmap.items && Array.isArray(roadmap.items)) {
        // Chronological format
        const quarters = generateQuarters();
        quarters.forEach((quarter) => {
          const quarterItems = roadmap.items!.filter(item => item && item.quarter === quarter);
        
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${quarter} - ${quarterItems.length} items`, 15, yPos);
        yPos += 8;

        if (quarterItems.length > 0) {
          const tableData = quarterItems.map(item => [
            item.title,
            item.description,
            item.priority,
            item.category || '-'
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Titre', 'Description', 'Priorité', 'Catégorie']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [67, 56, 202] },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
              0: { cellWidth: 45 },
              1: { cellWidth: 80 },
              2: { cellWidth: 25 },
              3: { cellWidth: 30 }
            },
            didParseCell: function(data) {
              if (data.column.index === 2 && data.section === 'body') {
                const priority = data.cell.raw as string;
                if (priority === 'high') {
                  data.cell.styles.textColor = [220, 38, 38];
                  data.cell.styles.fontStyle = 'bold';
                } else if (priority === 'medium') {
                  data.cell.styles.textColor = [234, 88, 12];
                }
              }
            }
          });

          yPos = (doc as any).lastAutoTable.finalY + 10;
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('Aucun item pour cette période', 15, yPos);
          yPos += 10;
        }
      });
      } else if (roadmapFormat === 'thematic' && roadmap.pillars && Array.isArray(roadmap.pillars)) {
        // Thematic format
        roadmap.pillars.forEach((pillar, index) => {
          if (!pillar || typeof pillar.name !== 'string') return;
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Pilier ${index + 1}: ${pillar.name}`, 15, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const descLines = doc.splitTextToSize(pillar.description, pageWidth - 30);
        doc.text(descLines, 15, yPos);
          yPos += descLines.length * 5 + 5;

          if (Array.isArray(pillar.initiatives) && pillar.initiatives.length > 0) {
            const tableData = pillar.initiatives.filter(item => item && item.title).map(item => [
            item.title,
            item.description,
            item.priority,
            item.timeline || '-'
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Initiative', 'Description', 'Priorité', 'Timeline']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [67, 56, 202] },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
              0: { cellWidth: 45 },
              1: { cellWidth: 70 },
              2: { cellWidth: 25 },
              3: { cellWidth: 40 }
            },
            didParseCell: function(data) {
              if (data.column.index === 2 && data.section === 'body') {
                const priority = data.cell.raw as string;
                if (priority === 'high') {
                  data.cell.styles.textColor = [220, 38, 38];
                  data.cell.styles.fontStyle = 'bold';
                } else if (priority === 'medium') {
                  data.cell.styles.textColor = [234, 88, 12];
                }
              }
            }
          });

            yPos = (doc as any).lastAutoTable.finalY + 15;
          }
        });
      } else if (roadmapFormat === 'now-next-later' && roadmap.now && roadmap.next && roadmap.later) {
        // Now/Next/Later format
        const sections = [
          { title: 'NOW - En cours (0-3 mois)', items: Array.isArray(roadmap.now) ? roadmap.now : [], color: [34, 197, 94] as [number, number, number] },
          { title: 'NEXT - À venir (3-6 mois)', items: Array.isArray(roadmap.next) ? roadmap.next : [], color: [59, 130, 246] as [number, number, number] },
          { title: 'LATER - Futur (6+ mois)', items: Array.isArray(roadmap.later) ? roadmap.later : [], color: [168, 85, 247] as [number, number, number] }
        ];

        sections.forEach((section) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(section.color[0], section.color[1], section.color[2]);
        doc.text(section.title, 15, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 8;

          if (section.items.length > 0) {
            const tableData = section.items.filter(item => item && item.title).map(item => [
            item.title,
            item.description,
            item.priority,
            item.category || '-'
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Titre', 'Description', 'Priorité', 'Catégorie']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: section.color },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
              0: { cellWidth: 45 },
              1: { cellWidth: 80 },
              2: { cellWidth: 25 },
              3: { cellWidth: 30 }
            },
            didParseCell: function(data) {
              if (data.column.index === 2 && data.section === 'body') {
                const priority = data.cell.raw as string;
                if (priority === 'high') {
                  data.cell.styles.textColor = [220, 38, 38];
                  data.cell.styles.fontStyle = 'bold';
                } else if (priority === 'medium') {
                  data.cell.styles.textColor = [234, 88, 12];
                }
              }
            }
          });

          yPos = (doc as any).lastAutoTable.finalY + 12;
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('Aucun item', 15, yPos);
            yPos += 10;
          }
        });
      } else if (roadmapFormat === 'okr' && roadmap.okrs && Array.isArray(roadmap.okrs)) {
        // OKR format
        roadmap.okrs.forEach((okr, index) => {
          if (!okr || typeof okr.objective !== 'string') return;
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Objectif ${index + 1}: ${okr.objective}`, 15, yPos);
        yPos += 8;

        // Key Results
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Résultats Clés:', 15, yPos);
        yPos += 6;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          if (Array.isArray(okr.keyResults)) {
            okr.keyResults.forEach((kr) => {
              if (typeof kr === 'string') {
                const krLines = doc.splitTextToSize(`• ${kr}`, pageWidth - 35);
                doc.text(krLines, 20, yPos);
                yPos += krLines.length * 5;
              }
            });
          }
          yPos += 3;

          // Initiatives
          if (Array.isArray(okr.initiatives) && okr.initiatives.length > 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Initiatives:', 15, yPos);
            yPos += 6;

            const tableData = okr.initiatives.filter(item => item && item.title).map(item => [
            item.title,
            item.description,
            item.priority
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Initiative', 'Description', 'Priorité']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [67, 56, 202] },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 100 },
              2: { cellWidth: 30 }
            },
            didParseCell: function(data) {
              if (data.column.index === 2 && data.section === 'body') {
                const priority = data.cell.raw as string;
                if (priority === 'high') {
                  data.cell.styles.textColor = [220, 38, 38];
                  data.cell.styles.fontStyle = 'bold';
                } else if (priority === 'medium') {
                  data.cell.styles.textColor = [234, 88, 12];
                }
              }
            }
          });

            yPos = (doc as any).lastAutoTable.finalY + 15;
          }
        });
      }

      // Save
      const downloadFileName = inputMode === 'file' ? file?.name : 'texte-colle';
      doc.save(`Roadmap-${roadmapFormat}-${downloadFileName || 'document'}.pdf`);
      toast.success('PDF téléchargé avec succès !');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const generateQuarters = () => {
    if (!startDate) return [];
    
    const start = new Date(startDate);
    const quarters = [];
    
    for (let i = 0; i < 4; i++) {
      const date = new Date(start);
      date.setMonth(start.getMonth() + i * 3);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      quarters.push(`Q${quarter} ${year}`);
    }
    
    return quarters;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Générateur de Roadmap depuis Document</h2>
        <p className="text-muted-foreground">Uploadez un document et générez automatiquement une roadmap</p>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Configuration</span>
          </CardTitle>
          <CardDescription>Uploadez un document ou collez du texte pour générer votre roadmap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as 'file' | 'text')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <FileUp className="w-4 h-4" />
                Upload Fichier
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4" />
                Coller Texte
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-2 mt-4">
              <Label htmlFor="file-upload">Document (PDF, DOCX, TXT)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {file && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>{file.name}</span>
                  </Badge>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-2 mt-4">
              <Label htmlFor="pasted-text">Texte à analyser</Label>
              <Textarea
                id="pasted-text"
                placeholder="Collez ici votre texte (description du produit, vision, objectifs, etc.)..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="min-h-[200px] resize-y"
              />
              {pastedText && (
                <p className="text-sm text-muted-foreground">
                  {pastedText.length} caractères
                </p>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Format de Roadmap</Label>
              <Select value={roadmapFormat} onValueChange={(value: RoadmapFormat) => setRoadmapFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chronological">📅 Chronologique (Timeline)</SelectItem>
                  <SelectItem value="thematic">📊 Thématique (Par piliers)</SelectItem>
                  <SelectItem value="now-next-later">🎯 Now / Next / Later</SelectItem>
                  <SelectItem value="okr">🎖️ Orienté Objectifs (OKR)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {roadmapFormat === 'chronological' && 'Visualisation par trimestre/mois - Idéal pour équipes produit et tech'}
                {roadmapFormat === 'thematic' && 'Structure par piliers stratégiques - Idéal pour C-level et stakeholders'}
                {roadmapFormat === 'now-next-later' && 'Catégorisation agile par phase - Idéal pour MVPs et contextes itératifs'}
                {roadmapFormat === 'okr' && 'Lien objectifs-résultats-actions - Idéal pour pilotage stratégique'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de début</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {roadmapFormat === 'chronological' && (
                <div className="space-y-2">
                  <Label>Période</Label>
                  <Select value={periodType} onValueChange={(value: 'quarter' | 'month') => setPeriodType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarter">Par Trimestre (Q1, Q2, Q3, Q4)</SelectItem>
                      <SelectItem value="month">Par Mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={handleGenerateRoadmap} 
            disabled={(inputMode === 'file' && !file) || (inputMode === 'text' && !pastedText.trim()) || !startDate || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer la Roadmap
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Roadmap Display */}
      {roadmap && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Roadmap Générée</h3>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
              <Button onClick={handleSaveToArtifacts} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>

          {roadmap.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{roadmap.summary}</p>
              </CardContent>
            </Card>
          )}

          {roadmapFormat === 'chronological' && roadmap.items && (
            <ChronologicalRoadmapView items={roadmap.items} quarters={generateQuarters()} />
          )}

          {roadmapFormat === 'thematic' && roadmap.pillars && (
            <ThematicRoadmapView pillars={roadmap.pillars} />
          )}

          {roadmapFormat === 'now-next-later' && roadmap.now && roadmap.next && roadmap.later && (
            <NowNextLaterView now={roadmap.now} next={roadmap.next} later={roadmap.later} />
          )}

          {roadmapFormat === 'okr' && roadmap.okrs && (
            <OKRRoadmapView okrs={roadmap.okrs} />
          )}
        </div>
      )}
    </div>
  );
};
