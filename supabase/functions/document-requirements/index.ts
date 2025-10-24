import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { promptHelpers } from "../_shared/prompts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirements, context } = await req.json();
    
    if (!requirements) {
      return new Response(
        JSON.stringify({ error: 'Requirements are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = promptHelpers.requirementsDocumentation
      .replace('{requirements}', requirements)
      .replace('{context}', context || 'Non spécifié');

    const systemPrompt = `Tu es un expert en documentation de spécifications techniques et fonctionnelles.
    
Approche méthodologique :
1. Structuration claire du document de spécifications
2. Rédaction d'un résumé exécutif synthétique et impactant
3. Documentation détaillée des spécifications fonctionnelles
4. Spécifications techniques avec architecture et contraintes
5. Plan de tests complet avec critères de validation
6. Annexes pertinentes (glossaire, références, schémas)

Réponds toujours en français avec un document professionnel et exploitable.`;

    console.log('Generating requirements documentation...');
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
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const documentation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ documentation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in document-requirements:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
