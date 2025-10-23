import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artifactId, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables not configured");
    }

    // Fetch artifact
    const artifactResponse = await fetch(`${SUPABASE_URL}/rest/v1/artifacts?id=eq.${artifactId}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    if (!artifactResponse.ok) {
      throw new Error("Failed to fetch artifact");
    }

    const artifacts = await artifactResponse.json();
    if (!artifacts || artifacts.length === 0) {
      throw new Error("Artifact not found");
    }

    const artifact = artifacts[0];

    // Build analysis prompt based on type
    const prompts: Record<string, string> = {
      quality: `Analyze the quality of this ${artifact.artifact_type}:

${JSON.stringify(artifact.content, null, 2)}

Evaluate:
1. Completeness: Are all necessary sections filled?
2. Clarity: Is it easy to understand?
3. Specificity: Are requirements/criteria specific and measurable?
4. Consistency: Is terminology and structure consistent?
5. Actionability: Can developers/teams act on this?

Provide:
- Overall quality score (1-10)
- Specific strengths (3-5 points)
- Areas for improvement (3-5 points)
- Actionable recommendations (3-5 suggestions)

Return JSON:
{
  "score": 8,
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`,
      
      gaps: `Identify gaps and missing elements in this ${artifact.artifact_type}:

${JSON.stringify(artifact.content, null, 2)}

Check for:
- Missing acceptance criteria or test scenarios
- Undefined edge cases
- Incomplete specifications
- Missing stakeholders or dependencies
- Unclear success metrics

Return JSON:
{
  "gaps": [
    {
      "category": "Gap category",
      "description": "What's missing",
      "severity": "high|medium|low",
      "suggestion": "How to fix it"
    }
  ]
}`,
      
      enhancement: `Suggest enhancements for this ${artifact.artifact_type}:

${JSON.stringify(artifact.content, null, 2)}

Consider:
- Additional acceptance criteria for better coverage
- Edge cases to handle
- Performance considerations
- Security requirements
- User experience improvements

Return JSON:
{
  "enhancements": [
    {
      "title": "Enhancement title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "effort": "small|medium|large"
    }
  ]
}`
    };

    const prompt = prompts[analysisType] || prompts.quality;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a product management expert analyzing artifacts. Provide structured, actionable insights. Always respond with valid JSON only."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0]?.message?.content?.trim() || "{}";
    
    // Parse JSON from potential markdown
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const analysis = JSON.parse(jsonStr);

    return new Response(
      JSON.stringify({ 
        artifact,
        analysis,
        analysisType
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-document:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
