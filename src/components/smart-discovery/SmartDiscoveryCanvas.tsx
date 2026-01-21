import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';

import { DiscoveryProgress } from './DiscoveryProgress';
import { StepInput } from './StepInput';
import { StepDiscovery } from './StepDiscovery';
import { StepPersonas } from './StepPersonas';
import { StepJourneys } from './StepJourneys';
import { StepEpics } from './StepEpics';
import { StepStories } from './StepStories';
import { StepSummary } from './StepSummary';

import {
  ProductContext,
  DiscoveryData,
  Persona,
  JourneyNeed,
  Epic,
  UserStory,
  DiscoveryStep
} from './types';

export const SmartDiscoveryCanvas = () => {
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<DiscoveryStep>('input');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data state
  const [ideaDescription, setIdeaDescription] = useState('');
  const [activeContext, setActiveContext] = useState<ProductContext | null>(null);
  const [reformulatedProblem, setReformulatedProblem] = useState('');
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [journeyNeeds, setJourneyNeeds] = useState<JourneyNeed[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [stories, setStories] = useState<UserStory[]>([]);

  // Generate Discovery (Step 1 → 2)
  const handleGenerateDiscovery = async () => {
    if (!ideaDescription.trim()) {
      toast.error('Décrivez votre idée avant de continuer');
      return;
    }

    setIsLoading(true);

    try {
      const contextInfo = activeContext
        ? `
Contexte Produit: ${activeContext.name}
Vision: ${activeContext.vision || 'Non définie'}
Audience cible: ${activeContext.target_audience || 'Non définie'}
Contraintes: ${activeContext.constraints || 'Aucune'}
Secteur: ${activeContext.metadata?.industry_sector || 'Non défini'}
`
        : '';

      const systemPrompt = `Tu es un expert Product Manager en Discovery. Analyse l'idée fournie et génère une étude de discovery structurée.

RÉPONDS UNIQUEMENT EN JSON avec cette structure exacte:
{
  "reformulatedProblem": "Reformulation claire et précise du problème métier (1-2 phrases)",
  "hypotheses": ["Hypothèse 1", "Hypothèse 2", "Hypothèse 3"],
  "objectives": ["Objectif 1", "Objectif 2", "Objectif 3"],
  "constraints": ["Contrainte tech/data/orga 1", "Contrainte 2"],
  "indicators": ["Indicateur pressenti 1", "Indicateur 2", "Indicateur 3"]
}

Sois précis, actionnable et orienté valeur utilisateur.`;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `${contextInfo}\n\nIdée/phrase stakeholder à analyser:\n${ideaDescription}`,
          systemPrompt
        }
      });

      if (error) throw error;

      const content = data?.response || data?.content || '';
      let parsed: any = null;
      
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (!parsed || !parsed.reformulatedProblem) {
        throw new Error('Format de réponse invalide');
      }

      setReformulatedProblem(parsed.reformulatedProblem);
      setDiscoveryData({
        reformulatedProblem: parsed.reformulatedProblem,
        hypotheses: parsed.hypotheses || [],
        objectives: parsed.objectives || [],
        constraints: parsed.constraints || [],
        indicators: parsed.indicators || []
      });
      setCurrentStep('discovery');
      toast.success('Discovery générée !');
    } catch (error) {
      console.error('Error generating discovery:', error);
      toast.error('Échec de la génération. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Personas (Step 2 → 3)
  const handleGeneratePersonas = async () => {
    setIsLoading(true);

    try {
      const contextInfo = activeContext
        ? `Contexte: ${activeContext.name}, Audience: ${activeContext.target_audience || 'Non définie'}`
        : '';

      const systemPrompt = `Tu es un expert UX Research. Génère des personas pertinents basés sur le contexte.

RÉPONDS UNIQUEMENT EN JSON avec cette structure:
{
  "personas": [
    {
      "role": "Titre du rôle",
      "mainGoal": "Objectif principal de ce persona",
      "keyFrustration": "Frustration clé actuelle",
      "usageContext": "Contexte dans lequel il utilise le produit"
    }
  ]
}

Génère 3-5 personas variés et pertinents.`;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `${contextInfo}\n\nProblème: ${reformulatedProblem}\nIdée initiale: ${ideaDescription}\n\nHypothèses: ${discoveryData?.hypotheses.join(', ')}`,
          systemPrompt
        }
      });

      if (error) throw error;

      const content = data?.response || data?.content || '';
      let parsed: any = null;
      
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (!parsed || !parsed.personas) {
        throw new Error('Format invalide');
      }

      const generatedPersonas: Persona[] = parsed.personas.map((p: any) => ({
        id: crypto.randomUUID(),
        role: p.role,
        mainGoal: p.mainGoal,
        keyFrustration: p.keyFrustration,
        usageContext: p.usageContext,
        selected: true
      }));

      setPersonas(generatedPersonas);
      setCurrentStep('personas');
      toast.success('Personas générés !');
    } catch (error) {
      console.error('Error generating personas:', error);
      toast.error('Échec de la génération des personas');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Journeys (Step 3 → 4)
  const handleGenerateJourneys = async () => {
    const selectedPersonas = personas.filter(p => p.selected);
    setIsLoading(true);

    try {
      const systemPrompt = `Tu es un expert UX. Pour chaque persona, génère les situations clés, besoins et points de friction.

RÉPONDS UNIQUEMENT EN JSON:
{
  "journeys": [
    {
      "personaId": "ID_DU_PERSONA",
      "situations": ["Situation 1", "Situation 2"],
      "needs": ["Besoin 1", "Besoin 2"],
      "frictionPoints": ["Point de friction 1", "Point de friction 2"]
    }
  ]
}`;

      const personasInfo = selectedPersonas.map(p => ({
        id: p.id,
        role: p.role,
        goal: p.mainGoal,
        frustration: p.keyFrustration
      }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Problème: ${reformulatedProblem}\n\nPersonas:\n${JSON.stringify(personasInfo, null, 2)}`,
          systemPrompt
        }
      });

      if (error) throw error;

      const content = data?.response || data?.content || '';
      let parsed: any = null;
      
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (parsed?.journeys) {
        const generatedJourneys: JourneyNeed[] = parsed.journeys.map((j: any) => ({
          id: crypto.randomUUID(),
          personaId: j.personaId,
          situations: j.situations || [],
          needs: j.needs || [],
          frictionPoints: j.frictionPoints || []
        }));
        setJourneyNeeds(generatedJourneys);
      }

      setCurrentStep('journeys');
      toast.success('Parcours générés !');
    } catch (error) {
      console.error('Error generating journeys:', error);
      // Continue without generated journeys
      setCurrentStep('journeys');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Epics (Step 4 → 5)
  const handleGenerateEpics = async () => {
    const selectedPersonas = personas.filter(p => p.selected);
    setIsLoading(true);

    try {
      const systemPrompt = `Tu es un Product Manager expert. Génère des Epics à partir de la discovery.

RÉPONDS UNIQUEMENT EN JSON:
{
  "epics": [
    {
      "title": "Titre de l'Epic",
      "description": "Description courte",
      "objective": "Objectif principal",
      "expectedValue": "Valeur business attendue",
      "personaRole": "Rôle du persona concerné",
      "indicators": ["Indicateur 1", "Indicateur 2"]
    }
  ]
}

Génère 2-4 Epics pertinents et actionnables.`;

      const journeyInfo = journeyNeeds.map(j => {
        const persona = personas.find(p => p.id === j.personaId);
        return {
          persona: persona?.role,
          needs: j.needs,
          frictions: j.frictionPoints
        };
      });

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Problème: ${reformulatedProblem}\n\nObjectifs: ${discoveryData?.objectives.join(', ')}\n\nParcours:\n${JSON.stringify(journeyInfo, null, 2)}`,
          systemPrompt
        }
      });

      if (error) throw error;

      const content = data?.response || data?.content || '';
      let parsed: any = null;
      
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (!parsed || !parsed.epics) {
        throw new Error('Format invalide');
      }

      const generatedEpics: Epic[] = parsed.epics.map((e: any) => {
        const matchingPersona = selectedPersonas.find(p => 
          p.role.toLowerCase().includes(e.personaRole?.toLowerCase()) ||
          e.personaRole?.toLowerCase().includes(p.role.toLowerCase())
        ) || selectedPersonas[0];

        return {
          id: crypto.randomUUID(),
          title: e.title,
          description: e.description,
          objective: e.objective,
          expectedValue: e.expectedValue,
          personaId: matchingPersona?.id || '',
          personaRole: e.personaRole || matchingPersona?.role || '',
          indicators: e.indicators || [],
          selected: true
        };
      });

      setEpics(generatedEpics);
      setCurrentStep('epics');
      toast.success('Epics générés !');
    } catch (error) {
      console.error('Error generating epics:', error);
      toast.error('Échec de la génération des Epics');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate User Stories (Step 5 → 6)
  const handleGenerateStories = async () => {
    const selectedEpics = epics.filter(e => e.selected);
    setIsLoading(true);

    try {
      const allStories: UserStory[] = [];

      for (const epic of selectedEpics) {
        const systemPrompt = `Tu es un Product Owner expert. Génère des User Stories pour cet Epic.

RÉPONDS UNIQUEMENT EN JSON:
{
  "stories": [
    {
      "title": "Titre court",
      "asA": "type d'utilisateur",
      "iWant": "action souhaitée",
      "soThat": "bénéfice attendu",
      "acceptanceCriteria": ["Critère 1", "Critère 2", "Critère 3"],
      "tshirtSize": "S",
      "priority": "high",
      "impact": "Impact qualitatif attendu",
      "indicators": ["Indicateur 1"]
    }
  ]
}

Génère 3-5 User Stories par Epic. tshirtSize: XS, S, M, L, XL. priority: high, medium, low.`;

        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: {
            message: `Epic: ${epic.title}\nDescription: ${epic.description}\nObjectif: ${epic.objective}\nPersona: ${epic.personaRole}`,
            systemPrompt
          }
        });

        if (error) throw error;

        const content = data?.response || data?.content || '';
        let parsed: any = null;
        
        try {
          parsed = JSON.parse(content);
        } catch {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) parsed = JSON.parse(match[0]);
        }

        if (parsed?.stories) {
          const epicStories: UserStory[] = parsed.stories.map((s: any) => ({
            id: crypto.randomUUID(),
            epicId: epic.id,
            title: s.title,
            story: {
              asA: s.asA,
              iWant: s.iWant,
              soThat: s.soThat
            },
            acceptanceCriteria: s.acceptanceCriteria || [],
            effortPoints: s.tshirtSize === 'XS' ? 1 : s.tshirtSize === 'S' ? 2 : s.tshirtSize === 'M' ? 3 : s.tshirtSize === 'L' ? 5 : 8,
            tshirtSize: s.tshirtSize || 'M',
            priority: s.priority || 'medium',
            impact: s.impact || '',
            indicators: s.indicators || [],
            status: 'draft' as const,
            personaRole: epic.personaRole
          }));
          allStories.push(...epicStories);
        }
      }

      setStories(allStories);
      setCurrentStep('stories');
      toast.success(`${allStories.length} User Stories générées !`);
    } catch (error) {
      console.error('Error generating stories:', error);
      toast.error('Échec de la génération des User Stories');
    } finally {
      setIsLoading(false);
    }
  };

  // Save all artifacts
  const handleSaveAll = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const selectedPersonas = personas.filter(p => p.selected);
      const selectedEpics = epics.filter(e => e.selected);

      // Save Discovery artifact
      await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Discovery - ${reformulatedProblem.substring(0, 50)}...`,
        content: {
          type: 'smart_discovery',
          ideaDescription,
          reformulatedProblem,
          discoveryData,
          personas: selectedPersonas,
          journeyNeeds
        } as any,
        product_context_id: activeContext?.id || null
      });

      // Save each Epic
      for (const epic of selectedEpics) {
        const epicStories = stories.filter(s => s.epicId === epic.id);
        
        await supabase.from('artifacts').insert({
          user_id: user.id,
          artifact_type: 'epic' as const,
          title: epic.title,
          content: {
            type: 'discovery_epic',
            epic,
            stories: epicStories
          } as any,
          product_context_id: activeContext?.id || null
        });
      }

      // Save User Stories collection
      await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'story' as const,
        title: `User Stories - ${reformulatedProblem.substring(0, 40)}...`,
        content: {
          type: 'discovery_stories',
          stories,
          epics: selectedEpics.map(e => ({ id: e.id, title: e.title }))
        } as any,
        product_context_id: activeContext?.id || null
      });

      setCurrentStep('summary');
      toast.success('Discovery complète sauvegardée !');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Échec de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  // Export handler
  const handleExport = async (format: 'pdf' | 'notion' | 'jira' | 'docx') => {
    if (format === 'docx') {
      await exportToWord();
    } else if (format === 'pdf') {
      const content = `
