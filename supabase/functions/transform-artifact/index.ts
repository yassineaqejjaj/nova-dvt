import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Transformation types and their specialized prompts
const TRANSFORMATION_PROMPTS: Record<string, { system: string; outputSchema: string }> = {
  canvas_to_epic: {
    system: `Tu es un expert Product Manager spécialisé dans l'extraction d'Epics stratégiques à partir de Canvas produit.

TÂCHE: Analyse le Canvas produit fourni et extrais 2-5 Epics stratégiques.

Pour chaque Epic, fournis:
- title: Titre court et actionnable (max 10 mots)
- description: Description détaillée en 2-3 phrases
- objective: Objectif métier clair et mesurable
- expectedValue: Valeur attendue (impact business)
- indicators: 2-3 indicateurs de succès (KPIs)
- priority: "high" | "medium" | "low"

RÈGLES:
1. Chaque Epic doit être stratégique et orienté valeur utilisateur
2. Les Epics doivent couvrir les différentes dimensions du Canvas
3. Priorise selon l'impact et la faisabilité
4. Utilise un langage orienté action et résultat`,
    outputSchema: `{"epics": [{"title": "string", "description": "string", "objective": "string", "expectedValue": "string", "indicators": ["string"], "priority": "high|medium|low"}]}`
  },

  canvas_to_story: {
    system: `Tu es un expert Product Manager spécialisé dans la création de User Stories à partir de Canvas produit.

TÂCHE: Analyse le Canvas produit fourni et génère 5-10 User Stories actionnables.

Pour chaque Story:
- title: Titre court et descriptif
- story: {asA, iWant, soThat} - SANS les préfixes "En tant que", "Je veux", "Afin de"
- acceptanceCriteria: 2-4 critères d'acceptation spécifiques
- effortPoints: Estimation Fibonacci (1, 2, 3, 5, 8)
- priority: "high" | "medium" | "low"

RÈGLES CRITIQUES pour story:
- asA: UNIQUEMENT le type d'utilisateur (ex: "utilisateur connecté", "administrateur")
- iWant: UNIQUEMENT l'action (ex: "créer un nouveau projet", "modifier mes paramètres")
- soThat: UNIQUEMENT le bénéfice (ex: "organiser mon travail", "personnaliser mon expérience")`,
    outputSchema: `{"stories": [{"title": "string", "story": {"asA": "string", "iWant": "string", "soThat": "string"}, "acceptanceCriteria": ["string"], "effortPoints": number, "priority": "high|medium|low"}]}`
  },

  epic_to_story: {
    system: `Tu es un expert Product Manager spécialisé dans le découpage d'Epics en User Stories.

TÂCHE: Découpe l'Epic fourni en 3-7 User Stories détaillées et actionnables.

Pour chaque Story:
- id: Identifiant unique (US-001, US-002, ...)
- title: Titre court et descriptif
- story: {asA, iWant, soThat} - SANS les préfixes "En tant que", "Je veux", "Afin de"
- acceptanceCriteria: 2-4 critères d'acceptation spécifiques et testables
- effortPoints: Estimation Fibonacci (1, 2, 3, 5, 8) - max 8 points sinon découper
- priority: "high" | "medium" | "low"
- dependencies: IDs des stories dont celle-ci dépend

RÈGLES CRITIQUES:
1. Chaque story doit être indépendante et livrable
2. Les critères d'acceptation doivent être vérifiables
3. JAMAIS "En tant que", "Je veux", "Afin de" dans asA/iWant/soThat`,
    outputSchema: `{"stories": [{"id": "string", "title": "string", "story": {"asA": "string", "iWant": "string", "soThat": "string"}, "acceptanceCriteria": ["string"], "effortPoints": number, "priority": "high|medium|low", "dependencies": ["string"]}]}`
  },

  epic_to_tech_spec: {
    system: `Tu es un architecte technique senior spécialisé dans la création de spécifications techniques.

TÂCHE: Génère une spécification technique complète pour l'Epic fourni.

Structure attendue:
- overview: Vue d'ensemble technique (2-3 paragraphes)
- architecture: Liste des composants principaux avec leurs interactions
- dataModel: Modèle de données (entités, relations, attributs clés)
- apis: Endpoints API nécessaires (méthode, path, description)
- dependencies: Dépendances techniques (libraries, services externes)
- securityConsiderations: Points de sécurité à adresser
- risks: Risques techniques et mitigations proposées
- estimatedEffort: Estimation globale (jours/homme)

RÈGLES:
1. Sois concret et spécifique au contexte
2. Identifie les points de complexité
3. Propose des solutions pragmatiques`,
    outputSchema: `{"techSpec": {"overview": "string", "architecture": [{"name": "string", "description": "string", "interactions": ["string"]}], "dataModel": [{"entity": "string", "attributes": ["string"], "relations": ["string"]}], "apis": [{"method": "string", "path": "string", "description": "string"}], "dependencies": ["string"], "securityConsiderations": ["string"], "risks": [{"risk": "string", "mitigation": "string"}], "estimatedEffort": "string"}}`
  },

  story_to_impact: {
    system: `Tu es un analyste produit expert en analyse d'impact et évaluation de risques.

TÂCHE: Analyse l'impact de la User Story fournie sur le produit et l'organisation.

Structure attendue:
- summary: Résumé de l'impact en 2-3 phrases
- userImpact: Impact sur les utilisateurs (positif/négatif)
- businessImpact: Impact business et métriques affectées
- technicalImpact: Impact technique (dette, performance, sécurité)
- dependencies: Dépendances identifiées
- risks: Risques et mitigations
- recommendations: Recommandations pour la mise en œuvre
- priority: Score de priorité global (1-10)

RÈGLES:
1. Sois objectif et factuel
2. Identifie les effets de bord potentiels
3. Propose des métriques de suivi`,
    outputSchema: `{"impactAnalysis": {"summary": "string", "userImpact": {"positive": ["string"], "negative": ["string"]}, "businessImpact": {"metrics": ["string"], "value": "string"}, "technicalImpact": {"areas": ["string"], "complexity": "low|medium|high"}, "dependencies": ["string"], "risks": [{"risk": "string", "likelihood": "low|medium|high", "mitigation": "string"}], "recommendations": ["string"], "priority": number}}`
  }
};

