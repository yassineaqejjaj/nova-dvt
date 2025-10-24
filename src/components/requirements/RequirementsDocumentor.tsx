import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Sparkles, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RequirementsDocumentorProps {
  onSave?: (data: any) => void;
  onClose?: () => void;
}

export const RequirementsDocumentor = ({ onSave, onClose }: RequirementsDocumentorProps) => {
  const [requirements, setRequirements] = useState('');
  const [context, setContext] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      toast.error('Veuillez fournir les exigences priorisées');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('document-requirements', {
        body: { requirements, context }
      });

      if (error) throw error;
      setDocumentation(data.documentation);
      toast.success('Documentation générée avec succès');
    } catch (error: any) {
      console.error('Error generating documentation:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!documentation) {
      toast.error('Veuillez générer la documentation d\'abord');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas',
        title: 'Spécifications Complètes',
        content: documentation,
        metadata: { requirements, context, workflowStep: 'requirements-documentation' }
      });

      if (error) throw error;

      toast.success('Documentation sauvegardée');
      onSave?.({ documentation, requirements, context });
      onClose?.();
    } catch (error: any) {
      console.error('Error saving documentation:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([documentation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'specifications-produit.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Documentation exportée');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documenter les Spécifications</CardTitle>
          <CardDescription>
            Générez un document de spécifications complet et structuré
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Exigences Priorisées
            </label>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Collez ici les exigences priorisées..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Contexte Complet (optionnel)
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Informations additionnelles, périmètre, contraintes..."
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
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer la Documentation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {documentation && (
        <Card>
          <CardHeader>
            <CardTitle>Documentation Générée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-secondary/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                {documentation}
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
                    Sauvegarder
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
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
