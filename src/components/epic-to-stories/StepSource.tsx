import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Plus, Sparkles, Calendar, Users, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Epic } from './types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StepSourceProps {
  selectedEpic: Epic | null;
  onSelectEpic: (epic: Epic) => void;
  onNext: () => void;
}

interface ArtifactEpic {
  id: string;
  title: string;
  content: any;
  created_at: string;
  squad_id?: string;
  squads?: { name: string } | null;
}

const StepSource = ({ selectedEpic, onSelectEpic, onNext }: StepSourceProps) => {
  const [sourceMode, setSourceMode] = useState<'existing' | 'new'>('existing');
  const [existingEpics, setExistingEpics] = useState<ArtifactEpic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newEpicTitle, setNewEpicTitle] = useState('');
  const [newEpicDescription, setNewEpicDescription] = useState('');
  const [newEpicContext, setNewEpicContext] = useState('');

  useEffect(() => {
    loadExistingEpics();
  }, []);

  const loadExistingEpics = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('artifacts')
        .select(
          `
          id,
          title,
          content,
          created_at,
          squad_id,
          squads(name)
        `
        )
        .eq('user_id', user.id)
        .eq('artifact_type', 'epic')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setExistingEpics((data || []) as unknown as ArtifactEpic[]);
    } catch (error) {
      console.error('Error loading epics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExistingEpic = (artifact: ArtifactEpic) => {
    const content = artifact.content as any;
    onSelectEpic({
      id: artifact.id,
      title: artifact.title,
      description: content?.description || content?.summary || '',
      context: content?.context || content?.businessContext || '',
      squadName: artifact.squads?.name,
      createdAt: artifact.created_at,
    });
  };

  const handleCreateNewEpic = () => {
    if (!newEpicTitle.trim() || !newEpicDescription.trim()) return;
    onSelectEpic({
      id: crypto.randomUUID(),
      title: newEpicTitle,
      description: newEpicDescription,
      context: newEpicContext,
    });
  };

  const canProceed = selectedEpic !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Sélectionner l'Epic source
        </CardTitle>
        <CardDescription>
          Choisissez un Epic existant ou créez-en un nouveau pour générer des User Stories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={sourceMode}
          onValueChange={(v) => setSourceMode(v as 'existing' | 'new')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing" className="cursor-pointer">
              Epic existant
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new" className="cursor-pointer">
              Nouvel Epic
            </Label>
          </div>
        </RadioGroup>

        {sourceMode === 'existing' ? (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Chargement des Epics...
              </div>
            ) : existingEpics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun Epic trouvé dans vos artefacts</p>
                <Button variant="link" onClick={() => setSourceMode('new')} className="mt-2">
                  Créer un nouvel Epic
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {existingEpics.map((epic) => (
                    <div
                      key={epic.id}
                      onClick={() => handleSelectExistingEpic(epic)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                        selectedEpic?.id === epic.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{epic.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {(epic.content as any)?.description ||
                              (epic.content as any)?.summary ||
                              'Aucune description'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {epic.squads?.name && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {epic.squads.name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(epic.created_at), 'dd MMM', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="epic-title">Titre de l'Epic *</Label>
              <Input
                id="epic-title"
                placeholder="ex.: Système d'authentification multi-facteur"
                value={newEpicTitle}
                onChange={(e) => setNewEpicTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="epic-description">Description de l'Epic *</Label>
              <Textarea
                id="epic-description"
                placeholder="Décrivez l'Epic en détail : objectifs, périmètre, besoins utilisateurs..."
                value={newEpicDescription}
                onChange={(e) => setNewEpicDescription(e.target.value)}
                rows={5}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="epic-context">Contexte additionnel (optionnel)</Label>
              <Textarea
                id="epic-context"
                placeholder="Contraintes techniques, dépendances, utilisateurs cibles..."
                value={newEpicContext}
                onChange={(e) => setNewEpicContext(e.target.value)}
                rows={3}
                className="mt-1.5"
              />
            </div>
            {newEpicTitle.trim() && newEpicDescription.trim() && (
              <Button onClick={handleCreateNewEpic} variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Utiliser cet Epic
              </Button>
            )}
          </div>
        )}

        {selectedEpic && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary">Epic sélectionné</p>
                <p className="font-semibold mt-1">{selectedEpic.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {selectedEpic.description}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onNext} disabled={!canProceed}>
            Continuer
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepSource;
