import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  query: string;
  context?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context }: RequestBody = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Market research request:', { query, context });

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a market research analyst specializing in competitive intelligence and market trends. 
Your task is to provide comprehensive market research based on the user's query.

Analyze the query and provide insights in the following structure:
1. Executive summary
2. Key competitors (3-5) with their strengths and weaknesses
3. Current market trends (5-7)
4. User needs and pain points (5-7)
5. Opportunities for differentiation (3-5)

Format your response as JSON with this structure:
{
  "summary": "Brief executive summary",
  "competitors": [
    {
      "name": "Competitor name",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"]
    }
  ],
  "trends": ["trend1", "trend2"],
  "userNeeds": ["need1", "need2"],
  "opportunities": ["opportunity1", "opportunity2"]
}`;

    const userPrompt = `Research Query: ${query}${context ? `\n\nAdditional Context: ${context}` : ''}

Please provide comprehensive market research insights for this query.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    let results;
    try {
      results = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid response format from AI');
    }

    console.log('Market research completed successfully');

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in market-research function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});