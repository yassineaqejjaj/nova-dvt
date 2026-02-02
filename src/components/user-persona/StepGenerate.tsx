import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  Target,
  Frown,
  Heart,
  Calendar,
  Edit3,
  Trash2,
  Check,
  RefreshCw,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  ProductContext, 
  ResearchIntent, 
  PersonaConfig, 
  GeneratedPersona,
  INTENT_OPTIONS,
  DETAIL_LEVELS,
  ORIENTATION_OPTIONS
} from './types';
import { cn } from '@/lib/utils';

interface StepGenerateProps {
  context: ProductContext | null;
  intent: ResearchIntent;
  productDescription: string;
  targetAudience: string;
  config: PersonaConfig;
  personas: GeneratedPersona[];
  isGenerating: boolean;
  onPersonasChange: (personas: GeneratedPersona[]) => void;
  onGeneratingChange: (isGenerating: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepGenerate = ({
  context,
  intent,
  productDescription,
  targetAudience,
  config,
  personas,
  isGenerating,
  onPersonasChange,
  onGeneratingChange,
  onNext,
  onBack,
}: StepGenerateProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [alignmentScore, setAlignmentScore] = useState<number | null>(null);

  useEffect(() => {
    if (personas.length === 0 && !isGenerating) {
      generatePersonas();
    }
  }, []);

  useEffect(() => {
    // Calculate alignment score based on context match
    if (personas.length > 0 && context) {
      const score = calculateAlignmentScore();
      setAlignmentScore(score);
    }
  }, [personas, context]);

  const calculateAlignmentScore = (): number => {
    if (!context?.objectives?.length) return 70;
    
    // Simple heuristic based on persona goals matching context objectives
    let matchCount = 0;
    const objectives = context.objectives.join(' ').toLowerCase();
    
    personas.forEach(persona => {
      persona.goals.forEach(goal => {
        if (objectives.includes(goal.toLowerCase().split(' ')[0])) {
          matchCount++;
        }
      });
    });
    
    return Math.min(95, 60 + matchCount * 5);
  };

  const generatePersonas = async () => {
    onGeneratingChange(true);
    try {
      const intentLabel = INTENT_OPTIONS.find(o => o.value === intent)?.label || '';
      const detailLabel = DETAIL_LEVELS.find(l => l.value === config.detailLevel)?.label || '';
      const orientationLabel = ORIENTATION_OPTIONS.find(o => o.value === config.orientation)?.label || '';

      const contextInfo = context 
        ? `Contexte produit: ${context.name}
Vision: ${context.vision || 'Non définie'}
Objectifs: ${context.objectives?.join(', ') || 'Non définis'}
Audience cible: ${context.target_audience || 'Non définie'}`
        : '';

      const prompt = `${contextInfo}

Produit: "${productDescription}"
Audience: "${targetAudience || 'Non spécifiée'}"
Intention de recherche: ${intentLabel}
Niveau de détail: ${detailLabel}
Orientation: ${orientationLabel}

Génère exactement ${config.personaCount} persona(s) utilisateur en JSON:
{
  "personas": [
    {
      "name": "Prénom Nom",
      "age": 32,
      "role": "Titre professionnel",
      "location": "Ville, Pays",
      "bio": "Biographie ${config.detailLevel === 'synthesis' ? 'courte (1 phrase)' : config.detailLevel === 'standard' ? 'moyenne (2-3 phrases)' : 'détaillée (4-5 phrases)'}",
      "goals": [${config.detailLevel === 'synthesis' ? '2 objectifs' : config.detailLevel === 'standard' ? '3 objectifs' : '4-5 objectifs'}],
      "painPoints": [${config.orientation === 'frustrations' ? '4-5 frustrations détaillées' : '2-3 frustrations'}],
      "motivations": [${config.orientation === 'needs' ? '4-5 motivations détaillées' : '2-3 motivations'}],
      "behaviors": ["Comportement 1", "Comportement 2"],
      "decisionFactors": [${config.orientation === 'decisions' ? '4-5 facteurs de décision détaillés' : '2-3 facteurs'}],
      "techSavviness": "Débutant/Intermédiaire/Avancé",
      "preferredChannels": ["Mobile", "Desktop", etc.]
    }
  ]
}`;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: prompt,
          mode: 'simple',
          systemPrompt: `Tu es un expert en UX research et création de personas. 
Génère des personas réalistes, nuancés et actionnables en français.
Adapte le niveau de détail selon les paramètres demandés.
Retourne uniquement du JSON valide, sans markdown.`
        }
      });

      if (error) throw error;

      const content = data?.response || data;
      let jsonString = typeof content === 'string' ? content : JSON.stringify(content);
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonString = jsonMatch[0];
      
      const result = JSON.parse(jsonString);
      const generatedPersonas: GeneratedPersona[] = (result.personas || []).map((p: any) => ({
        ...p,
        id: crypto.randomUUID(),
        selected: true,
        decisionFactors: p.decisionFactors || [],
      }));
      
      onPersonasChange(generatedPersonas);
      toast.success(`${generatedPersonas.length} persona(s) générée(s) !`);
    } catch (error) {
      console.error('Error generating personas:', error);
      toast.error("Erreur lors de la génération des personas");
    } finally {
      onGeneratingChange(false);
    }
  };

  const togglePersona = (id: string) => {
    onPersonasChange(personas.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const deletePersona = (id: string) => {
    onPersonasChange(personas.filter(p => p.id !== id));
  };

  const updatePersona = (id: string, updates: Partial<GeneratedPersona>) => {
    onPersonasChange(personas.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const selectedCount = personas.filter(p => p.selected).length;

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-lg font-medium">Génération des personas...</p>
        <p className="text-sm text-muted-foreground">
          Analyse du contexte et création de profils réalistes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quality Indicators */}
      {alignmentScore !== null && (
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Alignement contexte</span>
                </div>
                <Badge variant={alignmentScore >= 80 ? "default" : alignmentScore >= 60 ? "secondary" : "outline"}>
                  {alignmentScore}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
                </Badge>
                <Button variant="outline" size="sm" onClick={generatePersonas} disabled={isGenerating}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Régénérer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Persona Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card 
            key={persona.id} 
            className={cn(
              'overflow-hidden transition-all',
              persona.selected ? 'ring-2 ring-primary' : 'opacity-60'
            )}
          >
            <CardHeader className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingId === persona.id ? (
                    <Input
                      value={persona.name}
                      onChange={(e) => updatePersona(persona.id, { name: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    />
                  ) : (
                    <CardTitle className="text-xl">{persona.name}</CardTitle>
                  )}
                  <p className="text-primary-foreground/80 mt-1">{persona.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Calendar className="w-3 h-3 mr-1" />
                    {persona.age} ans
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{persona.location}</p>
                {editingId === persona.id ? (
                  <Textarea
                    value={persona.bio}
                    onChange={(e) => updatePersona(persona.id, { bio: e.target.value })}
                    rows={3}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm mt-2">{persona.bio}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Objectifs</h4>
                  </div>
                  <ul className="text-sm space-y-1">
                    {persona.goals.slice(0, 3).map((goal, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Frown className="w-4 h-4 text-destructive" />
                    <h4 className="text-sm font-semibold">Frustrations</h4>
                  </div>
                  <ul className="text-sm space-y-1">
                    {persona.painPoints.slice(0, 3).map((pain, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>{pain}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {persona.decisionFactors?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      <h4 className="text-sm font-semibold">Facteurs de décision</h4>
                    </div>
                    <ul className="text-sm space-y-1">
                      {persona.decisionFactors.slice(0, 3).map((factor, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tech:</span>
                    <Badge variant="outline">{persona.techSavviness}</Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Canaux:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {persona.preferredChannels.slice(0, 3).map((channel, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant={persona.selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePersona(persona.id)}
                >
                  {persona.selected ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Sélectionné
                    </>
                  ) : (
                    'Sélectionner'
                  )}
                </Button>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingId(editingId === persona.id ? null : persona.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deletePersona(persona.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button onClick={onNext} disabled={selectedCount === 0}>
          Continuer vers finalisation
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
