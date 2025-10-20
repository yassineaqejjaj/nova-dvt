import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Upload, Sparkles, FileText, Loader2, Download, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RoadmapItem {
  quarter: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface RoadmapResult {
  items: RoadmapItem[];
  summary: string;
}

export const DocumentRoadmapGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState('');
  const [periodType, setPeriodType] = useState<'quarter' | 'month'>('quarter');
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
    if (!file || !startDate) {
      toast.error('Veuillez uploader un document et sélectionner une date de début');
      return;
    }

    setIsGenerating(true);

    try {
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
            periodType
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

      const { error } = await supabase.from('artifacts').insert([{
        user_id: user.id,
        artifact_type: 'epic',
        title: `Roadmap - ${file?.name || 'Document'}`,
        content: roadmap as any,
        metadata: {
          generatedAt: new Date().toISOString(),
          startDate,
          periodType,
          documentName: file?.name,
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
          <CardDescription>Uploadez votre document et configurez les paramètres de la roadmap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
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
          </div>

          <Button 
            onClick={handleGenerateRoadmap} 
            disabled={!file || !startDate || isGenerating}
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
            <Button onClick={handleSaveToArtifacts} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
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

          <div className="grid gap-6">
            {generateQuarters().map(quarter => {
              const quarterItems = roadmap.items.filter(item => item.quarter === quarter);
              
              return (
                <Card key={quarter}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{quarter}</span>
                      <Badge variant="outline">{quarterItems.length} items</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quarterItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucun item pour cette période
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {quarterItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">{item.title}</h4>
                                <Badge variant={getPriorityColor(item.priority)}>
                                  {item.priority}
                                </Badge>
                                {item.category && (
                                  <Badge variant="outline">{item.category}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
