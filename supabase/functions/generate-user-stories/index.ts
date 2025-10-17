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

TASK: Analyze the Epic and generate ${options?.storyCount || '3-7'} detailed User Stories.

RULES:
1. Each story must be independent and deliverable
2. Stories should follow "As a [role], I want [action], so that [benefit]" format
3. Each story needs 2-4 specific acceptance criteria
4. Estimate effort using Fibonacci: 1, 2, 3, 5, 8, or 13 points
5. Max complexity: ${options?.maxComplexity || 8} points (split if larger)
6. Priority: high (must-have), medium (should-have), or low (nice-to-have)
${options?.focusAreas?.length ? `7. Focus on these areas: ${options.focusAreas.join(', ')}` : ''}

OUTPUT: Return valid JSON matching this structure.`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_user_stories',
            description: 'Generate user stories from an Epic',
            parameters: {
              type: 'object',
              properties: {
                stories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: 'Short, descriptive title for the story' },
                      story: {
                        type: 'object',
                        properties: {
                          asA: { type: 'string', description: 'User role' },
                          iWant: { type: 'string', description: 'Desired action' },
                          soThat: { type: 'string', description: 'Expected benefit' }
                        }
                      },
                      acceptanceCriteria: { type: 'array', items: { type: 'string' }, description: '2-4 specific, testable criteria' },
                      effortPoints: { type: 'integer', enum: [1, 2, 3, 5, 8, 13], description: 'Fibonacci effort estimate' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      technicalNotes: { type: 'string', description: 'Optional technical implementation notes' },
                      dependencies: { type: 'array', items: { type: 'string' }, description: 'IDs of dependent stories' },
                      tags: { type: 'array', items: { type: 'string' } }
                    },
                    additionalProperties: false
                  }
                }
              },
              required: ['stories'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_user_stories' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const result = JSON.parse(toolCall.function.arguments);
    
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
