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

interface DetailedUserStory {
  id: string;
  featureId: string;
  title: string;
  asA?: string;
  iWant?: string;
  soThat?: string;
  description?: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  complexity: 'XS' | 'S' | 'M' | 'L' | 'XL';
  storyPoints?: number;
  technicalNotes?: string;
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
 
    const repairTruncatedJSON = (json: string): string => {
      // Try to fix truncated JSON by closing open brackets/braces
      let fixed = json;
      let openBraces = 0;
      let openBrackets = 0;
      let inString = false;
      let escaped = false;

      for (let i = 0; i < fixed.length; i++) {
        const ch = fixed[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') openBraces++;
        if (ch === '}') openBraces--;
        if (ch === '[') openBrackets++;
        if (ch === ']') openBrackets--;
      }

      // Remove trailing comma or incomplete value
      fixed = fixed.replace(/,\s*$/, '');
      // Remove incomplete string at end (unmatched quote)
      if (inString) {
        const lastQuote = fixed.lastIndexOf('"');
        if (lastQuote > 0) {
          // Remove from last quote to end, then remove trailing comma
          fixed = fixed.substring(0, lastQuote) + '"';
          fixed = fixed.replace(/,\s*"[^"]*"$/, '');
          // Recount
          openBraces = 0; openBrackets = 0; inString = false; escaped = false;
          for (let i = 0; i < fixed.length; i++) {
            const ch = fixed[i];
            if (escaped) { escaped = false; continue; }
            if (ch === '\\') { escaped = true; continue; }
            if (ch === '"') { inString = !inString; continue; }
            if (inString) continue;
            if (ch === '{') openBraces++;
            if (ch === '}') openBraces--;
            if (ch === '[') openBrackets++;
            if (ch === ']') openBrackets--;
          }
        }
      }

      // Remove trailing incomplete key-value pairs
      fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*$/, '');
      fixed = fixed.replace(/,\s*$/, '');

      // Close open brackets and braces
      for (let i = 0; i < openBrackets; i++) fixed += ']';
      for (let i = 0; i < openBraces; i++) fixed += '}';

      return fixed;
    };

