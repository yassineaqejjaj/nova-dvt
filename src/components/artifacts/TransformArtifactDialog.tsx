import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Loader2, Check, AlertCircle, ChevronRight, 
  FileText, Layers, Code, TrendingUp, Edit2, RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Artifact } from '@/types';
import { cn } from '@/lib/utils';

interface GeneratedArtifact {
  type: string;
  title: string;
  content: any;
  selected: boolean;
  editedTitle?: string;
}

interface TransformArtifactDialogProps {
  open: boolean;
  onClose: () => void;
  sourceArtifact: Artifact | null;
  targetType: string;
  userId: string;
  onSaveComplete: () => void;
}

type Step = 'configure' | 'generating' | 'preview';

const TARGET_TYPE_INFO: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  epic: { 
    label: 'Epics', 
    icon: <Layers className="w-4 h-4" />,
    description: 'Extraire des Epics stratégiques avec objectifs et indicateurs'
  },
  story: { 
    label: 'User Stories', 
    icon: <FileText className="w-4 h-4" />,
    description: 'Générer des User Stories avec critères d\'acceptation'
  },
  tech_spec: { 
    label: 'Spécification Technique', 
    icon: <Code className="w-4 h-4" />,
    description: 'Créer une spec technique avec architecture et APIs'
  },
  impact_analysis: { 
    label: 'Analyse d\'Impact', 
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Analyser l\'impact utilisateur, business et technique'
  },
};

