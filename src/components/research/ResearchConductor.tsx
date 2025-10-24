import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, MessageSquare, FileText, MousePointer } from 'lucide-react';

interface ResearchConductorProps {
  onSave?: (data: any) => void;
  workflowContext?: Record<string, any>;
}

export const ResearchConductor: React.FC<ResearchConductorProps> = ({
  onSave,
  workflowContext
}) => {
  const [activeTab, setActiveTab] = useState('interview');
  const [objectives, setObjectives] = useState('');
  const [participantProfile, setParticipantProfile] = useState('');
  const [feature, setFeature] = useState('');
  const [tasks, setTasks] = useState('');
  const [audience, setAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      let body: any = { type: activeTab };
      
      if (activeTab === 'interview') {
        if (!objectives.trim() || !participantProfile.trim()) {
          toast.error('Veuillez remplir les objectifs et le profil des participants');
          return;
        }
        body.objectives = objectives;
        body.participantProfile = participantProfile;
      } else if (activeTab === 'survey') {
        if (!objectives.trim() || !audience.trim()) {
          toast.error('Veuillez remplir les objectifs et l\'audience');
          return;
        }
        body.objectives = objectives;
        body.audience = audience;
      } else if (activeTab === 'usability') {
        if (!feature.trim() || !tasks.trim()) {
          toast.error('Veuillez décrire la fonctionnalité et les tâches');
          return;
        }
        body.feature = feature;
        body.tasks = tasks;
      }

      const { data, error } = await supabase.functions.invoke('generate-research-materials', {
        body
      });

      if (error) throw error;
      setResults(data.results);
      toast.success('Matériel de recherche généré avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération');
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

      const typeMap: Record<string, string> = {
        interview: 'Guide d\'Entretien',
        survey: 'Questionnaire',
        usability: 'Protocole de Test d\'Utilisabilité'
      };

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        title: typeMap[activeTab] || 'Matériel de Recherche',
        artifact_type: 'canvas',
        content: results,
        metadata: { 
          researchType: activeTab,
          objectives,
          participantProfile,
          feature,
          tasks,
          audience,
          ...workflowContext 
        }
      });

      if (error) throw error;
      toast.success('Matériel sauvegardé avec succès');
      if (onSave) onSave(results);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    if (activeTab === 'interview' && results.sections) {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guide d'Entretien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.introduction && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Introduction</p>
                  <p className="text-sm whitespace-pre-line">{results.introduction}</p>
                </div>
              )}
              
              {results.sections.map((section: any, idx: number) => (
                <div key={idx} className="border-l-2 border-primary pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{section.title}</h4>
                    <span className="text-xs text-muted-foreground">{section.duration}</span>
                  </div>
                  {section.questions?.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="space-y-1">
                      <p className="text-sm font-medium">→ {q.main}</p>
                      {q.probes && q.probes.length > 0 && (
                        <div className="pl-4 space-y-0.5">
                          {q.probes.map((probe: string, pIdx: number) => (
                            <p key={pIdx} className="text-xs text-muted-foreground">• {probe}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              {results.closingScript && (
                <div className="p-3 bg-muted rounded-lg mt-4">
                  <p className="text-sm font-medium mb-1">Conclusion</p>
                  <p className="text-sm whitespace-pre-line">{results.closingScript}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === 'survey' && results.questions) {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Questionnaire</CardTitle>
              <CardDescription>
                {results.estimatedTime && `Temps estimé : ${results.estimatedTime}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.introduction && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-line">{results.introduction}</p>
                </div>
              )}
              
              {results.questions.map((q: any, idx: number) => (
                <div key={idx} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">Q{idx + 1}. {q.question}</p>
                    {q.required && <span className="text-xs text-destructive">*</span>}
                  </div>
                  <p className="text-xs text-muted-foreground uppercase">{q.type}</p>
                  {q.options && q.options.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {q.options.map((opt: string, oIdx: number) => (
                        <li key={oIdx} className="text-sm pl-2">□ {opt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === 'usability' && results.testScenarios) {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scénarios de Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.testScenarios.map((scenario: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Scénario {idx + 1}</h4>
                    <span className="text-xs text-muted-foreground">{scenario.expectedDuration}</span>
                  </div>
                  <p className="text-sm"><strong>Contexte :</strong> {scenario.scenario}</p>
                  <p className="text-sm"><strong>Tâche :</strong> {scenario.task}</p>
                  <p className="text-sm"><strong>Critère de succès :</strong> {scenario.successCriteria}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {results.metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Métriques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.metrics.quantitative && (
                  <div>
                    <p className="text-sm font-medium mb-1">Quantitatives :</p>
                    <ul className="space-y-1">
                      {results.metrics.quantitative.map((m: string, idx: number) => (
                        <li key={idx} className="text-sm">• {m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.metrics.qualitative && (
                  <div>
                    <p className="text-sm font-medium mb-1">Qualitatives :</p>
                    <ul className="space-y-1">
                      {results.metrics.qualitative.map((m: string, idx: number) => (
                        <li key={idx} className="text-sm">• {m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {results.facilitationGuide && (
            <Card>
              <CardHeader>
                <CardTitle>Guide d'Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{results.facilitationGuide}</p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interview" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Entretien
          </TabsTrigger>
          <TabsTrigger value="survey" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Sondage
          </TabsTrigger>
          <TabsTrigger value="usability" className="flex items-center gap-2">
            <MousePointer className="w-4 h-4" />
            Test d'Utilisabilité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interview" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="objectives-interview">Objectifs de Recherche *</Label>
            <Textarea
              id="objectives-interview"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Collez les objectifs de recherche..."
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="participant-profile">Profil des Participants *</Label>
            <Textarea
              id="participant-profile"
              value={participantProfile}
              onChange={(e) => setParticipantProfile(e.target.value)}
              placeholder="Décrivez le profil des participants cibles..."
              rows={3}
              className="mt-2"
            />
          </div>
        </TabsContent>

        <TabsContent value="survey" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="objectives-survey">Objectifs de Recherche *</Label>
            <Textarea
              id="objectives-survey"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Collez les objectifs de recherche..."
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="audience">Audience Cible *</Label>
            <Textarea
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Décrivez l'audience du sondage..."
              rows={3}
              className="mt-2"
            />
          </div>
        </TabsContent>

        <TabsContent value="usability" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="feature">Fonctionnalité à Tester *</Label>
            <Textarea
              id="feature"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="Décrivez la fonctionnalité ou le produit à tester..."
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="tasks">Tâches à Évaluer *</Label>
            <Textarea
              id="tasks"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder="Listez les tâches principales que les utilisateurs doivent accomplir..."
              rows={3}
              className="mt-2"
            />
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Génération en cours...
          </>
        ) : (
          'Générer le Matériel de Recherche'
        )}
      </Button>

      {renderResults()}

      {results && (
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
      )}
    </div>
  );
};
