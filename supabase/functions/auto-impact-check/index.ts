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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    const headers = {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    };

    // Fetch pending queue entries where scheduled_at has passed
    const queueRes = await fetch(
      `${SUPABASE_URL}/rest/v1/impact_queue?status=eq.pending&scheduled_at=lte.${new Date().toISOString()}&order=created_at.asc&limit=10`,
      { headers }
    );
    const queueItems = await queueRes.json();

    if (!Array.isArray(queueItems) || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No pending items" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;
    let errors = 0;

    for (const item of queueItems) {
      try {
        // Mark as processing
        await fetch(`${SUPABASE_URL}/rest/v1/impact_queue?id=eq.${item.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "processing" }),
        });

        // Fetch the artifact content
        const artRes = await fetch(
          `${SUPABASE_URL}/rest/v1/artifacts?id=eq.${item.artefact_id}&select=id,content,user_id`,
          { headers }
        );
        const [artifact] = await artRes.json();

        if (!artifact) {
          await fetch(`${SUPABASE_URL}/rest/v1/impact_queue?id=eq.${item.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status: "skipped" }),
          });
          continue;
        }

        // Call analyze-impact edge function
        const analyzeRes = await fetch(
          `${SUPABASE_URL}/functions/v1/analyze-impact`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              artefactId: item.artefact_id,
              newContent: artifact.content,
              userId: item.user_id,
            }),
          }
        );

        if (!analyzeRes.ok) {
          const errText = await analyzeRes.text();
          console.error(`analyze-impact failed for ${item.artefact_id}:`, errText);
          await fetch(`${SUPABASE_URL}/rest/v1/impact_queue?id=eq.${item.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status: "completed" }),
          });
          errors++;
          continue;
        }

        const result = await analyzeRes.json();

        // Mark as completed with the impact_run_id
        await fetch(`${SUPABASE_URL}/rest/v1/impact_queue?id=eq.${item.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            status: "completed",
            impact_run_id: result.impactRun?.id || null,
          }),
        });

        processed++;
      } catch (err) {
        console.error(`Error processing queue item ${item.id}:`, err);
        await fetch(`${SUPABASE_URL}/rest/v1/impact_queue?id=eq.${item.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "completed" }),
        });
        errors++;
      }
    }

    return new Response(
      JSON.stringify({ processed, errors, total: queueItems.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("auto-impact-check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
