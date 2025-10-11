import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeatureDiscoveryWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeContext?: any;
}

interface ProblemData {
  problemStatement: string;
  targetUsers: string;
  painPoints: string[];
}

interface HypothesisData {
  hypothesis: string;
  expectedBenefits: string[];
  risks: string[];
}

interface ValidationData {
  successMetrics: string[];
  validationMethod: string;
  timeline: string;
}

interface EpicData {
  title: string;
  description: string;
  userStories: UserStory[];
  acceptanceCriteria: string[];
  definitionOfDone: string[];
  kpis: string[];
}

interface UserStory {
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
}

export const FeatureDiscoveryWorkflow: React.FC<FeatureDiscoveryWorkflowProps> = ({
  open,
  onOpenChange,
  activeContext,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Step 1: Problem Definition
  const [problemData, setProblemData] = useState<ProblemData>({
    problemStatement: '',
    targetUsers: activeContext?.target_audience || '',
    painPoints: [],
  });
  const [newPainPoint, setNewPainPoint] = useState('');

  // Step 2: Hypothesis Formulation
  const [hypothesisData, setHypothesisData] = useState<HypothesisData>({
    hypothesis: '',
    expectedBenefits: [],
    risks: [],
  });
  const [newBenefit, setNewBenefit] = useState('');
  const [newRisk, setNewRisk] = useState('');

  // Step 3: Validation Planning
  const [validationData, setValidationData] = useState<ValidationData>({
    successMetrics: [],
    validationMethod: '',
    timeline: '',
  });
  const [newMetric, setNewMetric] = useState('');

  // Step 4: Epic Generation
  const [epicData, setEpicData] = useState<EpicData | null>(null);

  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      setProblemData({ ...problemData, painPoints: [...problemData.painPoints, newPainPoint.trim()] });
      setNewPainPoint('');
    }
  };

  const removePainPoint = (index: number) => {
    setProblemData({
      ...problemData,
      painPoints: problemData.painPoints.filter((_, i) => i !== index),
    });
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setHypothesisData({ ...hypothesisData, expectedBenefits: [...hypothesisData.expectedBenefits, newBenefit.trim()] });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setHypothesisData({
      ...hypothesisData,
      expectedBenefits: hypothesisData.expectedBenefits.filter((_, i) => i !== index),
    });
  };

  const addRisk = () => {
    if (newRisk.trim()) {
      setHypothesisData({ ...hypothesisData, risks: [...hypothesisData.risks, newRisk.trim()] });
      setNewRisk('');
    }
  };

  const removeRisk = (index: number) => {
    setHypothesisData({
      ...hypothesisData,
      risks: hypothesisData.risks.filter((_, i) => i !== index),
    });
  };

  const addMetric = () => {
    if (newMetric.trim()) {
      setValidationData({ ...validationData, successMetrics: [...validationData.successMetrics, newMetric.trim()] });
      setNewMetric('');
    }
  };

  const removeMetric = (index: number) => {
    setValidationData({
      ...validationData,
      successMetrics: validationData.successMetrics.filter((_, i) => i !== index),
    });
  };

  const generateEpic = async () => {
    setIsGenerating(true);
    try {
      const contextInfo = activeContext
        ? `Product Context:\n- Vision: ${activeContext.vision}\n- Objectives: ${JSON.stringify(activeContext.objectives)}\n- Constraints: ${activeContext.constraints}\n- Target Audience: ${activeContext.target_audience}`
        : '';

      const prompt = `Based on the following information, generate a comprehensive Epic artifact with User Stories:

${contextInfo}

Problem Definition:
- Problem Statement: ${problemData.problemStatement}
- Target Users: ${problemData.targetUsers}
- Pain Points: ${problemData.painPoints.join(', ')}

Hypothesis:
- Solution Hypothesis: ${hypothesisData.hypothesis}
- Expected Benefits: ${hypothesisData.expectedBenefits.join(', ')}
- Risks & Assumptions: ${hypothesisData.risks.join(', ')}

Validation Plan:
- Success Metrics: ${validationData.successMetrics.join(', ')}
- Validation Method: ${validationData.validationMethod}
- Timeline: ${validationData.timeline}

Generate a structured Epic that includes:
1. Epic Title (concise, action-oriented)
2. Epic Description (comprehensive overview)
3. 3-5 User Stories in the format: "As a [persona], I want [action] so that [benefit]"
4. Acceptance Criteria for the Epic (5-7 items)
5. Definition of Done (3-5 items)
6. Key Performance Indicators (KPIs) aligned with validation metrics

Return the response in JSON format with this structure:
{
  "title": "Epic title",
  "description": "Epic description",
  "userStories": [
    {
      "title": "Story title",
      "asA": "user persona",
      "iWant": "action",
      "soThat": "benefit",
      "acceptanceCriteria": ["AC1", "AC2", "AC3"]
    }
  ],
  "acceptanceCriteria": ["Epic AC1", "Epic AC2"],
  "definitionOfDone": ["DoD1", "DoD2"],
  "kpis": ["KPI1", "KPI2"]
}`;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: prompt,
          systemPrompt: 'You are an expert Product Manager. Generate structured, actionable Epic artifacts with clear User Stories. Always respond with valid JSON only, no additional text.',
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Raw response from chat-ai:', data);

      let generatedEpic;
      
      // Handle the response structure: data.response contains the AI response
      const responseText = data?.response || data;
      
      if (typeof responseText === 'string') {
        // Extract JSON from markdown code blocks if present
        const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          generatedEpic = JSON.parse(codeBlockMatch[1]);
        } else {
          // Try to find JSON object in the text
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generatedEpic = JSON.parse(jsonMatch[0]);
          } else {
            console.error('No JSON found in response:', responseText);
            throw new Error('La réponse de l\'IA n\'est pas au format JSON valide');
          }
        }
      } else if (typeof responseText === 'object') {
        generatedEpic = responseText;
      } else {
        throw new Error('Format de réponse inattendu');
      }

      console.log('Parsed epic data:', generatedEpic);

      // Validate the structure
      if (!generatedEpic.title || !generatedEpic.userStories || !Array.isArray(generatedEpic.userStories)) {
        console.error('Invalid epic structure:', generatedEpic);
        throw new Error('Structure de l\'Epic invalide');
      }

      setEpicData(generatedEpic);
      toast.success('Epic généré avec succès');
    } catch (error) {
      console.error('Error generating epic:', error);
      toast.error('Erreur lors de la génération de l\'Epic');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveEpic = async () => {
    if (!epicData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('artifacts').insert([{
        user_id: user.id,
        artifact_type: 'epic',
        title: epicData.title,
        content: {
          description: epicData.description,
          userStories: epicData.userStories,
          acceptanceCriteria: epicData.acceptanceCriteria,
          definitionOfDone: epicData.definitionOfDone,
          kpis: epicData.kpis,
          sourceData: {
            problem: problemData,
            hypothesis: hypothesisData,
            validation: validationData,
          },
        } as any,
        metadata: {
          context_id: activeContext?.id,
          workflow: 'feature-discovery',
        } as any,
      }]);

      if (error) throw error;

      toast.success('Epic sauvegardé dans les artefacts');
      onOpenChange(false);
      
      // Reset form
      setCurrentStep(1);
      setProblemData({ problemStatement: '', targetUsers: '', painPoints: [] });
      setHypothesisData({ hypothesis: '', expectedBenefits: [], risks: [] });
      setValidationData({ successMetrics: [], validationMethod: '', timeline: '' });
      setEpicData(null);
    } catch (error) {
      console.error('Error saving epic:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="problem">Énoncé du problème *</Label>
        <Textarea
          id="problem"
          placeholder="Décrivez le problème que vous souhaitez résoudre..."
          value={problemData.problemStatement}
          onChange={(e) => setProblemData({ ...problemData, problemStatement: e.target.value })}
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="users">Utilisateurs cibles *</Label>
        <Input
          id="users"
          placeholder="Qui sont les utilisateurs concernés ?"
          value={problemData.targetUsers}
          onChange={(e) => setProblemData({ ...problemData, targetUsers: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Points de douleur actuels</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Ajouter un point de douleur..."
            value={newPainPoint}
            onChange={(e) => setNewPainPoint(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPainPoint()}
          />
          <Button onClick={addPainPoint} size="icon" type="button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {problemData.painPoints.map((point, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {point}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removePainPoint(index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="hypothesis">Hypothèse de solution *</Label>
        <Textarea
          id="hypothesis"
          placeholder="Décrivez votre hypothèse de solution..."
          value={hypothesisData.hypothesis}
          onChange={(e) => setHypothesisData({ ...hypothesisData, hypothesis: e.target.value })}
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Bénéfices attendus</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Ajouter un bénéfice..."
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
          />
          <Button onClick={addBenefit} size="icon" type="button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {hypothesisData.expectedBenefits.map((benefit, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {benefit}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeBenefit(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Risques & Hypothèses</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Ajouter un risque ou hypothèse..."
            value={newRisk}
            onChange={(e) => setNewRisk(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addRisk()}
          />
          <Button onClick={addRisk} size="icon" type="button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {hypothesisData.risks.map((risk, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {risk}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeRisk(index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <Label>Métriques de succès (KPIs)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Ajouter une métrique..."
            value={newMetric}
            onChange={(e) => setNewMetric(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addMetric()}
          />
          <Button onClick={addMetric} size="icon" type="button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {validationData.successMetrics.map((metric, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {metric}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeMetric(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="method">Méthode de validation *</Label>
        <Select
          value={validationData.validationMethod}
          onValueChange={(value) => setValidationData({ ...validationData, validationMethod: value })}
        >
          <SelectTrigger id="method" className="mt-1">
            <SelectValue placeholder="Sélectionnez une méthode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ab-testing">A/B Testing</SelectItem>
            <SelectItem value="user-interview">Entretiens utilisateurs</SelectItem>
            <SelectItem value="prototype">Prototype / MVP</SelectItem>
            <SelectItem value="survey">Enquête</SelectItem>
            <SelectItem value="analytics">Analyse de données</SelectItem>
            <SelectItem value="beta">Bêta test</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="timeline">Calendrier *</Label>
        <Input
          id="timeline"
          type="date"
          value={validationData.timeline}
          onChange={(e) => setValidationData({ ...validationData, timeline: e.target.value })}
          className="mt-1"
        />
      </div>
    </div>
  );

  const renderStep4 = () => {
    if (!epicData) {
      return (
        <div className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">
            Prêt à générer votre Epic avec les User Stories basées sur les informations collectées.
          </p>
          <Button onClick={generateEpic} disabled={isGenerating} size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              'Générer l\'Epic'
            )}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{epicData.title}</CardTitle>
            <CardDescription>{epicData.description}</CardDescription>
          </CardHeader>
        </Card>

        <div>
          <h3 className="text-lg font-semibold mb-3">User Stories</h3>
          <div className="space-y-3">
            {epicData.userStories.map((story, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{story.title}</CardTitle>
                  <CardDescription className="space-y-1 text-sm">
                    <p>
                      <strong>En tant que</strong> {story.asA}
                    </p>
                    <p>
                      <strong>Je veux</strong> {story.iWant}
                    </p>
                    <p>
                      <strong>Afin de</strong> {story.soThat}
                    </p>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">Critères d'acceptation:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {story.acceptanceCriteria.map((ac, acIndex) => (
                      <li key={acIndex}>{ac}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Critères d'acceptation (Epic)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {epicData.acceptanceCriteria.map((ac, index) => (
                  <li key={index}>{ac}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Definition of Done</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {epicData.definitionOfDone.map((dod, index) => (
                  <li key={index}>{dod}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {epicData.kpis.map((kpi, index) => (
                <Badge key={index} variant="outline">
                  {kpi}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveEpic} size="lg">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Sauvegarder l'Epic
          </Button>
        </div>
      </div>
    );
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return problemData.problemStatement.trim() && problemData.targetUsers.trim();
      case 2:
        return hypothesisData.hypothesis.trim();
      case 3:
        return validationData.validationMethod && validationData.timeline;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Feature Discovery & Validation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Problem Definition' },
              { num: 2, title: 'Hypothesis' },
              { num: 3, title: 'Validation' },
              { num: 4, title: 'Epic Generation' },
            ].map((step, index) => (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.num
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.num
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.num ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.num ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canGoNext()}>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
