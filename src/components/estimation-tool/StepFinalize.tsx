import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Download, FileSpreadsheet, Loader2, CheckCircle2, Zap, Clock, ArrowRight, Target, Layers } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimation, EstimationContext, ConfidenceLevel, COMPLEXITY_CONFIG } from "./types";

interface StepFinalizeProps {
  estimations: Estimation[];
  context: EstimationContext | null;
  confidenceLevel: ConfidenceLevel;
  onBack: () => void;
  onComplete: () => void;
}

export const StepFinalize = ({ 
  estimations, 
  context, 
  confidenceLevel,
  onBack, 
  onComplete 
}: StepFinalizeProps) => {
  const [selectedEstimations, setSelectedEstimations] = useState<Set<number>>(
    new Set(estimations.map((_, i) => i))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleEstimation = (index: number) => {
    const newSelected = new Set(selectedEstimations);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEstimations(newSelected);
  };

  const toggleAll = () => {
    if (selectedEstimations.size === estimations.length) {
      setSelectedEstimations(new Set());
    } else {
      setSelectedEstimations(new Set(estimations.map((_, i) => i)));
    }
  };

  const selectedItems = estimations.filter((_, i) => selectedEstimations.has(i));
  const totalPoints = selectedItems.reduce((sum, est) => sum + est.storyPoints, 0);
  const totalHoursMin = selectedItems.reduce((sum, est) => sum + est.hours.min, 0);
  const totalHoursMax = selectedItems.reduce((sum, est) => sum + est.hours.max, 0);

  const saveAsArtifact = async () => {
    if (selectedEstimations.size === 0) {
      toast.error("Sélectionnez au moins une estimation");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Estimations - ${context?.name || 'Sans contexte'} - ${new Date().toLocaleDateString('fr-FR')}`,
        content: { 
          estimations: selectedItems,
          summary: { totalPoints, totalHoursMin, totalHoursMax }
        },
        metadata: { 
          type: 'estimations',
          context_name: context?.name,
          confidence_level: confidenceLevel,
          generated_at: new Date().toISOString(),
          count: selectedItems.length
        }
      } as any);

      if (error) throw error;
      setSaved(true);
      toast.success("Estimations sauvegardées dans les artifacts!");
    } catch (error) {
      console.error('Error saving artifact:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Feature', 'Complexity', 'Story Points', 'Hours Min', 'Hours Max', 'Confidence', 'Reasoning'];
    const rows = selectedItems.map(est => [
      est.feature,
      est.complexity,
      est.storyPoints,
      est.hours.min,
      est.hours.max,
      est.confidence,
      `"${est.reasoning.replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  const confidenceColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-red-100 text-red-800'
  };

  const confidenceLabels = {
    high: 'Confiance élevée',
    medium: 'Confiance moyenne',
    low: 'Confiance faible'
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Finaliser les Estimations</h2>
        <p className="text-muted-foreground mt-2">
          Sélectionnez les estimations à sauvegarder et choisissez votre format d'export
        </p>
      </div>

      {/* Summary */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{selectedEstimations.size}</p>
              <p className="text-xs text-muted-foreground">Sélectionnées</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
              <p className="text-xs text-muted-foreground">Story Points</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-2xl font-bold">{totalHoursMin}-{totalHoursMax}h</p>
              </div>
              <p className="text-xs text-muted-foreground">Estimation temps</p>
            </div>
            <div>
              <Badge className={confidenceColors[confidenceLevel]}>
                {confidenceLabels[confidenceLevel]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Estimations à sauvegarder</CardTitle>
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              {selectedEstimations.size === estimations.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {estimations.map((estimation, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedEstimations.has(index) ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
              }`}
              onClick={() => toggleEstimation(index)}
            >
              <Checkbox
                checked={selectedEstimations.has(index)}
                onCheckedChange={() => toggleEstimation(index)}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{estimation.feature}</p>
                <p className="text-xs text-muted-foreground">
                  {estimation.hours.min}-{estimation.hours.max}h · {estimation.confidence}
                </p>
              </div>
              <Badge className={COMPLEXITY_CONFIG[estimation.complexity].color}>
                {estimation.complexity}
              </Badge>
              <Badge variant="outline">{estimation.storyPoints} pts</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={saveAsArtifact}
            disabled={isSaving || selectedEstimations.size === 0}
            className="w-full gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Sauvegardé!' : 'Sauvegarder dans les Artifacts'}
          </Button>

          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={selectedEstimations.size === 0}
            className="w-full gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exporter en CSV
          </Button>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Utiliser ces estimations</CardTitle>
          <CardDescription>Continuez votre travail avec ces estimations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={onComplete}>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Sprint Planning</p>
              <p className="text-xs text-muted-foreground">Organiser ces éléments en sprint</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>

          <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={onComplete}>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Roadmap</p>
              <p className="text-xs text-muted-foreground">Intégrer à la roadmap produit</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button onClick={onComplete} className="gap-2">
          Terminer
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
