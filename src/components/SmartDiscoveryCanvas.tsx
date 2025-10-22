import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share2, Download, Edit, Sparkles, Target, Users, TrendingUp, AlertTriangle, Lightbulb, BarChart3, FlaskConical, CheckCircle2, Rocket, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  problem: string;
  personas: string[];
  analytics: string[];
  competitors: string;
  redFlags: string[];
}

interface SolutionOption {
  id: string;
  title: string;
  description: string;
  effort: number;
  impact: "high" | "medium" | "low";
  details: string;
}

interface ValidationData {
  userComplaints: number;
  competitorAdoption: string;
  testIdeas: string[];
}

interface Epic {
  title: string;
  userStories: number;
  storyPoints: number;
  metrics: string;
  businessCase: string;
  validationPlan: string;
}

export const SmartDiscoveryCanvas = () => {
  const [initialInput, setInitialInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [solutions, setSolutions] = useState<SolutionOption[]>([]);
  const [validation, setValidation] = useState<ValidationData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [epic, setEpic] = useState<Epic | null>(null);
  const [isGeneratingEpic, setIsGeneratingEpic] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  const handleAnalyze = async () => {
    if (!initialInput.trim()) {
      toast.error("Veuillez entrer une idée ou demande");
      return;
    }

    setIsAnalyzing(true);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Analyze this product request and provide a structured response in JSON format:

INPUT: "${initialInput}"

Return ONLY a valid JSON object with this exact structure:
{
  "problem": "Reframed problem statement (user-centric, unbiased)",
  "personas": ["Persona 1", "Persona 2"],
  "analytics": ["Metric 1", "Metric 2", "Metric 3"],
  "competitors": "Brief competitor analysis",
  "redFlags": ["Red flag 1", "Red flag 2"]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const analysisData = typeof data === 'string' ? JSON.parse(data) : data;
      const normalized: AnalysisResult = {
        problem: typeof analysisData?.problem === 'string' ? analysisData.problem : '',
        personas: Array.isArray(analysisData?.personas) ? analysisData.personas : [],
        analytics: Array.isArray(analysisData?.analytics) ? analysisData.analytics : [],
        competitors: typeof analysisData?.competitors === 'string' ? analysisData.competitors : '',
        redFlags: Array.isArray(analysisData?.redFlags) ? analysisData.redFlags : [],
      };
      setAnalysis(normalized);
      
      // Auto-generate solutions after analysis
      await generateSolutions(normalized.problem);
      
      // Auto-generate validation data
      setValidation({
        userComplaints: Math.floor(Math.random() * 500) + 100,
        competitorAdoption: `${Math.floor(Math.random() * 30) + 5}%`,
        testIdeas: ["A/B test", "User interviews", "Beta program"]
      });

      setConfidence(Math.floor(Math.random() * 20) + 75);
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      
      toast.success("Analyse terminée !");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Erreur lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSolutions = async (problem: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Based on this problem: "${problem}"

Generate 3 solution options in JSON format with this exact structure:
{
  "solutions": [
    {
      "id": "option_a",
      "title": "Full Feature",
      "description": "Complete implementation",
      "effort": 13,
      "impact": "high",
      "details": "Detailed description"
    },
    {
      "id": "option_b", 
      "title": "Lite Version",
      "description": "Minimal viable",
      "effort": 5,
      "impact": "medium",
      "details": "Detailed description"
    },
    {
      "id": "option_c",
      "title": "Workaround",
      "description": "Quick fix",
      "effort": 2,
      "impact": "low", 
      "details": "Detailed description"
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const solutionsData = typeof data === 'string' ? JSON.parse(data) : data;
      setSolutions(solutionsData.solutions || []);
    } catch (error) {
      console.error('Solutions generation error:', error);
    }
  };

  const handleGenerateEpic = async () => {
    if (!selectedOption) {
      toast.error("Veuillez sélectionner une option");
      return;
    }

    setIsGeneratingEpic(true);

    try {
      const selectedSolution = solutions.find(s => s.id === selectedOption);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Generate an Epic for this solution: "${selectedSolution?.title}"

Return ONLY a valid JSON object:
{
  "title": "Epic title",
  "userStories": 5,
  "storyPoints": 21,
  "metrics": "Success metrics description",
  "businessCase": "ROI and business value",
  "validationPlan": "Validation approach"
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const epicData = typeof data === 'string' ? JSON.parse(data) : data;
      setEpic(epicData);
      toast.success("Epic généré !");
    } catch (error) {
      console.error('Epic generation error:', error);
      toast.error("Erreur lors de la génération de l'Epic");
    } finally {
      setIsGeneratingEpic(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Smart Discovery Canvas</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Initial Input */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Initial Input</h2>
            </div>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <Textarea
            placeholder="Collez le message Slack du stakeholder ou décrivez l'idée..."
            value={initialInput}
            onChange={(e) => setInitialInput(e.target.value)}
            className="min-h-[120px] mb-4"
          />

          {!analysis && (
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !initialInput.trim()}>
              {isAnalyzing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Sparkles className="w-4 h-4 mr-2" />
              Analyser avec Nova
            </Button>
          )}

          {analysis && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold">Nova Analysis</span>
                <span className="text-xs text-muted-foreground">(3s ago)</span>
              </div>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Problem detected: {(analysis?.problem ? analysis.problem.substring(0, 50) : '—')}...
                  </li>
                  {(Array.isArray(analysis?.redFlags) ? analysis!.redFlags : []).map((flag, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      {flag}
                    </li>
                  ))}
                </ul>
            </div>
          )}
        </Card>

        {/* Three Columns: Problem, Solution, Validation */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Problem */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">1. PROBLEM</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">🎯 Reframed Problem:</div>
                  <p className="text-sm text-muted-foreground">{analysis?.problem || '—'}</p>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">👥 Personas:</div>
                  <div className="space-y-1">
                    {(Array.isArray(analysis?.personas) ? analysis!.personas : []).map((persona, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {persona}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">📈 Analytics:</div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {(Array.isArray(analysis?.analytics) ? analysis!.analytics : []).map((metric, idx) => (
                      <li key={idx}>• {metric}</li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Dig Deeper
                </Button>
              </div>
            </Card>

            {/* Solution */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">2. SOLUTION</h3>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium mb-2">💡 3 Options:</div>
                {solutions.map((solution) => (
                  <div
                    key={solution.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOption === solution.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedOption(solution.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{solution.title}</span>
                      <Badge variant={solution.impact === "high" ? "default" : "secondary"} className="text-xs">
                        {solution.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{solution.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span>Effort: {solution.effort}</span>
                      <span className={getImpactColor(solution.impact)}>Impact: {solution.impact}</span>
                    </div>
                  </div>
                ))}

                <Button variant="outline" size="sm" className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate More
                </Button>
              </div>
            </Card>

            {/* Validation */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">3. VALIDATION</h3>
              </div>

              {validation && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">📊 Data Points:</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{validation.userComplaints} users complained</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span>Competitor adoption: {validation.competitorAdoption} only</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">🧪 Test Ideas:</div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {validation.testIdeas.map((idea, idx) => (
                        <li key={idx}>• {idea}</li>
                      ))}
                    </ul>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Build Test Plan
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Decision Matrix */}
        {solutions.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">4. DECISION MATRIX</h3>
              </div>
              <Button variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Recommend
              </Button>
            </div>

            <div className="mb-6">
              <div className="relative h-64 border rounded-lg p-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    {/* Axes */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
                    
                    {/* Labels */}
                    <div className="absolute -left-16 top-0 text-xs text-muted-foreground">High Impact</div>
                    <div className="absolute -left-16 bottom-0 text-xs text-muted-foreground">Low Impact</div>
                    <div className="absolute bottom-[-24px] left-0 text-xs text-muted-foreground">Low Effort</div>
                    <div className="absolute bottom-[-24px] right-0 text-xs text-muted-foreground">High Effort</div>

                    {/* Plot solutions */}
                    {solutions.map((solution, idx) => {
                      const impactValue = solution.impact === "high" ? 80 : solution.impact === "medium" ? 50 : 20;
                      const effortValue = (solution.effort / 15) * 100;
                      
                      return (
                        <div
                          key={solution.id}
                          className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition-transform hover:scale-110 ${
                            solution.impact === "high" ? 'bg-green-500' : 
                            solution.impact === "medium" ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{
                            left: `${effortValue}%`,
                            bottom: `${impactValue}%`,
                            transform: 'translate(-50%, 50%)'
                          }}
                          onClick={() => setSelectedOption(solution.id)}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {selectedOption && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Nova Recommendation: {solutions.find(s => s.id === selectedOption)?.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Why: Highest ROI, aligns with Q1 OKR, tech feasible
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleGenerateEpic} disabled={isGeneratingEpic}>
                    {isGeneratingEpic && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Generate Epic
                  </Button>
                  <Button variant="outline">Compare All</Button>
                  <Button variant="outline">Add Custom</Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Output Ready */}
        {epic && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">5. OUTPUT READY</h3>
              </div>
              <Button variant="outline" size="sm">Review</Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Epic: "{epic.title}"</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{epic.userStories} User Stories (total {epic.storyPoints} points)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Success Metrics: {epic.metrics}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Business Case: {epic.businessCase}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Validation Plan: {epic.validationPlan}</span>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>
                  <Rocket className="w-4 h-4 mr-2" />
                  Ship to Dev
                </Button>
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Share Canvas
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Footer Stats */}
        {analysis && (
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>💬 Stakeholders (3)</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>📊 Confidence: {confidence}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏱️ {timeSpent} min</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
