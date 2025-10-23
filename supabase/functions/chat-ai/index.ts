import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { multiAgentPrompts } from "../_shared/prompts.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const body = await req.json();
    const { messages, agents, mentionedAgents, message, systemPrompt } = body;

    // Input validation
    if (message && typeof message === 'string' && message.length > 50000) {
      return new Response(JSON.stringify({ error: 'Message too long (max 50000 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Simple mode: single message with optional system prompt
    if (message && !agents) {
      console.log('Simple mode: generating response with Lovable AI');
      
      const defaultSystemPrompt = 'You are a helpful AI assistant specialized in product management and technical specifications. Provide clear, structured, and actionable responses.';
      const finalSystemPrompt = systemPrompt || defaultSystemPrompt;
      
      const { stream } = body;
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: finalSystemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 4000,
          temperature: 0.7,
          stream: stream || false,
        }),
      });

      if (!response.ok) {
        console.error('Lovable AI API error:', response.status);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Payment required' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ error: 'AI gateway error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (stream) {
        return new Response(response.body, {
          headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
        });
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log('AI Response received:', content.substring(0, 100) + '...');
      
      return new Response(JSON.stringify({ 
        response: content 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Multi-agent mode
    if (!agents || !Array.isArray(agents)) {
      throw new Error('Agents array is required for multi-agent mode');
    }

    const respondingAgents = mentionedAgents && mentionedAgents.length > 0 
      ? agents.filter((agent: any) => mentionedAgents.some((mention: string) => 
          agent.name.toLowerCase().includes(mention.toLowerCase()) || 
          agent.specialty.toLowerCase().includes(mention.toLowerCase())))
      : agents.slice(0, Math.min(2, agents.length));

    const responses = [];

    for (const agent of respondingAgents) {
      const toolInstructions = getToolInstructions(agent);
      
      const systemMessage = {
        role: 'system',
        content: multiAgentPrompts.buildSystemPrompt(agent) + `\n\n${toolInstructions}`
      };

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [systemMessage, ...messages],
          max_tokens: 200,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        console.error(`AI error for ${agent.name}:`, response.status);
        continue;
      }

      const data = await response.json();
      const responseData: any = {
        agent: agent,
        message: data.choices[0].message.content
      };
      
      const toolSuggestion = getToolSuggestion(agent, messages);
      if (toolSuggestion) {
        responseData.toolSuggestion = toolSuggestion;
      }
      
      responses.push(responseData);
    }

    function getToolInstructions(agent: any): string {
      const agentId = agent.id.toLowerCase();
      
      if (agentId.includes('story-writer') || agent.specialty.toLowerCase().includes('user story')) {
        return 'When discussing features or requirements, suggest creating user stories.';
      }
      
      if (agentId.includes('impact-effort') || agentId.includes('plotter')) {
        return 'When discussing prioritization, suggest impact vs effort analysis.';
      }
      
      if (agentId.includes('canvas') || agent.specialty.toLowerCase().includes('strategy')) {
        return 'When discussing product strategy, suggest using strategic canvases.';
      }
      
      return '';
    }

    function getToolSuggestion(agent: any, messages: any[]): any {
      const agentId = agent.id.toLowerCase();
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      
      if (agentId.includes('story-writer') && lastMessage.includes('feature')) {
        return { type: 'story', label: 'Generate User Story' };
      }
      
      if (agentId.includes('impact-effort') && lastMessage.includes('priorit')) {
        return { type: 'impact', label: 'Create Impact Plot' };
      }
      
      if (agentId.includes('sarah') && lastMessage.includes('strategy')) {
        return { type: 'canvas', label: 'Generate Canvas' };
      }
      
      return null;
    }

    return new Response(JSON.stringify({ responses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
