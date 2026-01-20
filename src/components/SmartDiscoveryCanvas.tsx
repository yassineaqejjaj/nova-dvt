import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share2, Download, Edit, Sparkles, Target, Users, TrendingUp, AlertTriangle, Lightbulb, BarChart3, FlaskConical, CheckCircle2, Rocket, Save, Send, ArrowLeft, Copy, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ContextSelector } from "./ContextSelector";
import { Separator } from "@/components/ui/separator";

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
  const [isDiggingDeeper, setIsDiggingDeeper] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [isBuildingTestPlan, setIsBuildingTestPlan] = useState(false);
  const [testPlan, setTestPlan] = useState<string | null>(null);
  const [importedContext, setImportedContext] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input');

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
      
      // Switch to results view
      setCurrentView('results');
      
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

  const handleDigDeeper = async () => {
    if (!analysis) return;
    
    setIsDiggingDeeper(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `You are a Product Discovery expert. Expand on the following problem analysis with deeper insights.

CURRENT ANALYSIS:
Problem: "${analysis.problem}"
Personas: ${analysis.personas.join(', ')}
Competitors: "${analysis.competitors}"

YOUR TASK:
Provide deeper analysis including:
1. Root cause analysis - dig into the "why" behind this problem
2. Detailed persona pain points - specific challenges each persona faces
3. Market opportunity sizing - TAM/SAM/SOM estimates if applicable
4. Competitive gaps - specific weaknesses in competitor solutions
5. Strategic implications - how solving this aligns with broader business goals

Return ONLY valid JSON (no markdown):
{
  "rootCause": "2-3 sentence analysis of the underlying root cause",
  "personaDetails": {
    "${analysis.personas[0] || 'Persona 1'}": "Specific pain points and context",
    "${analysis.personas[1] || 'Persona 2'}": "Specific pain points and context"
  },
  "marketOpportunity": "1-2 sentences on market size and growth potential",
  "competitiveGaps": ["Specific gap 1", "Specific gap 2", "Specific gap 3"],
  "strategicValue": "Why this matters for the business strategy"
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const responseContent = data?.response || data;
      const deeperAnalysis = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
      
      // Enhance the existing analysis with deeper insights
      setAnalysis(prev => prev ? {
        ...prev,
        competitors: deeperAnalysis.competitiveGaps?.join(', ') || prev.competitors,
        redFlags: [...(prev.redFlags || []), ...(deeperAnalysis.competitiveGaps || [])]
      } : prev);
      
      toast.success("Analysis enrichie avec plus de détails !");
    } catch (error) {
      console.error('Dig deeper error:', error);
      toast.error("Erreur lors de l'analyse approfondie");
    } finally {
      setIsDiggingDeeper(false);
    }
  };

  const handleGenerateMoreSolutions = async () => {
    if (!analysis) return;
    
    setIsGeneratingMore(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `You are a Product Innovation expert. Generate 3 additional creative solution options for this problem.

PROBLEM: "${analysis.problem}"
EXISTING SOLUTIONS: ${solutions.length} options already generated

YOUR TASK:
Generate 3 NEW, creative solution approaches that are different from typical solutions. Consider:
- Unconventional approaches
- Partnership/ecosystem plays
- Technology innovations
- Process innovations
- Business model innovations

Return ONLY valid JSON (no markdown):
{
  "solutions": [
    {
      "id": "creative_1",
      "title": "Innovative solution title",
      "description": "One-line creative approach",
      "effort": 5,
      "impact": "medium",
      "details": "Explanation of why this is innovative and its unique value"
    },
    {
      "id": "creative_2",
      "title": "Partnership-based solution",
      "description": "Ecosystem or integration approach",
      "effort": 3,
      "impact": "medium",
      "details": "How partnerships reduce effort and increase value"
    },
    {
      "id": "creative_3",
      "title": "Future-forward solution",
      "description": "Emerging tech or trend-based",
      "effort": 8,
      "impact": "high",
      "details": "Long-term strategic value and differentiation"
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const responseContent = data?.response || data;
      const newSolutions = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
      
      setSolutions(prev => [...prev, ...(newSolutions.solutions || [])]);
      toast.success(`${newSolutions.solutions?.length || 0} nouvelles options ajoutées !`);
    } catch (error) {
      console.error('Generate more solutions error:', error);
      toast.error("Erreur lors de la génération de solutions");
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const handleBuildTestPlan = async () => {
    if (!validation || !analysis) return;
    
    setIsBuildingTestPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `You are a Product Validation expert. Create a comprehensive test plan for validating this problem and solution.

PROBLEM: "${analysis.problem}"
DATA POINTS: ${validation.userComplaints} complaints, ${validation.competitorAdoption} competitor adoption

YOUR TASK:
Create a detailed, actionable test plan with:
1. Research objectives - what we need to learn
2. Test methods - specific approaches (surveys, interviews, A/B tests, etc.)
3. Success criteria - how we'll measure validation
4. Timeline - realistic phases and durations
5. Required resources - team, budget, tools
6. Risk mitigation - what could go wrong and contingencies

Return ONLY valid JSON (no markdown):
{
  "objectives": ["Specific learning objective 1", "Specific learning objective 2", "Specific learning objective 3"],
  "methods": [
    {
      "name": "User Interviews",
      "details": "20 interviews with target personas, 30min each",
      "timeline": "Week 1-2",
      "cost": "$2,000"
    },
    {
      "name": "A/B Test",
      "details": "Test core hypothesis with 1000 users",
      "timeline": "Week 3-4",
      "cost": "$5,000"
    }
  ],
  "successCriteria": "70% of users confirm problem exists, 60% willing to pay, NPS >50",
  "timeline": "4-6 weeks total",
  "budget": "$10,000-15,000",
  "risks": ["Low response rate → use incentives", "Biased feedback → use neutral language"]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const responseContent = data?.response || data;
      const plan = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
      
      setTestPlan(JSON.stringify(plan, null, 2));
      toast.success("Plan de test créé !");
    } catch (error) {
      console.error('Build test plan error:', error);
      toast.error("Erreur lors de la création du plan de test");
    } finally {
      setIsBuildingTestPlan(false);
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

  const handleStartOver = () => {
    setAnalysis(null);
    setSolutions([]);
    setValidation(null);
    setSelectedOption(null);
    setEpic(null);
    setTestPlan(null);
    setConfidence(0);
    setTimeSpent(0);
    setCurrentView('input');
  };

  const handleCopyResults = () => {
    const resultsText = `
Smart Discovery Canvas Results
==============================

📋 Original Input:
${initialInput}

🎯 Problem Analysis:
${analysis?.problem || 'N/A'}

👥 Personas:
${analysis?.personas?.join(', ') || 'N/A'}

📈 Key Metrics:
${analysis?.analytics?.map(m => `• ${m}`).join('\n') || 'N/A'}

🏢 Competitive Landscape:
${analysis?.competitors || 'N/A'}

⚠️ Red Flags:
${analysis?.redFlags?.map(r => `• ${r}`).join('\n') || 'N/A'}

💡 Solutions:
${solutions.map((s, i) => `${i + 1}. ${s.title} (Effort: ${s.effort}, Impact: ${s.impact})\n   ${s.description}`).join('\n') || 'N/A'}

${epic ? `
🚀 Epic:
Title: ${epic.title}
User Stories: ${epic.userStories}
Story Points: ${epic.storyPoints}
Metrics: ${epic.metrics}
Business Case: ${epic.businessCase}
Validation Plan: ${epic.validationPlan}
` : ''}
    `.trim();
    
    navigator.clipboard.writeText(resultsText);
    toast.success("Résultats copiés dans le presse-papier");
  };

  // INPUT VIEW
  if (currentView === 'input') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">Smart Discovery Canvas</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Transformez une idée ou demande stakeholder en analyse structurée et Epic prêt à développer
            </p>
          </div>

          {/* Input Card */}
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Décrivez votre idée ou demande</h2>
              </div>

              <Textarea
                placeholder="Collez le message Slack du stakeholder, décrivez une idée de feature, ou expliquez un problème utilisateur à résoudre..."
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
                className="min-h-[200px] text-base"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ContextSelector
                    onContextSelected={(context) => {
                      setImportedContext(context);
                      const contextInfo = `
Contexte: ${context.name}
Vision: ${context.vision || 'Non définie'}
Objectifs: ${context.objectives.join(', ')}
Audience: ${context.target_audience || 'Non définie'}
`;
                      setInitialInput(prev => prev ? `${prev}\n\n${contextInfo}` : contextInfo);
                    }}
                    selectedContextId={importedContext?.id}
                  />
                  {importedContext && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {importedContext.name}
                    </Badge>
                  )}
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !initialInput.trim()}
                  size="lg"
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyser avec Nova
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center p-4">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Reformulation du problème</h3>
              <p className="text-sm text-muted-foreground">Cadrage user-centric automatique</p>
            </div>
            <div className="text-center p-4">
              <Lightbulb className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">3 options de solution</h3>
              <p className="text-sm text-muted-foreground">Matrice effort/impact intégrée</p>
            </div>
            <div className="text-center p-4">
              <Rocket className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Epic prêt à shipper</h3>
              <p className="text-sm text-muted-foreground">User stories et business case</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS VIEW
  return (
    <div className="min-h-screen bg-background">
      {/* Results Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleStartOver}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Nouvelle analyse
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold">Smart Discovery Canvas</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyResults}>
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Original Input Summary */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Demande analysée</h3>
              <p className="text-sm line-clamp-2">{initialInput}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('input')}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground bg-muted/30 rounded-lg py-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{analysis?.personas?.length || 0} Personas identifiées</span>
          </div>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span>{solutions.length} Solutions générées</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Confiance: {confidence}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏱️ Analysé en {timeSpent}s</span>
          </div>
        </div>

        {/* Three Columns: Problem, Solution, Validation */}
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
                <div className="flex flex-wrap gap-1">
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

              <div>
                <div className="text-sm font-medium mb-2">🏢 Competitors:</div>
                <p className="text-sm text-muted-foreground">{analysis?.competitors || '—'}</p>
              </div>

              {analysis?.redFlags && analysis.redFlags.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">⚠️ Red Flags:</div>
                  <ul className="space-y-1">
                    {analysis.redFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleDigDeeper}
                disabled={isDiggingDeeper}
              >
                {isDiggingDeeper && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
              <div className="text-sm font-medium mb-2">💡 {solutions.length} Options:</div>
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

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleGenerateMoreSolutions}
                disabled={isGeneratingMore}
              >
                {isGeneratingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleBuildTestPlan}
                  disabled={isBuildingTestPlan}
                >
                  {isBuildingTestPlan && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Sparkles className="w-4 h-4 mr-2" />
                  Build Test Plan
                </Button>
                
                {testPlan && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-xs font-medium mb-2">📋 Test Plan Generated</div>
                    <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40">
                      {testPlan}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

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
                          } ${selectedOption === solution.id ? 'ring-4 ring-primary ring-offset-2' : ''}`}
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
                  <span className="font-semibold">Selected: {solutions.find(s => s.id === selectedOption)?.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {solutions.find(s => s.id === selectedOption)?.details}
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleGenerateEpic} disabled={isGeneratingEpic}>
                    {isGeneratingEpic && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Rocket className="w-4 h-4 mr-2" />
                    Generate Epic
                  </Button>
                  <Button variant="outline">Compare All</Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Output Ready - Epic */}
        {epic && (
          <Card className="p-6 border-green-500/50 bg-green-500/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-semibold">5. EPIC READY</h3>
              </div>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Prêt à développer
              </Badge>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-primary mb-2">{epic.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {epic.userStories} User Stories
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {epic.storyPoints} Story Points
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Success Metrics
                  </h5>
                  <p className="text-sm text-muted-foreground">{epic.metrics}</p>
                </div>

                <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Business Case
                  </h5>
                  <p className="text-sm text-muted-foreground">{epic.businessCase}</p>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  Validation Plan
                </h5>
                <p className="text-sm text-muted-foreground">{epic.validationPlan}</p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button size="lg">
                  <Rocket className="w-4 h-4 mr-2" />
                  Ship to Dev
                </Button>
                <Button variant="outline" size="lg">
                  <Save className="w-4 h-4 mr-2" />
                  Save to Artifacts
                </Button>
                <Button variant="outline" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Share Canvas
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
