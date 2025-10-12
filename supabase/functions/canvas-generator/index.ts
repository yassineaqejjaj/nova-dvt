import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { canvasGeneratorPrompts } from "../_shared/prompts.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { template, projectContext, formData, documents } = await req.json();

    console.log('Canvas generation request:', { template: typeof template === 'string' ? template : template?.name, hasDocuments: documents?.length > 0 });

    let prompt = '';
    let responseStructure: any = {};

    // Handle different template types
    if (template === 'user-story') {
      // User Story generation using centralized prompt
      prompt = canvasGeneratorPrompts.userStory(
        formData?.featureDescription || projectContext,
        formData?.userType || 'user',
        projectContext
      );
      
      responseStructure = {
        title: '',
        userType: '',
        action: '',
        benefit: '',
        acceptanceCriteria: [],
        priority: 'medium',
        estimatedEffort: 'Medium'
      };
    } else if (template === 'impact-effort') {
      // Impact vs Effort analysis using centralized prompt
      const items = formData?.items || [];
      prompt = canvasGeneratorPrompts.impactEffort(items, projectContext);
      responseStructure = { items: [] };
    } else {
      // General canvas template using centralized prompt
      prompt = canvasGeneratorPrompts.generalCanvas(
        template.name,
        projectContext,
        template.sections,
        template.prompts,
        formData,
        documents
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: canvasGeneratorPrompts.system
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('OpenAI response:', generatedText);

    // Parse the JSON response
    let parsedContent;
    try {
      // Clean up the response to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback: create structured content based on template type
      if (template === 'user-story') {
        parsedContent = {
          title: formData?.featureDescription || 'User Story',
          userType: formData?.userType || 'user',
          action: 'perform the described action',
          benefit: 'achieve their goal',
          acceptanceCriteria: ['Feature works as expected', 'All edge cases handled', 'Tests pass'],
          priority: 'medium',
          estimatedEffort: 'Medium'
        };
      } else if (template === 'impact-effort') {
        parsedContent = { items: [] };
      } else if (template?.sections) {
        parsedContent = template.sections.reduce((acc: Record<string, string>, section: string) => {
          acc[section] = `Generated content for ${section} based on the provided context and analysis.`;
          return acc;
        }, {});
      } else {
        parsedContent = {};
      }
    }

    return new Response(JSON.stringify({ 
      content: parsedContent,
      canvas: parsedContent, // Keep for backward compatibility
      template: typeof template === 'string' ? template : template?.name 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in canvas-generator function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Canvas generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});