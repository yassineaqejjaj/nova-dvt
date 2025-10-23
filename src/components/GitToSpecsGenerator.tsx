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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch, FolderGit2, Loader2, Download, CheckCircle2, AlertCircle, Code, FileText, Bug, Shield } from "lucide-react";

interface GitRepoAnalysis {
  specDoc: {
    overview: string;
    functionalRequirements: Array<{ id: string; description: string; priority: string }>;
    nonFunctionalRequirements: Array<{ id: string; type: string; description: string; metric: string }>;
    acceptanceCriteria: Array<{ requirement: string; criteria: string[] }>;
  };
  techSpec: {
    architecture: string;
    frameworks: string[];
    components: Array<{ name: string; type: string; description: string; dependencies: string[] }>;
    dataModels: Array<{ name: string; fields: string[]; relationships: string[] }>;
  };
  apiCatalog: Array<{ method: string; path: string; description: string; parameters: string[]; authentication: boolean }>;
  testPlan: {
    coverageScore: number;
    testedEndpoints: number;
    totalEndpoints: number;
    gaps: string[];
    suggestions: string[];
  };
  riskRegister: Array<{ type: string; severity: string; description: string; location: string; recommendation: string }>;
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

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze repository");
      clearInterval(progressInterval);
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportArtifact = (type: string, content: any) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${type} exported successfully!`);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Git Repository → Specs</CardTitle>
            <CardDescription>
              Generate comprehensive documentation from your codebase
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
                {progress >= 60 && progress < 90 && "Generating documentation artifacts..."}
                {progress >= 90 && "Finalizing analysis..."}
              </p>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
            </div>
          </div>
        )}

        {/* Step 4: Review & Export */}
        {step === 4 && analysis && (
          <div className="space-y-4">
            <Tabs defaultValue="spec" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="spec"><FileText className="h-4 w-4 mr-1" />Spec Doc</TabsTrigger>
                <TabsTrigger value="tech"><Code className="h-4 w-4 mr-1" />Tech Spec</TabsTrigger>
                <TabsTrigger value="api"><GitBranch className="h-4 w-4 mr-1" />APIs</TabsTrigger>
                <TabsTrigger value="test"><Bug className="h-4 w-4 mr-1" />Tests</TabsTrigger>
                <TabsTrigger value="risk"><Shield className="h-4 w-4 mr-1" />Risks</TabsTrigger>
              </TabsList>

              <TabsContent value="spec" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Specification Document</h3>
                  <Button size="sm" onClick={() => exportArtifact('spec-doc', analysis.specDoc)}>
                    <Download className="h-4 w-4 mr-1" />Export
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Overview</h4>
                    <p className="text-sm text-muted-foreground">{analysis.specDoc.overview}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Functional Requirements ({analysis.specDoc.functionalRequirements.length})</h4>
                    <div className="space-y-2">
                      {analysis.specDoc.functionalRequirements.map((req) => (
                        <div key={req.id} className="flex items-start gap-2 text-sm">
                          <Badge variant={req.priority === 'must' ? 'default' : 'secondary'}>{req.priority}</Badge>
                          <span>{req.id}: {req.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tech" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Technical Specification</h3>
                  <Button size="sm" onClick={() => exportArtifact('tech-spec', analysis.techSpec)}>
                    <Download className="h-4 w-4 mr-1" />Export
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Architecture</h4>
                    <p className="text-sm text-muted-foreground">{analysis.techSpec.architecture}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Frameworks</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.techSpec.frameworks.map((fw) => (
                        <Badge key={fw} variant="outline">{fw}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Components ({analysis.techSpec.components.length})</h4>
                    <div className="space-y-2">
                      {analysis.techSpec.components.map((comp) => (
                        <div key={comp.name} className="text-sm">
                          <span className="font-medium">{comp.name}</span> - {comp.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="api" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">API Catalog ({analysis.apiCatalog.length} endpoints)</h3>
                  <Button size="sm" onClick={() => exportArtifact('api-catalog', analysis.apiCatalog)}>
                    <Download className="h-4 w-4 mr-1" />Export
                  </Button>
                </div>
                <div className="space-y-2">
                  {analysis.apiCatalog.map((api, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm border rounded p-2">
                      <Badge variant="outline">{api.method}</Badge>
                      <code className="flex-1">{api.path}</code>
                      {api.authentication && <Badge variant="secondary">Auth</Badge>}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Test Plan</h3>
                  <Button size="sm" onClick={() => exportArtifact('test-plan', analysis.testPlan)}>
                    <Download className="h-4 w-4 mr-1" />Export
                  </Button>
                </div>
                <div className="space-y-3">
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
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />Coverage Gaps
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysis.testPlan.gaps.map((gap, idx) => (
                        <li key={idx}>• {gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Risk Register ({analysis.riskRegister.length} items)</h3>
                  <Button size="sm" onClick={() => exportArtifact('risk-register', analysis.riskRegister)}>
                    <Download className="h-4 w-4 mr-1" />Export
                  </Button>
                </div>
                <div className="space-y-2">
                  {analysis.riskRegister.map((risk, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(risk.severity) as any}>{risk.severity}</Badge>
                            <Badge variant="outline">{risk.type}</Badge>
                          </div>
                        </div>
                        <p className="text-sm font-medium mb-1">{risk.description}</p>
                        <p className="text-xs text-muted-foreground mb-2">Location: {risk.location}</p>
                        <div className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500" />
                          <span>{risk.recommendation}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => { setStep(1); setAnalysis(null); }}>
                New Analysis
              </Button>
              <Button onClick={() => {
                exportArtifact('complete-analysis', analysis);
              }}>
                <Download className="h-4 w-4 mr-1" />
                Export All Artifacts
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
