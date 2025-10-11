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
    const { message, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for intent detection
    const systemPrompt = `You are an intent detection assistant for Nova, a product management AI platform. 
Your job is to analyze user messages and detect if they want to use specific tools.

Available tools:
1. "canvas_generator" - Use when user wants to:
   - Create a business model canvas
   - Generate frameworks (lean canvas, value proposition, etc.)
   - Visualize business strategy
   - Create product canvases
   Keywords: canvas, framework, business model, lean canvas, value proposition

2. "instant_prd" - Use when user wants to:
   - Create a PRD (Product Requirements Document)
   - Generate product specifications
   - Write user stories
   - Create product documentation
   - Define product features
   Keywords: PRD, product requirements, user stories, specifications, features, documentation

3. "none" - Use when the message doesn't clearly indicate they want to use a tool

Respond ONLY with the tool name in lowercase: "canvas_generator", "instant_prd", or "none"`;

    // Build conversation context
    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).slice(-3), // Last 3 messages for context
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.3, // Lower temperature for more consistent intent detection
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again later.",
            detectedIntent: "none" 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required. Please add credits to your workspace.",
            detectedIntent: "none" 
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const detectedIntent = aiResponse.choices[0]?.message?.content?.trim().toLowerCase() || "none";

    // Validate and sanitize the response
    const validIntents = ["canvas_generator", "instant_prd", "none"];
    const finalIntent = validIntents.includes(detectedIntent) ? detectedIntent : "none";

    return new Response(
      JSON.stringify({ 
        detectedIntent: finalIntent,
        confidence: detectedIntent === finalIntent ? "high" : "low",
        originalMessage: message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in detect-tool-intent:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        detectedIntent: "none" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});