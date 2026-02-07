import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Trash2, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Artifact {
  id: string;
  title: string;
  artifact_type: string;
  content: any;
  metadata: any;
  created_at: string;
}

interface PRDArtifactsProps {
  prdId: string;
}

export const PRDArtifacts = ({ prdId }: PRDArtifactsProps) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArtifacts();
  }, [prdId]);

  const loadArtifacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('prd_id', prdId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setArtifacts((data || []) as unknown as Artifact[]);
    } catch (error) {
      console.error('Error loading artifacts:', error);
      toast.error('Erreur lors du chargement des artefacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (artifactId: string) => {
    try {
      const { error } = await supabase.from('artifacts').delete().eq('id', artifactId);

      if (error) throw error;

      setArtifacts((prev) => prev.filter((a) => a.id !== artifactId));
      toast.success('Artefact supprimé');
    } catch (error) {
      console.error('Error deleting artifact:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleExport = (artifact: Artifact) => {
    const dataStr = JSON.stringify(artifact.content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.title}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Artefact exporté');
  };

  const getArtifactTypeIcon = (type: string) => {
    return <FileText className="h-5 w-5" />;
  };

  const getArtifactTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: any }> = {
      canvas: { label: 'Canvas', variant: 'default' },
      wireframe: { label: 'Wireframe', variant: 'secondary' },
      user_flow: { label: 'User Flow', variant: 'outline' },
    };

    const typeInfo = typeMap[type] || { label: type, variant: 'default' };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Artefacts associés
        </CardTitle>
        <CardDescription>Tous les artefacts créés à partir de ce PRD</CardDescription>
      </CardHeader>
      <CardContent>
        {artifacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun artefact créé pour ce PRD</p>
            <p className="text-sm mt-1">Utilisez le bouton "Créer un artefact" pour commencer</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {artifacts.map((artifact) => (
                <Card key={artifact.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getArtifactTypeIcon(artifact.artifact_type)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{artifact.title}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Créé le {new Date(artifact.created_at).toLocaleDateString('fr-FR')}
                          </CardDescription>
                          <div className="mt-2">{getArtifactTypeBadge(artifact.artifact_type)}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExport(artifact)}
                          title="Exporter"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(artifact.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
