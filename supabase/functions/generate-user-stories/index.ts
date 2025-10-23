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
    const { epic, options } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a product management expert specialized in breaking down Epics into actionable User Stories.

    LANGUAGE: Réponds en français.

    TASK: Analyze the Epic and generate ${options?.storyCount || '3-7'} detailed User Stories.

    CRITICAL FORMAT RULES FOR USER STORIES:
    Each story object MUST have this exact JSON structure:
    {
      "id": "US-001",
      "title": "Titre court et descriptif",
      "story": {
        "asA": "type d'utilisateur SEULEMENT (ex: 'utilisateur authentifié', 'administrateur', 'client premium')",
        "iWant": "action voulue SEULEMENT (ex: 'me déconnecter de l'application', 'voir mon historique', 'modifier mes paramètres')",
        "soThat": "bénéfice obtenu SEULEMENT (ex: 'sécuriser ma session', 'suivre mes activités', 'personnaliser mon expérience')"
      },
      "acceptanceCriteria": ["Critère 1", "Critère 2", "Critère 3"],
      "effortPoints": 3,
      "priority": "high",
      "dependencies": [],
      "status": "draft",
      "tags": ["tag1"]
    }

    CRITICAL: Ne mets JAMAIS "En tant que", "Je veux", ou "Afin de" dans les champs asA, iWant, soThat !
    Ces champs doivent contenir UNIQUEMENT le contenu, pas la structure de la phrase.

    EXAMPLE - CORRECT ✅:
    "story": {
      "asA": "utilisateur authentifié",
      "iWant": "me déconnecter rapidement",
      "soThat": "sécuriser ma session et protéger mes données"
    }

    EXAMPLE - WRONG ❌:
    "story": {
      "asA": "En tant qu'utilisateur authentifié",  // NE PAS FAIRE
      "iWant": "Je veux me déconnecter",  // NE PAS FAIRE
      "soThat": "Afin de sécuriser ma session"  // NE PAS FAIRE
    }

    OTHER RULES:
    1. Each story must be independent and deliverable
    2. Each story needs 2-4 specific acceptance criteria in French
    3. Estimate effort using Fibonacci: 1, 2, 3, 5, 8, or 13 points
    4. Max complexity: ${options?.maxComplexity || 8} points (split if larger)
    5. Priority: high (must-have), medium (should-have), or low (nice-to-have)
    ${options?.focusAreas?.length ? `6. Focus on these areas: ${options.focusAreas.join(', ')}` : ''}

    OUTPUT: Return valid JSON with top-level {"stories": [...]} containing an array of story objects.`;

    const userPrompt = `Epic Title: ${epic.title}

Epic Description:
${epic.description}

${epic.context ? `Additional Context:\n${epic.context}` : ''}

Generate ${options?.storyCount || 'an appropriate number of'} user stories from this Epic.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: `${systemPrompt}\nReturn ONLY valid JSON with top-level {\"stories\":[...]} and no prose.` },
          { role: 'user', content: userPrompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      // Fallback: direct JSON (no tool calling)
      const fbResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: `${systemPrompt}\nReturn ONLY valid JSON with a top-level {\"stories\": Story[]} structure. No prose, code fences, or comments.` },
            { role: 'user', content: userPrompt }
          ]
        }),
      });

      if (!fbResponse.ok) {
        const t = await fbResponse.text();
        console.error('AI fallback error:', fbResponse.status, t);
        throw new Error(`AI Gateway returned ${response.status}`);
      }

      const fbData = await fbResponse.json();
      const content = fbData.choices?.[0]?.message?.content as string | undefined;
      let parsed: any = null;
      if (content) {
        try {
          parsed = JSON.parse(content);
        } catch {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) parsed = JSON.parse(match[0]);
        }
      }

      if (parsed?.stories && Array.isArray(parsed.stories)) {
        console.log('Generated stories result (fallback):', JSON.stringify(parsed, null, 2));
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error('Fallback AI returned invalid data');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      // Fallback handled below
    }

    const data = await response.json();

    let result: any = null;

    // Prefer content parsing (no tools)
    const content = data.choices?.[0]?.message?.content as string | undefined;
    if (content) {
      try {
        result = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try { result = JSON.parse(match[0]); } catch { /* ignore */ }
        }
      }
    }

    // Validate result, otherwise run fallback minimal call
    const isValidStory = (s: any) => s && typeof s.title === 'string' && s.title && s.story && s.story.asA && s.story.iWant && s.story.soThat && Array.isArray(s.acceptanceCriteria);
    const invalid = !result?.stories || !Array.isArray(result.stories) || result.stories.length === 0 || result.stories.some((s: any) => !isValidStory(s));

    if (invalid) {
      const fbResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: `${systemPrompt}\nReturn ONLY valid JSON with top-level {\"stories\":Story[]} and no prose.` },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!fbResponse.ok) {
        const t = await fbResponse.text();
        console.error('Fallback AI error:', fbResponse.status, t);
        return new Response(JSON.stringify({ error: 'AI gateway error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fbData = await fbResponse.json();
      const fbContent = fbData.choices?.[0]?.message?.content as string | undefined;
      if (fbContent) {
        try { result = JSON.parse(fbContent); } catch {
          const match = fbContent.match(/\{[\s\S]*\}/);
          if (match) result = JSON.parse(match[0]);
        }
      }
    }

    if (!result?.stories || !Array.isArray(result.stories)) {
      return new Response(JSON.stringify({ stories: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generated stories result:', JSON.stringify(result, null, 2));
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-user-stories:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
