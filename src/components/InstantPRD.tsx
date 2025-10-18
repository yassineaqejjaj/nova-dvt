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
  PartyPopper,
  BookOpen
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
  introduction: string;
  context: string;
  problem: string;
  vision: string;
  constraints: string[];
  personas: Persona[];
  userStories: UserStory[];
  features: { name: string; description: string }[];
  prioritization: { mvp: string[]; must: string[]; should: string[]; could: string[]; wont: string[] };
  acceptance: string[];
  wireframes: string[];
  architecture: string;
  risks: { risk: string; mitigation: string; dependencies?: string }[];
  kpis: string[];
  roadmap: { phase: string; timeline: string; deliverables: string[] }[];
  appendix: string[];
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
    { id: 'introduction', title: 'Introduction', icon: BookOpen, status: 'pending' },
    { id: 'context', title: 'Contexte & Objectifs', icon: Target, status: 'pending' },
    { id: 'problem', title: 'Problème à résoudre', icon: AlertTriangle, status: 'pending' },
    { id: 'vision', title: 'Vision produit', icon: Sparkles, status: 'pending' },
    { id: 'constraints', title: 'Hypothèses & Contraintes', icon: AlertTriangle, status: 'pending' },
    { id: 'personas', title: 'Utilisateurs cibles / Personas', icon: Users, status: 'pending' },
    { id: 'stories', title: 'User Stories & Scénarios d\'usage', icon: FileText, status: 'pending' },
    { id: 'features', title: 'Fonctionnalités clés', icon: Zap, status: 'pending' },
    { id: 'prioritization', title: 'Priorisation (MoSCoW)', icon: Target, status: 'pending' },
    { id: 'acceptance', title: 'Critères d\'acceptation', icon: CheckCircle2, status: 'pending' },
    { id: 'wireframes', title: 'Design & UX', icon: Layout, status: 'pending' },
    { id: 'architecture', title: 'Architecture & Intégrations', icon: Code2, status: 'pending' },
    { id: 'risks', title: 'Dépendances & Risques', icon: AlertTriangle, status: 'pending' },
    { id: 'kpis', title: 'Mesure du succès (KPIs)', icon: TrendingUp, status: 'pending' },
    { id: 'roadmap', title: 'Roadmap & Planning', icon: Map, status: 'pending' },
    { id: 'appendix', title: 'Annexes & Références', icon: FileText, status: 'pending' },
  ]);

  const updateSectionStatus = (sectionId: string, status: 'pending' | 'generating' | 'complete') => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status } : s));
  };

  // Helper function to parse AI responses
  const parseAIResponse = (data: any): any => {
    try {
      let content = data?.response || data;
      if (typeof content === 'object') {
        content = JSON.stringify(content);
      }
      let jsonString = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
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
      const contextInfo = activeContext ? `
Contexte Produit:
- Vision: ${activeContext.vision || 'Non définie'}
- Objectifs: ${(activeContext.objectives || []).join(', ')}
- Audience cible: ${activeContext.target_audience || 'Non définie'}
- Contraintes: ${activeContext.constraints || 'Aucune'}
` : '';

      // Step 1: Introduction (6%)
      setCurrentSection("Introduction");
      updateSectionStatus('introduction', 'generating');
      setProgress(6);

      const { data: introData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère une introduction concise (JSON uniquement):
{ "introduction": "Texte en 2-3 phrases" }`,
          mode: 'simple'
        }
      });

      const introResult = parseAIResponse(introData);
      updateSectionStatus('introduction', 'complete');

      // Step 2: Context (12%)
      setCurrentSection("Contexte & Objectifs");
      updateSectionStatus('context', 'generating');
      setProgress(12);

      const { data: contextData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"
${contextInfo}

Génère contexte et objectifs (JSON uniquement):
{ "context": "Texte en 3-4 phrases" }`,
          mode: 'simple'
        }
      });

      const contextResult = parseAIResponse(contextData);
      updateSectionStatus('context', 'complete');

      // Step 3: Problem (18%)
      setCurrentSection("Problème à résoudre");
      updateSectionStatus('problem', 'generating');
      setProgress(18);

      const { data: problemData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère la description du problème (JSON uniquement):
{ "problem": "Texte en 2-3 phrases" }`,
          mode: 'simple'
        }
      });

      const problemResult = parseAIResponse(problemData);
      updateSectionStatus('problem', 'complete');

      // Step 4: Vision (23%)
      setCurrentSection("Vision produit");
      updateSectionStatus('vision', 'generating');
      setProgress(23);

      const { data: visionData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère la vision (JSON uniquement):
{ "vision": "Vision inspirante en 2-3 phrases" }`,
          mode: 'simple'
        }
      });

      const visionResult = parseAIResponse(visionData);
      updateSectionStatus('vision', 'complete');

      // Step 5: Constraints (28%)
      setCurrentSection("Hypothèses & Contraintes");
      updateSectionStatus('constraints', 'generating');
      setProgress(28);

      const { data: constraintsData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère 4-5 contraintes (JSON uniquement):
{ "constraints": ["Contrainte 1", "Contrainte 2", ...] }`,
          mode: 'simple'
        }
      });

      const constraintsResult = parseAIResponse(constraintsData);
      updateSectionStatus('constraints', 'complete');

      // Step 6: Personas (34%)
      setCurrentSection("Utilisateurs cibles / Personas");
      updateSectionStatus('personas', 'generating');
      setProgress(34);

      const { data: personasData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère 3 personas (JSON uniquement):
{
  "personas": [
    {
      "name": "Nom",
      "role": "Rôle",
      "age": 30,
      "goals": ["Objectif 1", "Objectif 2", "Objectif 3"],
      "painPoints": ["Pain 1", "Pain 2", "Pain 3"]
    }
  ]
}`,
          mode: 'simple'
        }
      });

      const personasResult = parseAIResponse(personasData);
      const personasWithImages = personasResult.personas.map((p: Persona) => ({ ...p, imageUrl: '' }));
      updateSectionStatus('personas', 'complete');

      // Step 7: User Stories (41%)
      setCurrentSection("User Stories & Scénarios d'usage");
      updateSectionStatus('stories', 'generating');
      setProgress(41);

      const { data: storiesData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"
Personas: ${JSON.stringify(personasWithImages)}

Génère 12 user stories (JSON uniquement):
{
  "userStories": [
    {
      "id": "US-001",
      "title": "Titre",
      "description": "En tant que [persona], je veux [action] afin de [bénéfice]",
      "acceptanceCriteria": ["Critère 1", "Critère 2", "Critère 3"],
      "priority": "high",
      "storyPoints": 5
    }
  ]
}`,
          mode: 'simple'
        }
      });

      const storiesResult = parseAIResponse(storiesData);
      updateSectionStatus('stories', 'complete');

      // Step 8: Features (48%)
      setCurrentSection("Fonctionnalités clés");
      updateSectionStatus('features', 'generating');
      setProgress(48);

      const { data: featuresData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère 5-7 fonctionnalités clés (JSON uniquement):
{
  "features": [
    { "name": "Nom feature", "description": "Description détaillée" }
  ]
}`,
          mode: 'simple'
        }
      });

      const featuresResult = parseAIResponse(featuresData);
      updateSectionStatus('features', 'complete');

      // Step 9: Prioritization (55%)
      setCurrentSection("Priorisation (MoSCoW)");
      updateSectionStatus('prioritization', 'generating');
      setProgress(55);

      const { data: prioritizationData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère la priorisation MoSCoW (JSON uniquement):
{
  "prioritization": {
    "mvp": ["Feature MVP 1", "Feature MVP 2"],
    "must": ["Must have 1", "Must have 2"],
    "should": ["Should have 1", "Should have 2"],
    "could": ["Could have 1", "Could have 2"],
    "wont": ["Won't have 1"]
  }
}`,
          mode: 'simple'
        }
      });

      const prioritizationResult = parseAIResponse(prioritizationData);
      updateSectionStatus('prioritization', 'complete');

      // Step 10: Acceptance Criteria (61%)
      setCurrentSection("Critères d'acceptation");
      updateSectionStatus('acceptance', 'generating');
      setProgress(61);

      const { data: acceptanceData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère 5-6 critères d'acceptation globaux (JSON uniquement):
{ "acceptance": ["Critère 1", "Critère 2", ...] }`,
          mode: 'simple'
        }
      });

      const acceptanceResult = parseAIResponse(acceptanceData);
      updateSectionStatus('acceptance', 'complete');

      // Step 11: Wireframes (68%)
      setCurrentSection("Design & UX");
      updateSectionStatus('wireframes', 'generating');
      setProgress(68);

      const { data: wireframesData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère 3 descriptions de wireframes (JSON uniquement):
{ "wireframes": ["Description 1", "Description 2", "Description 3"] }`,
          mode: 'simple'
        }
      });

      const wireframesResult = parseAIResponse(wireframesData);
      updateSectionStatus('wireframes', 'complete');

      // Step 12: Architecture (75%)
      setCurrentSection("Architecture & Intégrations");
      updateSectionStatus('architecture', 'generating');
      setProgress(75);

      const { data: archData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère l'architecture technique (JSON uniquement):
{ "architecture": "Description de l'architecture en texte structuré" }`,
          mode: 'simple'
        }
      });

      const archResult = parseAIResponse(archData);
      updateSectionStatus('architecture', 'complete');

      // Step 13: Risks (81%)
      setCurrentSection("Dépendances & Risques");
      updateSectionStatus('risks', 'generating');
      setProgress(81);

      const { data: risksData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère 4-5 risques avec dépendances (JSON uniquement):
{
  "risks": [
    {
      "risk": "Description du risque",
      "mitigation": "Stratégie de mitigation",
      "dependencies": "Dépendances associées (optionnel)"
    }
  ]
}`,
          mode: 'simple'
        }
      });

      const risksResult = parseAIResponse(risksData);
      updateSectionStatus('risks', 'complete');

      // Step 14: KPIs (88%)
      setCurrentSection("Mesure du succès (KPIs)");
      updateSectionStatus('kpis', 'generating');
      setProgress(88);

      const { data: kpisData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère 5 KPIs SMART (JSON uniquement):
{ "kpis": ["KPI 1 avec métrique et cible", "KPI 2", ...] }`,
          mode: 'simple'
        }
      });

      const kpisResult = parseAIResponse(kpisData);
      updateSectionStatus('kpis', 'complete');

      // Step 15: Roadmap (94%)
      setCurrentSection("Roadmap & Planning");
      updateSectionStatus('roadmap', 'generating');
      setProgress(94);

      const { data: roadmapData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère une roadmap en 3 phases (JSON uniquement):
{
  "roadmap": [
    {
      "phase": "Phase 1: MVP",
      "timeline": "Q1 2025",
      "deliverables": ["Livrable 1", "Livrable 2", "Livrable 3"]
    }
  ]
}`,
          mode: 'simple'
        }
      });

      const roadmapResult = parseAIResponse(roadmapData);
      updateSectionStatus('roadmap', 'complete');

      // Step 16: Appendix (99%)
      setCurrentSection("Annexes & Références");
      updateSectionStatus('appendix', 'generating');
      setProgress(99);

      const { data: appendixData } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Idée: "${idea}"

Génère 3-4 références/annexes (JSON uniquement):
{ "appendix": ["Référence 1", "Référence 2", ...] }`,
          mode: 'simple'
        }
      });

      const appendixResult = parseAIResponse(appendixData);
      updateSectionStatus('appendix', 'complete');

      // Complete!
      setProgress(100);
      
      const document: PRDDocument = {
        introduction: introResult.introduction,
        context: contextResult.context,
        problem: problemResult.problem,
        vision: visionResult.vision,
        constraints: constraintsResult.constraints,
        personas: personasWithImages,
        userStories: storiesResult.userStories,
        features: featuresResult.features,
        prioritization: prioritizationResult.prioritization,
        acceptance: acceptanceResult.acceptance,
        wireframes: wireframesResult.wireframes,
        architecture: archResult.architecture,
        risks: risksResult.risks,
        kpis: kpisResult.kpis,
        roadmap: roadmapResult.roadmap,
        appendix: appendixResult.appendix,
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
            <Badge variant="secondary">✨ 16 sections complètes</Badge>
            <Badge variant="secondary">👥 3 Personas</Badge>
            <Badge variant="secondary">📝 12 User Stories</Badge>
            <Badge variant="secondary">🎨 Design & UX</Badge>
            <Badge variant="secondary">🏗️ Architecture</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Input
              placeholder="Décrivez votre idée en une phrase..."
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
              <span className="text-muted-foreground">~{Math.round((100 - progress) / 6)}s restantes</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
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
                  <span className={`font-medium text-sm ${
                    section.status === 'complete' ? 'text-green-600 dark:text-green-400' :
                    section.status === 'generating' ? 'text-primary' :
                    'text-muted-foreground'
                  }`}>
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
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
              {/* Introduction */}
              <Card id="introduction">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Introduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{prdDocument.introduction}</p>
                </CardContent>
              </Card>

              {/* Context & Objectives */}
              <Card id="context">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Contexte & Objectifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{prdDocument.context}</p>
                </CardContent>
              </Card>

              {/* Problem */}
              <Card id="problem">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Problème à résoudre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{prdDocument.problem}</p>
                </CardContent>
              </Card>

              {/* Vision */}
              <Card id="vision">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Vision produit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{prdDocument.vision}</p>
                </CardContent>
              </Card>

              {/* Hypothèses & Contraintes */}
              <Card id="constraints">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Hypothèses & Contraintes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prdDocument.constraints.map((constraint, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                        <span className="text-sm flex-1">{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Personas */}
              <Card id="personas">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Utilisateurs cibles / Personas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {prdDocument.personas.map((persona, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
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
                    User Stories & Scénarios d'usage
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

              {/* Features */}
              <Card id="features">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Fonctionnalités clés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prdDocument.features.map((feature, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prioritization */}
              <Card id="prioritization">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Priorisation (MoSCoW)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Badge className="mb-2">MVP</Badge>
                      <ul className="space-y-1 ml-4">
                        {prdDocument.prioritization.mvp.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <Badge variant="destructive" className="mb-2">Must Have</Badge>
                      <ul className="space-y-1 ml-4">
                        {prdDocument.prioritization.must.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <Badge variant="default" className="mb-2">Should Have</Badge>
                      <ul className="space-y-1 ml-4">
                        {prdDocument.prioritization.should.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <Badge variant="secondary" className="mb-2">Could Have</Badge>
                      <ul className="space-y-1 ml-4">
                        {prdDocument.prioritization.could.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <Badge variant="outline" className="mb-2">Won't Have</Badge>
                      <ul className="space-y-1 ml-4">
                        {prdDocument.prioritization.wont.map((item, idx) => (
                          <li key={idx} className="text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acceptance Criteria */}
              <Card id="acceptance">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Critères d'acceptation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prdDocument.acceptance.map((criterion, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm flex-1">{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Wireframes */}
              <Card id="wireframes">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Design & UX (Wireframes/Mockups)
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
                    Architecture & Intégrations techniques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {prdDocument.architecture}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Risks */}
              <Card id="risks">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Dépendances & Risques
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
                        <div className="pl-6 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Mitigation:</span> {item.mitigation}
                          </p>
                          {item.dependencies && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Dépendances:</span> {item.dependencies}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* KPIs */}
              <Card id="kpis">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Mesure du succès (KPIs/OKRs)
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
                    Roadmap & Planning de livraison
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

              {/* Appendix */}
              <Card id="appendix">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Annexes & Références
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prdDocument.appendix.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                        <span className="text-sm flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
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