    const parseAIResponse = (data: any): any => {
      try {
        let content = data?.response || data;
        if (typeof content === 'object') return content;
        let jsonString = String(content).replace(/```json\s*/g, '').replace(/```\s*/g, '');
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) jsonString = jsonMatch[0];
        
        // Try direct parse first
        try {
          return JSON.parse(jsonString);
        } catch {
          // Try repairing truncated JSON
          console.warn('JSON parse failed, attempting repair...');
          const repaired = repairTruncatedJSON(jsonString);
          try {
            const result = JSON.parse(repaired);
            console.log('JSON repair succeeded');
            return result;
          } catch (e2) {
            console.error('JSON repair also failed:', e2);
            throw new Error('Failed to parse AI response');
          }
        }
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

      const callAI = async (message: string, maxTokens = 4000) => {
        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: { message, mode: 'simple', json_mode: true, max_tokens: maxTokens }
        });
        if (error) throw new Error(`Edge function error: ${error.message}`);
        return parseAIResponse(data);
      };

      const safeCallAI = async (message: string, fallback: any, maxTokens = 4000) => {
        try {
          return await callAI(message, maxTokens);
        } catch (e) {
          console.warn('Section generation failed, using fallback:', e);
          return fallback;
        }
      };

      try {
        const contextInfo = context
          ? `Contexte: ${context.name}\nVision: ${context.vision || ''}\nObjectifs: ${(context.objectives || []).join(', ')}\nAudience: ${context.target_audience || ''}`
          : '';

        const selectedArtifactsData = artifacts.filter(a => selectedArtifactIds.includes(a.id));
        const artifactsInfo = selectedArtifactsData.length > 0
          ? `\n\nArtefacts:\n${selectedArtifactsData.map(a => `- ${a.title}: ${JSON.stringify(a.content).slice(0, 500)}`).join('\n')}`
          : '';

        const progressPerSection = 100 / 16;
 
        // 1. Introduction
        setCurrentSection('Introduction');
        updateSectionStatus('introduction', 'generating');
        setProgress(progressPerSection);
        const introResult = await safeCallAI(`Idée: "${idea}"\n\nGénère une introduction (JSON): { "introduction": "texte" }`, { introduction: '' });
        updateSectionStatus('introduction', 'complete');

        // 2. Context
        setCurrentSection('Contexte & Objectifs');
        updateSectionStatus('context', 'generating');
        setProgress(progressPerSection * 2);
        const ctxResult = await safeCallAI(`Idée: "${idea}"\n${contextInfo}${artifactsInfo}\n\nGénère contexte et objectifs (JSON): { "context": "texte" }`, { context: '' });
        updateSectionStatus('context', 'complete');

        // 3. Problem
        setCurrentSection('Problème');
        updateSectionStatus('problem', 'generating');
        setProgress(progressPerSection * 3);
        const problemResult = await safeCallAI(`Idée: "${idea}"\n\nGénère le problème (JSON): { "problem": "texte" }`, { problem: '' });
        updateSectionStatus('problem', 'complete');

        // 4. Vision
        setCurrentSection('Vision');
        updateSectionStatus('vision', 'generating');
        setProgress(progressPerSection * 4);
        const visionResult = await safeCallAI(`Idée: "${idea}"\n\nGénère la vision (JSON): { "vision": "texte" }`, { vision: '' });
        updateSectionStatus('vision', 'complete');

        // 5. Constraints
        setCurrentSection('Contraintes');
        updateSectionStatus('constraints', 'generating');
        setProgress(progressPerSection * 5);
        const constraintsResult = await safeCallAI(`Idée: "${idea}"\n\nGénère 4 contraintes (JSON): { "constraints": ["..."] }`, { constraints: [] });
        updateSectionStatus('constraints', 'complete');
 
        // 6. Personas
        let personasResult: any = { personas: [] };
        if (config.includePersonas) {
          setCurrentSection('Personas');
          updateSectionStatus('personas', 'generating');
          setProgress(progressPerSection * 6);
          const personaDetailLevel = config.detailLevel === 'detailed' ? 'très détaillés avec biographie complète' : config.detailLevel === 'standard' ? 'détaillés' : 'concis';
          const personaCount = config.detailLevel === 'detailed' ? 4 : 3;
          personasResult = await safeCallAI(`Idée produit: "${idea}"\n${contextInfo}\n\nGénère ${personaCount} personas utilisateurs ${personaDetailLevel}.\n\nFormat JSON: { "personas": [{ "name": "Prénom Nom", "role": "Titre", "age": 35, "bio": "Bio", "goals": ["..."], "painPoints": ["..."], "motivations": ["..."], "behaviors": ["..."], "quote": "Citation" }] }`, { personas: [] }, 6000);
        }
        updateSectionStatus('personas', 'complete');

        // 7. Journey Map
        let journeyResult: any = { userJourneyMap: [] };
        if (config.includeJourneyMap) {
          setCurrentSection('User Journey Map');
          updateSectionStatus('userJourneyMap', 'generating');
          setProgress(progressPerSection * 7);
          const stageCount = config.detailLevel === 'detailed' ? 7 : 5;
          journeyResult = await safeCallAI(`Idée produit: "${idea}"\n${contextInfo}\n\nGénère une User Journey Map en ${stageCount} étapes.\n\nFormat JSON: { "userJourneyMap": [{ "stage": "Nom", "actions": ["..."], "thoughts": ["..."], "emotions": "positive/neutre/negative", "painPoints": ["..."], "opportunities": ["..."] }] }`, { userJourneyMap: [] }, 6000);
        }
        updateSectionStatus('userJourneyMap', 'complete');

        // 8. Features (Epics)
        setCurrentSection('Fonctionnalités (Epics)');
        updateSectionStatus('features', 'generating');
        setProgress(progressPerSection * 8);
        const featureCount = config.detailLevel === 'detailed' ? '8-10' : config.detailLevel === 'standard' ? '6-8' : '5-6';
        const featuresResult = await safeCallAI(`Idée produit: "${idea}"\n${contextInfo}\n\nGénère ${featureCount} fonctionnalités majeures (Epics).\n\nFormat JSON: { "features": [{ "id": "EPIC-001", "name": "Nom", "description": "Description", "businessValue": "Valeur", "scope": "Périmètre", "dependencies": ["..."] }] }`, { features: [] }, 6000);
        updateSectionStatus('features', 'complete');

        // 9. User Stories
        let storiesResult: any = { userStories: [] };
        if (config.includeUserStories) {
          const featuresList = Array.isArray(featuresResult?.features) ? featuresResult.features : [];
          const storiesPerFeature = config.detailLevel === 'detailed' ? 4 : config.detailLevel === 'standard' ? 3 : 2;
          const batchSize = 3;
          const allStories: any[] = [];
          for (let i = 0; i < featuresList.length; i += batchSize) {
            const batch = featuresList.slice(i, i + batchSize);
            const batchNames = batch.map((f: any) => f.name || f.id).join(', ');
            setCurrentSection(`User Stories (${batchNames})`);
            setProgress(progressPerSection * (8.5 + (i / Math.max(featuresList.length, 1)) * 0.5));
            try {
              const batchResult = await callAI(`Fonctionnalités: ${JSON.stringify(batch.map((f: any) => ({ id: f.id, name: f.name, description: f.description })))}\n\nGénère exactement ${storiesPerFeature} user stories par fonctionnalité.\n\nFormat JSON: { "userStories": [{ "id": "US-001", "featureId": "EPIC-001", "title": "Titre", "asA": "utilisateur", "iWant": "action", "soThat": "bénéfice", "acceptanceCriteria": ["GIVEN... WHEN... THEN..."], "priority": "high", "complexity": "M", "storyPoints": 3, "technicalNotes": "Notes" }] }`, 6000);
              allStories.push(...(batchResult.userStories || []));
            } catch (e) {
              console.warn(`Failed to parse stories batch ${i}, skipping`, e);
            }
          }
          storiesResult = { userStories: allStories };
        }

        // 10. Prioritization
        setCurrentSection('Priorisation');
        updateSectionStatus('prioritization', 'generating');
        setProgress(progressPerSection * 9);
        const prioResult = await safeCallAI(`Fonctionnalités: ${(featuresResult.features || []).map((f: any) => f.name || f.title).join(', ')}\n\nGénère une priorisation MoSCoW. Retourne UNIQUEMENT les NOMS des fonctionnalités.\n\nFormat JSON: { "prioritization": { "mvp": ["..."], "must": ["..."], "should": ["..."], "could": ["..."], "wont": [] } }`, { prioritization: { mvp: [], must: [], should: [], could: [], wont: [] } });
        updateSectionStatus('prioritization', 'complete');

        // 11. Acceptance
        setCurrentSection('Critères d\'acceptation');
        updateSectionStatus('acceptance', 'generating');
        setProgress(progressPerSection * 10);
        const accResult = await safeCallAI(`Idée: "${idea}"\n\nGénère 5 critères d'acceptation (JSON): { "acceptance": ["..."] }`, { acceptance: [] });
        updateSectionStatus('acceptance', 'complete');

        // 12. Wireframes
        setCurrentSection('Design & UX');
        updateSectionStatus('wireframes', 'generating');
        setProgress(progressPerSection * 11);
        const wfResult = await safeCallAI(`Idée: "${idea}"\n\nGénère 3 recommandations UX (JSON): { "wireframes": ["..."] }`, { wireframes: [] });
        updateSectionStatus('wireframes', 'complete');

        // 13. Architecture
        setCurrentSection('Architecture');
        updateSectionStatus('architecture', 'generating');
        setProgress(progressPerSection * 12);
        const archResult = await safeCallAI(`Idée: "${idea}"\n\nGénère architecture technique (JSON): { "architecture": { "frontend": "", "backend": "", "database": "" } }`, { architecture: {} });
        updateSectionStatus('architecture', 'complete');

        // 14. Risks
        setCurrentSection('Risques');
        updateSectionStatus('risks', 'generating');
        setProgress(progressPerSection * 13);
        const riskResult = await safeCallAI(`Idée: "${idea}"\n\nGénère 4 risques (JSON): { "risks": [{ "risk": "", "mitigation": "" }] }`, { risks: [] });
        updateSectionStatus('risks', 'complete');

        // 15. KPIs
        setCurrentSection('KPIs');
        updateSectionStatus('kpis', 'generating');
        setProgress(progressPerSection * 14);
        const kpiResult = await safeCallAI(`Idée: "${idea}"\n\nGénère 4 KPIs (JSON): { "kpis": ["..."] }`, { kpis: [] });
        updateSectionStatus('kpis', 'complete');

        // 16. Roadmap
        setCurrentSection('Roadmap');
        updateSectionStatus('roadmap', 'generating');
        setProgress(progressPerSection * 15);
        const rmResult = await safeCallAI(`Idée: "${idea}"\n\nGénère roadmap 3 phases (JSON): { "roadmap": [{ "phase": "", "timeline": "", "deliverables": [] }] }`, { roadmap: [] });
        updateSectionStatus('roadmap', 'complete');

        // 17. Appendix
        setCurrentSection('Annexes');
        updateSectionStatus('appendix', 'generating');
        setProgress(99);
        const apxResult = await safeCallAI(`Idée: "${idea}"\n\nGénère 3 références (JSON): { "appendix": ["..."] }`, { appendix: [] });
        updateSectionStatus('appendix', 'complete');
 
       setProgress(100);
 
        // Attach user stories to features with full data mapping
        const features = (featuresResult.features || []).map((f: any, idx: number) => {
          const featureId = f.id || `EPIC-${String(idx + 1).padStart(3, '0')}`;
          const featureStories = (storiesResult.userStories || [])
            .filter((s: any) => s.featureId === featureId || s.featureId === f.id)
            .map((s: any) => ({
              id: s.id || `US-${idx + 1}-${Math.random().toString(36).substr(2, 4)}`,
              featureId: featureId,
              title: safeText(s.title),
              asA: safeText(s.asA),
              iWant: safeText(s.iWant),
              soThat: safeText(s.soThat),
              description: safeText(s.description),
              acceptanceCriteria: normalizeArrayOfStrings(s.acceptanceCriteria),
              priority: s.priority || 'medium',
              complexity: s.complexity || 'M',
              storyPoints: s.storyPoints || null,
              technicalNotes: safeText(s.technicalNotes),
            }));

          return {
            id: featureId,
            name: safeText(f.name || f.title || 'Feature'),
            description: safeText(f.description || ''),
            businessValue: safeText(f.businessValue),
            scope: safeText(f.scope),
            dependencies: normalizeArrayOfStrings(f.dependencies),
            userStories: featureStories,
          };
        });

        const document: PRDDocument = {
          introduction: safeText(introResult.introduction),
          context: safeText(ctxResult.context),
          problem: safeText(problemResult.problem),
          vision: safeText(visionResult.vision),
          constraints: normalizeArrayOfStrings(constraintsResult.constraints),
          personas: (personasResult.personas || []).map((p: any) => ({
            name: safeText(p.name),
            role: safeText(p.role),
            age: p.age || 30,
            bio: safeText(p.bio),
            goals: normalizeArrayOfStrings(p.goals),
            painPoints: normalizeArrayOfStrings(p.painPoints),
            motivations: normalizeArrayOfStrings(p.motivations),
            behaviors: normalizeArrayOfStrings(p.behaviors),
            quote: safeText(p.quote),
            imageUrl: '',
          })),
          userJourneyMap: (journeyResult.userJourneyMap || []).map((stage: any) => ({
            stage: safeText(stage.stage || ''),
            actions: normalizeArrayOfStrings(stage.actions),
            thoughts: normalizeArrayOfStrings(stage.thoughts),
            emotions: safeText(stage.emotions),
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