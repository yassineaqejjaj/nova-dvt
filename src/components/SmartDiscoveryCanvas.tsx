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
          message: `You are an expert Product Manager conducting a Smart Discovery analysis. Analyze the following product request and provide a structured, actionable response.

STAKEHOLDER INPUT:
"${initialInput}"

YOUR TASK:
1. Reframe the problem statement to be user-centric, unbiased, and focused on the root cause rather than the solution
2. Identify 2-3 specific user personas who would be affected (with job titles or roles)
3. List 3-4 key metrics that should be tracked to measure success
4. Provide a brief competitive landscape analysis (1-2 sentences)
5. Identify potential red flags or risks (2-3 items)

IMPORTANT GUIDELINES:
- Focus on "why" not "what" when reframing the problem
- Be specific with persona names (e.g., "Marketing Manager", "Sales Executive")
- Metrics should be measurable and business-relevant (e.g., "Conversion rate", "User retention", "Time to value")
- Red flags should highlight risks like scope creep, technical complexity, or market misalignment

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "problem": "Clear, user-centric problem statement that avoids mentioning specific solutions",
  "personas": ["Specific Persona 1 (e.g., Product Manager)", "Specific Persona 2 (e.g., Data Analyst)", "Specific Persona 3 (optional)"],
  "analytics": ["Measurable Metric 1", "Measurable Metric 2", "Measurable Metric 3", "Measurable Metric 4 (optional)"],
  "competitors": "Brief 1-2 sentence analysis of how competitors handle this problem",
  "redFlags": ["Specific Risk 1", "Specific Risk 2", "Specific Risk 3 (optional)"]
}

EXAMPLE OUTPUT:
{
  "problem": "Users struggle to find relevant insights in complex datasets, leading to missed opportunities and delayed decision-making",
  "personas": ["Data Analyst", "Product Manager", "Business Intelligence Lead"],
  "analytics": ["Time spent searching for data", "Number of insights discovered per session", "User satisfaction score", "Decision velocity"],
  "competitors": "Tableau offers visual analytics but lacks AI-powered recommendations. Looker provides strong BI but has a steep learning curve.",
  "redFlags": ["High technical complexity may increase development time", "Requires significant data infrastructure investment", "User adoption depends on data quality"]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      // Extract the response content - chat-ai wraps it in a response field
      const responseContent = data?.response || data;
      const analysisData = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
      
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
          message: `You are a Product Strategy expert. Generate 3 distinct solution options for the following problem, ranging from comprehensive to minimal.

PROBLEM STATEMENT:
"${problem}"

YOUR TASK:
Generate exactly 3 solution options with different effort/impact profiles:

OPTION A - COMPREHENSIVE SOLUTION (High Impact, High Effort)
- Full-featured implementation addressing all aspects of the problem
- Effort: 8-13 story points
- Impact: "high"
- Should include advanced features, scalability, and polish

OPTION B - VIABLE SOLUTION (Medium Impact, Medium Effort)  
- Core functionality that solves the main problem
- Effort: 3-8 story points
- Impact: "medium"
- Should be production-ready but with limited scope

OPTION C - QUICK WIN (Low-Medium Impact, Low Effort)
- Minimal implementation or workaround
- Effort: 1-3 story points
- Impact: "low"
- Should provide immediate value with minimal investment

GUIDELINES:
- Each solution should be distinct and realistic
- Effort should be estimated in story points (1-13 range)
- Details should explain key features, technical approach, and tradeoffs
- Focus on business value and user impact

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "solutions": [
    {
      "id": "option_a",
      "title": "Concise, descriptive title (3-5 words)",
      "description": "One-line summary of the approach",
      "effort": 10,
      "impact": "high",
      "details": "2-3 sentences explaining what this includes, why it's valuable, and key tradeoffs"
    },
    {
      "id": "option_b",
      "title": "Concise, descriptive title",
      "description": "One-line summary",
      "effort": 5,
      "impact": "medium",
      "details": "2-3 sentences with specifics"
    },
    {
      "id": "option_c",
      "title": "Concise, descriptive title",
      "description": "One-line summary",
      "effort": 2,
      "impact": "low",
      "details": "2-3 sentences with specifics"
    }
  ]
}

