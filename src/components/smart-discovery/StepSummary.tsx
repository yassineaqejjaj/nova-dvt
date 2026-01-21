import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2,
  Users,
  Target,
  FileText,
  Sparkles,
  Download,
  ArrowRight,
  Home
} from 'lucide-react';
import { ProductContext, DiscoveryData, Persona, Epic, UserStory } from './types';

interface StepSummaryProps {
  activeContext: ProductContext | null;
  discoveryData: DiscoveryData | null;
  personas: Persona[];
  epics: Epic[];
  stories: UserStory[];
  onExport: (format: 'pdf' | 'notion' | 'jira' | 'docx') => void;
  onNewDiscovery: () => void;
  onGoHome: () => void;
}

export const StepSummary = ({
  activeContext,
  discoveryData,
  personas,
  epics,
  stories,
  onExport,
  onNewDiscovery,
  onGoHome
}: StepSummaryProps) => {
  const selectedPersonas = personas.filter(p => p.selected);
  const selectedEpics = epics.filter(e => e.selected);
  const validatedStories = stories.filter(s => s.status === 'validated');
  const totalPoints = stories.reduce((sum, s) => sum + s.effortPoints, 0);
  const estimatedSprints = Math.ceil(totalPoints / 20);

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
                Discovery terminée et sauvegardée !
              </h2>
              <p className="text-green-600 dark:text-green-400">
                Tous les artefacts ont été enregistrés
                {activeContext && ` dans le contexte "${activeContext.name}"`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{selectedPersonas.length}</p>
            <p className="text-sm text-muted-foreground">Personas validés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{selectedEpics.length}</p>
            <p className="text-sm text-muted-foreground">Epics créés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stories.length}</p>
            <p className="text-sm text-muted-foreground">User Stories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">~{estimatedSprints}</p>
            <p className="text-sm text-muted-foreground">Sprints estimés</p>
          </CardContent>
        </Card>
      </div>

      {/* Discovery Details */}
      {discoveryData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Discovery documentée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Problème reformulé</p>
              <p className="font-medium">{discoveryData.reformulatedProblem}</p>
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Hypothèses</p>
                <ul className="space-y-1">
                  {discoveryData.hypotheses.map((h, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Objectifs</p>
                <ul className="space-y-1">
                  {discoveryData.objectives.map((o, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personas Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personas validés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedPersonas.map(p => (
              <Badge key={p.id} variant="secondary" className="py-1 px-3">
                <Users className="h-3 w-3 mr-1" />
                {p.role}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Epics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Epics prêts pour le backlog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedEpics.map(epic => {
            const epicStories = stories.filter(s => s.epicId === epic.id);
            const epicPoints = epicStories.reduce((sum, s) => sum + s.effortPoints, 0);
            
            return (
              <div key={epic.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{epic.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {epicStories.length} stories • {epicPoints} pts
                  </p>
                </div>
                <Badge variant="outline">{epic.personaRole}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exporter</CardTitle>
          <CardDescription>Exportez votre discovery vers vos outils</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onExport('docx')}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger Word (.docx)
            </Button>
            <Button variant="outline" onClick={() => onExport('pdf')}>
              Copier Markdown
            </Button>
            <Button variant="outline" onClick={() => onExport('notion')} disabled>
              Notion (bientôt)
            </Button>
            <Button variant="outline" onClick={() => onExport('jira')} disabled>
              Jira (bientôt)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onNewDiscovery}>
          <Sparkles className="mr-2 h-4 w-4" />
          Nouvelle Discovery
        </Button>
        <Button onClick={onGoHome}>
          <Home className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};
