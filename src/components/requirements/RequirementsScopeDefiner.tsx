import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Sparkles, Import } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RequirementsScopeDefinerProps {
  onSave?: (data: any) => void;
  onClose?: () => void;
}

export const RequirementsScopeDefiner = ({ onSave, onClose }: RequirementsScopeDefinerProps) => {
  const [context, setContext] = useState('');
  const [generatedScope, setGeneratedScope] = useState('');
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

      let importedContext = `Nom du projet: ${data.name}\n\n`;
      
      if (data.vision) {
        importedContext += `Vision:\n${data.vision}\n\n`;
      }
      
      if (data.objectives && Array.isArray(data.objectives) && data.objectives.length > 0) {
        importedContext += `Objectifs:\n${data.objectives.join('\n')}\n\n`;
      }
      
      if (data.target_audience) {
        importedContext += `Audience cible:\n${data.target_audience}\n\n`;
      }
      
      if (data.constraints) {
        importedContext += `Contraintes:\n${data.constraints}\n\n`;
      }
      
      if (data.target_kpis && Array.isArray(data.target_kpis) && data.target_kpis.length > 0) {
        importedContext += `KPIs:\n${data.target_kpis.join('\n')}`;
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
    if (!context.trim()) {
      toast.error('Veuillez fournir un contexte');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-requirements-scope', {
        body: { context }
      });

      if (error) throw error;
      setGeneratedScope(data.scope);
      toast.success('Périmètre généré avec succès');
    } catch (error: any) {
      console.error('Error generating scope:', error);
      toast.error('Erreur lors de la génération du périmètre');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedScope) {
      toast.error('Veuillez générer un périmètre d\'abord');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas',
        title: 'Définition du Périmètre',
        content: generatedScope,
        metadata: { context, workflowStep: 'requirements-scope' }
      });

      if (error) throw error;

      toast.success('Périmètre sauvegardé');
      onSave?.({ scope: generatedScope, context });
      onClose?.();
    } catch (error: any) {
      console.error('Error saving scope:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Définir le Périmètre du Projet</CardTitle>
          <CardDescription>
            Décrivez le contexte de votre projet pour générer une définition claire du périmètre
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Contexte du Projet
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
              placeholder="Exemple : Nous voulons créer une application mobile de gestion de tâches pour les équipes distribuées..."
              rows={6}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !context.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer le Périmètre
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedScope && (
        <Card>
          <CardHeader>
            <CardTitle>Périmètre Généré</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-secondary/50 p-4 rounded-lg">
                {generatedScope}
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
