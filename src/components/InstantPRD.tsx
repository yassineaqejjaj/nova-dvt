import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Target, 
  Users, 
  FileText, 
  Layout, 
  Code2, 
  TrendingUp, 
  Map, 
  AlertTriangle,
  Download,
  Share2,
  Edit,
  Eye,
  Zap,
  PartyPopper
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PRDSection {
  id: string;
  title: string;
  icon: any;
  status: 'pending' | 'generating' | 'complete';
  content?: any;
}

interface Persona {
  name: string;
  role: string;
  age: number;
  goals: string[];
  painPoints: string[];
  imageUrl?: string;
}

interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  storyPoints: number;
}

interface PRDDocument {
  vision: string;
  personas: Persona[];
  userStories: UserStory[];
  wireframes: string[];
  architecture: string;
  kpis: string[];
  roadmap: { phase: string; timeline: string; deliverables: string[] }[];
  risks: { risk: string; mitigation: string }[];
}

export const InstantPRD = () => {
  const [idea, setIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("");
  const [prdDocument, setPrdDocument] = useState<PRDDocument | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeContext, setActiveContext] = useState<any>(null);

  // Load active product context
  useEffect(() => {
    const loadActiveContext = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('product_contexts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('is_deleted', false)
          .single();

        if (error) {
          // No active context, get the most recent one
          const { data: recent } = await supabase
            .from('product_contexts')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_deleted', false)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();
          
          setActiveContext(recent);
        } else {
          setActiveContext(data);
        }
      } catch (error) {
        console.error('Error loading context:', error);
      }
    };

    loadActiveContext();
  }, []);

  const [sections, setSections] = useState<PRDSection[]>([
    { id: 'vision', title: 'Vision Produit', icon: Target, status: 'pending' },
    { id: 'personas', title: 'Personas (3)', icon: Users, status: 'pending' },
    { id: 'stories', title: 'User Stories (12)', icon: FileText, status: 'pending' },
    { id: 'wireframes', title: 'Wireframes (3)', icon: Layout, status: 'pending' },
    { id: 'architecture', title: 'Architecture Technique', icon: Code2, status: 'pending' },
    { id: 'kpis', title: 'KPIs SMART (5)', icon: TrendingUp, status: 'pending' },
    { id: 'roadmap', title: 'Roadmap (3 phases)', icon: Map, status: 'pending' },
    { id: 'risks', title: 'Risques & Mitigations', icon: AlertTriangle, status: 'pending' },
  ]);

  const updateSectionStatus = (sectionId: string, status: 'pending' | 'generating' | 'complete') => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status } : s));
  };

  // Helper function to parse AI responses that may be wrapped in markdown code blocks
  const parseAIResponse = (data: any): any => {
    try {
      // First extract the response field from the edge function return
      let content = data?.response || data;
      
      // If it's still an object, stringify it
      if (typeof content === 'object') {
        content = JSON.stringify(content);
      }
      
      // Remove markdown code blocks if present
      let jsonString = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find JSON object in the string
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonString);
      console.log('Parsed AI response:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error parsing AI response:', error, 'Raw data:', data);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  };

  const generatePersonaImage = async (persona: Persona): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-persona-image', {
        body: { 
          prompt: `Professional portrait of ${persona.name}, ${persona.role}, ${persona.age} years old, modern corporate style, high quality headshot`,
        }
      });

      if (error) throw error;
      return data.imageUrl || '';
    } catch (error) {
      console.error('Error generating persona image:', error);
      return '';
    }
  };

  const generatePRD = async () => {
    if (!idea.trim()) {
      toast.error("Veuillez décrire votre idée");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setShowDocument(false);
    
    const startTime = Date.now();

    try {
      // Step 1: Generate Vision (10%)
      setCurrentSection("Vision Produit");
      updateSectionStatus('vision', 'generating');
      setProgress(10);

      const contextInfo = activeContext ? `
Contexte Produit:
- Vision: ${activeContext.vision || 'Non définie'}
- Objectifs: ${(activeContext.objectives || []).join(', ')}
- Audience cible: ${activeContext.target_audience || 'Non définie'}
- Contraintes: ${activeContext.constraints || 'Aucune'}
` : '';

      const { data: visionData, error: visionError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Contexte de l'idée produit: "${idea}"

${contextInfo}

IMPORTANT: Retourne UNIQUEMENT du JSON valide sans formatage markdown ni blocs de code. Ne pas envelopper avec des backticks.

Génère une vision produit convaincante en format JSON:
{
  "vision": "Une vision claire et inspirante en 2-3 phrases qui capture l'essence et l'impact"
}`,
          mode: 'simple'
        }
      });

      if (visionError) throw visionError;
      const visionResult = parseAIResponse(visionData);
      if (!visionResult || !visionResult.vision) {
        throw new Error('Invalid vision response from AI');
      }
      updateSectionStatus('vision', 'complete');

      // Step 2: Generate Personas (25%)
      setCurrentSection("Personas");
      updateSectionStatus('personas', 'generating');
      setProgress(25);

      const { data: personasData, error: personasError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Based on this product idea: "${idea}"

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap in backticks.

Generate 3 detailed personas in JSON format:
{
  "personas": [
    {
      "name": "Full name",
      "role": "Job title/role",
      "age": 30,
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "painPoints": ["Pain 1", "Pain 2", "Pain 3"]
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (personasError) throw personasError;
      const personasResult = parseAIResponse(personasData);
      if (!personasResult || !personasResult.personas || !Array.isArray(personasResult.personas)) {
        throw new Error('Invalid personas response from AI');
      }
      
      // Generate persona images in parallel (skip images to speed up for now)
      const personasWithImages = personasResult.personas.map((persona: Persona) => ({
        ...persona,
        imageUrl: '' // We'll skip image generation for speed
      }));
      
      updateSectionStatus('personas', 'complete');

      // Step 3: Generate User Stories (40%)
      setCurrentSection("User Stories");
      updateSectionStatus('stories', 'generating');
      setProgress(40);

      const { data: storiesData, error: storiesError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Based on this product idea: "${idea}" and these personas: ${JSON.stringify(personasWithImages)}

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap in backticks.

Generate 12 user stories in JSON format:
{
  "userStories": [
    {
      "id": "US-001",
      "title": "Story title",
      "description": "As a [persona], I want to [action] so that [benefit]",
      "acceptanceCriteria": ["Criteria 1", "Criteria 2", "Criteria 3"],
      "priority": "high",
      "storyPoints": 5
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (storiesError) throw storiesError;
      const storiesResult = parseAIResponse(storiesData);
      if (!storiesResult || !storiesResult.userStories || !Array.isArray(storiesResult.userStories)) {
        throw new Error('Invalid user stories response from AI');
      }
      updateSectionStatus('stories', 'complete');

      // Step 4: Generate Wireframes descriptions (55%)
      setCurrentSection("Wireframes");
      updateSectionStatus('wireframes', 'generating');
      setProgress(55);

      const { data: wireframesData, error: wireframesError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Based on this product idea: "${idea}"

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap in backticks.

Generate 3 wireframe descriptions in JSON format:
{
  "wireframes": [
    "Detailed wireframe description 1",
    "Detailed wireframe description 2",
    "Detailed wireframe description 3"
  ]
}`,
          mode: 'simple'
        }
      });

      if (wireframesError) throw wireframesError;
      const wireframesResult = parseAIResponse(wireframesData);
      if (!wireframesResult || !wireframesResult.wireframes || !Array.isArray(wireframesResult.wireframes)) {
        throw new Error('Invalid wireframes response from AI');
      }
      updateSectionStatus('wireframes', 'complete');

      // Step 5: Generate Architecture (70%)
      setCurrentSection("Architecture Technique");
      updateSectionStatus('architecture', 'generating');
      setProgress(70);

      const { data: archData, error: archError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Based on this product idea: "${idea}"

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap in backticks.

Generate a technical architecture as a Mermaid diagram in JSON format:
{
  "architecture": "graph TD\\n    A[Frontend] --> B[API Gateway]\\n    B --> C[Backend Services]\\n    C --> D[Database]"
}`,
          mode: 'simple'
        }
      });

      if (archError) throw archError;
      const archResult = parseAIResponse(archData);
      if (!archResult || !archResult.architecture) {
        throw new Error('Invalid architecture response from AI');
      }
      updateSectionStatus('architecture', 'complete');

      // Step 6: Generate KPIs (80%)
      setCurrentSection("KPIs SMART");
      updateSectionStatus('kpis', 'generating');
      setProgress(80);

      const { data: kpisData, error: kpisError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Based on this product idea: "${idea}"

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap in backticks.

Generate 5 SMART KPIs in JSON format:
{
  "kpis": [
    "KPI 1: Specific metric with target and timeline",
    "KPI 2: ...",
    "KPI 3: ...",
    "KPI 4: ...",
    "KPI 5: ..."
  ]
}`,
          mode: 'simple'
        }
      });

      if (kpisError) throw kpisError;
      const kpisResult = parseAIResponse(kpisData);
      if (!kpisResult || !kpisResult.kpis || !Array.isArray(kpisResult.kpis)) {
        throw new Error('Invalid KPIs response from AI');
      }
      updateSectionStatus('kpis', 'complete');

      // Step 7: Generate Roadmap (90%)
      setCurrentSection("Roadmap");
      updateSectionStatus('roadmap', 'generating');
      setProgress(90);

      const { data: roadmapData, error: roadmapError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Based on this product idea: "${idea}"

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap in backticks.

Generate a 3-phase roadmap in JSON format:
{
  "roadmap": [
    {
      "phase": "Phase 1: MVP",
      "timeline": "Q1 2025",
      "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3"]
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (roadmapError) throw roadmapError;
      const roadmapResult = parseAIResponse(roadmapData);
      if (!roadmapResult || !roadmapResult.roadmap || !Array.isArray(roadmapResult.roadmap)) {
        throw new Error('Invalid roadmap response from AI');
      }
      updateSectionStatus('roadmap', 'complete');

      // Step 8: Generate Risks (95%)
      setCurrentSection("Risques & Mitigations");
      updateSectionStatus('risks', 'generating');
      setProgress(95);

      const { data: risksData, error: risksError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Based on this product idea: "${idea}"

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap in backticks.

Generate risk analysis in JSON format:
{
  "risks": [
    {
      "risk": "Risk description",
      "mitigation": "Mitigation strategy"
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (risksError) throw risksError;
      const risksResult = parseAIResponse(risksData);
      if (!risksResult || !risksResult.risks || !Array.isArray(risksResult.risks)) {
        throw new Error('Invalid risks response from AI');
      }
      updateSectionStatus('risks', 'complete');

      // Complete!
      setProgress(100);
      
      const document: PRDDocument = {
        vision: visionResult.vision,
        personas: personasWithImages,
        userStories: storiesResult.userStories,
        wireframes: wireframesResult.wireframes,
        architecture: archResult.architecture,
        kpis: kpisResult.kpis,
        roadmap: roadmapResult.roadmap,
        risks: risksResult.risks,
      };

      setPrdDocument(document);

      const elapsed = Date.now() - startTime;
      console.log(`PRD generated in ${elapsed}ms`);

      setTimeout(() => {
        setShowDocument(true);
        toast.success("🎉 Votre PRD est prêt !", {
          description: `Généré en ${Math.round(elapsed / 1000)}s`,
        });
      }, 500);

    } catch (error) {
      console.error('Error generating PRD:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error("Erreur lors de la génération du PRD", {
        description: errorMessage
      });
      
      // Reset all sections to pending
      setSections(prev => prev.map(s => ({ ...s, status: 'pending' })));
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLandingScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="max-w-2xl w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Instant Product Requirements Document</h1>
            <p className="text-muted-foreground text-lg">
              Transformez une idée en PRD complet en 15 secondes
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">✨ Vision produit</Badge>
            <Badge variant="secondary">👥 3 Personas</Badge>
            <Badge variant="secondary">📝 12 User Stories</Badge>
            <Badge variant="secondary">🎨 Wireframes</Badge>
            <Badge variant="secondary">🏗️ Architecture</Badge>
            <Badge variant="secondary">📊 5 KPIs</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Input
              placeholder="Décrivez votre idée en une phrase... (ex: Un dashboard analytics pour que les managers voient la performance de leur équipe en temps réel)"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="text-base h-12"
              onKeyDown={(e) => e.key === 'Enter' && generatePRD()}
            />
            <Button 
              onClick={generatePRD} 
              disabled={isGenerating || !idea.trim()}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate PRD
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">15s</div>
                <div className="text-xs text-muted-foreground">Temps de génération</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">8</div>
                <div className="text-xs text-muted-foreground">Sections complètes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGenerationScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="max-w-3xl w-full shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Génération de votre PRD</h2>
          <p className="text-muted-foreground">{currentSection}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{progress}%</span>
              <span className="text-muted-foreground">~{Math.round((100 - progress) / 7)}s restantes</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  section.status === 'complete' ? 'bg-green-500/10' :
                  section.status === 'generating' ? 'bg-primary/10' :
                  'bg-muted/50'
                }`}
              >
                {section.status === 'complete' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : section.status === 'generating' ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                ) : (
                  <section.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={`font-medium ${
                  section.status === 'complete' ? 'text-green-600 dark:text-green-400' :
                  section.status === 'generating' ? 'text-primary' :
                  'text-muted-foreground'
                }`}>
                  {section.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentScreen = () => {
    if (!prdDocument) return null;

    const handleExportPDF = () => {
      toast.info("Export PDF en cours de développement");
    };

    const handleShare = () => {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié dans le presse-papiers !");
    };

    const handleBack = () => {
      window.location.href = '/';
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  ← Retour
                </Button>
                <div className="border-l pl-3">
                  <PartyPopper className="w-8 h-8 text-primary inline mr-2" />
                  <div className="inline-block">
                    <h1 className="text-2xl font-bold">Votre PRD est prêt !</h1>
                    <p className="text-sm text-muted-foreground">{idea}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-sm">Table des Matières</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm flex items-center gap-2"
                          onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          <section.icon className="w-4 h-4 flex-shrink-0" />
                          <span>{section.title}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Document Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Vision */}
              <Card id="vision">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Vision Produit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{prdDocument.vision}</p>
                </CardContent>
              </Card>

              {/* Personas */}
              <Card id="personas">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Personas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {prdDocument.personas.map((persona, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          {persona.imageUrl && (
                            <img 
                              src={persona.imageUrl} 
                              alt={persona.name}
                              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                            />
                          )}
                          <h3 className="font-semibold text-center mb-1">{persona.name}</h3>
                          <p className="text-sm text-muted-foreground text-center mb-3">
                            {persona.role}, {persona.age} ans
                          </p>
                          <Separator className="my-3" />
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium mb-1">Objectifs:</p>
                              <ul className="text-xs space-y-1">
                                {persona.goals.map((goal, i) => (
                                  <li key={i}>• {goal}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-1">Pain Points:</p>
                              <ul className="text-xs space-y-1">
                                {persona.painPoints.map((pain, i) => (
                                  <li key={i}>• {pain}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Stories */}
              <Card id="stories">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    User Stories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prdDocument.userStories.map((story) => (
                      <Card key={story.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{story.id}</Badge>
                              <h4 className="font-semibold">{story.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                story.priority === 'high' ? 'destructive' : 
                                story.priority === 'medium' ? 'default' : 'secondary'
                              }>
                                {story.priority}
                              </Badge>
                              <Badge variant="outline">{story.storyPoints} pts</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm italic">{story.description}</p>
                          <div>
                            <p className="text-xs font-medium mb-2">Critères d'acceptation:</p>
                            <ul className="text-sm space-y-1">
                              {story.acceptanceCriteria.map((criteria, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Wireframes */}
              <Card id="wireframes">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Wireframes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prdDocument.wireframes.map((wireframe, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Wireframe {idx + 1}</h4>
                        <p className="text-sm text-muted-foreground">{wireframe}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Architecture */}
              <Card id="architecture">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Architecture Technique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {prdDocument.architecture}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* KPIs */}
              <Card id="kpis">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    KPIs SMART
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prdDocument.kpis.map((kpi, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                        <p className="text-sm flex-1">{kpi}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap */}
              <Card id="roadmap">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prdDocument.roadmap.map((phase, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{phase.phase}</h4>
                            <Badge variant="secondary">{phase.timeline}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {phase.deliverables.map((deliverable, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>{deliverable}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risks */}
              <Card id="risks">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risques & Mitigations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prdDocument.risks.map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium">{item.risk}</p>
                        </div>
                        <div className="pl-6">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Mitigation:</span> {item.mitigation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showDocument) {
    return renderDocumentScreen();
  }

  if (isGenerating) {
    return renderGenerationScreen();
  }

  return renderLandingScreen();
};
