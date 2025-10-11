import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Target, TrendingUp, Calculator, Clock, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface KPI {
  name: string;
  category: 'adoption' | 'engagement' | 'performance' | 'revenue';
  formula: string;
  target: string;
  measurementMethod: string;
  trackingFrequency: string;
}

interface KPIGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: {
    projectContext?: string;
    featureDescription?: string;
    objective?: string;
  };
}

export const KPIGenerator = ({ open, onOpenChange, context }: KPIGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKPIs, setGeneratedKPIs] = useState<KPI[]>([]);
  
  const [formData, setFormData] = useState({
    projectContext: context?.projectContext || '',
    featureDescription: context?.featureDescription || '',
    objective: context?.objective || '',
    existingOKRs: ''
  });

  const getCategoryColor = (category: KPI['category']): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<KPI['category'], "default" | "destructive" | "outline" | "secondary"> = {
      adoption: 'default',
      engagement: 'secondary',
      performance: 'outline',
      revenue: 'destructive'
    };
    return colors[category];
  };

  const getCategoryIcon = (category: KPI['category']) => {
    const icons = {
      adoption: TrendingUp,
      engagement: Target,
      performance: BarChart3,
      revenue: Calculator
    };
    return icons[category];
  };

  const handleGenerate = async () => {
    if (!formData.featureDescription || !formData.objective) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir au minimum la description de la feature et l'objectif.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `En tant qu'expert en Product Management, génère 3 à 5 KPIs pertinents pour l'initiative suivante :

Contexte projet : ${formData.projectContext || 'Non spécifié'}
Description de la feature : ${formData.featureDescription}
Objectif : ${formData.objective}
OKRs existants : ${formData.existingOKRs || 'Non spécifiés'}

Pour chaque KPI, fournis :
1. Nom du KPI (court et précis)
2. Catégorie (adoption, engagement, performance, ou revenue)
3. Formule de calcul (formule mathématique claire)
4. Cible réaliste (avec unité)
5. Méthode de mesure (comment le mesurer concrètement)
6. Fréquence de tracking (daily, weekly, monthly, quarterly)

Format ta réponse en JSON : 
{
  "kpis": [
    {
      "name": "string",
      "category": "adoption|engagement|performance|revenue",
      "formula": "string",
      "target": "string",
      "measurementMethod": "string",
      "trackingFrequency": "string"
    }
  ]
}`;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: prompt,
          systemPrompt: "Tu es un expert en Product Management et en définition de KPIs. Réponds toujours en JSON valide."
        }
      });

      if (error) throw error;

      const response = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
      setGeneratedKPIs(response.kpis || []);
      
      toast({
        title: "KPIs générés",
        description: `${response.kpis?.length || 0} KPIs ont été générés avec succès.`
      });
    } catch (error) {
      console.error('Error generating KPIs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les KPIs. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Générateur de KPI
          </DialogTitle>
          <DialogDescription>
            Générez des indicateurs de performance pertinents pour votre initiative produit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectContext">Contexte du projet</Label>
              <Textarea
                id="projectContext"
                placeholder="Décrivez le contexte global du projet..."
                value={formData.projectContext}
                onChange={(e) => setFormData({ ...formData, projectContext: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featureDescription">Description de la feature *</Label>
              <Textarea
                id="featureDescription"
                placeholder="Décrivez la feature ou l'initiative à mesurer..."
                value={formData.featureDescription}
                onChange={(e) => setFormData({ ...formData, featureDescription: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objectif *</Label>
              <Input
                id="objective"
                placeholder="Ex: Augmenter l'engagement utilisateur de 20%"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="existingOKRs">OKRs existants (optionnel)</Label>
              <Textarea
                id="existingOKRs"
                placeholder="Listez les OKRs existants pour un meilleur alignement..."
                value={formData.existingOKRs}
                onChange={(e) => setFormData({ ...formData, existingOKRs: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Générer les KPIs
              </>
            )}
          </Button>

          {generatedKPIs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">KPIs suggérés</h3>
              <div className="grid gap-4">
                {generatedKPIs.map((kpi, index) => {
                  const Icon = getCategoryIcon(kpi.category);
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {kpi.name}
                            </CardTitle>
                            <CardDescription>
                              <Badge variant={getCategoryColor(kpi.category)}>
                                {kpi.category}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <Calculator className="h-3 w-3" />
                            Formule
                          </div>
                          <p className="text-sm text-muted-foreground">{kpi.formula}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <Target className="h-3 w-3" />
                            Cible
                          </div>
                          <p className="text-sm text-muted-foreground">{kpi.target}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <BarChart3 className="h-3 w-3" />
                            Méthode de mesure
                          </div>
                          <p className="text-sm text-muted-foreground">{kpi.measurementMethod}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <Clock className="h-3 w-3" />
                            Fréquence de tracking
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{kpi.trackingFrequency}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
