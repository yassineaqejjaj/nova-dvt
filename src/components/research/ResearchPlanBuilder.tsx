import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, Users, Calendar, Sparkles } from 'lucide-react';

interface ResearchPlanBuilderProps {
  onSave?: (data: any) => void;
  workflowContext?: Record<string, any>;
}

export const ResearchPlanBuilder: React.FC<ResearchPlanBuilderProps> = ({
  onSave,
  workflowContext
}) => {
  const [objectives, setObjectives] = useState('');
  const [methodology, setMethodology] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!objectives.trim() || !methodology) {
      toast.error('Veuillez remplir les objectifs et choisir une méthodologie');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase.functions.invoke('generate-research-plan', {
        body: { objectives, methodology, context }
      });

      if (error) throw error;
      setResults(data.results);
      toast.success('Plan de recherche généré avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération du plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        title: 'Plan de Recherche Utilisateur',
        artifact_type: 'canvas',
        content: results,
        metadata: { objectives, methodology, context, ...workflowContext }
      });

      if (error) throw error;
      toast.success('Plan sauvegardé avec succès');
      if (onSave) onSave(results);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="objectives">Objectifs de Recherche *</Label>
          <Textarea
            id="objectives"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Collez les objectifs de l'étape précédente ou décrivez-les..."
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="methodology">Méthodologie *</Label>
          <Select value={methodology} onValueChange={setMethodology}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Choisissez une méthodologie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interviews">Entretiens Individuels</SelectItem>
              <SelectItem value="focus-groups">Focus Groups</SelectItem>
              <SelectItem value="surveys">Sondages</SelectItem>
              <SelectItem value="usability-testing">Tests d'Utilisabilité</SelectItem>
              <SelectItem value="field-studies">Études de Terrain</SelectItem>
              <SelectItem value="diary-studies">Études de Journal</SelectItem>
              <SelectItem value="mixed-methods">Méthodes Mixtes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="context">Contexte Additionnel (optionnel)</Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Contraintes de temps, budget, accès aux participants, etc."
            rows={3}
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !objectives.trim() || !methodology}
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
              Générer le Plan de Recherche
            </>
          )}
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          {results.participantProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Profil des Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Critères :</p>
                  <ul className="space-y-1">
                    {results.participantProfile.criteria?.map((c: string, idx: number) => (
                      <li key={idx} className="text-sm">• {c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium">Nombre cible : {results.participantProfile.targetNumber}</p>
                </div>
                {results.participantProfile.screeningQuestions && (
                  <div>
                    <p className="text-sm font-medium mb-1">Questions de sélection :</p>
                    <ul className="space-y-1">
                      {results.participantProfile.screeningQuestions.map((q: string, idx: number) => (
                        <li key={idx} className="text-sm">• {q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {results.recruitmentStrategy && (
            <Card>
              <CardHeader>
                <CardTitle>Stratégie de Recrutement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Canaux :</p>
                  <ul className="space-y-1">
                    {results.recruitmentStrategy.channels?.map((c: string, idx: number) => (
                      <li key={idx} className="text-sm">• {c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium">Incitations : <span className="font-normal">{results.recruitmentStrategy.incentives}</span></p>
                </div>
                <div>
                  <p className="text-sm font-medium">Timeline : <span className="font-normal">{results.recruitmentStrategy.timeline}</span></p>
                </div>
              </CardContent>
            </Card>
          )}

          {results.logistics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Logistique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Calendrier : <span className="font-normal">{results.logistics.schedule}</span></p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Outils nécessaires :</p>
                  <ul className="space-y-1">
                    {results.logistics.tools?.map((t: string, idx: number) => (
                      <li key={idx} className="text-sm">• {t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Rôles de l'équipe :</p>
                  <ul className="space-y-1">
                    {results.logistics.teamRoles?.map((r: string, idx: number) => (
                      <li key={idx} className="text-sm">• {r}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {results.researchGuide && (
            <Card>
              <CardHeader>
                <CardTitle>Guide de Recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{results.researchGuide}</p>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder et Passer à l'Étape Suivante
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
