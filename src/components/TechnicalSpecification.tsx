import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Code2, 
  FileCode, 
  TestTube, 
  ListChecks,
  Sparkles,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Artifact } from '@/types';
import { toast } from 'sonner';
import { trackWorkflowStart, trackWorkflowComplete, trackArtifactCreated } from '@/lib/analytics';

interface TechnicalSpecificationProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'story-input' | 'tech-requirements' | 'test-cases' | 'dod';

interface StoryArtifact {
  id: string;
  title: string;
  content: any;
}

export function TechnicalSpecification({ open, onClose }: TechnicalSpecificationProps) {
  const [currentStep, setCurrentStep] = useState<Step>('story-input');
  const [loading, setLoading] = useState(false);
  const [workflowStartTime, setWorkflowStartTime] = useState(0);
  
  // Step 1: Story Input
  const [userStories, setUserStories] = useState<StoryArtifact[]>([]);
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [techContext, setTechContext] = useState({
    stack: '',
    constraints: '',
  });

  // Step 2: Tech Requirements
  const [techRequirements, setTechRequirements] = useState({
    architecture: '',
    apis: [] as string[],
    components: [] as string[],
    dataModel: '',
  });
  const [newApi, setNewApi] = useState('');
  const [newComponent, setNewComponent] = useState('');
  const [suggestingArchitecture, setSuggestingArchitecture] = useState(false);

  // Step 3: Test Cases
  const [testCases, setTestCases] = useState<Array<{
    type: 'unit' | 'integration' | 'edge';
    description: string;
    scenarios: string[];
  }>>([]);
  const [generatingTests, setGeneratingTests] = useState(false);

  // Step 4: Definition of Done
  const [dod, setDod] = useState<string[]>([
    'Code reviewed',
    'Unit tests coverage ≥80%',
    'API documented',
    'Integration tests passed',
    'No critical bugs',
  ]);
  const [newDodItem, setNewDodItem] = useState('');

  useEffect(() => {
    if (open) {
      loadUserStories();
      const startTime = Date.now();
      setWorkflowStartTime(startTime);
      
      // Track workflow start
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          trackWorkflowStart(user.id, 'tech_spec');
        }
      });
    }
  }, [open]);

  const loadUserStories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('artifacts')
        .select('id, title, content')
        .eq('user_id', user.id)
        .in('artifact_type', ['story', 'epic'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserStories(data || []);
    } catch (error) {
      console.error('Error loading user stories:', error);
    }
  };

  const handleSuggestArchitecture = async () => {
    if (!selectedStory) {
      toast.error('Veuillez sélectionner une User Story');
      return;
    }

    setSuggestingArchitecture(true);
    try {
      const story = userStories.find(s => s.id === selectedStory);
      if (!story) return;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Basé sur cette User Story et le contexte technique, suggère une approche architecturale.

User Story: ${story.title}
Description: ${JSON.stringify(story.content)}

Stack technique: ${techContext.stack || 'Non spécifié'}
Contraintes: ${techContext.constraints || 'Aucune'}

Suggère:
1. Une approche architecturale (patterns, principes)
2. Les APIs/endpoints nécessaires
3. Les composants principaux
4. Les changements du modèle de données

Réponds en JSON avec: { architecture, apis, components, dataModel }`,
          type: 'simple'
        }
      });

      if (error) throw error;

      try {
        const suggestions = typeof data.response === 'string' 
          ? JSON.parse(data.response.replace(/```json\n?|\n?```/g, ''))
          : data.response;

        setTechRequirements({
          architecture: suggestions.architecture || '',
          apis: Array.isArray(suggestions.apis) ? suggestions.apis : [],
          components: Array.isArray(suggestions.components) ? suggestions.components : [],
          dataModel: suggestions.dataModel || '',
        });

        toast.success('Suggestions générées avec succès');
      } catch (parseError) {
        console.error('Error parsing suggestions:', parseError);
        toast.error('Erreur lors du parsing des suggestions');
      }
    } catch (error) {
      console.error('Error suggesting architecture:', error);
      toast.error('Erreur lors de la génération des suggestions');
    } finally {
      setSuggestingArchitecture(false);
    }
  };

  const handleGenerateTestCases = async () => {
    setGeneratingTests(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Génère des test cases basés sur ces requirements techniques:

Architecture: ${techRequirements.architecture}
APIs: ${techRequirements.apis.join(', ')}
Components: ${techRequirements.components.join(', ')}
Data Model: ${techRequirements.dataModel}

Génère 3 types de tests:
1. Unit tests (2-3 scénarios)
2. Integration tests (2-3 scénarios)
3. Edge cases (2-3 scénarios)

Réponds en JSON avec un tableau: [{ type: "unit"|"integration"|"edge", description: "...", scenarios: ["...", "..."] }]`,
          type: 'simple'
        }
      });

      if (error) throw error;

      try {
        const tests = typeof data.response === 'string'
          ? JSON.parse(data.response.replace(/```json\n?|\n?```/g, ''))
          : data.response;

        setTestCases(Array.isArray(tests) ? tests : []);
        toast.success('Test cases générés avec succès');
      } catch (parseError) {
        console.error('Error parsing test cases:', parseError);
        toast.error('Erreur lors du parsing des test cases');
      }
    } catch (error) {
      console.error('Error generating test cases:', error);
      toast.error('Erreur lors de la génération des test cases');
    } finally {
      setGeneratingTests(false);
    }
  };

  const handleSaveTechSpec = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const story = userStories.find(s => s.id === selectedStory);
      if (!story) throw new Error('Story not found');

      const techSpec = {
        type: 'tech_spec',
        linkedStory: selectedStory,
        linkedStoryTitle: story.title,
        content: {
          overview: `Spécification technique pour: ${story.title}`,
          techContext: techContext,
          architecture: {
            approach: techRequirements.architecture,
            components: techRequirements.components,
            dataModel: techRequirements.dataModel,
          },
          implementation: {
            apis: techRequirements.apis,
            files: techRequirements.components.map(c => `src/components/${c}.tsx`),
          },
          testCases: testCases,
          definitionOfDone: dod,
        },
      };

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'tech_spec' as any,
        title: `Tech Spec - ${story.title}`,
        content: techSpec,
      });

      if (error) throw error;

      // Track completion
      await trackWorkflowComplete(user.id, 'tech_spec', workflowStartTime);
      await trackArtifactCreated(user.id, 'tech_spec' as any);

      toast.success('Spécification technique sauvegardée !');
      handleClose();
    } catch (error) {
      console.error('Error saving tech spec:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('story-input');
    setSelectedStory('');
    setTechContext({ stack: '', constraints: '' });
    setTechRequirements({ architecture: '', apis: [], components: [], dataModel: '' });
    setTestCases([]);
    setDod(['Code reviewed', 'Unit tests coverage ≥80%', 'API documented', 'Integration tests passed', 'No critical bugs']);
    onClose();
  };

  const getStepNumber = (step: Step): number => {
    const steps: Step[] = ['story-input', 'tech-requirements', 'test-cases', 'dod'];
    return steps.indexOf(step) + 1;
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'story-input':
        return !!selectedStory;
      case 'tech-requirements':
        return !!techRequirements.architecture && techRequirements.apis.length > 0;
      case 'test-cases':
        return testCases.length > 0;
      case 'dod':
        return dod.length > 0;
      default:
        return false;
    }
  };

  const renderStoryInput = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Sélectionner User Story / Epic *</Label>
        <Select value={selectedStory} onValueChange={setSelectedStory}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir une story..." />
          </SelectTrigger>
          <SelectContent>
            {userStories.map(story => (
              <SelectItem key={story.id} value={story.id}>
                {story.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {userStories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucune User Story disponible. Créez-en une d'abord.
          </p>
        )}
      </div>

      {selectedStory && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Story Sélectionnée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {userStories.find(s => s.id === selectedStory)?.title}
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="space-y-3">
        <Label htmlFor="stack">Stack Technique</Label>
        <Input
          id="stack"
          placeholder="Ex: React, TypeScript, Supabase, Tailwind CSS"
          value={techContext.stack}
          onChange={(e) => setTechContext({ ...techContext, stack: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="constraints">Contraintes Techniques</Label>
        <Textarea
          id="constraints"
          placeholder="Ex: Doit être compatible mobile, Performance critique, ..."
          value={techContext.constraints}
          onChange={(e) => setTechContext({ ...techContext, constraints: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  const renderTechRequirements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Architecture & Design</h4>
        <Button
          onClick={handleSuggestArchitecture}
          disabled={suggestingArchitecture}
          size="sm"
          variant="outline"
        >
          {suggestingArchitecture ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Suggérer avec IA</>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        <Label htmlFor="architecture">Approche Architecturale *</Label>
        <Textarea
          id="architecture"
          placeholder="Ex: Clean Architecture avec séparation des couches, Pattern Repository pour data access..."
          value={techRequirements.architecture}
          onChange={(e) => setTechRequirements({ ...techRequirements, architecture: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-3">
        <Label>APIs / Endpoints Nécessaires *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: POST /api/users/create"
            value={newApi}
            onChange={(e) => setNewApi(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newApi.trim()) {
                setTechRequirements({
                  ...techRequirements,
                  apis: [...techRequirements.apis, newApi.trim()]
                });
                setNewApi('');
              }
            }}
          />
          <Button
            onClick={() => {
              if (newApi.trim()) {
                setTechRequirements({
                  ...techRequirements,
                  apis: [...techRequirements.apis, newApi.trim()]
                });
                setNewApi('');
              }
            }}
            size="icon"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {techRequirements.apis.map((api, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {api}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setTechRequirements({
                  ...techRequirements,
                  apis: techRequirements.apis.filter((_, i) => i !== idx)
                })}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Composants Principaux</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: UserService, AuthManager"
            value={newComponent}
            onChange={(e) => setNewComponent(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newComponent.trim()) {
                setTechRequirements({
                  ...techRequirements,
                  components: [...techRequirements.components, newComponent.trim()]
                });
                setNewComponent('');
              }
            }}
          />
          <Button
            onClick={() => {
              if (newComponent.trim()) {
                setTechRequirements({
                  ...techRequirements,
                  components: [...techRequirements.components, newComponent.trim()]
                });
                setNewComponent('');
              }
            }}
            size="icon"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {techRequirements.components.map((comp, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {comp}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setTechRequirements({
                  ...techRequirements,
                  components: techRequirements.components.filter((_, i) => i !== idx)
                })}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="dataModel">Changements du Modèle de Données</Label>
        <Textarea
          id="dataModel"
          placeholder="Ex: Nouvelle table 'users' avec colonnes id, name, email, created_at..."
          value={techRequirements.dataModel}
          onChange={(e) => setTechRequirements({ ...techRequirements, dataModel: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );

  const renderTestCases = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Scénarios de Tests</h4>
        <Button
          onClick={handleGenerateTestCases}
          disabled={generatingTests}
          size="sm"
          variant="outline"
        >
          {generatingTests ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Générer avec IA</>
          )}
        </Button>
      </div>

      {testCases.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TestTube className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Cliquez sur "Générer avec IA" pour créer des test cases
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {testCases.map((test, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant={
                      test.type === 'unit' ? 'default' : 
                      test.type === 'integration' ? 'secondary' : 
                      'outline'
                    }>
                      {test.type === 'unit' ? 'Unit Test' : 
                       test.type === 'integration' ? 'Integration Test' : 
                       'Edge Case'}
                    </Badge>
                    {test.description}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {test.scenarios.map((scenario, sIdx) => (
                    <li key={sIdx} className="text-sm text-muted-foreground">
                      {scenario}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderDod = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-2">Definition of Done</h4>
        <p className="text-sm text-muted-foreground">
          Checklist technique pour valider que le travail est terminé
        </p>
      </div>

      <div className="space-y-2">
        {dod.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 p-3 border rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="flex-1 text-sm">{item}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDod(dod.filter((_, i) => i !== idx))}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ajouter un critère..."
          value={newDodItem}
          onChange={(e) => setNewDodItem(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newDodItem.trim()) {
              setDod([...dod, newDodItem.trim()]);
              setNewDodItem('');
            }
          }}
        />
        <Button
          onClick={() => {
            if (newDodItem.trim()) {
              setDod([...dod, newDodItem.trim()]);
              setNewDodItem('');
            }
          }}
          variant="outline"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Technical Specification
          </DialogTitle>
          <DialogDescription>
            Traduisez une User Story en spécification technique détaillée (4 étapes)
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Étape {getStepNumber(currentStep)} sur 4
            </span>
            <span className="font-medium">{Math.round((getStepNumber(currentStep) / 4) * 100)}%</span>
          </div>
          <Progress value={(getStepNumber(currentStep) / 4) * 100} />
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'story-input', label: 'Story Input', icon: <FileCode className="w-4 h-4" /> },
            { id: 'tech-requirements', label: 'Tech Design', icon: <Code2 className="w-4 h-4" /> },
            { id: 'test-cases', label: 'Test Plan', icon: <TestTube className="w-4 h-4" /> },
            { id: 'dod', label: 'DoD', icon: <ListChecks className="w-4 h-4" /> },
          ].map((step, idx) => (
            <div
              key={step.id}
              className={`p-2 rounded-lg text-center ${
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : getStepNumber(currentStep) > idx + 1
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                {step.icon}
                <span className="text-xs font-medium">{step.label}</span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'story-input' && renderStoryInput()}
          {currentStep === 'tech-requirements' && renderTechRequirements()}
          {currentStep === 'test-cases' && renderTestCases()}
          {currentStep === 'dod' && renderDod()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              const steps: Step[] = ['story-input', 'tech-requirements', 'test-cases', 'dod'];
              const currentIdx = steps.indexOf(currentStep);
              if (currentIdx > 0) {
                setCurrentStep(steps[currentIdx - 1]);
              } else {
                handleClose();
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 'story-input' ? 'Annuler' : 'Précédent'}
          </Button>

          {currentStep === 'dod' ? (
            <Button
              onClick={handleSaveTechSpec}
              disabled={!canProceed() || loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Sauvegarder</>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                const steps: Step[] = ['story-input', 'tech-requirements', 'test-cases', 'dod'];
                const currentIdx = steps.indexOf(currentStep);
                setCurrentStep(steps[currentIdx + 1]);
              }}
              disabled={!canProceed()}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