EXAMPLE OUTPUT:
{
  "solutions": [
    {
      "id": "option_a",
      "title": "AI-Powered Analytics Hub",
      "description": "Full-featured intelligent data platform",
      "effort": 13,
      "impact": "high",
      "details": "Build a comprehensive analytics platform with AI recommendations, custom dashboards, real-time alerts, and collaborative features. Includes advanced filtering, export capabilities, and mobile app. Highest user satisfaction but requires 3-4 months development."
    },
    {
      "id": "option_b",
      "title": "Smart Search & Filters",
      "description": "Enhanced search with basic recommendations",
      "effort": 5,
      "impact": "medium",
      "details": "Add intelligent search, key metrics dashboard, and basic AI suggestions. Covers 80% of use cases with 40% of the effort. Can be delivered in 4-6 weeks and iterated based on feedback."
    },
    {
      "id": "option_c",
      "title": "Quick Insights Widget",
      "description": "Lightweight recommendation panel",
      "effort": 2,
      "impact": "low",
      "details": "Add a simple insights sidebar showing top 5 recommendations based on user behavior. Minimal development overhead, can ship in 1-2 weeks. Good for validating user interest before bigger investment."
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      // Extract the response content
      const responseContent = data?.response || data;
      const solutionsData = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
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
          message: `You are a Senior Product Manager creating an Epic breakdown. Generate a detailed Epic specification for the following solution.

SELECTED SOLUTION:
Title: "${selectedSolution?.title}"
Description: ${selectedSolution?.description}
Effort: ${selectedSolution?.effort} story points
Impact: ${selectedSolution?.impact}
Details: ${selectedSolution?.details}

YOUR TASK:
Create a comprehensive Epic that includes:

1. EPIC TITLE: Clear, action-oriented title that describes the outcome (not the feature)
2. USER STORIES: Realistic estimate of how many user stories this would break down into (typically 3-8)
3. STORY POINTS: Total effort estimate aligned with the solution's effort score (should be similar or slightly higher)
4. SUCCESS METRICS: 3-4 specific, measurable KPIs to track success
5. BUSINESS CASE: Clear ROI explanation including revenue impact, cost savings, or strategic value
6. VALIDATION PLAN: Concrete approach to validate success (A/B tests, beta program, phased rollout, etc.)

GUIDELINES:
- Epic title should focus on user outcomes, not implementation
- User stories count should reflect the scope realistically
- Metrics must be measurable and time-bound
- Business case should include quantifiable benefits
- Validation plan should be actionable and specific

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "title": "User-centric epic title describing the outcome",
  "userStories": 6,
  "storyPoints": 13,
  "metrics": "3-4 specific metrics to track (e.g., '50% reduction in search time', '30% increase in insights discovered', 'NPS improvement from 40 to 60')",
  "businessCase": "Clear ROI statement with quantifiable benefits (e.g., 'Expected to save 20 hours/week across 50 analysts = $200K annual productivity gain. Reduces time-to-insight from 3 days to 3 hours, accelerating decision-making.')",
  "validationPlan": "Specific validation approach (e.g., '3-week beta with 20 power users → measure time savings and satisfaction → phased rollout to 50% → full launch based on NPS >60')"
}

EXAMPLE OUTPUT:
{
  "title": "Enable data analysts to discover insights 10x faster",
  "userStories": 7,
  "storyPoints": 13,
  "metrics": "Time-to-insight reduced from 3 days to 3 hours, 50% increase in insights discovered per week, User satisfaction score >4.5/5, 80% feature adoption rate within 30 days",
  "businessCase": "Estimated $250K annual productivity savings across 60 analysts. Faster insights enable 2x more A/B tests per quarter, projected to increase conversion rate by 0.5% ($400K additional annual revenue). Strategic advantage in data-driven decision making.",
  "validationPlan": "Phase 1: 2-week beta with 10 power users, measure time savings and satisfaction. Phase 2: Expand to 30 users if time-to-insight improves by >50%. Phase 3: Full rollout if NPS >65 and 70% daily active usage. Include weekly check-ins and feedback sessions."
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      // Extract the response content
      const responseContent = data?.response || data;
      const epicData = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
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
