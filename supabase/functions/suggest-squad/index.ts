import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { context, availableAgents } = await req.json();

    // Create a structured description of all available agents
    const agentsDescription = availableAgents.map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      specialty: agent.specialty,
      capabilities: agent.capabilities,
      tags: agent.tags,
      backstory: agent.backstory,
      familyColor: agent.familyColor
    }));

    const systemPrompt = `You are an AI squad composition expert. Your job is to analyze a user's project context and recommend the most effective team of AI agents.

Available agents:
${JSON.stringify(agentsDescription, null, 2)}

Based on the user's context, recommend 2-5 agents that would form the most effective squad. Consider:
1. Complementary skill sets
2. Coverage of required capabilities
3. Balance between strategy, design, development, and growth
4. Synergies between agent specialties

Return your response as a JSON object with this structure:
{
  "recommendedAgents": ["agent-id-1", "agent-id-2", ...],
  "reasoning": "Brief explanation of why this squad composition is optimal",
  "squadName": "A creative name for this squad based on their combined strengths"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Project context: ${context}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const recommendation = JSON.parse(data.choices[0].message.content);

    console.log('Squad recommendation:', recommendation);

    return new Response(JSON.stringify(recommendation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in suggest-squad function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
