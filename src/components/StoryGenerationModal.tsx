import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Epic {
  id: string;
  title: string;
  description: string;
  context?: string;
}

interface UserStory {
  id: string;
  epicId: string;
  title: string;
  story: {
    asA: string;
    iWant: string;
    soThat: string;
  };
  acceptanceCriteria: string[];
  effortPoints: number;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  technicalNotes?: string;
  status: 'draft' | 'ready' | 'in_progress' | 'done';
  tags: string[];
}

interface StoryGenerationModalProps {
  epic: Epic;
  open: boolean;
  onClose: () => void;
  onGenerate: (stories: UserStory[]) => void;
}

const StoryGenerationModal = ({ epic, open, onClose, onGenerate }: StoryGenerationModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyCount, setStoryCount] = useState<string>('auto');
  const [maxComplexity, setMaxComplexity] = useState<string>('8');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState('');

  const handleAddFocus = () => {
    if (focusInput.trim() && !focusAreas.includes(focusInput.trim())) {
      setFocusAreas([...focusAreas, focusInput.trim()]);
      setFocusInput('');
    }
  };

  const handleRemoveFocus = (area: string) => {
    setFocusAreas(focusAreas.filter(a => a !== area));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-user-stories', {
        body: {
          epic: {
            title: epic.title,
            description: epic.description,
            context: epic.context
          },
          options: {
            storyCount: storyCount === 'auto' ? undefined : parseInt(storyCount),
            maxComplexity: parseInt(maxComplexity),
            focusAreas: focusAreas.length > 0 ? focusAreas : undefined
          }
        }
      });

      if (error) throw error;

      console.log('Raw response from edge function:', data);
      
      if (!data || !data.stories) {
        throw new Error('Invalid response format from edge function');
      }

      const mapped: UserStory[] = data.stories.map((story: any) => {
        // Handle both old format (description) and new format (story object)
        let storyObj;
        if (story.story && typeof story.story === 'object') {
          storyObj = story.story;
        } else if (story.description) {
          // Parse "As a [role], I want [action], so that [benefit]" format
          const match = story.description.match(/As a (.+?), I want (.+?), so that (.+)/i);
          if (match) {
            storyObj = {
              asA: match[1].trim(),
              iWant: match[2].trim(),
              soThat: match[3].trim()
            };
          } else {
            storyObj = {
              asA: 'utilisateur',
              iWant: story.description || story.title,
              soThat: 'utiliser la fonctionnalité'
            };
          }
        } else {
          storyObj = {
            asA: 'utilisateur',
            iWant: story.title,
            soThat: 'utiliser la fonctionnalité'
          };
        }

        return {
          id: crypto.randomUUID(),
          epicId: epic.id,
          title: story.title,
          story: storyObj,
          acceptanceCriteria: Array.isArray(story.acceptance_criteria) ? story.acceptance_criteria : (Array.isArray(story.acceptanceCriteria) ? story.acceptanceCriteria : []),
          effortPoints: story.effort || story.effortPoints || 3,
          priority: (story.priority || 'medium') as 'high' | 'medium' | 'low',
          status: 'draft' as const,
          dependencies: [],
          tags: [],
          technicalNotes: story.technical_notes || story.technicalNotes
        };
      });

      const valid = mapped.filter(s => s && s.title && s.story?.asA && s.story?.iWant && s.story?.soThat && Array.isArray(s.acceptanceCriteria));
      if (valid.length === 0) {
        console.error('Invalid AI stories payload:', data);
        toast.error("Échec de génération des stories. Réessayez dans un instant.");
        setIsGenerating(false);
        return;
      }

      onGenerate(valid);
      toast.success(`${valid.length} stories générées`);
    } catch (error) {
      console.error('Story generation error:', error);
      toast.error('Échec de génération des stories. Réessayez.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Générer des User Stories</DialogTitle>
          <DialogDescription>
            Configurez comment l’IA doit découper votre Epic en User Stories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-muted-foreground">Titre de l’Epic</label>
            <p className="text-sm font-semibold">{epic.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre de stories</label>
              <Select value={storyCount} onValueChange={setStoryCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (3-7)</SelectItem>
                  <SelectItem value="3">Exactement 3</SelectItem>
                  <SelectItem value="5">Exactement 5</SelectItem>
                  <SelectItem value="7">Exactement 7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Complexité max</label>
              <Select value={maxComplexity} onValueChange={setMaxComplexity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 points</SelectItem>
                  <SelectItem value="8">8 points</SelectItem>
                  <SelectItem value="13">13 points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Domaines d’attention (optionnel)</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="ex.: Sécurité, Performance, UX..."
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFocus()}
              />
              <Button type="button" variant="outline" onClick={handleAddFocus}>
                Ajouter
              </Button>
            </div>
            {focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {focusAreas.map(area => (
                  <Badge key={area} variant="secondary" className="gap-1">
                    {area}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveFocus(area)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer les stories
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoryGenerationModal;
