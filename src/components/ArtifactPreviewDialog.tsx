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
    metadata?: any;
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

    // Handle smart_discovery type
    if (content.type === 'smart_discovery') {
      return (
        <div className="space-y-4">
          {/* Reformulated Problem */}
          {content.reformulatedProblem && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Target className="w-4 h-4" />
                <h4 className="font-semibold text-sm">Problème reformulé</h4>
              </div>
              <p className="text-sm">{content.reformulatedProblem}</p>
            </Card>
          )}

          {/* Idea Description */}
          {content.ideaDescription && (
            <div>
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Idée initiale
              </h4>
              <p className="text-sm text-muted-foreground">{content.ideaDescription}</p>
            </div>
          )}

          {/* Discovery Data */}
          {content.discoveryData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.discoveryData.hypotheses && content.discoveryData.hypotheses.length > 0 && (
                <Card className="p-3">
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-1 text-blue-600">
                    <Lightbulb className="w-4 h-4" />
                    Hypothèses
                  </h5>
                  <ul className="space-y-1">
                    {content.discoveryData.hypotheses.map((h: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600">•</span>
                        <span className="text-muted-foreground">{h}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {content.discoveryData.objectives && content.discoveryData.objectives.length > 0 && (
                <Card className="p-3">
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-1 text-green-600">
                    <Target className="w-4 h-4" />
                    Objectifs
                  </h5>
                  <ul className="space-y-1">
                    {content.discoveryData.objectives.map((o: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-3 h-3 mt-1 text-green-600 shrink-0" />
                        <span className="text-muted-foreground">{o}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {content.discoveryData.constraints && content.discoveryData.constraints.length > 0 && (
                <Card className="p-3">
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    Contraintes
                  </h5>
                  <ul className="space-y-1">
                    {content.discoveryData.constraints.map((c: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-red-600">•</span>
                        <span className="text-muted-foreground">{c}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {content.discoveryData.indicators && content.discoveryData.indicators.length > 0 && (
                <Card className="p-3">
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-1 text-purple-600">
                    <TrendingUp className="w-4 h-4" />
                    Indicateurs
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {content.discoveryData.indicators.map((i: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{i}</Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Personas */}
          {content.personas && content.personas.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Personas ({content.personas.length})
              </h4>
              <div className="grid gap-2">
                {content.personas.map((p: any, idx: number) => (
                  <Card key={idx} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{p.role}</span>
                    </div>
                    {p.mainObjective && (
                      <p className="text-xs text-muted-foreground">Objectif: {p.mainObjective}</p>
                    )}
                    {p.keyFrustration && (
                      <p className="text-xs text-red-600">Frustration: {p.keyFrustration}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Journey Needs */}
          {content.journeyNeeds && content.journeyNeeds.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-primary" />
                Parcours & Besoins ({content.journeyNeeds.length})
              </h4>
              <div className="space-y-2">
                {content.journeyNeeds.map((j: any, idx: number) => (
                  <Card key={idx} className="p-3">
                    <p className="font-medium text-sm">{j.situation}</p>
                    {j.needs && j.needs.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {j.needs.map((n: string, nIdx: number) => (
                          <Badge key={nIdx} variant="outline" className="text-xs">{n}</Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Standard Lean Canvas sections
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

    // Check if any standard section exists
    const hasStandardSections = sections.some(({ key }) => content[key]);
    
    if (hasStandardSections) {
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
                {Array.isArray(value) ? (
                  <ul className="space-y-1">
                    {value.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className={color}>•</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{value}</p>
                )}
              </Card>
            );
          })}
        </div>
      );
    }

    // Fallback to generic content rendering for other canvas types
    return renderGenericContent(content);
  };

  // Helper to render a single user story
  const renderSingleStory = (story: any, idx?: number) => {
    const storyData = story.story || story;
    const asA = storyData.asA || story.asA;
    const iWant = storyData.iWant || story.iWant;
    const soThat = storyData.soThat || story.soThat;
    
    return (
      <Card key={idx} className="p-4">
        <div className="space-y-3">
          {/* Title */}
          {story.title && (
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {story.title}
            </h4>
          )}
          
          {/* User Story Format */}
          {(asA || iWant || soThat) && (
            <div className="bg-primary/5 p-3 rounded-lg space-y-1 text-sm">
              {asA && (
                <p><span className="font-semibold text-primary">En tant que</span> {asA}</p>
              )}
              {iWant && (
                <p><span className="font-semibold text-primary">Je veux</span> {iWant}</p>
              )}
              {soThat && (
                <p><span className="font-semibold text-primary">Afin de</span> {soThat}</p>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {story.tshirtSize && <Badge variant="outline">{story.tshirtSize}</Badge>}
            {story.priority && (
              <Badge variant={story.priority === 'high' ? 'destructive' : story.priority === 'medium' ? 'default' : 'secondary'}>
                {story.priority === 'high' ? 'Haute' : story.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </Badge>
            )}
            {story.personaRole && (
              <Badge variant="outline" className="gap-1">
                <User className="w-3 h-3" />
                {story.personaRole}
              </Badge>
            )}
          </div>

          {/* Acceptance Criteria */}
          {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Critères d'acceptation
              </p>
              <ul className="space-y-1">
                {story.acceptanceCriteria.map((criteria: string, cIdx: number) => (
                  <li key={cIdx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-3 h-3 mt-1 text-green-600 shrink-0" />
                    <span className="text-muted-foreground">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impact & Indicators */}
          {(story.impact || (story.indicators && story.indicators.length > 0)) && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {story.impact && (
                <div>
                  <p className="font-medium flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Target className="w-3 h-3" />
                    Impact
                  </p>
                  <p className="text-sm">{story.impact}</p>
                </div>
              )}
              {story.indicators && story.indicators.length > 0 && (
                <div>
                  <p className="font-medium flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Indicateurs
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {story.indicators.map((ind: string, iIdx: number) => (
                      <Badge key={iIdx} variant="secondary" className="text-xs">{ind}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderStoryContent = (content: any) => {
    if (!content) return null;

    // Handle discovery_stories type (collection of stories)
    if (content.type === 'discovery_stories' && content.stories) {
      return (
        <div className="space-y-4">
          {content.epics && content.epics.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Epics associés
              </p>
              <div className="flex flex-wrap gap-2">
                {content.epics.map((epic: any, idx: number) => (
                  <Badge key={idx} variant="outline">{epic.title}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {content.stories.length} User Stories
          </p>
          
          <div className="space-y-3">
            {content.stories.map((story: any, idx: number) => renderSingleStory(story, idx))}
          </div>
        </div>
      );
    }

    // Handle single story with nested structure
    if (content.asA || content.iWant || content.soThat || content.story) {
      return renderSingleStory(content);
    }

    // Handle array of stories
    if (Array.isArray(content)) {
      return (
        <div className="space-y-3">
          {content.map((story: any, idx: number) => renderSingleStory(story, idx))}
        </div>
      );
    }

    return renderGenericContent(content);
  };

  // Helper to render a single epic
  const renderSingleEpic = (epic: any, idx?: number) => {
    return (
      <Card key={idx} className="p-4">
        <div className="space-y-3">
          {epic.title && (
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {epic.title}
            </h4>
          )}
          
          {epic.objective && (
            <div className="bg-primary/5 p-3 rounded-lg">
              <p className="text-xs font-semibold text-primary mb-1">Objectif</p>
              <p className="text-sm">{epic.objective}</p>
            </div>
          )}

          {epic.description && (
            <p className="text-sm text-muted-foreground">{epic.description}</p>
          )}

          {epic.expectedValue && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                Valeur Attendue
              </p>
              <p className="text-sm">{epic.expectedValue}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {epic.personaRole && (
              <Badge variant="outline" className="gap-1">
                <User className="w-3 h-3" />
                {epic.personaRole}
              </Badge>
            )}
          </div>

          {epic.indicators && epic.indicators.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Indicateurs</p>
              <div className="flex flex-wrap gap-1">
                {epic.indicators.map((ind: string, iIdx: number) => (
                  <Badge key={iIdx} variant="secondary" className="text-xs">{ind}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderEpicContent = (content: any) => {
    if (!content) return null;

    // Handle discovery_epic type (epic with embedded stories)
    if (content.type === 'discovery_epic' && content.epic) {
      const epic = content.epic;
      const stories = content.stories || [];
      
      return (
        <div className="space-y-4">
          {renderSingleEpic(epic)}
          
          {stories.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                User Stories associées ({stories.length})
              </h4>
              <div className="space-y-3">
                {stories.map((story: any, idx: number) => renderSingleStory(story, idx))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle direct epic content
    if (content.objective || content.title || content.description) {
      return (
        <div className="space-y-4">
          {renderSingleEpic(content)}
          
          {content.stories && content.stories.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                User Stories ({content.stories.length})
              </h4>
              <div className="space-y-3">
                {content.stories.map((story: any, idx: number) => renderSingleStory(story, idx))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle array of epics
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4">
          {content.map((epic: any, idx: number) => renderSingleEpic(epic, idx))}
        </div>
      );
    }

    return renderGenericContent(content);
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
    // Handle null/undefined
    if (content === null || content === undefined) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">Aucun contenu disponible pour cet artefact</p>
        </div>
      );
    }

    // Handle string content - format with line breaks
    if (typeof content === 'string') {
      if (!content.trim()) {
        return (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Contenu vide</p>
          </div>
        );
      }
      
      // Parse sections from text (lines starting with emoji or special chars as headers)
      const lines = content.split('\n');
      const sections: { title: string; items: string[] }[] = [];
      let currentSection: { title: string; items: string[] } | null = null;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Detect section headers (starts with emoji, •, -, or is all caps/bold-like)
        const isSectionHeader = /^[^\w\s]/.test(trimmed) || 
                                /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s]{3,}:?$/.test(trimmed) ||
                                /^\*\*.*\*\*:?$/.test(trimmed);

        if (isSectionHeader && trimmed.length < 60) {
          if (currentSection) sections.push(currentSection);
          currentSection = { title: trimmed.replace(/^\*\*|\*\*$/g, ''), items: [] };
        } else if (currentSection) {
          currentSection.items.push(trimmed.replace(/^[•\-\*]\s*/, ''));
        } else {
          if (!sections.length) {
            currentSection = { title: '', items: [trimmed.replace(/^[•\-\*]\s*/, '')] };
          }
        }
      });

      if (currentSection) sections.push(currentSection);

      if (sections.length === 0) {
        return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>;
      }

      return (
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <Card key={idx} className="p-4">
              {section.title && (
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                  <Lightbulb className="w-4 h-4" />
                  {section.title}
                </h4>
              )}
              {section.items.length > 0 && (
                <ul className="space-y-1.5">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      );
    }

    // Handle empty objects/arrays
    if (typeof content === 'object') {
      if (Array.isArray(content) && content.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Layers className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Liste vide</p>
          </div>
        );
      }
      if (Object.keys(content).length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Aucun contenu disponible</p>
          </div>
        );
      }
    }

    const getIconForKey = (key: string) => {
      const keyLower = key.toLowerCase();
      if (keyLower.includes('goal') || keyLower.includes('objecti')) return Target;
      if (keyLower.includes('user') || keyLower.includes('persona') || keyLower.includes('client')) return User;
      if (keyLower.includes('risk') || keyLower.includes('risque')) return AlertTriangle;
      if (keyLower.includes('metric') || keyLower.includes('kpi') || keyLower.includes('indicat')) return TrendingUp;
      if (keyLower.includes('accept') || keyLower.includes('critere') || keyLower.includes('done')) return CheckCircle2;
      if (keyLower.includes('story') || keyLower.includes('stories')) return FileText;
      if (keyLower.includes('team') || keyLower.includes('equipe')) return Users;
      return Lightbulb;
    };

    const renderValue = (value: any, depth: number = 0): React.ReactNode => {
      if (value === null || value === undefined) return null;
      
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return <span className="text-muted-foreground">{String(value)}</span>;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return (
          <ul className="space-y-1.5 mt-1">
            {value.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                {typeof item === 'object' ? (
                  <div className="flex-1">{renderValue(item, depth + 1)}</div>
                ) : (
                  <span className="text-muted-foreground">{String(item)}</span>
                )}
              </li>
            ))}
          </ul>
        );
      }

      if (typeof value === 'object') {
        return (
          <div className={`space-y-4 ${depth > 0 ? 'pl-4 border-l-2 border-muted' : ''}`}>
            {Object.entries(value).map(([key, val]) => {
              if (val === null || val === undefined) return null;
              if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val as object).length === 0) return null;
              if (Array.isArray(val) && val.length === 0) return null;
              
              const formattedKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/_/g, ' ')
                .replace(/^./, str => str.toUpperCase())
                .trim();
              
              const IconComponent = getIconForKey(key);
              
              return (
                <Card key={key} className={depth === 0 ? 'p-4' : 'p-3 bg-muted/30'}>
                  <h5 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-2">
                    <IconComponent className="w-4 h-4 text-primary" />
                    {formattedKey}
                  </h5>
                  <div className="text-sm">{renderValue(val, depth + 1)}</div>
                </Card>
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
