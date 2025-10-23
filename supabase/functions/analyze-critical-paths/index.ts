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
    const { artifacts } = await req.json();
    
    if (!artifacts || artifacts.length === 0) {
      throw new Error('No artifacts provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context from artifacts
    const artifactsContext = artifacts.map((a: any) => 
      `[${a.type}] ${a.title}:\n${JSON.stringify(a.content, null, 2)}`
    ).join('\n\n---\n\n');

    const systemPrompt = `Tu es Nova QA Agent, expert en analyse de risques et planification de tests.

Analyse les artefacts fournis (Epics, User Stories, Canvas) et identifie les chemins critiques qui nécessitent une attention particulière en termes de tests.

Pour chaque chemin critique identifié:
1. Évalue le niveau de risque (high/medium/low)
2. Identifie les features impactées
3. Liste les dépendances critiques
4. Attribue une priorité de test (1-10)
5. Explique le raisonnement
6. Suggère des types de tests spécifiques

Retourne une analyse structurée et actionnable.`;

    const userPrompt = `Analyse ces artefacts et identifie les chemins critiques:

${artifactsContext}

Fournis une analyse complète des risques et recommandations de test.`;

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
        tools: [{
          type: 'function',
          function: {
            name: 'return_critical_path_analysis',
            description: 'Return critical path risk analysis',
            parameters: {
              type: 'object',
              properties: {
                totalPaths: {
                  type: 'number',
                  description: 'Total number of paths analyzed'
                },
                criticalPaths: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      riskLevel: { 
                        type: 'string',
                        enum: ['high', 'medium', 'low']
                      },
                      impactedFeatures: {
                        type: 'array',
                        items: { type: 'string' }
                      },
                      dependencies: {
                        type: 'array',
                        items: { type: 'string' }
                      },
                      testingPriority: {
                        type: 'number',
                        description: 'Priority from 1-10'
                      },
                      reasoning: {
                        type: 'string',
                        description: 'Why this path is critical'
                      },
                      suggestedTests: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    },
                    required: ['id', 'name', 'riskLevel', 'impactedFeatures', 'dependencies', 'testingPriority', 'reasoning', 'suggestedTests']
                  }
                },
                coverageRecommendations: {
                  type: 'array',
                  items: { type: 'string' }
                },
                estimatedTestEffort: {
                  type: 'string',
                  description: 'Estimated time/effort for testing'
                }
              },
              required: ['totalPaths', 'criticalPaths', 'coverageRecommendations', 'estimatedTestEffort']
            }
          }
        }],
        tool_choice: {
          type: 'function',
          function: { name: 'return_critical_path_analysis' }
        }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response:', JSON.stringify(aiResponse, null, 2));

    const toolCall = aiResponse.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-critical-paths:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
