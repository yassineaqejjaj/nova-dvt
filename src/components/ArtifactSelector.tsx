import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Target, Layers, TrendingUp, Loader2, Package, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Artifact {
  id: string;
  title: string;
  artifact_type: string;
  content: any;
  created_at: string;
}

interface ArtifactSelectorProps {
  selectedArtifacts: Artifact[];
  onSelectionChange: (artifacts: Artifact[]) => void;
  maxSelection?: number;
}

export const ArtifactSelector = ({
  selectedArtifacts,
  onSelectionChange,
  maxSelection = 5,
}: ArtifactSelectorProps) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadArtifacts();
    }
  }, [isOpen]);

  const loadArtifacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('artifacts')
        .select('id, title, artifact_type, content, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setArtifacts((data || []) as unknown as Artifact[]);
    } catch (error) {
      console.error('Error loading artifacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      canvas: <Layers className="w-4 h-4 text-blue-600" />,
      story: <FileText className="w-4 h-4 text-green-600" />,
      epic: <Target className="w-4 h-4 text-purple-600" />,
      impact_analysis: <TrendingUp className="w-4 h-4 text-amber-600" />,
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      canvas: 'Canvas',
      story: 'Story',
      epic: 'Epic',
      impact_analysis: 'Analyse',
    };
    return labels[type] || type;
  };

  const toggleArtifact = (artifact: Artifact) => {
    const isSelected = selectedArtifacts.some((a) => a.id === artifact.id);

    if (isSelected) {
      onSelectionChange(selectedArtifacts.filter((a) => a.id !== artifact.id));
    } else if (selectedArtifacts.length < maxSelection) {
      onSelectionChange([...selectedArtifacts, artifact]);
    }
  };

  const removeArtifact = (artifactId: string) => {
    onSelectionChange(selectedArtifacts.filter((a) => a.id !== artifactId));
  };

  return (
    <div className="space-y-2">
      {/* Selected Artifacts Display */}
      {selectedArtifacts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedArtifacts.map((artifact) => (
            <Badge key={artifact.id} variant="secondary" className="gap-1 pr-1">
              {getTypeIcon(artifact.artifact_type)}
              <span className="max-w-[120px] truncate">{artifact.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={() => removeArtifact(artifact.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Selector Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Package className="w-4 h-4" />
            {selectedArtifacts.length > 0
              ? `${selectedArtifacts.length} artefact${selectedArtifacts.length > 1 ? 's' : ''} sélectionné${selectedArtifacts.length > 1 ? 's' : ''}`
              : 'Ajouter des artefacts'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <h4 className="font-semibold text-sm">Sélectionner des artefacts</h4>
            <p className="text-xs text-muted-foreground">
              Les agents auront accès à ces artefacts pour leurs réponses
            </p>
          </div>

          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : artifacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun artefact disponible</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {artifacts.map((artifact) => {
                  const isSelected = selectedArtifacts.some((a) => a.id === artifact.id);
                  const isDisabled = !isSelected && selectedArtifacts.length >= maxSelection;

                  return (
                    <Card
                      key={artifact.id}
                      className={`p-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-primary/30'
                          : isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-muted/50'
                      }`}
                      onClick={() => !isDisabled && toggleArtifact(artifact)}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox checked={isSelected} disabled={isDisabled} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(artifact.artifact_type)}
                            <span className="font-medium text-sm truncate">{artifact.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(artifact.artifact_type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(artifact.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {selectedArtifacts.length > 0 && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => onSelectionChange([])}
              >
                Tout désélectionner
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Helper function to format artifact content for AI context
export const formatArtifactsForContext = (artifacts: Artifact[]): string => {
  if (artifacts.length === 0) return '';

  const sections = artifacts.map((artifact) => {
    let contentSummary = '';
    const content = artifact.content;

    if (typeof content === 'string') {
      contentSummary = content.substring(0, 2000);
    } else if (content) {
      // Smart content extraction based on type
      if (content.type === 'smart_discovery') {
        contentSummary = [
          content.reformulatedProblem && `Problème: ${content.reformulatedProblem}`,
          content.ideaDescription && `Idée: ${content.ideaDescription}`,
          content.discoveryData?.hypotheses &&
            `Hypothèses: ${content.discoveryData.hypotheses.join('; ')}`,
          content.discoveryData?.objectives &&
            `Objectifs: ${content.discoveryData.objectives.join('; ')}`,
          content.personas && `Personas: ${content.personas.map((p: any) => p.role).join(', ')}`,
        ]
          .filter(Boolean)
          .join('\n');
      } else if (content.type === 'discovery_stories' && content.stories) {
        contentSummary = content.stories
          .slice(0, 5)
          .map((s: any) => {
            const story = s.story || s;
            return `- ${s.title || ''}: En tant que ${story.asA || s.asA}, je veux ${story.iWant || s.iWant}`;
          })
          .join('\n');
      } else if (content.type === 'discovery_epic' && content.epic) {
        const epic = content.epic;
        contentSummary = [
          `Epic: ${epic.title}`,
          epic.objective && `Objectif: ${epic.objective}`,
          epic.expectedValue && `Valeur: ${epic.expectedValue}`,
          content.stories && `Stories: ${content.stories.length}`,
        ]
          .filter(Boolean)
          .join('\n');
      } else {
        // Generic extraction for canvas and other types
        const keys = [
          'problem',
          'solution',
          'objective',
          'description',
          'uniqueValueProposition',
          'summary',
        ];
        const extracted = keys
          .filter((k) => content[k])
          .map(
            (k) =>
              `${k}: ${typeof content[k] === 'string' ? content[k] : JSON.stringify(content[k]).substring(0, 500)}`
          )
          .join('\n');
        contentSummary = extracted || JSON.stringify(content).substring(0, 2000);
      }
    }

    return `
### Artefact: ${artifact.title} (${artifact.artifact_type})
${contentSummary}
`;
  });

  return `
=== ARTEFACTS DE CONTEXTE ===
Les artefacts suivants ont été sélectionnés pour enrichir cette discussion. 
Tu DOIS les consulter et les référencer dans tes réponses lorsque pertinent.

${sections.join('\n---\n')}
=== FIN DES ARTEFACTS ===
`;
};