# Smart Discovery Canvas

## Problème
${reformulatedProblem}

## Hypothèses
${discoveryData?.hypotheses.map(h => `- ${h}`).join('\n')}

## Objectifs
${discoveryData?.objectives.map(o => `- ${o}`).join('\n')}

## Personas
${personas.filter(p => p.selected).map(p => `### ${p.role}\n- Objectif: ${p.mainGoal}\n- Frustration: ${p.keyFrustration}`).join('\n\n')}

## Epics
${epics.filter(e => e.selected).map(e => `### ${e.title}\n${e.description}\n- Valeur: ${e.expectedValue}`).join('\n\n')}

## User Stories
${stories.map(s => `- ${s.title}: En tant que ${s.story.asA}, je veux ${s.story.iWant} afin de ${s.story.soThat}`).join('\n')}
      `;

      navigator.clipboard.writeText(content);
      toast.success('Contenu copié dans le presse-papier (format Markdown)');
    } else {
      toast.info('Export vers ' + format + ' bientôt disponible');
    }
  };

  // Word Document Export
  const exportToWord = async () => {
    const selectedPersonas = personas.filter(p => p.selected);
    const selectedEpics = epics.filter(e => e.selected);
    const totalPoints = stories.reduce((sum, s) => sum + s.effortPoints, 0);
    const estimatedSprints = Math.ceil(totalPoints / 20);
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    const createBulletList = (items: string[]) => 
      items.map(item => new Paragraph({
        text: item,
        bullet: { level: 0 },
        spacing: { after: 100 }
      }));

    const createTableCell = (text: string, bold = false, width?: number) => 
      new TableCell({
        width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
        children: [new Paragraph({
          children: [new TextRun({ text, bold })],
          spacing: { before: 50, after: 50 }
        })],
        margins: { top: convertInchesToTwip(0.05), bottom: convertInchesToTwip(0.05), left: convertInchesToTwip(0.1), right: convertInchesToTwip(0.1) }
      });

    // Document sections
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        text: 'Smart Discovery Canvas',
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: `Généré le ${today}`, italics: true, color: '666666' })],
        spacing: { after: 400 }
      })
    );

    // Context
    if (activeContext) {
      children.push(
        new Paragraph({ text: 'Contexte Produit', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        new Paragraph({ text: `Produit: ${activeContext.name}`, spacing: { after: 100 } })
      );
      if (activeContext.vision) {
        children.push(new Paragraph({ text: `Vision: ${activeContext.vision}`, spacing: { after: 100 } }));
      }
      if (activeContext.target_audience) {
        children.push(new Paragraph({ text: `Audience cible: ${activeContext.target_audience}`, spacing: { after: 100 } }));
      }
    }

    // Idea & Problem
    children.push(
      new Paragraph({ text: '1. Cadrage Discovery', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ text: 'Idée initiale', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
      new Paragraph({ text: ideaDescription, spacing: { after: 200 } }),
      new Paragraph({ text: 'Problème reformulé', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
      new Paragraph({ 
        children: [new TextRun({ text: reformulatedProblem, bold: true })],
        spacing: { after: 200 }
      })
    );

    // Discovery Data
    if (discoveryData) {
      children.push(
        new Paragraph({ text: 'Hypothèses', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
        ...createBulletList(discoveryData.hypotheses),
        new Paragraph({ text: 'Objectifs', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
        ...createBulletList(discoveryData.objectives),
        new Paragraph({ text: 'Contraintes identifiées', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
        ...createBulletList(discoveryData.constraints),
        new Paragraph({ text: 'Indicateurs pressentis', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
        ...createBulletList(discoveryData.indicators)
      );
    }

    // Personas
    children.push(
      new Paragraph({ text: '2. Personas', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } })
    );

    selectedPersonas.forEach(persona => {
      children.push(
        new Paragraph({ text: persona.role, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [createTableCell('Objectif principal', true, 30), createTableCell(persona.mainGoal, false, 70)] }),
            new TableRow({ children: [createTableCell('Frustration clé', true, 30), createTableCell(persona.keyFrustration, false, 70)] }),
            new TableRow({ children: [createTableCell('Contexte d\'usage', true, 30), createTableCell(persona.usageContext, false, 70)] })
          ]
        })
      );
    });

    // Journeys
    if (journeyNeeds.length > 0) {
      children.push(
        new Paragraph({ text: '3. Parcours et Besoins', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } })
      );

      journeyNeeds.forEach(journey => {
        const persona = personas.find(p => p.id === journey.personaId);
        if (persona) {
          children.push(
            new Paragraph({ text: `Parcours: ${persona.role}`, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            new Paragraph({ text: 'Situations clés:', spacing: { before: 100, after: 50 } }),
            ...createBulletList(journey.situations),
            new Paragraph({ text: 'Besoins:', spacing: { before: 100, after: 50 } }),
            ...createBulletList(journey.needs),
            new Paragraph({ text: 'Points de friction:', spacing: { before: 100, after: 50 } }),
            ...createBulletList(journey.frictionPoints)
          );
        }
      });
    }

    // Epics
    children.push(
      new Paragraph({ text: '4. Epics', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } })
    );

    selectedEpics.forEach((epic, index) => {
      const epicStories = stories.filter(s => s.epicId === epic.id);
      const epicPoints = epicStories.reduce((sum, s) => sum + s.effortPoints, 0);

      children.push(
        new Paragraph({ 
          text: `Epic ${index + 1}: ${epic.title}`, 
          heading: HeadingLevel.HEADING_2, 
          spacing: { before: 300, after: 100 } 
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [createTableCell('Description', true, 25), createTableCell(epic.description, false, 75)] }),
            new TableRow({ children: [createTableCell('Objectif', true, 25), createTableCell(epic.objective, false, 75)] }),
            new TableRow({ children: [createTableCell('Valeur attendue', true, 25), createTableCell(epic.expectedValue, false, 75)] }),
            new TableRow({ children: [createTableCell('Persona', true, 25), createTableCell(epic.personaRole, false, 75)] }),
            new TableRow({ children: [createTableCell('Stories', true, 25), createTableCell(`${epicStories.length} stories - ${epicPoints} points`, false, 75)] })
          ]
        })
      );

      if (epic.indicators.length > 0) {
        children.push(
          new Paragraph({ text: 'Indicateurs:', spacing: { before: 100, after: 50 } }),
          ...createBulletList(epic.indicators)
        );
      }
    });

    // User Stories
    children.push(
      new Paragraph({ text: '5. User Stories', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } })
    );

    selectedEpics.forEach(epic => {
      const epicStories = stories.filter(s => s.epicId === epic.id);
      
      if (epicStories.length > 0) {
        children.push(
          new Paragraph({ 
            text: `Stories pour: ${epic.title}`, 
            heading: HeadingLevel.HEADING_2, 
            spacing: { before: 200, after: 100 } 
          })
        );

        epicStories.forEach((story, storyIndex) => {
          children.push(
            new Paragraph({ 
              children: [new TextRun({ text: `${storyIndex + 1}. ${story.title}`, bold: true })],
              spacing: { before: 150, after: 50 }
            }),
            new Paragraph({ 
              children: [
                new TextRun({ text: 'En tant que ', italics: true }),
                new TextRun({ text: story.story.asA }),
                new TextRun({ text: ', je veux ', italics: true }),
                new TextRun({ text: story.story.iWant }),
                new TextRun({ text: ' afin de ', italics: true }),
                new TextRun({ text: story.story.soThat })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({ 
              children: [
                new TextRun({ text: `Taille: ${story.tshirtSize} | Priorité: ${story.priority} | Points: ${story.effortPoints}`, color: '666666' })
              ],
              spacing: { after: 50 }
            }),
            new Paragraph({ text: 'Critères d\'acceptation:', spacing: { before: 50, after: 50 } }),
            ...story.acceptanceCriteria.map(criterion => 
              new Paragraph({
                text: `☐ ${criterion}`,
                spacing: { after: 50 }
              })
            )
          );

          if (story.impact) {
            children.push(
              new Paragraph({ 
                children: [new TextRun({ text: `Impact: ${story.impact}`, italics: true })],
                spacing: { before: 50, after: 100 }
              })
            );
          }
        });
      }
    });

    // Summary
    children.push(
      new Paragraph({ text: '6. Résumé', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [createTableCell('Personas validés', true), createTableCell(String(selectedPersonas.length))] }),
          new TableRow({ children: [createTableCell('Epics créés', true), createTableCell(String(selectedEpics.length))] }),
          new TableRow({ children: [createTableCell('User Stories', true), createTableCell(String(stories.length))] }),
          new TableRow({ children: [createTableCell('Points totaux', true), createTableCell(String(totalPoints))] }),
          new TableRow({ children: [createTableCell('Sprints estimés (~20 pts/sprint)', true), createTableCell(`~${estimatedSprints}`)] })
        ]
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const fileName = `Smart_Discovery_${activeContext?.name || 'Canvas'}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
    toast.success('Document Word téléchargé !');
  };

  // Reset
  const handleNewDiscovery = () => {
    setCurrentStep('input');
    setIdeaDescription('');
    setActiveContext(null);
    setReformulatedProblem('');
    setDiscoveryData(null);
    setPersonas([]);
    setJourneyNeeds([]);
    setEpics([]);
    setStories([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Smart Discovery Canvas
            </h1>
            <p className="text-muted-foreground text-sm">
              Transformez une idée floue en discovery structurée et traçable
            </p>
          </div>
        </div>

        {/* Progress */}
        {currentStep !== 'summary' && (
          <div className="mb-8">
            <DiscoveryProgress 
              currentStep={currentStep} 
              onStepClick={(step) => {
                // Allow going back to previous steps
                const steps: DiscoveryStep[] = ['input', 'discovery', 'personas', 'journeys', 'epics', 'stories'];
                const currentIndex = steps.indexOf(currentStep);
                const targetIndex = steps.indexOf(step);
                if (targetIndex < currentIndex) {
                  setCurrentStep(step);
                }
              }}
            />
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'input' && (
          <StepInput
            ideaDescription={ideaDescription}
            onIdeaChange={setIdeaDescription}
            activeContext={activeContext}
            onContextSelect={setActiveContext}
            isLoading={isLoading}
            onAnalyze={handleGenerateDiscovery}
          />
        )}

        {currentStep === 'discovery' && discoveryData && (
          <StepDiscovery
            reformulatedProblem={reformulatedProblem}
            discoveryData={discoveryData}
            onUpdate={(data, problem) => {
              setDiscoveryData(data);
              setReformulatedProblem(problem);
            }}
            onNext={handleGeneratePersonas}
            onBack={() => setCurrentStep('input')}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'personas' && (
          <StepPersonas
            personas={personas}
            onUpdate={setPersonas}
            onNext={handleGenerateJourneys}
            onBack={() => setCurrentStep('discovery')}
            isLoading={isLoading}
            onRegenerate={handleGeneratePersonas}
          />
        )}

        {currentStep === 'journeys' && (
          <StepJourneys
            personas={personas}
            journeyNeeds={journeyNeeds}
            onUpdate={setJourneyNeeds}
            onNext={handleGenerateEpics}
            onBack={() => setCurrentStep('personas')}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'epics' && (
          <StepEpics
            epics={epics}
            personas={personas}
            onUpdate={setEpics}
            onNext={handleGenerateStories}
            onBack={() => setCurrentStep('journeys')}
            isLoading={isLoading}
            onRegenerate={handleGenerateEpics}
          />
        )}

        {currentStep === 'stories' && (
          <StepStories
            epics={epics}
            stories={stories}
            onUpdate={setStories}
            onSave={handleSaveAll}
            onBack={() => setCurrentStep('epics')}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'summary' && (
          <StepSummary
            activeContext={activeContext}
            discoveryData={discoveryData}
            personas={personas}
            epics={epics}
            stories={stories}
            onExport={handleExport}
            onNewDiscovery={handleNewDiscovery}
            onGoHome={() => navigate('/')}
          />
        )}
      </div>
    </div>
  );
};

export default SmartDiscoveryCanvas;
