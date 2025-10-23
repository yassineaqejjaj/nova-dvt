import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to generate test cases');
    const { artifactContent, artifactType, testLevels, context } = await req.json();
    
    console.log('Request details:', {
      artifactType,
      testLevels,
      contentLength: artifactContent?.length || 0,
      hasContext: !!context
    });

    if (!artifactContent || artifactContent.trim().length === 0) {
      throw new Error('Artifact content is required');
    }

    if (!testLevels || testLevels.length === 0) {
      throw new Error('At least one test level must be selected');
    }

    // Limit content size to prevent timeouts (100KB max)
    const MAX_CONTENT_SIZE = 100000;
    if (artifactContent.length > MAX_CONTENT_SIZE) {
      throw new Error(`Content too large. Maximum size is ${MAX_CONTENT_SIZE} characters. Current size: ${artifactContent.length}`);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are Nova QA Agent, an automation-minded tester ensuring that every artifact meets its Definition of Done.

Your task is to generate comprehensive test cases based on the provided artifact. Consider:
- Positive and negative test scenarios
- Edge cases and boundary conditions
- Integration points and dependencies
- Security and performance considerations
- Accessibility requirements

Generate test cases in the following JSON structure:
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "Test case title",
      "level": "unit|integration|e2e|api",
      "priority": "high|medium|low",
      "description": "What this test verifies",
      "preconditions": ["Precondition 1", "Precondition 2"],
      "steps": ["Step 1", "Step 2", "Step 3"],
      "expectedResults": "Expected outcome",
      "testData": "Required test data",
      "automatable": true,
      "estimatedEffort": "1h"
    }
  ],
  "coverageAnalysis": {
    "totalCases": 0,
    "byLevel": {
      "unit": 0,
      "integration": 0,
      "e2e": 0,
      "api": 0
    },
    "coverageScore": 0,
    "missingScenarios": ["Scenario 1", "Scenario 2"]
  },
  "automationScript": "// Playwright/Jest template code"
}`;

    const userPrompt = `Artifact Type: ${artifactType}
Test Levels Requested: ${testLevels.join(', ')}
Context: ${context || 'None provided'}

Artifact Content:
${artifactContent}

Generate comprehensive test cases covering all test levels requested. Include edge cases and suggest automation scripts where applicable.`;

    console.log('Calling AI Gateway...');
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
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_test_cases",
            description: "Generate comprehensive test cases for the given artifact",
            parameters: {
              type: "object",
              properties: {
                testCases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      level: { type: "string", enum: ["unit", "integration", "e2e", "api"] },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      description: { type: "string" },
                      preconditions: { type: "array", items: { type: "string" } },
                      steps: { type: "array", items: { type: "string" } },
                      expectedResults: { type: "string" },
                      testData: { type: "string" },
                      automatable: { type: "boolean" },
                      estimatedEffort: { type: "string" }
                    },
                    required: ["id", "title", "level", "priority", "description", "steps", "expectedResults"]
                  }
                },
                coverageAnalysis: {
                  type: "object",
                  properties: {
                    totalCases: { type: "number" },
                    byLevel: {
                      type: "object",
                      properties: {
                        unit: { type: "number" },
                        integration: { type: "number" },
                        e2e: { type: "number" },
                        api: { type: "number" }
                      }
                    },
                    coverageScore: { type: "number" },
                    missingScenarios: { type: "array", items: { type: "string" } }
                  }
                },
                automationScript: { type: "string" }
              },
              required: ["testCases", "coverageAnalysis"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_test_cases" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de taux dépassée. Veuillez réessayer dans quelques instants.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Limite d\'utilisation atteinte. Veuillez ajouter des crédits à votre espace Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    console.log('AI Gateway response received, parsing...');
    const data = await response.json();

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('No tool call in response:', JSON.stringify(data, null, 2));
      throw new Error('Invalid AI response format: no tool call found');
    }

    console.log('Parsing tool call arguments...');
    const result = JSON.parse(toolCall.function.arguments);
    
    console.log('Test cases generated successfully:', {
      totalCases: result.testCases?.length || 0,
      coverageScore: result.coverageAnalysis?.coverageScore || 0
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-test-cases:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    const statusCode = error.message?.includes('too large') ? 413 : 500;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.toString()
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});