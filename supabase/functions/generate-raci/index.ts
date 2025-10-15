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
    const { projectName, projectDescription, stakeholders } = await req.json();
    
    if (!projectName || !stakeholders || stakeholders.length === 0) {
      throw new Error('Project name and stakeholders are required');
    }

    console.log('Generating RACI matrix with AI...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert project manager specializing in RACI matrix creation.

RACI Definitions:
- R (Responsible): People who do the work
- A (Accountable): Person ultimately answerable (only ONE per task)
- C (Consulted): People whose opinions are sought
- I (Informed): People who are kept updated

Rules:
1. Each task MUST have exactly ONE Accountable person
2. Each task should have 1-3 Responsible people
3. Consulted and Informed are optional but recommended
4. Consider roles and expertise when assigning
5. Balance workload across stakeholders`;

    const stakeholderList = stakeholders.map((s: any) => `- ${s.name} (${s.role})`).join('\n');

    const userPrompt = `Project: ${projectName}
Description: ${projectDescription || 'No description provided'}

Stakeholders:
${stakeholderList}

Generate a comprehensive list of 8-15 tasks/activities for this project, with appropriate RACI assignments for each stakeholder. Consider:
- Project phases (Planning, Design, Development, Testing, Launch)
- Key deliverables and milestones
- Communication and approval flows
- Risk management and quality assurance

Return JSON array of tasks with RACI assignments using exact stakeholder names.`;

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
          type: "function",
          function: {
            name: "generate_raci_tasks",
            description: "Generate RACI matrix tasks with assignments",
            parameters: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Task name" },
                      description: { type: "string", description: "Brief task description" },
                      responsible: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Names of responsible people"
                      },
                      accountable: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Name of accountable person (exactly one)"
                      },
                      consulted: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Names of consulted people"
                      },
                      informed: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Names of informed people"
                      }
                    },
                    required: ["name", "responsible", "accountable"]
                  }
                }
              },
              required: ["tasks"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_raci_tasks" } }
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
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls[0];
    const result = JSON.parse(toolCall.function.arguments);

    console.log('RACI matrix generated successfully');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RACI generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
