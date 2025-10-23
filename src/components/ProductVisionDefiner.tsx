import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, Users, TrendingUp, Plus, Trash2, Save, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

interface ProductVisionDefinerProps {
  activeWorkflow?: { type: string; currentStep: number } | null;
  onStepComplete?: (nextStep: number, context: any) => void;
  workflowContext?: Record<string, any>;
}

export const ProductVisionDefiner: React.FC<ProductVisionDefinerProps> = ({
  activeWorkflow,
  onStepComplete,
  workflowContext
}) => {
  const [visionStatement, setVisionStatement] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyObjectives, setKeyObjectives] = useState<string[]>(['']);
  const [successMetrics, setSuccessMetrics] = useState<string[]>(['']);
  const [strategicThemes, setStrategicThemes] = useState<string[]>(['']);
  const [timeHorizon, setTimeHorizon] = useState('12 months');
  const [isSaving, setIsSaving] = useState(false);

  const addObjective = () => {
    setKeyObjectives([...keyObjectives, '']);
  };

  const updateObjective = (index: number, value: string) => {
    const updated = [...keyObjectives];
    updated[index] = value;
    setKeyObjectives(updated);
  };

  const removeObjective = (index: number) => {
    setKeyObjectives(keyObjectives.filter((_, i) => i !== index));
  };

  const addMetric = () => {
    setSuccessMetrics([...successMetrics, '']);
  };

  const updateMetric = (index: number, value: string) => {
    const updated = [...successMetrics];
    updated[index] = value;
    setSuccessMetrics(updated);
  };

  const removeMetric = (index: number) => {
    setSuccessMetrics(successMetrics.filter((_, i) => i !== index));
  };

  const addTheme = () => {
    setStrategicThemes([...strategicThemes, '']);
  };

  const updateTheme = (index: number, value: string) => {
    const updated = [...strategicThemes];
    updated[index] = value;
    setStrategicThemes(updated);
  };

  const removeTheme = (index: number) => {
    setStrategicThemes(strategicThemes.filter((_, i) => i !== index));
  };

  const canSave = () => {
    return visionStatement.trim() && 
           targetAudience.trim() && 
           keyObjectives.some(obj => obj.trim());
  };

  const saveVision = async (andContinue: boolean = false) => {
    if (!canSave()) {
      toast.error("Veuillez remplir les champs requis");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const visionData = {
        visionStatement,
        targetAudience,
        keyObjectives: keyObjectives.filter(o => o.trim()),
        successMetrics: successMetrics.filter(m => m.trim()),
        strategicThemes: strategicThemes.filter(t => t.trim()),
        timeHorizon,
        createdAt: new Date().toISOString()
      };

      const { data: savedArtifact, error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Vision Produit - ${new Date().toLocaleDateString('fr-FR')}`,
        content: visionData,
        metadata: { 
          type: 'product-vision', 
          generatedAt: new Date().toISOString(),
          workflowStep: activeWorkflow?.currentStep
        }
      } as any).select().single();

      if (error) throw error;
      toast.success("Vision produit sauvegardée!");

      // If in a workflow and continuing to next step
      if (andContinue && activeWorkflow && onStepComplete && savedArtifact) {
        const updatedContext = {
          ...workflowContext,
          [`step_${activeWorkflow.currentStep}`]: savedArtifact,
          vision_artifact: savedArtifact,
          visionData
        };
        onStepComplete(activeWorkflow.currentStep + 1, updatedContext);
      }
    } catch (error) {
      console.error('Error saving vision:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Lightbulb className="w-8 h-8" />
            Définir la Vision Produit
          </h2>
          <p className="text-muted-foreground mt-2">
            Établissez les fondations stratégiques de votre roadmap
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          Stratégie
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vision Statement</CardTitle>
          <CardDescription>
            Décrivez la vision à long terme de votre produit (Où voulez-vous être ?)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vision">Vision Statement *</Label>
            <Textarea
              id="vision"
              value={visionStatement}
              onChange={(e) => setVisionStatement(e.target.value)}
              placeholder="Ex: Devenir la plateforme de référence pour..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Audience Cible *</Label>
            <Input
              id="audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Ex: PME du secteur tech, Product Managers..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horizon">Horizon Temporel</Label>
            <Input
              id="horizon"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              placeholder="Ex: 12 mois, 18 mois, 2 ans..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Objectifs Clés
          </CardTitle>
          <CardDescription>
            Quels sont les 3-5 objectifs stratégiques principaux ?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {keyObjectives.map((objective, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={objective}
                onChange={(e) => updateObjective(index, e.target.value)}
                placeholder={`Objectif ${index + 1}`}
              />
              {keyObjectives.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeObjective(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addObjective}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un objectif
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Métriques de Succès
          </CardTitle>
          <CardDescription>
            Comment mesurerez-vous le succès de cette vision ?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {successMetrics.map((metric, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={metric}
                onChange={(e) => updateMetric(index, e.target.value)}
                placeholder={`Métrique ${index + 1} (ex: +50% de rétention)`}
              />
              {successMetrics.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetric(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addMetric}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une métrique
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Thèmes Stratégiques
          </CardTitle>
          <CardDescription>
            Quels sont les grands thèmes qui guideront votre roadmap ?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {strategicThemes.map((theme, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={theme}
                onChange={(e) => updateTheme(index, e.target.value)}
                placeholder={`Thème ${index + 1} (ex: Acquisition, Rétention...)`}
              />
              {strategicThemes.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTheme(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addTheme}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un thème
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button 
          onClick={() => saveVision(false)} 
          disabled={isSaving || !canSave()}
          variant="outline"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Sauvegarder
        </Button>
        {activeWorkflow && onStepComplete && (
          <Button 
            onClick={() => saveVision(true)} 
            disabled={isSaving || !canSave()}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            Sauvegarder et Continuer
          </Button>
        )}
      </div>
    </div>
  );
};
