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
    const { workspaceContext, recentActivity, currentPage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware prompt
    const prompt = `Based on the user's current context, generate 3-4 intelligent, actionable suggestions.

CONTEXT:
Current Page: ${currentPage || 'unknown'}
${workspaceContext ? `
Workspace Data:
- Recent Artifacts: ${workspaceContext.recentArtifacts?.length || 0}
- Active Contexts: ${workspaceContext.activeContexts?.length || 0}
- Current Squads: ${workspaceContext.squads?.length || 0}
- Pinned Items: ${workspaceContext.pinnedItems?.length || 0}
` : ''}
${recentActivity ? `
Recent Activity: ${recentActivity}
` : ''}

SUGGESTION GUIDELINES:
1. Prioritize actions that help users complete workflows
2. Suggest next logical steps based on their current state
3. Recommend tools/features they haven't used recently
4. Each suggestion should be specific and actionable
5. Consider what will provide immediate value

Return suggestions in this JSON format:
{
  "suggestions": [
    {
      "label": "Short, action-oriented label (max 30 chars)",
      "action": "tool_or_workflow_identifier",
      "type": "tool|workflow|navigation",
      "reasoning": "Why this suggestion is relevant now"
    }
  ]
}

Examples of good suggestions:
- If they have stories without test cases: "Generate Test Cases" (action: test_generator, type: tool)
- If they have epics but no roadmap: "Create Roadmap" (action: roadmap_planner, type: tool)
- If they just created a context: "Build a Squad" (action: squad_builder, type: workflow)
- If inactive for a while: "Review Recent Artifacts" (action: artifacts_view, type: navigation)

Think about what would be most helpful RIGHT NOW.`;

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
            content: "You are a suggestion engine for Nova, a product management platform. Generate contextually relevant, actionable suggestions based on user's current state. Always respond with valid JSON only."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again later.",
            suggestions: []
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required. Please add credits to your workspace.",
            suggestions: []
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0]?.message?.content?.trim() || "{}";
    
    // Parse JSON response
    let suggestions = [];
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonStr);
      suggestions = parsed.suggestions || [];
    } catch (parseError) {
      console.error("Failed to parse AI suggestions:", parseError, content);
      // Return fallback suggestions
      suggestions = [
        { label: "Créer un Canvas", action: "canvas_generator", type: "tool", reasoning: "Start with strategy" },
        { label: "Construire une Squad", action: "squad_builder", type: "workflow", reasoning: "Build your team" }
      ];
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-suggestions:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
