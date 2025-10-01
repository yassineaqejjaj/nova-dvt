import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      // User Story generation
      prompt = `Generate a comprehensive user story for the following feature:

FEATURE DESCRIPTION: ${formData?.featureDescription || projectContext}
USER TYPE: ${formData?.userType || 'user'}
${projectContext ? `ADDITIONAL CONTEXT: ${projectContext}` : ''}

Create a well-structured user story following this format and return as JSON:
{
  "title": "Brief descriptive title for the story",
  "userType": "The type of user",
  "action": "What the user wants to do",
  "benefit": "Why they want to do it (the value)",
  "acceptanceCriteria": ["criterion 1", "criterion 2", "criterion 3", "criterion 4", "criterion 5"],
  "priority": "high|medium|low",
  "estimatedEffort": "Small|Medium|Large"
}

Make the acceptance criteria specific, measurable, and testable. Include 5-7 criteria.`;
      
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
      // Impact vs Effort analysis
      const items = formData?.items || [];
      prompt = `Analyze the following items for impact vs effort prioritization:

ITEMS TO ANALYZE:
${items.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n')}

${projectContext ? `PROJECT CONTEXT: ${projectContext}` : ''}

For each item, rate:
- Impact: 1-10 (10 = highest business impact)
- Effort: 1-10 (10 = highest effort/cost)

Consider factors like:
- Business value and ROI
- User impact and reach
- Technical complexity
- Resource requirements
- Time to implement
- Dependencies and risks

Return as JSON:
{
  "items": [
    {
      "name": "item name",
      "impact": 7,
      "effort": 3,
      "reasoning": "Brief explanation of the ratings"
    }
  ]
}`;

      responseStructure = { items: [] };
    } else {
      // Original canvas template format
      prompt = `Generate a comprehensive ${template.name} for the following project:

PROJECT CONTEXT: ${projectContext}

TEMPLATE SECTIONS TO FILL:
${template.sections.map((section: string) => `- ${section}: ${template.prompts[section] || 'Provide relevant content for this section'}`).join('\n')}
`;

      // Add form data if provided for canvas templates
      if (formData && Object.keys(formData).length > 0) {
        prompt += `\n\nADDITIONAL FORM DATA:
${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}
`;
      }

      // Add document context if provided
      if (documents && documents.length > 0) {
        prompt += `\n\nUPLOADED DOCUMENTS CONTEXT:
${documents.map((doc: any, index: number) => `Document ${index + 1} (${doc.name}): ${doc.content || 'File uploaded - consider this in analysis'}`).join('\n\n')}
`;
      }

      prompt += `\n\nINSTRUCTIONS:
1. Provide specific, actionable content for each section
2. Make it relevant to the project context and any provided documents
3. Keep each section concise but comprehensive (3-5 bullet points or short paragraphs)
4. Use professional language appropriate for business contexts
5. Consider the interconnections between different sections

Respond with a JSON object where each key is exactly one of these section names: ${template.sections.map((s: string) => `"${s}"`).join(', ')} and the value is the generated content.

Example format:
{
  "${template.sections[0]}": "• Specific point 1\n• Specific point 2\n• Specific point 3",
  "${template.sections[1]}": "Content for this section with relevant details..."
}`;
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
            content: 'You are an expert business analyst and product manager. Generate structured, actionable canvas content based on the provided information. Always respond with valid JSON only.'
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