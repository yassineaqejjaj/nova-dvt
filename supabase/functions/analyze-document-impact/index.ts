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
    const { documentText, documentName, artefactId, userId } = await req.json();

    if (!documentText || !artefactId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: documentText, artefactId, userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input sizes
    if (documentText.length > 100000) {
      return new Response(
        JSON.stringify({ error: "Document trop volumineux (max 100 000 caractères)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables not configured");
    }

    const headers = {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    };

    // Fetch the current artifact content
    const artRes = await fetch(
      `${SUPABASE_URL}/rest/v1/artifacts?id=eq.${artefactId}&select=id,title,content,artifact_type,user_id,product_context_id`,
      { headers }
    );
    const [artifact] = await artRes.json();
    if (!artifact) {
      return new Response(
        JSON.stringify({ error: "Artefact introuvable" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const artifactContentStr = JSON.stringify(artifact.content, null, 2).slice(0, 8000);
    const docTextTruncated = documentText.slice(0, 8000);

    // Step 1: Use LLM to analyze impact of uploaded document on the artifact
    const analysisPrompt = `You are a Product Impact Analyst. A user has uploaded a document that may contain changes, new requirements, or updates that impact an existing product artifact.

EXISTING ARTIFACT ("${artifact.title}" - type: ${artifact.artifact_type}):
${artifactContentStr}

UPLOADED DOCUMENT ("${documentName || 'Unnamed document'}"):
${docTextTruncated}

Analyze the uploaded document and identify ALL potential impacts on the existing artifact. For each impact found, classify it:

Return a JSON array:
[
  {
    "change_type": "business_rule_update" | "data_field_added" | "data_field_modified" | "nfr_change" | "scope_change" | "persona_change" | "kpi_change" | "timeline_change" | "dependency_change",
    "entity": "Short name of what is impacted",
    "before": "Current state in the artifact",
    "after": "What the document implies should change",
    "severity": "low" | "medium" | "high",
    "description": "Brief explanation of the impact"
  }
]

Consider:
- New requirements that contradict or extend existing ones
- Data schema changes implied by the document
- Business rule modifications
- Timeline or scope changes
- New personas or changed user needs
- KPI changes or new metrics

If no significant impacts found, return an empty array [].
Return ONLY the JSON array, no markdown.`;

    const llmRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise impact detection engine for product artifacts. Output only valid JSON." },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!llmRes.ok) {
      if (llmRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (llmRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${llmRes.status}`);
    }

    const llmData = await llmRes.json();
    const rawContent = llmData.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    const changes = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");

    if (changes.length === 0) {
      return new Response(
        JSON.stringify({
          message: "Aucun impact détecté entre le document et l'artefact.",
          changes: [],
          impactRun: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Create an impact run for the document analysis
    const overallScore = changes.reduce((sum: number, c: any) => {
      const severityMap: Record<string, number> = { low: 1, medium: 3, high: 5 };
      return sum + (severityMap[c.severity] || 1);
    }, 0);

    const typeCounts: Record<string, number> = {};
    changes.forEach((c: any) => {
      typeCounts[c.change_type] = (typeCounts[c.change_type] || 0) + 1;
    });

    const [impactRun] = await (await fetch(`${SUPABASE_URL}/rest/v1/impact_runs`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        artefact_id: artefactId,
        impact_score: Math.min(overallScore, 100),
        summary: {
          total_changes: changes.length,
          type_breakdown: typeCounts,
          high_severity_count: changes.filter((c: any) => c.severity === "high").length,
          source: "document_upload",
          document_name: documentName || "Unnamed document",
        },
        status: "completed",
        user_id: userId,
        completed_at: new Date().toISOString(),
      }),
    })).json();

    // Step 3: Create impact items from the detected changes
    const impactItems = changes.map((change: any) => ({
      impact_run_id: impactRun.id,
      item_name: change.entity,
      item_type: "documentation",
      impact_score: change.severity === "high" ? 5 : change.severity === "medium" ? 3 : 1,
      impact_reason: `[Document: ${documentName || 'Upload'}] ${change.description}`,
      review_status: change.severity === "high" ? "review_required" : "pending",
      related_artefact_id: artefactId,
      metadata: {
        change_type: change.change_type,
        entity: change.entity,
        before: change.before,
        after: change.after,
        source: "document_upload",
        document_name: documentName,
      },
    }));

    if (impactItems.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/impact_items`, {
        method: "POST",
        headers,
        body: JSON.stringify(impactItems),
      });
    }

    return new Response(
      JSON.stringify({
        changes,
        impactRun,
        impactItemsCount: impactItems.length,
        message: `${changes.length} impact(s) détecté(s) depuis le document "${documentName}".`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-document-impact error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
