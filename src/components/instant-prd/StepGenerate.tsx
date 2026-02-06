 import { useState, useEffect } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Loader2, CheckCircle2, BookOpen, Target, AlertTriangle, Sparkles, Users, Map, Zap, CheckCircle, Layout, Code2, TrendingUp, FileText } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { PRDDocument, PRDConfig, ProductContextSummary, Artifact } from './types';
 
 interface StepGenerateProps {
   idea: string;
   context: ProductContextSummary | null;
   selectedArtifactIds: string[];
   artifacts: Artifact[];
   config: PRDConfig;
   onGenerated: (doc: PRDDocument) => void;
   onBack: () => void;
 }
 
 interface SectionStatus {
   id: string;
   title: string;
   icon: any;
   status: 'pending' | 'generating' | 'complete';
 }
 
 const SECTIONS: Omit<SectionStatus, 'status'>[] = [
   { id: 'introduction', title: 'Introduction', icon: BookOpen },
   { id: 'context', title: 'Contexte & Objectifs', icon: Target },
   { id: 'problem', title: 'Problème à résoudre', icon: AlertTriangle },
   { id: 'vision', title: 'Vision produit', icon: Sparkles },
   { id: 'constraints', title: 'Hypothèses & Contraintes', icon: AlertTriangle },
   { id: 'personas', title: 'Personas', icon: Users },
   { id: 'userJourneyMap', title: 'User Journey Map', icon: Map },
   { id: 'features', title: 'Fonctionnalités', icon: Zap },
   { id: 'prioritization', title: 'Priorisation (MoSCoW)', icon: Target },
   { id: 'acceptance', title: 'Critères d\'acceptation', icon: CheckCircle },
   { id: 'wireframes', title: 'Design & UX', icon: Layout },
   { id: 'architecture', title: 'Architecture', icon: Code2 },
   { id: 'risks', title: 'Risques', icon: AlertTriangle },
   { id: 'kpis', title: 'KPIs', icon: TrendingUp },
   { id: 'roadmap', title: 'Roadmap', icon: Map },
   { id: 'appendix', title: 'Annexes', icon: FileText },
 ];
 
 const StepGenerate = ({
   idea,
   context,
   selectedArtifactIds,
   artifacts,
   config,
   onGenerated,
   onBack,
 }: StepGenerateProps) => {
   const [progress, setProgress] = useState(0);
   const [currentSection, setCurrentSection] = useState('');
   const [sections, setSections] = useState<SectionStatus[]>(
     SECTIONS.map(s => ({ ...s, status: 'pending' as const }))
   );
   const [hasStarted, setHasStarted] = useState(false);
 
   useEffect(() => {
     if (!hasStarted) {
       setHasStarted(true);
       generatePRD();
     }
   }, []);
 
   const updateSectionStatus = (id: string, status: 'pending' | 'generating' | 'complete') => {
     setSections(prev => prev.map(s => s.id === id ? { ...s, status } : s));
   };
 
   const parseAIResponse = (data: any): any => {
     try {
       let content = data?.response || data;
       if (typeof content === 'object') content = JSON.stringify(content);
       let jsonString = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
       const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
       if (jsonMatch) jsonString = jsonMatch[0];
       return JSON.parse(jsonString);
     } catch (error) {
       console.error('Parse error:', error);
       throw new Error('Failed to parse AI response');
     }
   };
 
   const safeText = (val: any): string => {
     if (val === null || val === undefined) return '';
     if (typeof val === 'string') return val;
     if (typeof val === 'number' || typeof val === 'boolean') return String(val);
     if (Array.isArray(val)) return val.map(safeText).join(', ');
     try { return JSON.stringify(val); } catch { return String(val); }
   };
 
   const normalizeArrayOfStrings = (arr: any): string[] => {
     if (!arr) return [];
     if (Array.isArray(arr)) return arr.map(safeText);
     if (typeof arr === 'string') return [arr];
     return [safeText(arr)];
   };
 
   const generatePRD = async () => {
     const startTime = Date.now();
 
     try {
       const contextInfo = context
         ? `Contexte: ${context.name}\nVision: ${context.vision || ''}\nObjectifs: ${(context.objectives || []).join(', ')}\nAudience: ${context.target_audience || ''}`
         : '';
 
       const selectedArtifactsData = artifacts.filter(a => selectedArtifactIds.includes(a.id));
       const artifactsInfo = selectedArtifactsData.length > 0
         ? `\n\nArtefacts:\n${selectedArtifactsData.map(a => `- ${a.title}: ${JSON.stringify(a.content).slice(0, 500)}`).join('\n')}`
         : '';
 
       // Generate each section
       const progressPerSection = 100 / 16;
 
       // 1. Introduction
       setCurrentSection('Introduction');
       updateSectionStatus('introduction', 'generating');
       setProgress(progressPerSection);
       const { data: introData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère une introduction (JSON): { "introduction": "texte" }`, mode: 'simple' }
       });
       const introResult = parseAIResponse(introData);
       updateSectionStatus('introduction', 'complete');
 
       // 2. Context
       setCurrentSection('Contexte & Objectifs');
       updateSectionStatus('context', 'generating');
       setProgress(progressPerSection * 2);
       const { data: ctxData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n${contextInfo}${artifactsInfo}\n\nGénère contexte et objectifs (JSON): { "context": "texte" }`, mode: 'simple' }
       });
       const ctxResult = parseAIResponse(ctxData);
       updateSectionStatus('context', 'complete');
 
       // 3. Problem
       setCurrentSection('Problème');
       updateSectionStatus('problem', 'generating');
       setProgress(progressPerSection * 3);
       const { data: problemData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère le problème (JSON): { "problem": "texte" }`, mode: 'simple' }
       });
       const problemResult = parseAIResponse(problemData);
       updateSectionStatus('problem', 'complete');
 
       // 4. Vision
       setCurrentSection('Vision');
       updateSectionStatus('vision', 'generating');
       setProgress(progressPerSection * 4);
       const { data: visionData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère la vision (JSON): { "vision": "texte" }`, mode: 'simple' }
       });
       const visionResult = parseAIResponse(visionData);
       updateSectionStatus('vision', 'complete');
 
       // 5. Constraints
       setCurrentSection('Contraintes');
       updateSectionStatus('constraints', 'generating');
       setProgress(progressPerSection * 5);
       const { data: constraintsData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère 4 contraintes (JSON): { "constraints": ["..."] }`, mode: 'simple' }
       });
       const constraintsResult = parseAIResponse(constraintsData);
       updateSectionStatus('constraints', 'complete');
 
       // 6. Personas (optional)
       let personasResult: any = { personas: [] };
       if (config.includePersonas) {
         setCurrentSection('Personas');
         updateSectionStatus('personas', 'generating');
         setProgress(progressPerSection * 6);
         const { data: pData } = await supabase.functions.invoke('chat-ai', {
           body: { message: `Idée: "${idea}"\n\nGénère 3 personas (JSON): { "personas": [{ "name": "", "role": "", "age": 30, "goals": [], "painPoints": [] }] }`, mode: 'simple' }
         });
         personasResult = parseAIResponse(pData);
       }
       updateSectionStatus('personas', 'complete');
 
       // 7. Journey Map (optional)
       let journeyResult: any = { userJourneyMap: [] };
       if (config.includeJourneyMap) {
         setCurrentSection('User Journey Map');
         updateSectionStatus('userJourneyMap', 'generating');
         setProgress(progressPerSection * 7);
         const { data: jData } = await supabase.functions.invoke('chat-ai', {
           body: { message: `Idée: "${idea}"\n\nGénère user journey map 5 étapes (JSON): { "userJourneyMap": [{ "stage": "", "actions": [], "thoughts": [], "painPoints": [], "opportunities": [] }] }`, mode: 'simple' }
         });
         journeyResult = parseAIResponse(jData);
       }
       updateSectionStatus('userJourneyMap', 'complete');
 
       // 8. Features
       setCurrentSection('Fonctionnalités');
       updateSectionStatus('features', 'generating');
       setProgress(progressPerSection * 8);
       const { data: featuresData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère 5-7 fonctionnalités (JSON): { "features": [{ "id": "F-001", "name": "", "description": "" }] }`, mode: 'simple' }
       });
       const featuresResult = parseAIResponse(featuresData);
       updateSectionStatus('features', 'complete');
 
       // 9. User Stories (optional)
       let storiesResult: any = { userStories: [] };
       if (config.includeUserStories) {
         setCurrentSection('User Stories');
         setProgress(progressPerSection * 8.5);
         const { data: sData } = await supabase.functions.invoke('chat-ai', {
           body: { message: `Fonctionnalités: ${JSON.stringify(featuresResult.features)}\n\nGénère 2 user stories par fonctionnalité (JSON): { "userStories": [{ "id": "", "featureId": "", "title": "", "description": "", "acceptanceCriteria": [], "priority": "high", "complexity": "M" }] }`, mode: 'simple' }
         });
         storiesResult = parseAIResponse(sData);
       }
 
       // 10. Prioritization
       setCurrentSection('Priorisation');
       updateSectionStatus('prioritization', 'generating');
       setProgress(progressPerSection * 9);
       const { data: prioData } = await supabase.functions.invoke('chat-ai', {
          body: { message: `Fonctionnalités: ${(featuresResult.features || []).map((f: any) => f.name || f.title).join(', ')}\n\nGénère une priorisation MoSCoW. Retourne UNIQUEMENT les NOMS des fonctionnalités (pas d'objets, juste des strings).\n\nFormat JSON: { "prioritization": { "mvp": ["Nom feature 1"], "must": ["Nom feature 2"], "should": ["Nom feature 3"], "could": ["Nom feature 4"], "wont": [] } }`, mode: 'simple' }
       });
       const prioResult = parseAIResponse(prioData);
       updateSectionStatus('prioritization', 'complete');
 
       // 11. Acceptance
       setCurrentSection('Critères d\'acceptation');
       updateSectionStatus('acceptance', 'generating');
       setProgress(progressPerSection * 10);
       const { data: accData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère 5 critères d'acceptation (JSON): { "acceptance": ["..."] }`, mode: 'simple' }
       });
       const accResult = parseAIResponse(accData);
       updateSectionStatus('acceptance', 'complete');
 
       // 12. Wireframes
       setCurrentSection('Design & UX');
       updateSectionStatus('wireframes', 'generating');
       setProgress(progressPerSection * 11);
       const { data: wfData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère 3 recommandations UX (JSON): { "wireframes": ["..."] }`, mode: 'simple' }
       });
       const wfResult = parseAIResponse(wfData);
       updateSectionStatus('wireframes', 'complete');
 
       // 13. Architecture
       setCurrentSection('Architecture');
       updateSectionStatus('architecture', 'generating');
       setProgress(progressPerSection * 12);
       const { data: archData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère architecture technique (JSON): { "architecture": { "frontend": "", "backend": "", "database": "" } }`, mode: 'simple' }
       });
       const archResult = parseAIResponse(archData);
       updateSectionStatus('architecture', 'complete');
 
       // 14. Risks
       setCurrentSection('Risques');
       updateSectionStatus('risks', 'generating');
       setProgress(progressPerSection * 13);
       const { data: riskData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère 4 risques (JSON): { "risks": [{ "risk": "", "mitigation": "" }] }`, mode: 'simple' }
       });
       const riskResult = parseAIResponse(riskData);
       updateSectionStatus('risks', 'complete');
 
       // 15. KPIs
       setCurrentSection('KPIs');
       updateSectionStatus('kpis', 'generating');
       setProgress(progressPerSection * 14);
       const { data: kpiData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère 4 KPIs (JSON): { "kpis": ["..."] }`, mode: 'simple' }
       });
       const kpiResult = parseAIResponse(kpiData);
       updateSectionStatus('kpis', 'complete');
 
       // 16. Roadmap
       setCurrentSection('Roadmap');
       updateSectionStatus('roadmap', 'generating');
       setProgress(progressPerSection * 15);
       const { data: rmData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère roadmap 3 phases (JSON): { "roadmap": [{ "phase": "", "timeline": "", "deliverables": [] }] }`, mode: 'simple' }
       });
       const rmResult = parseAIResponse(rmData);
       updateSectionStatus('roadmap', 'complete');
 
       // 17. Appendix
       setCurrentSection('Annexes');
       updateSectionStatus('appendix', 'generating');
       setProgress(99);
       const { data: apxData } = await supabase.functions.invoke('chat-ai', {
         body: { message: `Idée: "${idea}"\n\nGénère 3 références (JSON): { "appendix": ["..."] }`, mode: 'simple' }
       });
       const apxResult = parseAIResponse(apxData);
       updateSectionStatus('appendix', 'complete');
 
       setProgress(100);
 
       // Attach user stories to features
       const features = (featuresResult.features || []).map((f: any, idx: number) => ({
         id: f.id || `F-${idx + 1}`,
         name: safeText(f.name || f.title || 'Feature'),
         description: safeText(f.description || ''),
         userStories: (storiesResult.userStories || []).filter((s: any) => s.featureId === f.id),
       }));
 
       const document: PRDDocument = {
         introduction: safeText(introResult.introduction),
         context: safeText(ctxResult.context),
         problem: safeText(problemResult.problem),
         vision: safeText(visionResult.vision),
         constraints: normalizeArrayOfStrings(constraintsResult.constraints),
         personas: (personasResult.personas || []).map((p: any) => ({ ...p, imageUrl: '' })),
         userJourneyMap: (journeyResult.userJourneyMap || []).map((stage: any) => ({
           stage: safeText(stage.stage || ''),
           actions: normalizeArrayOfStrings(stage.actions),
           thoughts: normalizeArrayOfStrings(stage.thoughts),
           painPoints: normalizeArrayOfStrings(stage.painPoints),
           opportunities: normalizeArrayOfStrings(stage.opportunities),
         })),
         features,
         prioritization: {
           mvp: normalizeArrayOfStrings(prioResult.prioritization?.mvp),
           must: normalizeArrayOfStrings(prioResult.prioritization?.must),
           should: normalizeArrayOfStrings(prioResult.prioritization?.should),
           could: normalizeArrayOfStrings(prioResult.prioritization?.could),
           wont: normalizeArrayOfStrings(prioResult.prioritization?.wont),
         },
         acceptance: normalizeArrayOfStrings(accResult.acceptance),
         wireframes: normalizeArrayOfStrings(wfResult.wireframes),
         architecture: archResult.architecture,
         risks: (riskResult.risks || []).map((r: any) => ({
           risk: safeText(r.risk || r.title || ''),
           mitigation: safeText(r.mitigation || r.solution || ''),
           dependencies: r.dependencies ? safeText(r.dependencies) : undefined,
         })),
         kpis: normalizeArrayOfStrings(kpiResult.kpis),
         roadmap: (rmResult.roadmap || []).map((ph: any) => ({
           phase: safeText(ph.phase || ph.title || 'Phase'),
           timeline: safeText(ph.timeline || ''),
           deliverables: normalizeArrayOfStrings(ph.deliverables || ph.items),
         })),
         appendix: normalizeArrayOfStrings(apxResult.appendix),
       };
 
       const elapsed = Date.now() - startTime;
       toast.success(`PRD généré en ${Math.round(elapsed / 1000)}s`);
       onGenerated(document);
     } catch (error) {
       console.error('Error generating PRD:', error);
       toast.error('Erreur lors de la génération');
     }
   };
 
    return (
      <Card className="flex flex-col min-h-[60vh]">
        <CardHeader className="text-center flex-shrink-0">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <CardTitle>Génération de votre PRD</CardTitle>
          <p className="text-muted-foreground">{currentSection}</p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-6">
          <div className="space-y-2 flex-shrink-0">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{Math.round(progress)}%</span>
              <span className="text-muted-foreground">~{Math.round((100 - progress) / 6)}s restantes</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <ScrollArea className="flex-1 min-h-[40vh]">
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
                  section.status === 'complete' ? 'text-primary' :
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
   );
 };
 
 export default StepGenerate;