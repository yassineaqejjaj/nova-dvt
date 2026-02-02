import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  CheckCircle2,
  Compass,
  FileText,
  Users,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  ProductContext, 
  ResearchIntent, 
  PersonaConfig, 
  GeneratedPersona,
  INTENT_OPTIONS 
} from './types';

interface StepFinalizeProps {
  context: ProductContext | null;
  intent: ResearchIntent;
  config: PersonaConfig;
  personas: GeneratedPersona[];
  productDescription: string;
  onBack: () => void;
  onReset: () => void;
}

export const StepFinalize = ({
  context,
  intent,
  config,
  personas,
  productDescription,
  onBack,
  onReset,
}: StepFinalizeProps) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [savedArtifactId, setSavedArtifactId] = useState<string | null>(null);

  const selectedPersonas = personas.filter(p => p.selected);

  const saveToArtifacts = async () => {
    if (selectedPersonas.length === 0) {
      toast.error("Aucun persona sélectionné");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const intentLabel = INTENT_OPTIONS.find(o => o.value === intent)?.label || '';

      const { data, error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Personas - ${context?.name || 'Sans contexte'} - ${new Date().toLocaleDateString('fr-FR')}`,
        content: { 
          personas: selectedPersonas,
          productDescription,
          config,
        },
        product_context_id: context?.id || null,
        metadata: { 
          type: 'user-personas',
          intent: intent,
          intentLabel,
          personaCount: selectedPersonas.length,
          generatedAt: new Date().toISOString(),
          contextName: context?.name,
        }
      } as any).select().single();

      if (error) throw error;
      
      setSavedArtifactId(data.id);
      toast.success("Personas sauvegardées dans les artefacts !");
    } catch (error) {
      console.error('Error saving artifact:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStepOptions = [
    {
      icon: Compass,
      title: 'Lancer une discovery',
      description: 'Utilisez ces personas pour cadrer votre recherche',
      action: () => navigate('/smart-discovery'),
    },
    {
      icon: FileText,
      title: 'Créer un Epic',
      description: 'Définissez des epics basés sur les besoins identifiés',
      action: () => navigate('/?tab=produire'),
    },
    {
      icon: Users,
      title: 'Générer des User Stories',
      description: 'Transformez les insights en stories actionnables',
      action: () => navigate('/?tab=produire'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">
              {selectedPersonas.length} persona{selectedPersonas.length > 1 ? 's' : ''} prêt{selectedPersonas.length > 1 ? 's' : ''} à être utilisé{selectedPersonas.length > 1 ? 's' : ''}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPersonas.map(persona => (
              <Badge key={persona.id} variant="secondary">
                {persona.name} - {persona.role}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={saveToArtifacts} disabled={isSaving || !!savedArtifactId}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : savedArtifactId ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {savedArtifactId ? 'Sauvegardé' : 'Sauvegarder dans les artefacts'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Utiliser ces personas pour...
          </CardTitle>
          <CardDescription>
            Ces personas sont maintenant prêts à être utilisés dans vos workflows Nova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {nextStepOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 px-4 flex flex-col items-start text-left gap-2"
                onClick={option.action}
              >
                <option.icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">{option.title}</div>
                  <p className="text-xs text-muted-foreground font-normal">
                    {option.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button variant="outline" onClick={onReset}>
          Créer d'autres personas
        </Button>
      </div>
    </div>
  );
};
