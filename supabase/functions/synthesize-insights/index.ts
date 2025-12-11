import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoreReview {
  source: 'apple_store' | 'google_play';
  rating: number;
  content: string;
  date?: string;
}

interface BusinessRequest {
  source: string; // PM, PO, Support, Retail, Marketing
  content: string;
  frequency?: 'low' | 'medium' | 'high';
  strategic_level?: 'short_term' | 'long_term';
}

interface Incident {
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  frequency: number;
  impact_business?: string;
  impact_user?: string;
  trend?: 'rising' | 'stable' | 'declining';
}

interface InsightInput {
  storeReviews?: StoreReview[];
  businessRequests?: BusinessRequest[];
  incidents?: Incident[];
  productContext?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const input: InsightInput = await req.json();
    const { storeReviews, businessRequests, incidents, productContext } = input;

    // Validate input - at least one source required
    if ((!storeReviews || storeReviews.length === 0) && 
        (!businessRequests || businessRequests.length === 0) && 
        (!incidents || incidents.length === 0)) {
      return new Response(JSON.stringify({ error: 'Au moins une source de données est requise' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Tu es un expert Product Manager senior spécialisé dans la synthèse et la priorisation produit. 
Tu analyses des données provenant de 3 sources : avis App Store/Google Play, demandes métiers internes, et incidents techniques.

Tu dois produire une analyse structurée en français comprenant :
1. **Synthèse Globale** : résumé des insights clés par source
2. **Thèmes Prioritaires** : thèmes identifiés avec justification (quelles sources les supportent)
3. **Pourquoi c'est Important** : impact business et utilisateur
4. **Valeur Attendue** : bénéfices concrets si on traite ces sujets
5. **Recommandations Roadmap** : avec niveau d'impact, effort estimé, KPIs concernés
6. **Epics & User Stories** : génération d'Epics avec description, User Stories et critères d'acceptation
7. **Prérequis Techniques** : besoins techniques par Epic

Classification des retours stores :
- friction : points de blocage utilisateur
- opportunité : features demandées
- dette_ux : problèmes d'expérience
- dette_tech : problèmes techniques
- accompagnement : besoin de documentation/aide

Réponds UNIQUEMENT avec un objet JSON valide suivant ce schéma exact.`;

    const userPrompt = `Analyse ces données et produis une synthèse complète :

## Données Store Reviews (${storeReviews?.length || 0} avis)
${storeReviews && storeReviews.length > 0 ? JSON.stringify(storeReviews, null, 2) : 'Aucune donnée'}

## Demandes Métiers (${businessRequests?.length || 0} demandes)
${businessRequests && businessRequests.length > 0 ? JSON.stringify(businessRequests, null, 2) : 'Aucune donnée'}

## Incidents (${incidents?.length || 0} incidents)
${incidents && incidents.length > 0 ? JSON.stringify(incidents, null, 2) : 'Aucune donnée'}

## Contexte Produit
${productContext || 'Non spécifié'}

Génère une analyse complète au format JSON.`;

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
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_insight_synthesis',
              description: 'Génère une synthèse complète des insights produit',
              parameters: {
                type: 'object',
                properties: {
                  globalSynthesis: {
                    type: 'object',
                    properties: {
                      storeInsights: { type: 'string', description: 'Résumé des retours stores' },
                      businessInsights: { type: 'string', description: 'Résumé des demandes métiers' },
                      incidentInsights: { type: 'string', description: 'Résumé des incidents' }
                    }
                  },
                  priorityThemes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        rank: { type: 'number' },
                        theme: { type: 'string' },
                        supportedBy: { type: 'array', items: { type: 'string' } },
                        category: { type: 'string', enum: ['friction', 'opportunité', 'dette_ux', 'dette_tech', 'accompagnement'] }
                      },
                      required: ['rank', 'theme', 'supportedBy', 'category']
                    }
                  },
                  importance: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        point: { type: 'string' },
                        metric: { type: 'string' }
                      }
                    }
                  },
                  expectedValue: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  roadmapRecommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        impact: { type: 'string', enum: ['très fort', 'fort', 'moyen', 'faible'] },
                        effort: { type: 'string', enum: ['très élevé', 'élevé', 'moyen', 'faible'] },
                        kpis: { type: 'array', items: { type: 'string' } },
                        action: { type: 'string' }
                      },
                      required: ['title', 'impact', 'effort', 'kpis', 'action']
                    }
                  },
                  epics: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        userStories: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              story: { type: 'string' },
                              acceptanceCriteria: { type: 'array', items: { type: 'string' } }
                            },
                            required: ['story', 'acceptanceCriteria']
                          }
                        },
                        technicalPrerequisites: { type: 'array', items: { type: 'string' } }
                      },
                      required: ['title', 'description', 'userStories', 'technicalPrerequisites']
                    }
                  }
                },
                required: ['globalSynthesis', 'priorityThemes', 'importance', 'expectedValue', 'roadmapRecommendations', 'epics']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_insight_synthesis' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response:', JSON.stringify(aiResponse, null, 2));

    // Extract the structured output from tool call
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('No structured output from AI');
    }

    const synthesis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      success: true,
      synthesis,
      metadata: {
        sourcesAnalyzed: {
          storeReviews: storeReviews?.length || 0,
          businessRequests: businessRequests?.length || 0,
          incidents: incidents?.length || 0
        },
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in synthesize-insights:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
