import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

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
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const body = await req.json();
    const { messages, agents, mentionedAgents, message, systemPrompt } = body;

    // Simple mode: single message with optional system prompt (for tools like KPI Generator, Epic Generator, Tech Spec)
    if (message && !agents) {
      console.log('Simple mode: generating response with Lovable AI');
      
      const defaultSystemPrompt = 'You are a helpful AI assistant specialized in product management and technical specifications. Provide clear, structured, and actionable responses.';
      const finalSystemPrompt = systemPrompt || defaultSystemPrompt;
      
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
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI API error:', response.status, errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add funds to your workspace.');
        }
        throw new Error(`AI gateway error: ${response.status}`);
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

    // Multi-agent mode: original functionality
    if (!agents || !Array.isArray(agents)) {
      throw new Error('Agents array is required for multi-agent mode');
    }

    // Determine which agents should respond
    const respondingAgents = mentionedAgents && mentionedAgents.length > 0 
      ? agents.filter((agent: any) => mentionedAgents.some((mention: string) => 
          agent.name.toLowerCase().includes(mention.toLowerCase()) || 
          agent.specialty.toLowerCase().includes(mention.toLowerCase())))
      : agents.slice(0, Math.min(2, agents.length)); // Default to first 2 agents

    const responses = [];

    // Generate response for each responding agent
    for (const agent of respondingAgents) {
      // Check if this agent has special tool capabilities
      const toolInstructions = getToolInstructions(agent);
      
      const systemMessage = {
        role: 'system',
        content: `You are ${agent.name}, a ${agent.specialty} specialist. Your background: ${agent.backstory}

Your key capabilities: ${agent.capabilities.join(', ')}
Your expertise tags: ${agent.tags.join(', ')}

${toolInstructions}

Respond as this specific agent with your unique perspective and expertise. Keep responses concise (2-3 sentences), professional, and focused on your specialty. If other agents are mentioned, acknowledge their expertise but maintain your unique viewpoint.`
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
        const errorText = await response.text();
        console.error(`Lovable AI API error for ${agent.name}:`, response.status, errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add funds to your workspace.');
        }
        throw new Error(`AI gateway error for ${agent.name}: ${response.status}`);
      }

      const data = await response.json();
      const responseData: any = {
        agent: agent,
        message: data.choices[0].message.content
      };
      
      // Add tool suggestion if agent has special capabilities
      const toolSuggestion = getToolSuggestion(agent, messages);
      if (toolSuggestion) {
        responseData.toolSuggestion = toolSuggestion;
      }
      
      responses.push(responseData);
    }

    function getToolInstructions(agent: any): string {
      const agentId = agent.id.toLowerCase();
      
      if (agentId.includes('story-writer') || agent.specialty.toLowerCase().includes('user story')) {
        return 'When discussing features or requirements, suggest creating user stories. Mention that you can help generate detailed user stories with acceptance criteria.';
      }
      
      if (agentId.includes('impact-effort') || agentId.includes('plotter') || agent.specialty.toLowerCase().includes('priority matrix')) {
        return 'When discussing prioritization or feature planning, suggest using an impact vs effort analysis. Offer to help plot items on a priority matrix.';
      }
      
      if (agentId.includes('canvas') || agent.specialty.toLowerCase().includes('strategy') || agent.name.toLowerCase().includes('sarah')) {
        return 'When discussing product strategy, planning, or frameworks, suggest using strategic canvases like SWOT, Business Model Canvas, or MoSCoW prioritization.';
      }
      
      return '';
    }

    function getToolSuggestion(agent: any, messages: any[]): any {
      const agentId = agent.id.toLowerCase();
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      
      // Story Writer agent
      if (agentId.includes('story-writer') || agent.specialty.toLowerCase().includes('user story')) {
        if (lastMessage.includes('feature') || lastMessage.includes('requirement') || lastMessage.includes('story')) {
          return { type: 'story', label: 'Generate User Story' };
        }
      }
      
      // Impact Effort Plotter agent
      if (agentId.includes('impact-effort') || agentId.includes('plotter')) {
        if (lastMessage.includes('priorit') || lastMessage.includes('feature') || lastMessage.includes('backlog')) {
          return { type: 'impact', label: 'Create Impact Plot' };
        }
      }
      
      // Canvas/Strategy agents
      if (agentId.includes('sarah') || agent.specialty.toLowerCase().includes('strategy')) {
        if (lastMessage.includes('strategy') || lastMessage.includes('plan') || lastMessage.includes('canvas')) {
          return { type: 'canvas', label: 'Generate Canvas' };
        }
      }
      
      return null;
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