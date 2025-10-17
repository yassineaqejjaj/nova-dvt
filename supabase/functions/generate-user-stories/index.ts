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
                      title: { type: 'string' },
                      story: {
                        type: 'object',
                        properties: {
                          asA: { type: 'string' },
                          iWant: { type: 'string' },
                          soThat: { type: 'string' }
                        }
                      },
                      acceptanceCriteria: { type: 'array', items: { type: 'string' } },
                      effortPoints: { type: 'integer', enum: [1, 2, 3, 5, 8, 13] },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      technicalNotes: { type: 'string' },
                      dependencies: { type: 'array', items: { type: 'string' } },
                      tags: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_user_stories' } }
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

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
    let result: any = toolArgs;

    const isValidStory = (s: any) => s && typeof s.title === 'string' && s.title.length > 0 &&
      s.story && typeof s.story.asA === 'string' && typeof s.story.iWant === 'string' && typeof s.story.soThat === 'string' &&
      Array.isArray(s.acceptanceCriteria) && s.acceptanceCriteria.length >= 2 &&
      typeof s.effortPoints === 'number' && ['high','medium','low'].includes(s.priority);

    const needsFallback = !result?.stories || !Array.isArray(result.stories) || result.stories.length === 0 || result.stories.some((s: any) => !isValidStory(s));

    if (needsFallback) {
      console.warn('Tool output invalid/empty, falling back to direct JSON generation');
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
        })
      });

      if (!fbResponse.ok) {
        const t = await fbResponse.text();
        console.error('Fallback AI error:', fbResponse.status, t);
        throw new Error('AI fallback failed');
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
        result = parsed;
      } else {
        throw new Error('Failed to parse structured stories from AI');
      }
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