function getTransformationType(sourceType: string, targetType: string): string {
  const key = `${sourceType}_to_${targetType}`;
  if (TRANSFORMATION_PROMPTS[key]) return key;
  
  // Fallbacks
  if (sourceType === 'canvas' && targetType === 'epic') return 'canvas_to_epic';
  if (sourceType === 'canvas' && targetType === 'story') return 'canvas_to_story';
  if (sourceType === 'epic' && targetType === 'story') return 'epic_to_story';
  if (sourceType === 'epic' && targetType === 'tech_spec') return 'epic_to_tech_spec';
  if (sourceType === 'story' && targetType === 'impact_analysis') return 'story_to_impact';
  
  throw new Error(`Unsupported transformation: ${sourceType} → ${targetType}`);
}

function formatSourceContent(content: any, type: string): string {
  if (typeof content === 'string') return content;
  
  switch (type) {
    case 'canvas':
      return Object.entries(content)
        .map(([key, value]) => {
          const title = key.replace(/_/g, ' ').toUpperCase();
          if (Array.isArray(value)) {
            return `${title}:\n${value.map((item: any) => `  • ${typeof item === 'object' ? JSON.stringify(item) : item}`).join('\n')}`;
          }
          return `${title}:\n${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`;
        })
        .join('\n\n');
    
    case 'epic':
      return `EPIC: ${content.title || 'Sans titre'}\n\n` +
        `DESCRIPTION:\n${content.description || 'Pas de description'}\n\n` +
        `OBJECTIF:\n${content.objective || content.goal || 'Non spécifié'}\n\n` +
        (content.user_stories ? `STORIES EXISTANTES:\n${content.user_stories.map((s: any) => `• ${typeof s === 'object' ? s.title : s}`).join('\n')}` : '');
    
    case 'story':
      const story = content.story || content;
      return `TITRE: ${content.title || 'Sans titre'}\n\n` +
        `USER STORY:\n` +
        `En tant que ${story.asA || story.as_a || 'utilisateur'}\n` +
        `Je veux ${story.iWant || story.i_want || '...'}\n` +
        `Afin de ${story.soThat || story.so_that || '...'}\n\n` +
        `CRITÈRES D'ACCEPTATION:\n${Array.isArray(content.acceptanceCriteria || content.acceptance_criteria) 
          ? (content.acceptanceCriteria || content.acceptance_criteria).map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') 
          : 'Aucun'}`;
    
    default:
      return JSON.stringify(content, null, 2);
  }
}

