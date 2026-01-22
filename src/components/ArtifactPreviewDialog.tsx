import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Target, 
  Users, 
  CheckCircle2, 
  Layers, 
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  User,
  Workflow,
  ListChecks
} from 'lucide-react';

interface ArtifactPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifact: {
    id: string;
    title: string;
    artifact_type: string;
    content: any;
    metadata: any;
    created_at: string;
  } | null;
}

export const ArtifactPreviewDialog = ({ 
  open, 
  onOpenChange, 
  artifact 
}: ArtifactPreviewDialogProps) => {
  if (!artifact) return null;

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      canvas: <Layers className="w-5 h-5" />,
      story: <FileText className="w-5 h-5" />,
      epic: <Target className="w-5 h-5" />,
      impact_analysis: <TrendingUp className="w-5 h-5" />,
    };
    return icons[type] || <FileText className="w-5 h-5" />;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      canvas: 'Canvas',
      story: 'User Story',
      epic: 'Epic',
      impact_analysis: 'Analyse d\'Impact',
    };
    return labels[type] || type;
  };

  const renderCanvasContent = (content: any) => {
    if (!content) return null;
    
    const sections = [
      { key: 'problem', title: 'Problème', icon: AlertTriangle, color: 'text-amber-600' },
      { key: 'solution', title: 'Solution', icon: Lightbulb, color: 'text-green-600' },
      { key: 'keyMetrics', title: 'Métriques Clés', icon: TrendingUp, color: 'text-blue-600' },
      { key: 'uniqueValueProposition', title: 'Proposition de Valeur', icon: Target, color: 'text-primary' },
      { key: 'unfairAdvantage', title: 'Avantage Concurrentiel', icon: CheckCircle2, color: 'text-purple-600' },
      { key: 'channels', title: 'Canaux', icon: Workflow, color: 'text-indigo-600' },
      { key: 'customerSegments', title: 'Segments Clients', icon: Users, color: 'text-pink-600' },
      { key: 'costStructure', title: 'Structure de Coûts', icon: ListChecks, color: 'text-red-600' },
      { key: 'revenueStreams', title: 'Sources de Revenus', icon: TrendingUp, color: 'text-emerald-600' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(({ key, title, icon: Icon, color }) => {
          const value = content[key];
          if (!value) return null;
          
          return (
            <Card key={key} className="p-4">
              <div className={`flex items-center gap-2 mb-2 ${color}`}>
                <Icon className="w-4 h-4" />
                <h4 className="font-semibold text-sm">{title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {Array.isArray(value) ? value.join(', ') : value}
              </p>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderStoryContent = (content: any) => {
    if (!content) return null;

    return (
      <div className="space-y-4">
        {/* User Story Format */}
        {(content.asA || content.iWant || content.soThat) && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="space-y-2">
              {content.asA && (
                <p className="text-sm">
                  <span className="font-semibold text-primary">En tant que</span>{' '}
                  <span className="text-foreground">{content.asA}</span>
                </p>
              )}
              {content.iWant && (
                <p className="text-sm">
                  <span className="font-semibold text-primary">Je veux</span>{' '}
                  <span className="text-foreground">{content.iWant}</span>
                </p>
              )}
              {content.soThat && (
                <p className="text-sm">
                  <span className="font-semibold text-primary">Afin de</span>{' '}
                  <span className="text-foreground">{content.soThat}</span>
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Story Title/Description */}
        {content.title && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Titre
            </h4>
            <p className="text-sm text-muted-foreground">{content.title}</p>
          </div>
        )}

        {content.description && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </div>
        )}

        {/* Acceptance Criteria */}
        {content.acceptanceCriteria && content.acceptanceCriteria.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Critères d'Acceptation
            </h4>
            <ul className="space-y-1">
              {content.acceptanceCriteria.map((criteria: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-3 h-3 mt-1 text-green-600 shrink-0" />
                  <span className="text-muted-foreground">{criteria}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Size/Estimation */}
        {content.size && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Estimation:</span>
            <Badge variant="outline">{content.size}</Badge>
          </div>
        )}

        {/* Persona */}
        {content.persona && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Persona: {content.persona}</span>
          </div>
        )}
      </div>
    );
  };

  const renderEpicContent = (content: any) => {
    if (!content) return null;

    return (
      <div className="space-y-4">
        {content.objective && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Target className="w-4 h-4" />
              <h4 className="font-semibold text-sm">Objectif</h4>
            </div>
            <p className="text-sm">{content.objective}</p>
          </Card>
        )}

        {content.description && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </div>
        )}

        {content.expectedValue && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Valeur Attendue
            </h4>
            <p className="text-sm text-muted-foreground">{content.expectedValue}</p>
          </div>
        )}

        {content.persona && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Persona concerné: {content.persona}</span>
          </div>
        )}

        {content.indicators && content.indicators.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Indicateurs</h4>
            <div className="flex flex-wrap gap-2">
              {content.indicators.map((indicator: string, idx: number) => (
                <Badge key={idx} variant="secondary">{indicator}</Badge>
              ))}
            </div>
          </div>
        )}

        {content.stories && content.stories.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              User Stories ({content.stories.length})
            </h4>
            <div className="space-y-2">
              {content.stories.map((story: any, idx: number) => (
                <Card key={idx} className="p-3">
                  <p className="text-sm font-medium">{story.title || story.iWant || `Story ${idx + 1}`}</p>
                  {story.size && <Badge variant="outline" className="mt-1">{story.size}</Badge>}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderImpactAnalysisContent = (content: any) => {
    if (!content) return null;

    return (
      <div className="space-y-4">
        {content.summary && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-sm mb-2">Résumé</h4>
            <p className="text-sm">{content.summary}</p>
          </Card>
        )}

        {content.impactScore !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Score d'Impact:</span>
            <Badge variant={content.impactScore >= 7 ? 'default' : content.impactScore >= 4 ? 'secondary' : 'outline'}>
              {content.impactScore}/10
            </Badge>
          </div>
        )}

        {content.risks && content.risks.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              Risques
            </h4>
            <ul className="space-y-1">
              {content.risks.map((risk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-red-600">•</span>
                  <span className="text-muted-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.opportunities && content.opportunities.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-600">
              <Lightbulb className="w-4 h-4" />
              Opportunités
            </h4>
            <ul className="space-y-1">
              {content.opportunities.map((opp: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600">•</span>
                  <span className="text-muted-foreground">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.recommendations && content.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-4 h-4" />
              Recommandations
            </h4>
            <ol className="space-y-1 list-decimal list-inside">
              {content.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  const renderGenericContent = (content: any) => {
    if (typeof content === 'string') {
      return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>;
    }

    const renderValue = (value: any, depth: number = 0): React.ReactNode => {
      if (value === null || value === undefined) return null;
      
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return <span className="text-muted-foreground">{String(value)}</span>;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return (
          <ul className="space-y-1 mt-1">
            {value.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                {typeof item === 'object' ? renderValue(item, depth + 1) : <span>{item}</span>}
              </li>
            ))}
          </ul>
        );
      }

      if (typeof value === 'object') {
        return (
          <div className={`space-y-3 ${depth > 0 ? 'pl-4 border-l-2 border-muted' : ''}`}>
            {Object.entries(value).map(([key, val]) => {
              if (val === null || val === undefined) return null;
              const formattedKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
              
              return (
                <div key={key}>
                  <h5 className="font-medium text-sm text-foreground">{formattedKey}</h5>
                  <div className="text-sm mt-1">{renderValue(val, depth + 1)}</div>
                </div>
              );
            })}
          </div>
        );
      }

      return null;
    };

    return renderValue(content);
  };

  const renderContent = () => {
    const content = artifact.content;
    
    switch (artifact.artifact_type) {
      case 'canvas':
        return renderCanvasContent(content);
      case 'story':
        return renderStoryContent(content);
      case 'epic':
        return renderEpicContent(content);
      case 'impact_analysis':
        return renderImpactAnalysisContent(content);
      default:
        return renderGenericContent(content);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getTypeIcon(artifact.artifact_type)}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{artifact.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{getTypeLabel(artifact.artifact_type)}</Badge>
                <span className="text-xs text-muted-foreground">
                  Créé le {new Date(artifact.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="py-4">
            {renderContent()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
