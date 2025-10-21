import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentContent, textContent, documentName, startDate, periodType, inputType, roadmapFormat = 'chronological' } = await req.json();

    if ((!documentContent && !textContent) || !startDate) {
      return new Response(
        JSON.stringify({ error: 'Content and start date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get content based on input type
    const decodedContent = inputType === 'text' ? textContent : atob(documentContent);
    
    // Create system and user prompts based on roadmap format
    let systemPrompt = '';
    let userPrompt = '';

    if (roadmapFormat === 'thematic') {
      systemPrompt = `Tu es un expert en product management et en planification stratégique.
Ton rôle est d'analyser un document et de générer une roadmap structurée par PILIERS STRATÉGIQUES.

Identifie 3-5 piliers stratégiques pertinents (ex: "Expérience Client", "Infrastructure Technique", "Data & Analytics", "Go-to-Market", "Innovation").

Pour chaque pilier, identifie 3-4 initiatives clés alignées sur les objectifs business.

Réponds UNIQUEMENT avec un objet JSON au format suivant (pas de markdown, pas de texte supplémentaire):
{
  "summary": "Vision stratégique globale de la roadmap",
  "pillars": [
    {
      "name": "Nom du pilier stratégique",
      "description": "Description courte du pilier",
      "initiatives": [
        {
          "title": "Titre de l'initiative",
          "description": "Description détaillée",
          "priority": "high|medium|low",
          "timeline": "Q1-Q2 2025 ou période spécifique",
          "category": "Catégorie"
        }
      ]
    }
  ]
}`;

      userPrompt = `Analyse le document suivant et structure la roadmap par piliers stratégiques.

Document: ${documentName}
Contenu: ${decodedContent.substring(0, 10000)} ${decodedContent.length > 10000 ? '...(truncated)' : ''}

Date de début: ${startDate}

Identifie les piliers stratégiques majeurs et les initiatives associées.
Focus sur la vision stratégique et l'alignement business.`;

    } else if (roadmapFormat === 'now-next-later') {
      systemPrompt = `Tu es un expert en product management et en priorisation agile.
Ton rôle est d'analyser un document et de catégoriser les éléments en 3 phases temporelles: NOW, NEXT, LATER.

NOW (En cours) : Ce qui doit être fait immédiatement (0-3 mois) - initiatives critiques et urgentes
NEXT (À venir) : Ce qui est validé et planifié (3-6 mois) - initiatives importantes et préparées
LATER (Futur) : Idées à explorer, non priorisées (6+ mois) - innovations et opportunités futures

Réponds UNIQUEMENT avec un objet JSON au format suivant (pas de markdown, pas de texte supplémentaire):
{
  "summary": "Résumé de la progression et de la stratégie",
  "now": [
    {
      "title": "Titre",
      "description": "Description détaillée",
      "priority": "high|medium|low",
      "category": "Catégorie"
    }
  ],
  "next": [...items],
  "later": [...items]
}`;

      userPrompt = `Analyse le document suivant et catégorise les éléments en NOW / NEXT / LATER.

Document: ${documentName}
Contenu: ${decodedContent.substring(0, 10000)} ${decodedContent.length > 10000 ? '...(truncated)' : ''}

Date de début: ${startDate}

Catégorise intelligemment les éléments selon leur urgence et leur maturité.
NOW: urgence immédiate, NEXT: validé et planifié, LATER: exploration future.`;

    } else if (roadmapFormat === 'okr') {
      systemPrompt = `Tu es un expert en product management et en méthodologie OKR (Objectives & Key Results).
Ton rôle est d'analyser un document et de structurer la roadmap selon la méthodologie OKR.

Identifie 3-5 objectifs principaux (Objectives) clairs et inspirants.
Pour chaque objectif, définis 2-3 résultats clés mesurables (Key Results).
Associe les initiatives concrètes à chaque objectif.

Réponds UNIQUEMENT avec un objet JSON au format suivant (pas de markdown, pas de texte supplémentaire):
{
  "summary": "Résumé stratégique global",
  "okrs": [
    {
      "objective": "Objectif clair et inspirant (ex: Devenir leader du marché européen)",
      "keyResults": [
        "KR1: Métrique mesurable (ex: Atteindre 100k utilisateurs actifs)",
        "KR2: Métrique mesurable (ex: Réduire le churn à 5%)"
      ],
      "initiatives": [
        {
          "title": "Titre de l'initiative",
          "description": "Description détaillée",
          "priority": "high|medium|low",
          "category": "Catégorie",
          "timeline": "Q1 2025"
        }
      ],
      "status": "not-started|in-progress|completed"
    }
  ]
}`;

      userPrompt = `Analyse le document suivant et structure la roadmap selon la méthodologie OKR.

Document: ${documentName}
Contenu: ${decodedContent.substring(0, 10000)} ${decodedContent.length > 10000 ? '...(truncated)' : ''}

Date de début: ${startDate}

Identifie les objectifs majeurs, leurs résultats clés mesurables et les initiatives associées.
Focus sur l'alignement objectifs-résultats-actions.`;

    } else {
      // Default chronological format
      systemPrompt = `Tu es un expert en product management et en planification de roadmap produit.
Ton rôle est d'analyser un document et de générer une roadmap structurée par période (trimestre ou mois).

Pour chaque élément de la roadmap, tu dois identifier:
- Le titre (court et descriptif)
- Une description détaillée
- La priorité (high, medium, low)
- La catégorie (ex: Fonctionnalité, Infrastructure, UX, Marketing, etc.)
- Le trimestre ou mois approprié

Réponds UNIQUEMENT avec un objet JSON au format suivant (pas de markdown, pas de texte supplémentaire):
{
  "summary": "Résumé global de la roadmap en 2-3 phrases",
  "items": [
    {
      "quarter": "Q1 2025" (ou format mois si demandé),
      "title": "Titre de l'item",
      "description": "Description détaillée",
      "priority": "high|medium|low",
      "category": "Catégorie"
    }
  ]
}`;

      userPrompt = `Analyse le document suivant et génère une roadmap structurée.

Document: ${documentName}
Contenu: ${decodedContent.substring(0, 10000)} ${decodedContent.length > 10000 ? '...(truncated)' : ''}

Date de début: ${startDate}
Type de période: ${periodType === 'quarter' ? 'Trimestre (Q1, Q2, Q3, Q4)' : 'Mois'}

Génère une roadmap sur 4 périodes (4 trimestres ou 4 mois selon le type choisi).
Répartis intelligemment les éléments identifiés dans le document selon leur priorité et leurs dépendances logiques.`;
    }

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte, veuillez réessayer plus tard.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants, veuillez ajouter des crédits à votre workspace Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI Gateway error');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse JSON response
    let roadmapData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      roadmapData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', generatedContent);
      
      // Return a fallback structure
      roadmapData = {
        summary: "Impossible de parser la réponse IA. Veuillez réessayer.",
        items: []
      };
    }

    return new Response(
      JSON.stringify(roadmapData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-roadmap-from-document:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