function truncateContent(content: string, maxChars: number = 8000): string {
  if (content.length <= maxChars) return content;
  return content.slice(0, maxChars) + '\n\n[... contenu tronqué pour respecter les limites ...]';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceArtifact, targetType, options } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!sourceArtifact?.content || !sourceArtifact?.artifact_type || !targetType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sourceArtifact (with content and artifact_type) and targetType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transformationType = getTransformationType(sourceArtifact.artifact_type, targetType);
    const promptConfig = TRANSFORMATION_PROMPTS[transformationType];

    const formattedContent = truncateContent(
      formatSourceContent(sourceArtifact.content, sourceArtifact.artifact_type)
    );

    const userPrompt = `ARTEFACT SOURCE (${sourceArtifact.artifact_type.toUpperCase()}):
Titre: ${sourceArtifact.title}

Contenu:
${formattedContent}

${options?.focusAreas?.length ? `FOCUS AREAS: ${options.focusAreas.join(', ')}` : ''}
${options?.count ? `NOMBRE D'ÉLÉMENTS SOUHAITÉ: ${options.count}` : ''}
${options?.context ? `CONTEXTE ADDITIONNEL: ${options.context}` : ''}

Génère le résultat au format JSON strict.`;

    console.log(`[transform-artifact] Type: ${transformationType}, Source: "${sourceArtifact.title}"`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { 
            role: 'system', 
            content: `${promptConfig.system}\n\nFORMAT DE SORTIE STRICT:\n${promptConfig.outputSchema}\n\nRenvoie UNIQUEMENT du JSON valide, sans prose, sans code fences, sans commentaires.`
          },
          { role: 'user', content: userPrompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[transform-artifact] AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte. Réessayez dans quelques instants.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits épuisés. Veuillez recharger votre compte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content as string | undefined;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1].trim());
        } catch { /* continue to next fallback */ }
      }
      
      // Try to find any JSON object
      if (!parsed) {
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          try {
            parsed = JSON.parse(objectMatch[0]);
          } catch { /* give up */ }
        }
      }
    }

    if (!parsed) {
      console.error('[transform-artifact] Failed to parse AI response:', content.slice(0, 500));
      return new Response(
        JSON.stringify({ error: 'Format de réponse invalide. Réessayez.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize the response to a consistent format
    const artifacts: any[] = [];
    
    if (parsed.epics && Array.isArray(parsed.epics)) {
      artifacts.push(...parsed.epics.map((epic: any) => ({
        type: 'epic',
        title: epic.title,
        content: epic
      })));
    }
    
    if (parsed.stories && Array.isArray(parsed.stories)) {
      artifacts.push(...parsed.stories.map((story: any) => ({
        type: 'story',
        title: story.title,
        content: story
      })));
    }
    
    if (parsed.techSpec) {
      artifacts.push({
        type: 'tech_spec',
        title: `Spécification technique - ${sourceArtifact.title}`,
        content: parsed.techSpec
      });
    }
    
    if (parsed.impactAnalysis) {
      artifacts.push({
        type: 'impact_analysis',
        title: `Analyse d'impact - ${sourceArtifact.title}`,
        content: parsed.impactAnalysis
      });
    }

    console.log(`[transform-artifact] Generated ${artifacts.length} artifacts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        artifacts,
        sourceId: sourceArtifact.id,
        transformationType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[transform-artifact] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
