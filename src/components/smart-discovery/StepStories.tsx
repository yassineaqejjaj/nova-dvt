import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText,
  Users,
  Target,
  BarChart3,
  Edit3, 
  Check,
  X,
  Plus,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Epic, UserStory } from './types';

interface StepStoriesProps {
  epics: Epic[];
  stories: UserStory[];
  onUpdate: (stories: UserStory[]) => void;
  onSave: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const tshirtSizes: UserStory['tshirtSize'][] = ['XS', 'S', 'M', 'L', 'XL'];
const priorities: UserStory['priority'][] = ['high', 'medium', 'low'];

const priorityLabels = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse'
};

const priorityColors = {
  high: 'bg-red-500/10 text-red-600 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
};

export const StepStories = ({
  epics,
  stories,
  onUpdate,
  onSave,
  onBack,
  isLoading
}: StepStoriesProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedEpics = epics.filter(e => e.selected);
  const storiesByEpic = selectedEpics.map(epic => ({
    epic,
    stories: stories.filter(s => s.epicId === epic.id)
  }));

  const validatedCount = stories.filter(s => s.status === 'validated').length;
  const totalPoints = stories.reduce((sum, s) => sum + s.effortPoints, 0);

  const handleUpdateStory = (storyId: string, field: keyof UserStory, value: any) => {
    onUpdate(stories.map(s => 
      s.id === storyId ? { ...s, [field]: value } : s
    ));
  };

  const handleValidateStory = (storyId: string) => {
    handleUpdateStory(storyId, 'status', 'validated');
  };

  const handleAddCriteria = (storyId: string, criteria: string) => {
    if (criteria.trim()) {
      const story = stories.find(s => s.id === storyId);
      if (story) {
        handleUpdateStory(storyId, 'acceptanceCriteria', [...story.acceptanceCriteria, criteria.trim()]);
      }
    }
  };

  const handleRemoveCriteria = (storyId: string, index: number) => {
    const story = stories.find(s => s.id === storyId);
    if (story) {
      handleUpdateStory(storyId, 'acceptanceCriteria', story.acceptanceCriteria.filter((_, i) => i !== index));
    }
  };

  const allValidated = stories.length > 0 && stories.every(s => s.status === 'validated');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">User Stories générées</h3>
              <p className="text-sm text-muted-foreground">
                Validez story par story, ajustez les tailles et complétez les critères
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {stories.length} stories
              </Badge>
              <Badge variant="secondary">
                {totalPoints} pts
              </Badge>
              <Badge variant={validatedCount === stories.length ? "default" : "secondary"}>
                {validatedCount}/{stories.length} validées
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stories by Epic */}
      <Accordion type="multiple" defaultValue={selectedEpics.map(e => e.id)} className="space-y-4">
        {storiesByEpic.map(({ epic, stories: epicStories }) => (
          <AccordionItem key={epic.id} value={epic.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold">{epic.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {epicStories.length} stories
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {epic.personaRole}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {epicStories.map((story) => (
                <Card 
                  key={story.id} 
                  className={`${story.status === 'validated' ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}`}
                >
                  <CardContent className="py-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {story.status === 'validated' && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          <h4 className="font-semibold">{story.title}</h4>
                        </div>
                        
                        <div className="text-sm bg-muted/50 p-3 rounded-lg mb-3">
                          <span className="font-medium">En tant que</span> {story.story.asA},{' '}
                          <span className="font-medium">Je veux</span> {story.story.iWant},{' '}
                          <span className="font-medium">Afin de</span> {story.story.soThat}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{story.personaRole}</Badge>
                          <Badge className={priorityColors[story.priority]} variant="outline">
                            {priorityLabels[story.priority]}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select 
                          value={story.tshirtSize} 
                          onValueChange={(v) => handleUpdateStory(story.id, 'tshirtSize', v)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tshirtSizes.map(size => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select 
                          value={story.priority} 
                          onValueChange={(v) => handleUpdateStory(story.id, 'priority', v as UserStory['priority'])}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorities.map(p => (
                              <SelectItem key={p} value={p}>{priorityLabels[p]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Acceptance Criteria */}
                    <div>
                      <p className="text-sm font-medium mb-2">Critères d'acceptation</p>
                      <div className="space-y-2">
                        {story.acceptanceCriteria.map((criteria, idx) => (
                          <div key={idx} className="flex items-start gap-2 group">
                            <span className="text-muted-foreground">•</span>
                            <Input
                              value={criteria}
                              onChange={(e) => {
                                const updated = [...story.acceptanceCriteria];
                                updated[idx] = e.target.value;
                                handleUpdateStory(story.id, 'acceptanceCriteria', updated);
                              }}
                              className="flex-1 text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveCriteria(story.id, idx)}
                              className="opacity-0 group-hover:opacity-100 text-destructive h-8 w-8"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <NewCriteriaInput onAdd={(c) => handleAddCriteria(story.id, c)} />
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Impact attendu
                        </p>
                        <p className="text-sm text-muted-foreground">{story.impact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          Indicateurs
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {story.indicators.map((ind, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {ind}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Validate Button */}
                    {story.status !== 'validated' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleValidateStory(story.id)}
                        className="w-full"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Valider cette story
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onSave} disabled={isLoading || stories.length === 0}>
          {isLoading ? 'Sauvegarde...' : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Sauvegarder tout ({stories.length} stories)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Helper component for adding new criteria
const NewCriteriaInput = ({ onAdd }: { onAdd: (criteria: string) => void }) => {
  const [value, setValue] = useState('');
  
  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };
  
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Ajouter un critère..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        className="text-sm"
      />
      <Button size="icon" variant="outline" onClick={handleAdd} className="h-9 w-9">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
