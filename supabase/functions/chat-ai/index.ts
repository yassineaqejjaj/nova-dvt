import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { multiAgentPrompts } from "../_shared/prompts.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function sanitizeAgentSelfReference(raw: string, agentName?: string): string {
  if (!raw) return raw;
  let text = raw.trim();

  const safeName = (agentName || '').trim();

  const stripLeading = (pattern: RegExp) => {
    let match = text.match(pattern);
    while (match?.[0]) {
      text = text.slice(match[0].length).trimStart();
      match = text.match(pattern);
    }
  };

  // Agent name-specific patterns
  if (safeName) {
    const escaped = safeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // "Alex Kim ici," / "Alex Kim ici :" / "Alex Kim," / "Alex Kim :"
    stripLeading(new RegExp(`^\\s*(?:${escaped})\\s*(?:ici\\s*)?[,.!:;\\-—]+\\s*`, 'i'));
    // "Alex Kim:" at the very start (common pattern)
    stripLeading(new RegExp(`^\\s*${escaped}\\s*:\\s*`, 'i'));
    // "Je suis Alex Kim," / "C'est Alex Kim,"
    stripLeading(new RegExp(`^\\s*(?:je\\s+suis|c['']est)\\s+(?:${escaped})\\s*[,.!:;\\-—]+\\s*`, 'i'));
    // "This is Alex Kim." / "Hello, this is Alex Kim."
    stripLeading(new RegExp(`^\\s*(?:hello|bonjour|salut)?[,!\\s]*(?:this\\s+is|c['']est)\\s+(?:${escaped})\\s*[,.!:;\\-—]+\\s*`, 'i'));
    // "Hello team! Alex Kim here,"
    stripLeading(new RegExp(`^\\s*(?:hello|bonjour|salut)[^.!?]{0,30}[!,.]?\\s*(?:${escaped})\\s+(?:here|ici)\\s*[,.!:;\\-—]+\\s*`, 'i'));
    // "Hello everyone! This is Alex Kim."
    stripLeading(new RegExp(`^\\s*(?:hello|bonjour|salut)\\s+(?:everyone|team|all|tous|tout le monde)[!.,]?\\s*(?:this\\s+is|c['']est)?\\s*(?:${escaped})?\\s*[,.!:;\\-—]*\\s*`, 'i'));
  }

  // Generic self-intro patterns (name-agnostic)
  stripLeading(/^\s*en\s+tant\s+qu['']?[^,.\n]{1,80}[,.:\-—]+\s*/i);
  stripLeading(/^\s*(?:bonjour|salut|hello)\s*[,!]?\s*(?:c['']est|this\s+is)\s+[^,.\n]{1,80}[,.!:;\-—]+\s*/i);
  stripLeading(/^\s*(?:hello|bonjour|salut)\s+(?:team|everyone|all|tous|tout le monde)[!.,]?\s*/i);
  // "Hello team! <Name> here, ready to..."
  stripLeading(/^\s*(?:hello|bonjour|salut)[^.!?]{0,40}[!,.]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:here|ici)\s*[,.!:;\-—]+\s*/i);
  // Just the name at start: "Sarah Chen, ready to tackle..."
  stripLeading(/^\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s*[,:]?\s*(?:ready|prêt|here|ici)\s+(?:to|pour|à)\s+/i);
  
  // NEW: Strip "Name Name:" pattern at start (e.g., "Alex Kim:", "David Chang:")
  stripLeading(/^\s*[A-Z][a-z]+\s+[A-Z][a-z]+\s*:\s*/);
  // NEW: Strip "Du point de vue de Name," / "Selon Name,"
  stripLeading(/^\s*(?:du\s+point\s+de\s+vue\s+de|selon|d['']après)\s+[^,.\n]{1,40}[,.:]\s*/i);
  // NEW: Strip "En tant que [role]," 
  stripLeading(/^\s*en\s+tant\s+que\s+[^,.\n]{1,60}[,.:\-—]+\s*/i);
  // NEW: Strip "From [Name]'s perspective,"
  stripLeading(/^\s*from\s+[^,.\n]{1,40}['']s?\s+perspective[,.:]\s*/i);

  return text.trim();
}

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
    const { messages, agents, mentionedAgents, message, systemPrompt, artifactContext, responseMode, modeInstructions } = body;

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
      
      const defaultSystemPrompt = 'Tu es un assistant IA spécialisé en gestion de produit et spécifications techniques. Tu DOIS ABSOLUMENT répondre UNIQUEMENT en français. Fournis des réponses claires, structurées et actionnables.';
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
      
      // Include artifact context if provided
      const artifactInstructions = artifactContext 
        ? `\n\n${artifactContext}\n\nIMPORTANT: You have access to the artifacts above. Reference them in your responses when relevant to provide grounded, contextual answers.`
        : '';
      
      // Include response mode instructions if provided
      const modeInstruction = modeInstructions 
        ? `\n\nINSTRUCTIONS DE FORMAT DE RÉPONSE:\n${modeInstructions}\nTu DOIS respecter ce format de réponse.`
        : '';
      
      const systemMessage = {
        role: 'system',
        content: multiAgentPrompts.buildSystemPrompt(agent) + `\n\n${toolInstructions}${artifactInstructions}${modeInstruction}`
      };

      // Adjust max_tokens based on response mode
      let maxTokens = 200; // default for 'short'
      if (responseMode === 'structured') {
        maxTokens = 350;
      } else if (responseMode === 'detailed') {
        maxTokens = 600;
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [systemMessage, ...messages],
          max_tokens: maxTokens,
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
        message: sanitizeAgentSelfReference(data.choices[0].message.content, agent?.name)
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
