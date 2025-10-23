import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  GitBranch, FolderGit2, Loader2, Download, Code, FileText, Bug, Shield,
  Target, Users, Lightbulb, TrendingUp, Calendar, BarChart
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from "docx";
import { saveAs } from "file-saver";

interface GitRepoAnalysis {
  // Executive Summary
  executive: {
    overview: string;
    productVision: string;
    problemStatement: string;
    targetAudience: string;
    valueProposition: string;
  };
  
  // Product Context
  context: {
    businessContext: string;
    marketAnalysis: string;
    competitiveLandscape: string;
    constraints: string[];
    assumptions: string[];
  };
  
  // User Research
  personas: Array<{
    name: string;
    role: string;
    goals: string[];
    painPoints: string[];
    behaviors: string[];
  }>;
  
  userJourneys: Array<{
    persona: string;
    stage: string;
    actions: string[];
    thoughts: string[];
    painPoints: string[];
    opportunities: string[];
  }>;
  
  // Features & Requirements
  features: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    priority: 'must' | 'should' | 'could' | 'wont';
    userStories: Array<{
      id: string;
      title: string;
      description: string;
      acceptanceCriteria: string[];
      complexity: 'XS' | 'S' | 'M' | 'L' | 'XL';
    }>;
  }>;
  
  functionalRequirements: Array<{
    id: string;
    description: string;
    priority: 'must' | 'should' | 'could' | 'wont';
    relatedFeatures: string[];
  }>;
  
  nonFunctionalRequirements: Array<{
    id: string;
    type: string;
    description: string;
    metric: string;
    target: string;
  }>;
  
  // Technical Specifications
  techSpec: {
    architecture: {
      overview: string;
      patterns: string[];
      components: Array<{
        name: string;
        type: string;
        description: string;
        responsibilities: string[];
        dependencies: string[];
      }>;
    };
    frameworks: Array<{
      name: string;
      version: string;
      purpose: string;
    }>;
    dataModels: Array<{
      name: string;
      description: string;
      fields: Array<{ name: string; type: string; required: boolean }>;
      relationships: string[];
    }>;
    integrations: Array<{
      name: string;
      type: string;
      description: string;
      apis: string[];
    }>;
  };
  
  // API Documentation
  apiCatalog: Array<{
    method: string;
    path: string;
    description: string;
    parameters: Array<{ name: string; type: string; required: boolean }>;
    authentication: boolean;
    responses: Array<{ code: number; description: string }>;
  }>;
  
  // Quality Assurance
  testPlan: {
    strategy: string;
    coverageScore: number;
    testedEndpoints: number;
    totalEndpoints: number;
    testTypes: Array<{
      type: string;
      coverage: number;
      description: string;
    }>;
    gaps: string[];
    suggestions: string[];
    criticalPaths: string[];
  };
  
  // Risk Management
  riskRegister: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    impact: string;
    probability: string;
    mitigation: string;
    dependencies: string[];
  }>;
  
  // Roadmap & Planning
  roadmap: Array<{
    phase: string;
    timeline: string;
    goals: string[];
    deliverables: string[];
    dependencies: string[];
  }>;
  
  // Success Metrics
  kpis: Array<{
    name: string;
    description: string;
    target: string;
    measurement: string;
  }>;
}

