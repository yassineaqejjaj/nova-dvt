import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Sparkles, Import } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RequirementsPrioritizerProps {
  onSave?: (data: any) => void;
  onClose?: () => void;
}

export const RequirementsPrioritizer = ({ onSave, onClose }: RequirementsPrioritizerProps) => {
  const [requirements, setRequirements] = useState('');
  const [context, setContext] = useState('');
  const [prioritizedRequirements, setPrioritizedRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportContext = async () => {
    setIsImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      const { data, error } = await supabase
        .from('product_contexts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .single();

      if (error || !data) {
        toast.error('Aucun contexte actif trouvé');
        return;
      }

      let importedContext = '';
      
      if (data.constraints) {
        importedContext += `Contraintes:\n${data.constraints}\n\n`;
      }
      
      if (data.target_kpis && Array.isArray(data.target_kpis) && data.target_kpis.length > 0) {
        importedContext += `KPIs prioritaires:\n${data.target_kpis.join('\n')}`;
      }

      setContext(importedContext);
      toast.success('Contexte importé avec succès');
    } catch (error: any) {
      console.error('Error importing context:', error);
      toast.error('Erreur lors de l\'importation du contexte');
    } finally {
      setIsImporting(false);
    }
  };

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      toast.error('Veuillez fournir les exigences à prioriser');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('prioritize-requirements', {
        body: { requirements, context }
      });

      if (error) throw error;
      setPrioritizedRequirements(data.prioritized);
      toast.success('Exigences priorisées avec succès');
    } catch (error: any) {
      console.error('Error prioritizing requirements:', error);
      toast.error('Erreur lors de la priorisation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!prioritizedRequirements) {
      toast.error('Veuillez générer la priorisation d\'abord');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas',
        title: 'Exigences Priorisées',
        content: prioritizedRequirements,
        metadata: { requirements, context, workflowStep: 'requirements-prioritization' }
      });

      if (error) throw error;

      toast.success('Priorisation sauvegardée');
      onSave?.({ prioritized: prioritizedRequirements, requirements, context });
      onClose?.();
    } catch (error: any) {
      console.error('Error saving prioritization:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prioriser les Exigences</CardTitle>
          <CardDescription>
            Analysez et priorisez vos exigences avec la méthode MoSCoW et une matrice valeur/effort
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Exigences à Prioriser
            </label>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Collez ici la liste des exigences collectées..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Contexte Additionnel (optionnel)
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportContext}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <Import className="mr-2 h-3 w-3" />
                    Importer le Contexte
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Contraintes de temps, budget, ressources..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !requirements.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Priorisation en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Prioriser les Exigences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {prioritizedRequirements && (
        <Card>
          <CardHeader>
            <CardTitle>Exigences Priorisées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-secondary/50 p-4 rounded-lg">
                {prioritizedRequirements}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder et Continuer
                  </>
                )}
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Fermer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
