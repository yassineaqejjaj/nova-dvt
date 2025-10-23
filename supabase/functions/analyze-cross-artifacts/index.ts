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
    const { userId, contextId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables not configured");
    }

    // Fetch user's artifacts
    let artifactQuery = `${SUPABASE_URL}/rest/v1/artifacts?user_id=eq.${userId}&order=created_at.desc&limit=20`;
    if (contextId) {
      artifactQuery += `&product_context_id=eq.${contextId}`;
    }

    const artifactsResponse = await fetch(artifactQuery, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    if (!artifactsResponse.ok) {
      throw new Error("Failed to fetch artifacts");
    }

    const artifacts = await artifactsResponse.json();

    if (!artifacts || artifacts.length < 2) {
      return new Response(
        JSON.stringify({ 
          message: "Need at least 2 artifacts for cross-analysis",
          insights: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group artifacts by type
    const artifactsByType = artifacts.reduce((acc: any, art: any) => {
      if (!acc[art.artifact_type]) acc[art.artifact_type] = [];
      acc[art.artifact_type].push(art);
      return acc;
    }, {});

    const prompt = `Analyze relationships and patterns across these artifacts:

${artifacts.map((art: any, i: number) => `
${i + 1}. ${art.title} (${art.artifact_type})
Created: ${art.created_at}
Content summary: ${JSON.stringify(art.content).substring(0, 200)}...
`).join('\n')}

Artifact Types Present: ${Object.keys(artifactsByType).join(', ')}
Total Artifacts: ${artifacts.length}

ANALYSIS TASKS:

1. RELATIONSHIP DETECTION
- Which artifacts are related or complementary?
- Are there epics linked to user stories?
- Do stories have corresponding test cases?

2. GAP IDENTIFICATION
- What artifacts are missing in the workflow?
- Are there epics without broken-down stories?
- Are there stories without test coverage?
- Missing roadmap items or sprint plans?

3. CONSISTENCY CHECK
- Do artifacts use consistent terminology?
- Are priorities aligned across artifacts?
- Do effort estimates match across related items?

4. COVERAGE ANALYSIS
- What features have complete documentation?
- Which areas need more detail?
- Are all user stories testable?

5. RECOMMENDATIONS
- What should be created next?
- Which artifacts need updates?
- Suggested workflow improvements

Return JSON:
{
  "relationships": [
    {
      "artifact1": "Title of artifact 1",
      "artifact2": "Title of artifact 2",
      "relationship": "Description of how they relate",
      "strength": "strong|moderate|weak"
    }
  ],
  "gaps": [
    {
      "type": "Gap type (e.g., missing test cases)",
      "description": "What's missing",
      "affectedArtifacts": ["Artifact titles"],
      "severity": "high|medium|low",
      "recommendation": "What to do"
    }
  ],
  "insights": [
    {
      "category": "coverage|consistency|quality|workflow",
      "title": "Insight title",
      "description": "Detailed insight",
      "actionable": "Specific action to take"
    }
  ],
  "nextSteps": [
    "Prioritized recommendation 1",
    "Prioritized recommendation 2"
  ]
}`;

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
            content: "You are a product intelligence analyst specializing in artifact relationship analysis and workflow optimization. Always respond with valid JSON only."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 3000,
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
    
    // Parse JSON
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const analysis = JSON.parse(jsonStr);

    return new Response(
      JSON.stringify({ 
        artifactCount: artifacts.length,
        artifactTypes: Object.keys(artifactsByType),
        analysis
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-cross-artifacts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