export const TransformArtifactDialog: React.FC<TransformArtifactDialogProps> = ({
  open,
  onClose,
  sourceArtifact,
  targetType,
  userId,
  onSaveComplete
}) => {
  const [step, setStep] = useState<Step>('configure');
  const [generatedArtifacts, setGeneratedArtifacts] = useState<GeneratedArtifact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Configuration options
  const [focusAreas, setFocusAreas] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [count, setCount] = useState<number | undefined>(undefined);

  const resetState = () => {
    setStep('configure');
    setGeneratedArtifacts([]);
    setError(null);
    setFocusAreas('');
    setAdditionalContext('');
    setCount(undefined);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleGenerate = async () => {
    if (!sourceArtifact) return;
    
    setStep('generating');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('transform-artifact', {
        body: {
          sourceArtifact: {
            id: sourceArtifact.id,
            title: sourceArtifact.title,
            content: sourceArtifact.content,
            artifact_type: sourceArtifact.artifact_type
          },
          targetType,
          options: {
            focusAreas: focusAreas ? focusAreas.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            context: additionalContext || undefined,
            count: count || undefined
          }
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erreur lors de la génération');
      }

      if (!data?.success || !data?.artifacts?.length) {
        throw new Error(data?.error || 'Aucun artefact généré');
      }

      setGeneratedArtifacts(
        data.artifacts.map((a: any) => ({
          ...a,
          selected: true,
          editedTitle: a.title
        }))
      );
      setStep('preview');

    } catch (err: any) {
      console.error('Transform error:', err);
      setError(err.message || 'Erreur lors de la transformation');
      setStep('configure');
    }
  };

  const handleSave = async () => {
    const selectedArtifacts = generatedArtifacts.filter(a => a.selected);
    if (selectedArtifacts.length === 0) {
      toast({ title: 'Erreur', description: 'Sélectionnez au moins un artefact', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const inserts = selectedArtifacts.map(artifact => ({
        user_id: userId,
        artifact_type: artifact.type as any,
        title: artifact.editedTitle || artifact.title,
        content: artifact.content,
        metadata: {
          source_artifact_id: sourceArtifact?.id,
          workflow_source: 'AI Transformation',
          status: 'draft'
        },
        squad_id: (sourceArtifact as any)?.squad_id || null,
        product_context_id: (sourceArtifact as any)?.product_context_id || null
      }));

      const { error: insertError } = await supabase
        .from('artifacts')
        .insert(inserts);

      if (insertError) throw insertError;

      toast({
        title: 'Succès',
        description: `${selectedArtifacts.length} artefact(s) créé(s) avec succès`
      });

      handleClose();
      onSaveComplete();

    } catch (err: any) {
      console.error('Save error:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Échec de la sauvegarde',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleArtifactSelection = (index: number) => {
    setGeneratedArtifacts(prev => 
      prev.map((a, i) => i === index ? { ...a, selected: !a.selected } : a)
    );
  };

  const updateArtifactTitle = (index: number, newTitle: string) => {
    setGeneratedArtifacts(prev =>
      prev.map((a, i) => i === index ? { ...a, editedTitle: newTitle } : a)
    );
  };

  const formatContentPreview = (content: any, type: string): string => {
    if (type === 'epic') {
      return `${content.description || ''}\n\nObjectif: ${content.objective || 'Non défini'}\nPriorité: ${content.priority || 'medium'}`;
    }
    if (type === 'story') {
      const story = content.story || content;
      return `En tant que ${story.asA || '...'}\nJe veux ${story.iWant || '...'}\nAfin de ${story.soThat || '...'}\n\nCritères: ${(content.acceptanceCriteria || []).slice(0, 2).join(', ')}${(content.acceptanceCriteria?.length || 0) > 2 ? '...' : ''}`;
    }
    if (type === 'tech_spec') {
      return content.overview?.slice(0, 300) || JSON.stringify(content).slice(0, 300);
    }
    if (type === 'impact_analysis') {
      return content.summary?.slice(0, 300) || JSON.stringify(content).slice(0, 300);
    }
    return JSON.stringify(content, null, 2).slice(0, 300);
  };

  const targetInfo = TARGET_TYPE_INFO[targetType] || { label: targetType, icon: <FileText className="w-4 h-4" />, description: '' };
  const selectedCount = generatedArtifacts.filter(a => a.selected).length;

  if (!sourceArtifact) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Transformation IA
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {targetInfo.icon}
            {targetInfo.label}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-3">
          <Badge variant={step === 'configure' ? 'default' : 'secondary'} className="text-xs">
            1. Configuration
          </Badge>
          <ChevronRight className="w-3 h-3" />
          <Badge variant={step === 'generating' ? 'default' : 'secondary'} className="text-xs">
            2. Génération
          </Badge>
          <ChevronRight className="w-3 h-3" />
          <Badge variant={step === 'preview' ? 'default' : 'secondary'} className="text-xs">
            3. Validation
          </Badge>
        </div>

        <ScrollArea className="flex-1 pr-4">
          {/* Step 1: Configuration */}
          {step === 'configure' && (
            <div className="space-y-6 py-4">
              {/* Source preview */}
              <div>
                <Label className="text-sm font-medium">Artefact source</Label>
                <Card className="mt-2">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {sourceArtifact.artifact_type}
                      </Badge>
                      {sourceArtifact.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6">
                      {typeof sourceArtifact.content === 'string' 
                        ? sourceArtifact.content.slice(0, 500)
                        : JSON.stringify(sourceArtifact.content, null, 2).slice(0, 500)}
                      {(typeof sourceArtifact.content === 'string' 
                        ? sourceArtifact.content.length 
                        : JSON.stringify(sourceArtifact.content).length) > 500 && '...'}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Target info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {targetInfo.icon}
                  <span className="font-medium">{targetInfo.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{targetInfo.description}</p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="focusAreas">Domaines de focus (optionnel)</Label>
                  <Input
                    id="focusAreas"
                    placeholder="ex: authentification, performance, UX (séparés par des virgules)"
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="context">Contexte additionnel (optionnel)</Label>
                  <Textarea
                    id="context"
                    placeholder="Informations supplémentaires pour guider la génération..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                {(targetType === 'epic' || targetType === 'story') && (
                  <div>
                    <Label htmlFor="count">Nombre d'éléments (optionnel)</Label>
                    <Input
                      id="count"
                      type="number"
                      min={1}
                      max={10}
                      placeholder="Auto (2-7 selon le contenu)"
                      value={count || ''}
                      onChange={(e) => setCount(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="mt-1.5 w-32"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Generating */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Génération en cours...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Transformation de "{sourceArtifact.title}" en {targetInfo.label}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {generatedArtifacts.length} artefact(s) généré(s) • {selectedCount} sélectionné(s)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('configure')}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Régénérer
                </Button>
              </div>

              <div className="space-y-3">
                {generatedArtifacts.map((artifact, index) => (
                  <Card 
                    key={index} 
                    className={cn(
                      "transition-all",
                      artifact.selected ? "ring-2 ring-primary/30" : "opacity-60"
                    )}
                  >
                    <CardHeader className="py-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={artifact.selected}
                          onCheckedChange={() => toggleArtifactSelection(index)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {TARGET_TYPE_INFO[artifact.type]?.label || artifact.type}
                            </Badge>
                            {artifact.content.priority && (
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs", {
                                  "bg-red-500/20 text-red-700": artifact.content.priority === 'high',
                                  "bg-amber-500/20 text-amber-700": artifact.content.priority === 'medium',
                                  "bg-green-500/20 text-green-700": artifact.content.priority === 'low',
                                })}
                              >
                                {artifact.content.priority}
                              </Badge>
                            )}
                          </div>
                          <Input
                            value={artifact.editedTitle || artifact.title}
                            onChange={(e) => updateArtifactTitle(index, e.target.value)}
                            className="text-sm font-medium h-8"
                            disabled={!artifact.selected}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 pl-10">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {formatContentPreview(artifact.content, artifact.type)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          
          {step === 'configure' && (
            <Button onClick={handleGenerate}>
              <Sparkles className="w-4 h-4 mr-2" />
              Générer
            </Button>
          )}
          
          {step === 'preview' && (
            <Button onClick={handleSave} disabled={saving || selectedCount === 0}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Sauvegarder {selectedCount > 0 && `(${selectedCount})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
