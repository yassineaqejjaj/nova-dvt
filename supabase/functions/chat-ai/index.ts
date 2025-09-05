import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { messages, agents, mentionedAgents } = await req.json();

    // Determine which agents should respond
    const respondingAgents = mentionedAgents && mentionedAgents.length > 0 
      ? agents.filter((agent: any) => mentionedAgents.some((mention: string) => 
          agent.name.toLowerCase().includes(mention.toLowerCase()) || 
          agent.specialty.toLowerCase().includes(mention.toLowerCase())))
      : agents.slice(0, Math.min(2, agents.length)); // Default to first 2 agents

    const responses = [];

    // Generate response for each responding agent
    for (const agent of respondingAgents) {
      const systemMessage = {
        role: 'system',
        content: `You are ${agent.name}, a ${agent.specialty} specialist. Your background: ${agent.backstory}

Your key capabilities: ${agent.capabilities.join(', ')}
Your expertise tags: ${agent.tags.join(', ')}

Respond as this specific agent with your unique perspective and expertise. Keep responses concise (2-3 sentences), professional, and focused on your specialty. If other agents are mentioned, acknowledge their expertise but maintain your unique viewpoint.`
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [systemMessage, ...messages],
          max_tokens: 200,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error for ${agent.name}: ${error}`);
      }

      const data = await response.json();
      responses.push({
        agent: agent,
        message: data.choices[0].message.content
      });
    }

    return new Response(JSON.stringify({ responses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});