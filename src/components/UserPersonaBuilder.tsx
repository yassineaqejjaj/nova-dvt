import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Sparkles, Loader2, Save, Download, Target, Heart, Frown, Calendar, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ContextSelector } from "@/components/ContextSelector";

interface Persona {
  name: string;
  age: number;
  role: string;
  location: string;
  bio: string;
  goals: string[];
  painPoints: string[];
  motivations: string[];
  behaviors: string[];
  techSavviness: string;
  preferredChannels: string[];
}

export const UserPersonaBuilder = () => {
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const generatePersonas = async () => {
    if (!productDescription.trim()) {
      toast.error("Veuillez décrire votre produit");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Produit: "${productDescription}"
Audience cible: "${targetAudience || 'Non spécifiée'}"

Génère 3 personas utilisateur détaillées et réalistes (JSON uniquement):
{
  "personas": [
    {
      "name": "Prénom Nom",
      "age": 32,
      "role": "Titre professionnel",
      "location": "Ville, Pays",
      "bio": "Biographie courte et réaliste (2-3 phrases)",
      "goals": ["Objectif 1", "Objectif 2", "Objectif 3"],
      "painPoints": ["Point de douleur 1", "Point de douleur 2", "Point de douleur 3"],
      "motivations": ["Motivation 1", "Motivation 2", "Motivation 3"],
      "behaviors": ["Comportement 1", "Comportement 2", "Comportement 3"],
      "techSavviness": "Débutant/Intermédiaire/Avancé",
      "preferredChannels": ["Mobile", "Desktop", "Email", etc.]
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const content = data?.response || data;
      let jsonString = typeof content === 'string' ? content : JSON.stringify(content);
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonString = jsonMatch[0];
      
      const result = JSON.parse(jsonString);
      setPersonas(result.personas || []);
      toast.success("Personas générées avec succès!");
    } catch (error) {
      console.error('Error generating personas:', error);
      toast.error("Erreur lors de la génération des personas");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsArtifact = async () => {
    if (!personas.length) {
      toast.error("Aucune persona à sauvegarder");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Personas Utilisateur - ${new Date().toLocaleDateString('fr-FR')}`,
        content: { personas, productDescription, targetAudience },
        metadata: { type: 'user-personas', generatedAt: new Date().toISOString() }
      } as any);

      if (error) throw error;
      toast.success("Personas sauvegardées dans les artifacts!");
    } catch (error) {
      console.error('Error saving artifact:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Users className="w-8 h-8" />
            User Persona Builder
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez des personas utilisateur détaillées et basées sur l'IA pour définir votre produit
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          IA
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informations Produit</CardTitle>
              <CardDescription>
                Décrivez votre produit et votre audience cible pour générer des personas pertinentes
              </CardDescription>
            </div>
            <ContextSelector
              onContextSelected={(context) => {
                setProductDescription(context.vision || '');
                setTargetAudience(context.target_audience || '');
                toast.success('Contexte importé avec succès');
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description du produit *</label>
            <Textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Décrivez votre produit, ses fonctionnalités principales et sa proposition de valeur..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Audience cible (optionnel)</label>
            <Input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Ex: Professionnels de la tech, PME, étudiants..."
            />
          </div>

          <Button
            onClick={generatePersonas}
            disabled={isGenerating || !productDescription.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer les Personas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {personas.length > 0 && (
        <>
          <div className="flex gap-2">
            <Button onClick={saveAsArtifact} disabled={isSaving} variant="outline">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {personas.map((persona, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gradient-primary text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{persona.name}</CardTitle>
                      <CardDescription className="text-white/80 mt-1">
                        {persona.role}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Calendar className="w-3 h-3 mr-1" />
                      {persona.age} ans
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{persona.location}</p>
                    <p className="text-sm mt-2">{persona.bio}</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold">Objectifs</h4>
                      </div>
                      <ul className="text-sm space-y-1">
                        {persona.goals.map((goal, i) => (
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
                        <h4 className="text-sm font-semibold">Points de Douleur</h4>
                      </div>
                      <ul className="text-sm space-y-1">
                        {persona.painPoints.map((pain, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{pain}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <h4 className="text-sm font-semibold">Motivations</h4>
                      </div>
                      <ul className="text-sm space-y-1">
                        {persona.motivations.map((motivation, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-pink-500">•</span>
                            <span>{motivation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tech Savviness:</span>
                        <Badge variant="outline">{persona.techSavviness}</Badge>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Canaux préférés:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.preferredChannels.map((channel, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
