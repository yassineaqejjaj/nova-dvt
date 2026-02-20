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
    const { artefactId, newContent, previousContent, userId } = await req.json();

    if (!artefactId || !newContent || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: artefactId, newContent, userId" }),
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

    // Step 1: Create artefact version
    const prevVersionRes = await fetch(
      `${SUPABASE_URL}/rest/v1/artefact_versions?artefact_id=eq.${artefactId}&order=version_number.desc&limit=1`,
      { headers }
    );
    const prevVersions = await prevVersionRes.json();
    const prevVersion = prevVersions?.[0];
    const newVersionNumber = prevVersion ? prevVersion.version_number + 1 : 1;

    const versionRes = await fetch(`${SUPABASE_URL}/rest/v1/artefact_versions`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        artefact_id: artefactId,
        previous_version_id: prevVersion?.id || null,
        content: newContent,
        version_number: newVersionNumber,
        author_id: userId,
      }),
    });
    const [newVersion] = await versionRes.json();

    // Step 2: LLM Change Classification
    const oldContentStr = previousContent
      ? JSON.stringify(previousContent, null, 2)
      : prevVersion
      ? JSON.stringify(prevVersion.content, null, 2)
      : "No previous version";
    const newContentStr = JSON.stringify(newContent, null, 2);

    const classificationPrompt = `You are a Product Change Analyst. Compare two versions of a product document and classify ALL changes.

PREVIOUS VERSION:
${oldContentStr.slice(0, 8000)}

NEW VERSION:
${newContentStr.slice(0, 8000)}

For each change found, classify it and return a JSON array:
[
  {
    "change_type": "business_rule_update" | "data_field_added" | "data_field_modified" | "nfr_change" | "scope_change" | "persona_change" | "kpi_change" | "timeline_change" | "dependency_change",
    "entity": "Short name of what changed",
    "before": "Previous value or state",
    "after": "New value or state",
    "severity": "low" | "medium" | "high",
    "description": "Brief explanation of the change"
  }
]

If no significant changes found, return an empty array [].
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
          { role: "system", content: "You are a precise change detection engine. Output only valid JSON." },
          { role: "user", content: classificationPrompt },
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

    // Step 3: Save change set
    const [changeSet] = await (await fetch(`${SUPABASE_URL}/rest/v1/change_sets`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        artefact_version_id: newVersion.id,
        changes_json: changes,
      }),
    })).json();

    // Step 4: Find linked artefacts and propagate impact
    const linksRes = await fetch(
      `${SUPABASE_URL}/rest/v1/artefact_links?source_id=eq.${artefactId}`,
      { headers }
    );
    const links = await linksRes.json();

    // Also find artefacts in same context
    const artefactRes = await fetch(
      `${SUPABASE_URL}/rest/v1/artifacts?id=eq.${artefactId}`,
      { headers }
    );
    const [artefact] = await artefactRes.json();

    let relatedArtefacts: any[] = [];
    if (artefact?.product_context_id) {
      const relRes = await fetch(
        `${SUPABASE_URL}/rest/v1/artifacts?product_context_id=eq.${artefact.product_context_id}&id=neq.${artefactId}&select=id,title,artifact_type`,
        { headers }
      );
      relatedArtefacts = await relRes.json();
    }

    // Step 5: Create impact run
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
        trigger_change_set_id: changeSet.id,
        artefact_id: artefactId,
        artefact_version_id: newVersion.id,
        impact_score: Math.min(overallScore, 100),
        summary: {
          total_changes: changes.length,
          type_breakdown: typeCounts,
          high_severity_count: changes.filter((c: any) => c.severity === "high").length,
          linked_artefacts: relatedArtefacts.length,
          manual_links: links.length,
        },
        status: "completed",
        user_id: userId,
        completed_at: new Date().toISOString(),
      }),
    })).json();

    // Step 6: Generate impact items from changes + linked artefacts
    const impactItems: any[] = [];

    // Impact items from changes on related artefacts
    for (const change of changes) {
      const reviewMap: Record<string, string> = {
        business_rule_update: "Review Required",
        data_field_added: "Schema Review",
        data_field_modified: "Schema Review",
        nfr_change: "Perf/Sec Review",
        scope_change: "Review Required",
        persona_change: "Review Required",
        kpi_change: "Review Required",
        timeline_change: "Review Required",
        dependency_change: "Review Required",
      };

      // Map change to related artefacts
      for (const rel of relatedArtefacts) {
        const typeMap: Record<string, string> = {
          prd: "documentation",
          story: "backlog",
          epic: "backlog",
          tech_spec: "spec",
          canvas: "documentation",
          impact_analysis: "documentation",
          roadmap: "documentation",
        };

        impactItems.push({
          impact_run_id: impactRun.id,
          item_name: rel.title,
          item_type: typeMap[rel.artifact_type] || "documentation",
          impact_score: change.severity === "high" ? 5 : change.severity === "medium" ? 3 : 1,
          impact_reason: `${reviewMap[change.change_type] || "Review"}: ${change.description || change.entity}`,
          review_status: change.severity === "high" ? "review_required" : "pending",
          related_artefact_id: rel.id,
          metadata: { change_type: change.change_type, entity: change.entity },
        });
      }
    }

    // Manual link impacts
    for (const link of links) {
      if (link.target_type === "artefact") {
        const targetRes = await fetch(
          `${SUPABASE_URL}/rest/v1/artifacts?id=eq.${link.target_id}&select=id,title,artifact_type`,
          { headers }
        );
        const [target] = await targetRes.json();
        if (target) {
          impactItems.push({
            impact_run_id: impactRun.id,
            item_name: target.title,
            item_type: "documentation",
            impact_score: 3,
            impact_reason: `Linked via "${link.link_type}" relationship`,
            review_status: "review_required",
            related_artefact_id: target.id,
            metadata: { link_type: link.link_type, confidence: link.confidence_score },
          });
        }
      }
    }

    // Deduplicate impact items by related_artefact_id (keep highest score)
    const deduped = new Map<string, any>();
    for (const item of impactItems) {
      const key = item.related_artefact_id || item.item_name;
      if (!deduped.has(key) || deduped.get(key).impact_score < item.impact_score) {
        deduped.set(key, item);
      }
    }

    const finalItems = Array.from(deduped.values());

    if (finalItems.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/impact_items`, {
        method: "POST",
        headers,
        body: JSON.stringify(finalItems),
      });
    }

    return new Response(
      JSON.stringify({
        impactRun,
        version: newVersion,
        changeSet,
        changes,
        impactedItems: finalItems.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-impact:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
