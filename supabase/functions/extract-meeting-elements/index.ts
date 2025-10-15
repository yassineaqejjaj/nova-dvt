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
    const { transcript, meetingTitle } = await req.json();
    
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    console.log('Analyzing meeting transcript with AI...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert meeting analyst. Extract key elements from meeting transcripts and structure them.

Extract and categorize:
1. DECISIONS: Clear decisions made, with rationale and decision makers
2. ACTION ITEMS: Tasks with assignees and deadlines
3. OPEN QUESTIONS: Unresolved topics or unclear points
4. USER INSIGHTS: Customer feedback, pain points, feature requests
5. RISKS & BLOCKERS: Technical dependencies, constraints, risks
6. IDEAS & OPPORTUNITIES: Suggestions, potential features, opportunities

For each element, provide:
- content: The main content
- confidence: 0-100 score based on clarity
- rationale: Why/context (for decisions)
- assignedTo: Person(s) responsible (for actions)
- deadline: When it's due (for actions)
- source_quote: Exact quote from transcript
- timestamp: Approximate time in meeting if detectable

Also provide:
- title: Meeting title
- summary: 2-3 sentence executive summary
- duration: Estimated meeting duration in minutes
- participants: List of participant names detected

Return JSON with this structure:
{
  "title": "string",
  "summary": "string",
  "duration": number,
  "participants": ["string"],
  "decisions": [{"id": "string", "content": "string", "confidence": number, "rationale": "string", "decided_by": ["string"], "source_quote": "string"}],
  "actions": [{"id": "string", "content": "string", "confidence": number, "assignedTo": "string", "deadline": "string", "source_quote": "string"}],
  "questions": [{"id": "string", "content": "string", "confidence": number, "source_quote": "string"}],
  "insights": [{"id": "string", "content": "string", "confidence": number, "source_quote": "string"}],
  "risks": [{"id": "string", "content": "string", "confidence": number, "source_quote": "string"}],
  "ideas": [{"id": "string", "content": "string", "confidence": number, "source_quote": "string"}]
}`;

    const userPrompt = `Meeting Title: ${meetingTitle}

Transcript:
${transcript}

Please analyze this meeting and extract all key elements according to the instructions.`;

    // Use tool calling for structured output
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
            name: "extract_meeting_elements",
            description: "Extract structured meeting elements",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                duration: { type: "number" },
                participants: { type: "array", items: { type: "string" } },
                decisions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      content: { type: "string" },
                      confidence: { type: "number" },
                      rationale: { type: "string" },
                      decided_by: { type: "array", items: { type: "string" } },
                      source_quote: { type: "string" }
                    },
                    required: ["id", "content", "confidence"]
                  }
                },
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      content: { type: "string" },
                      confidence: { type: "number" },
                      assignedTo: { type: "string" },
                      deadline: { type: "string" },
                      source_quote: { type: "string" }
                    },
                    required: ["id", "content", "confidence"]
                  }
                },
                questions: { type: "array", items: { type: "object" } },
                insights: { type: "array", items: { type: "object" } },
                risks: { type: "array", items: { type: "object" } },
                ideas: { type: "array", items: { type: "object" } }
              },
              required: ["title", "summary", "decisions", "actions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_meeting_elements" } }
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
    const extractedData = JSON.parse(toolCall.function.arguments);

    console.log('Meeting analysis completed successfully');

    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Extraction error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
