import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Folder,
  FileText,
  Download,
  Trash2,
  Loader2,
  FolderOpen,
  Eye,
  Target,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArtifactPreviewDialog } from './ArtifactPreviewDialog';

interface Artifact {
  id: string;
  title: string;
  artifact_type: string;
  content: any;
  metadata: any;
  created_at: string;
  prd_id: string | null;
}

interface ProductContext {
  id: string;
  name: string;
  vision: string;
}

interface ProjectFolder {
  context: ProductContext;
  artifacts: Artifact[];
}

export const ProjectArtifactsView = () => {
  const [projectFolders, setProjectFolders] = useState<ProjectFolder[]>([]);
  const [orphanArtifacts, setOrphanArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadProjectArtifacts();
  }, []);

  const loadProjectArtifacts = async () => {
    setIsLoading(true);
    try {
      const { data: contexts, error: contextsError } = await supabase
        .from('product_contexts')
        .select('id, name, vision')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (contextsError) throw contextsError;

      const { data: artifacts, error: artifactsError } = await supabase
        .from('artifacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (artifactsError) throw artifactsError;

      const folders: ProjectFolder[] = [];
      const orphans: Artifact[] = [];

      contexts?.forEach((context) => {
        const contextArtifacts =
          artifacts?.filter((art) => art.product_context_id === context.id) || [];

        if (contextArtifacts.length > 0) {
          folders.push({
            context: context as unknown as ProductContext,
            artifacts: contextArtifacts as unknown as Artifact[],
          });
        }
      });

      artifacts?.forEach((artifact) => {
        if (!artifact.product_context_id) {
          orphans.push(artifact as unknown as Artifact);
        }
      });

      setProjectFolders(folders);
      setOrphanArtifacts(orphans);
    } catch (error) {
      console.error('Error loading project artifacts:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleDelete = async (artifactId: string) => {
    try {
      const { error } = await supabase.from('artifacts').delete().eq('id', artifactId);

      if (error) throw error;

      await loadProjectArtifacts();
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

  const handlePreview = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setShowPreview(true);
  };

  const getArtifactTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      canvas: <Layers className="h-4 w-4" />,
      story: <FileText className="h-4 w-4" />,
      epic: <Target className="h-4 w-4" />,
      impact_analysis: <TrendingUp className="h-4 w-4" />,
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  const getArtifactTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'outline'; className?: string }
    > = {
      canvas: {
        label: 'Canvas',
        variant: 'default',
        className: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      },
      story: {
        label: 'User Story',
        variant: 'secondary',
        className: 'bg-green-500/20 text-green-700 border-green-500/30',
      },
      epic: {
        label: 'Epic',
        variant: 'outline',
        className: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      },
      impact_analysis: {
        label: 'Analyse',
        variant: 'secondary',
        className: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
      },
    };

    const typeInfo = typeMap[type] || { label: type, variant: 'default' as const };
    return (
      <Badge variant={typeInfo.variant} className={typeInfo.className}>
        {typeInfo.label}
      </Badge>
    );
  };

  const renderArtifactCard = (artifact: Artifact) => (
    <Card
      key={artifact.id}
      className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1" onClick={() => handlePreview(artifact)}>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {getArtifactTypeIcon(artifact.artifact_type)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                {artifact.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Créé le {new Date(artifact.created_at).toLocaleDateString('fr-FR')}
              </p>
              <div className="mt-2">{getArtifactTypeBadge(artifact.artifact_type)}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(artifact);
              }}
              title="Consulter"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleExport(artifact);
              }}
              title="Exporter"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(artifact.id);
              }}
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Artefacts par Projet
          </CardTitle>
          <CardDescription>Organisez et gérez vos artefacts par dossier projet</CardDescription>
        </CardHeader>
        <CardContent>
          {projectFolders.length === 0 && orphanArtifacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun artefact créé</p>
              <p className="text-sm mt-1">Créez des artefacts depuis vos PRDs ou workflows</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {projectFolders.map((folder) => (
                  <Collapsible
                    key={folder.context.id}
                    open={openFolders.has(folder.context.id)}
                    onOpenChange={() => toggleFolder(folder.context.id)}
                  >
                    <Card className="border-2">
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Folder className="h-5 w-5 text-primary" />
                              </div>
                              <div className="text-left">
                                <CardTitle className="text-lg">{folder.context.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {folder.artifacts.length} artefact
                                  {folder.artifacts.length > 1 ? 's' : ''}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="secondary">{folder.artifacts.length}</Badge>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="space-y-2 pt-0">
                          {folder.artifacts.map((artifact) => renderArtifactCard(artifact))}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}

                {orphanArtifacts.length > 0 && (
                  <Card className="border-dashed border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        Sans projet
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {orphanArtifacts.length} artefact{orphanArtifacts.length > 1 ? 's' : ''} non
                        classé{orphanArtifacts.length > 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {orphanArtifacts.map((artifact) => renderArtifactCard(artifact))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <ArtifactPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        artifact={selectedArtifact}
      />
    </div>
  );
};