export const GitToSpecsGenerator = () => {
  const [step, setStep] = useState(1);
  const [repoUrl, setRepoUrl] = useState("");
  const [path, setPath] = useState("");
  const [branch, setBranch] = useState("main");
  const [depth, setDepth] = useState<"quick" | "deep">("quick");
  const [outputProfile, setOutputProfile] = useState<"pm" | "dev" | "qa">("pm");
  const [languages, setLanguages] = useState<string[]>(["typescript", "javascript"]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<GitRepoAnalysis | null>(null);

  const availableLanguages = [
    "typescript", "javascript", "python", "java", "go", "rust", "ruby", "php"
  ];

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleAnalyze = async () => {
    if (!repoUrl) {
      toast.error("Please enter a repository URL");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setStep(3);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-git-repo', {
        body: {
          repoUrl,
          path,
          branch,
          depth,
          languages,
          outputProfile
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setAnalysis(data);
      toast.success("Repository analyzed successfully!");
      setTimeout(() => setStep(4), 500);

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze repository");
      clearInterval(progressInterval);
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportAsDocument = async () => {
    if (!analysis) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "Comprehensive Repository Specifications",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: `Generated on ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),

          // Executive Summary Section
          new Paragraph({
            text: "EXECUTIVE SUMMARY",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "Overview",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.executive.overview,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Product Vision",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.executive.productVision,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Problem Statement",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.executive.problemStatement,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Target Audience",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.executive.targetAudience,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Value Proposition",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.executive.valueProposition,
            spacing: { after: 400 }
          }),

          // Product Context Section
          new Paragraph({
            text: "PRODUCT CONTEXT",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "Business Context",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.context.businessContext,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Market Analysis",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.context.marketAnalysis,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Competitive Landscape",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.context.competitiveLandscape,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Constraints",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...( analysis.context?.constraints || []).map(c => new Paragraph({
            text: `• ${c}`,
            spacing: { after: 100 }
          })),
          new Paragraph({
            text: "Assumptions",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...(analysis.context?.assumptions || []).map(a => new Paragraph({
            text: `• ${a}`,
            spacing: { after: 100 }
          })),

          // User Research Section
          new Paragraph({
            text: "USER RESEARCH",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "User Personas",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...(analysis.personas || []).flatMap(persona => [
            new Paragraph({
              text: `${persona.name} - ${persona.role}`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({ 
              children: [new TextRun({ text: "Goals:", bold: true })],
              spacing: { after: 50 } 
            }),
            ...persona.goals.map(g => new Paragraph({ text: `• ${g}`, spacing: { after: 50 } })),
            new Paragraph({ 
              children: [new TextRun({ text: "Pain Points:", bold: true })],
              spacing: { before: 100, after: 50 } 
            }),
            ...persona.painPoints.map(p => new Paragraph({ text: `• ${p}`, spacing: { after: 50 } })),
            new Paragraph({ 
              children: [new TextRun({ text: "Behaviors:", bold: true })],
              spacing: { before: 100, after: 50 } 
            }),
            ...persona.behaviors.map(b => new Paragraph({ text: `• ${b}`, spacing: { after: 100 } }))
          ]),

          // Features & Requirements Section
          new Paragraph({
            text: "FEATURES & REQUIREMENTS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...(analysis.features || []).flatMap(feature => [
            new Paragraph({
              text: `${feature.name} [${feature.priority.toUpperCase()}]`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: feature.description,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "User Stories:", bold: true })],
              spacing: { before: 100, after: 50 }
            }),
            ...feature.userStories.flatMap(story => [
              new Paragraph({
                text: `${story.id}: ${story.title} (${story.complexity})`,
                spacing: { before: 100, after: 50 }
              }),
              new Paragraph({
                text: story.description,
                spacing: { after: 50 }
              }),
              new Paragraph({
                children: [new TextRun({ text: "Acceptance Criteria:", italics: true })],
                spacing: { after: 50 }
              }),
              ...story.acceptanceCriteria.map(ac => new Paragraph({
                text: `  • ${ac}`,
                spacing: { after: 50 }
              }))
            ])
          ]),

          // Technical Specifications Section
          new Paragraph({
            text: "TECHNICAL SPECIFICATIONS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "Architecture Overview",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.techSpec?.architecture?.overview || 'No architecture overview available',
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Frameworks & Technologies",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...(analysis.techSpec?.frameworks || []).map(f => new Paragraph({
            text: `• ${f.name} (${f.version}): ${f.purpose}`,
            spacing: { after: 100 }
          })),

          // Quality Assurance Section
          new Paragraph({
            text: "QUALITY ASSURANCE",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: "Test Strategy",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: analysis.testPlan?.strategy || 'No test strategy available',
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: `Coverage Score: ${analysis.testPlan?.coverageScore || 0}%`,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: `Tested Endpoints: ${analysis.testPlan?.testedEndpoints || 0}/${analysis.testPlan?.totalEndpoints || 0}`,
            spacing: { after: 200 }
          }),

          // Risk Management Section
          new Paragraph({
            text: "RISK MANAGEMENT",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...(analysis.riskRegister || []).map(risk => [
            new Paragraph({
              text: `${risk.type} [${risk.severity.toUpperCase()}]`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({ text: risk.description, spacing: { after: 100 } }),
            new Paragraph({ text: `Impact: ${risk.impact}`, spacing: { after: 50 } }),
            new Paragraph({ text: `Mitigation: ${risk.mitigation}`, spacing: { after: 200 } })
          ]).flat(),

          // Roadmap Section
          new Paragraph({
            text: "ROADMAP",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...(analysis.roadmap || []).flatMap(phase => [
            new Paragraph({
              text: `${phase.phase} - ${phase.timeline}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({ 
              children: [new TextRun({ text: "Goals:", bold: true })],
              spacing: { after: 50 } 
            }),
            ...phase.goals.map(g => new Paragraph({ text: `• ${g}`, spacing: { after: 50 } })),
            new Paragraph({ 
              children: [new TextRun({ text: "Deliverables:", bold: true })],
              spacing: { before: 100, after: 50 } 
            }),
            ...phase.deliverables.map(d => new Paragraph({ text: `• ${d}`, spacing: { after: 100 } }))
          ]),

          // KPIs Section
          new Paragraph({
            text: "KEY PERFORMANCE INDICATORS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...(analysis.kpis || []).map(kpi => [
            new Paragraph({
              text: kpi.name,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({ text: kpi.description, spacing: { after: 50 } }),
            new Paragraph({ text: `Target: ${kpi.target}`, spacing: { after: 50 } }),
            new Paragraph({ text: `Measurement: ${kpi.measurement}`, spacing: { after: 200 } })
          ]).flat()
        ]
      }]
    });

    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `repository-specifications-${Date.now()}.docx`);
      toast.success("Document exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export document");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'must': return 'default';
      case 'should': return 'secondary';
      case 'could': return 'outline';
      case 'wont': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Git Repository → Comprehensive Specs</CardTitle>
            <CardDescription>
              Generate detailed product & technical documentation from your codebase
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Step 1: Select Source */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="repoUrl">Repository URL *</Label>
              <Input
                id="repoUrl"
                placeholder="https://github.com/username/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="path">Path (optional)</Label>
                <Input
                  id="path"
                  placeholder="src/api"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="branch">Branch</Label>
                <div className="flex gap-2 mt-1">
                  <GitBranch className="h-4 w-4 mt-2 text-muted-foreground" />
                  <Input
                    id="branch"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setStep(2)}>
                Next: Configure Scope
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Scope & Focus */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Analysis Depth</Label>
              <Select value={depth} onValueChange={(v: "quick" | "deep") => setDepth(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick Scan (~2 min)</SelectItem>
                  <SelectItem value="deep">Deep Analysis (~10 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Output Profile</Label>
              <Select value={outputProfile} onValueChange={(v: "pm" | "dev" | "qa") => setOutputProfile(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pm">PM-First (Requirements & Business Logic)</SelectItem>
                  <SelectItem value="dev">Dev-First (Architecture & Implementation)</SelectItem>
                  <SelectItem value="qa">QA-First (Testing & Coverage)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Languages</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {availableLanguages.map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      id={lang}
                      checked={languages.includes(lang)}
                      onCheckedChange={() => toggleLanguage(lang)}
                    />
                    <label htmlFor={lang} className="text-sm cursor-pointer capitalize">
                      {lang}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Start Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Analyzing */}
        {step === 3 && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Repository</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {progress < 30 && "Connecting to repository..."}
                {progress >= 30 && progress < 60 && "Scanning codebase structure..."}
                {progress >= 60 && progress < 90 && "Generating comprehensive documentation..."}
                {progress >= 90 && "Finalizing analysis..."}
              </p>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
            </div>
          </div>
        )}

        {/* Step 4: Review & Export */}
        {step === 4 && analysis && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Comprehensive Documentation</h3>
              <Button size="sm" onClick={exportAsDocument}>
                <Download className="h-4 w-4 mr-1" />Export as Document
              </Button>
            </div>

            <Tabs defaultValue="executive" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="executive"><Target className="h-4 w-4 mr-1" />Executive</TabsTrigger>
                <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Users</TabsTrigger>
                <TabsTrigger value="features"><Lightbulb className="h-4 w-4 mr-1" />Features</TabsTrigger>
                <TabsTrigger value="tech"><Code className="h-4 w-4 mr-1" />Tech</TabsTrigger>
                <TabsTrigger value="qa"><Bug className="h-4 w-4 mr-1" />QA</TabsTrigger>
              </TabsList>

              {/* Executive Summary Tab */}
              <TabsContent value="executive" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Overview</h4>
                      <p className="text-sm text-muted-foreground">{analysis.executive.overview}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Product Vision</h4>
                      <p className="text-sm text-muted-foreground">{analysis.executive.productVision}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Problem Statement</h4>
                      <p className="text-sm text-muted-foreground">{analysis.executive.problemStatement}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Target Audience</h4>
                      <p className="text-sm text-muted-foreground">{analysis.executive.targetAudience}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Value Proposition</h4>
                      <p className="text-sm text-muted-foreground">{analysis.executive.valueProposition}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Context</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Business Context</h4>
                      <p className="text-sm text-muted-foreground">{analysis.context.businessContext}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Market Analysis</h4>
                      <p className="text-sm text-muted-foreground">{analysis.context.marketAnalysis}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Competitive Landscape</h4>
                      <p className="text-sm text-muted-foreground">{analysis.context.competitiveLandscape}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Constraints</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.context?.constraints?.map((constraint, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{constraint}</li>
                        )) || <li className="text-sm text-muted-foreground">No constraints specified</li>}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Assumptions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.context?.assumptions?.map((assumption, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{assumption}</li>
                        )) || <li className="text-sm text-muted-foreground">No assumptions specified</li>}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Roadmap ({analysis.roadmap?.length || 0} phases)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.roadmap && analysis.roadmap.length > 0 ? (
                      analysis.roadmap.map((phase, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{phase.phase}</h4>
                              <Badge variant="outline">{phase.timeline}</Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Goals:</span>
                                <ul className="list-disc list-inside ml-2">
                                  {phase.goals.map((goal, gIdx) => (
                                    <li key={gIdx}>{goal}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="font-medium">Deliverables:</span>
                                <ul className="list-disc list-inside ml-2">
                                  {phase.deliverables.map((deliverable, dIdx) => (
                                    <li key={dIdx}>{deliverable}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No roadmap data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Success Metrics ({analysis.kpis?.length || 0} KPIs)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.kpis && analysis.kpis.length > 0 ? (
                      analysis.kpis.map((kpi, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-4">
                            <h4 className="font-semibold mb-1">{kpi.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{kpi.description}</p>
                            <div className="flex gap-4 text-sm">
                              <div>
                                <span className="font-medium">Target:</span> {kpi.target}
                              </div>
                              <div>
                                <span className="font-medium">Measurement:</span> {kpi.measurement}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No KPIs available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Personas ({analysis.personas?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.personas && analysis.personas.length > 0 ? (
                      analysis.personas.map((persona, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{persona.name}</h4>
                              <p className="text-sm text-muted-foreground">{persona.role}</p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium mb-1">Goals</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {persona.goals.map((goal, gIdx) => (
                                  <li key={gIdx} className="text-muted-foreground">{goal}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-1">Pain Points</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {persona.painPoints.map((pain, pIdx) => (
                                  <li key={pIdx} className="text-muted-foreground">{pain}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-1">Behaviors</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {persona.behaviors.map((behavior, bIdx) => (
                                  <li key={bIdx} className="text-muted-foreground">{behavior}</li>
                                ))}
                              </ul>
                            </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No user personas available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Journeys ({analysis.userJourneys?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.userJourneys && analysis.userJourneys.length > 0 ? (
                      analysis.userJourneys.map((journey, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-4">
                            <div className="mb-3">
                              <Badge variant="outline" className="mb-2">{journey.persona}</Badge>
                              <h4 className="font-semibold">{journey.stage}</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h5 className="font-medium mb-1">Actions</h5>
                                <ul className="list-disc list-inside space-y-1">
                                  {(journey.actions || []).map((action, aIdx) => (
                                    <li key={aIdx} className="text-muted-foreground">{action}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-1">Thoughts</h5>
                                <ul className="list-disc list-inside space-y-1">
                                  {(journey.thoughts || []).map((thought, tIdx) => (
                                    <li key={tIdx} className="text-muted-foreground">{thought}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-1">Pain Points</h5>
                                <ul className="list-disc list-inside space-y-1">
                                  {(journey.painPoints || []).map((pain, pIdx) => (
                                    <li key={pIdx} className="text-muted-foreground">{pain}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-1">Opportunities</h5>
                                <ul className="list-disc list-inside space-y-1">
                                  {(journey.opportunities || []).map((opp, oIdx) => (
                                    <li key={oIdx} className="text-muted-foreground">{opp}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No user journeys available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Features ({analysis.features?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.features && analysis.features.length > 0 ? (
                      analysis.features.map((feature) => (
                      <Card key={feature.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{feature.name}</h4>
                                <Badge variant={getPriorityColor(feature.priority) as any}>
                                  {feature.priority}
                                </Badge>
                                <Badge variant="outline">{feature.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                          {feature.userStories && feature.userStories.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <h5 className="font-medium text-sm">User Stories</h5>
                              {feature.userStories.map((story) => (
                                <Card key={story.id} className="bg-muted/50">
                                  <CardContent className="pt-3">
                                    <div className="flex items-start justify-between mb-1">
                                      <h6 className="font-medium text-sm">{story.title}</h6>
                                      <Badge variant="outline">{story.complexity}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{story.description}</p>
                                    {story.acceptanceCriteria.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium mb-1">Acceptance Criteria:</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                          {story.acceptanceCriteria.map((criteria, cIdx) => (
                                            <li key={cIdx} className="text-xs text-muted-foreground">{criteria}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No features available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Functional Requirements ({analysis.functionalRequirements?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.functionalRequirements && analysis.functionalRequirements.length > 0 ? (
                      analysis.functionalRequirements.map((req) => (
                      <div key={req.id} className="flex items-start gap-2 text-sm border rounded p-2">
                        <Badge variant={getPriorityColor(req.priority) as any}>{req.priority}</Badge>
                        <div className="flex-1">
                          <span className="font-medium">{req.id}:</span> {req.description}
                          {req.relatedFeatures.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {req.relatedFeatures.map((fId, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{fId}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No functional requirements available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Non-Functional Requirements ({analysis.nonFunctionalRequirements?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.nonFunctionalRequirements && analysis.nonFunctionalRequirements.length > 0 ? (
                      analysis.nonFunctionalRequirements.map((req) => (
                      <Card key={req.id}>
                        <CardContent className="pt-3">
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="font-medium text-sm">{req.id}</h5>
                            <Badge variant="secondary">{req.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                          <div className="flex gap-4 text-xs">
                            <div><span className="font-medium">Metric:</span> {req.metric}</div>
                            <div><span className="font-medium">Target:</span> {req.target}</div>
                          </div>
                        </CardContent>
                      </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No non-functional requirements available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tech Tab */}
              <TabsContent value="tech" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Architecture</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Overview</h4>
                      <p className="text-sm text-muted-foreground">{analysis.techSpec?.architecture?.overview || 'No overview available'}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Patterns</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.techSpec?.architecture?.patterns?.map((pattern, idx) => (
                          <Badge key={idx} variant="outline">{pattern}</Badge>
                        )) || <span className="text-sm text-muted-foreground">No patterns available</span>}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Components ({analysis.techSpec?.architecture?.components?.length || 0})</h4>
                      <div className="space-y-2">
                        {analysis.techSpec?.architecture?.components && analysis.techSpec.architecture.components.length > 0 ? (
                          analysis.techSpec.architecture.components.map((comp, idx) => (
                          <Card key={idx}>
                            <CardContent className="pt-3">
                              <div className="flex items-start justify-between mb-1">
                                <h5 className="font-medium">{comp.name}</h5>
                                <Badge variant="secondary">{comp.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{comp.description}</p>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="font-medium">Responsibilities:</span>
                                  <ul className="list-disc list-inside ml-2">
                                    {comp.responsibilities.map((resp, rIdx) => (
                                      <li key={rIdx}>{resp}</li>
                                    ))}
                                  </ul>
                                </div>
                                {comp.dependencies?.length > 0 && (
                                  <div>
                                    <span className="font-medium">Dependencies:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {comp.dependencies.map((dep, dIdx) => (
                                        <Badge key={dIdx} variant="outline" className="text-xs">{dep}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No components available</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frameworks & Technologies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.techSpec?.frameworks && analysis.techSpec.frameworks.length > 0 ? (
                      analysis.techSpec.frameworks.map((fw, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm border rounded p-2">
                        <Badge variant="outline">{fw.name}</Badge>
                        <span className="text-muted-foreground text-xs">v{fw.version}</span>
                        <span className="text-sm flex-1">{fw.purpose}</span>
                      </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No frameworks data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Models ({analysis.techSpec?.dataModels?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.techSpec?.dataModels && analysis.techSpec.dataModels.length > 0 ? (
                      analysis.techSpec.dataModels.map((model, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-3">
                          <h5 className="font-semibold mb-1">{model.name}</h5>
                          <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Fields:</span>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {model.fields.map((field, fIdx) => (
                                  <div key={fIdx} className="flex items-center gap-1">
                                    <code className="text-xs">{field.name}</code>
                                    <span className="text-xs text-muted-foreground">: {field.type}</span>
                                    {field.required && <Badge variant="outline" className="text-xs">required</Badge>}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {model.relationships.length > 0 && (
                              <div>
                                <span className="font-medium">Relationships:</span>
                                <ul className="list-disc list-inside ml-2">
                                  {model.relationships.map((rel, rIdx) => (
                                    <li key={rIdx}>{rel}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No data models available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Catalog ({analysis.apiCatalog?.length || 0} endpoints)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.apiCatalog && analysis.apiCatalog.length > 0 ? (
                      analysis.apiCatalog.map((api, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{api.method}</Badge>
                            <code className="text-sm flex-1">{api.path}</code>
                            {api.authentication && <Badge variant="secondary">Auth</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{api.description}</p>
                          {api.parameters.length > 0 && (
                            <div className="text-sm mb-2">
                              <span className="font-medium">Parameters:</span>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {api.parameters.map((param, pIdx) => (
                                  <div key={pIdx} className="flex items-center gap-1">
                                    <code className="text-xs">{param.name}</code>
                                    <span className="text-xs text-muted-foreground">: {param.type}</span>
                                    {param.required && <Badge variant="outline" className="text-xs">required</Badge>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {api.responses.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium">Responses:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {api.responses.map((resp, rIdx) => (
                                  <Badge key={rIdx} variant="outline" className="text-xs">
                                    {resp.code}: {resp.description}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No API endpoints available</p>
                    )}
                  </CardContent>
                </Card>

                {analysis.techSpec?.integrations && analysis.techSpec.integrations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrations ({analysis.techSpec.integrations.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {analysis.techSpec.integrations.map((integration, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-3">
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="font-semibold">{integration.name}</h5>
                              <Badge variant="secondary">{integration.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                            {integration.apis.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {integration.apis.map((api, aIdx) => (
                                  <Badge key={aIdx} variant="outline" className="text-xs">{api}</Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* QA Tab */}
              <TabsContent value="qa" className="space-y-4">
                {analysis.testPlan ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Test Plan</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Strategy</h4>
                          <p className="text-sm text-muted-foreground">{analysis.testPlan.strategy}</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6 text-center">
                              <div className="text-3xl font-bold text-primary">{analysis.testPlan.coverageScore}%</div>
                              <div className="text-sm text-muted-foreground">Coverage Score</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6 text-center">
                              <div className="text-3xl font-bold">{analysis.testPlan.testedEndpoints}</div>
                              <div className="text-sm text-muted-foreground">Tested Endpoints</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6 text-center">
                              <div className="text-3xl font-bold">{analysis.testPlan.totalEndpoints}</div>
                              <div className="text-sm text-muted-foreground">Total Endpoints</div>
                            </CardContent>
                          </Card>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Test Types</h4>
                          <div className="space-y-2">
                            {analysis.testPlan.testTypes?.map((testType, idx) => (
                              <Card key={idx}>
                                <CardContent className="pt-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-medium">{testType.type}</h5>
                                    <Badge variant="outline">{testType.coverage}%</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{testType.description}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Critical Paths</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysis.testPlan.criticalPaths?.map((path, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">{path}</li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Coverage Gaps</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysis.testPlan.gaps?.map((gap, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">{gap}</li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Suggestions</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysis.testPlan.suggestions?.map((suggestion, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground text-center">No test plan data available</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Risk Register ({analysis.riskRegister?.length || 0} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.riskRegister && analysis.riskRegister.length > 0 ? (
                      analysis.riskRegister.map((risk, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityColor(risk.severity) as any}>{risk.severity}</Badge>
                              <Badge variant="outline">{risk.type}</Badge>
                            </div>
                            <Badge variant="secondary">{risk.probability}</Badge>
                          </div>
                          <h5 className="font-semibold mb-1">{risk.description}</h5>
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Location:</span> {risk.location}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Impact:</span> {risk.impact}
                            </div>
                            <div>
                              <span className="font-medium">Mitigation:</span> {risk.mitigation}
                            </div>
                            {risk.dependencies?.length > 0 && (
                              <div>
                                <span className="font-medium">Dependencies:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {risk.dependencies.map((dep, dIdx) => (
                                    <Badge key={dIdx} variant="outline" className="text-xs">{dep}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No risk data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between gap-2 mt-6">
              <Button variant="outline" onClick={() => { setStep(1); setAnalysis(null); }}>
                New Analysis
              </Button>
              <Button onClick={exportAsDocument}>
                <Download className="h-4 w-4 mr-2" />
                Export Complete Documentation
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
