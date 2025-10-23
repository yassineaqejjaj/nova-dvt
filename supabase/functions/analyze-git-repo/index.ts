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
    const { repoUrl, path, branch, depth, languages, outputProfile } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing repository:', { repoUrl, path, branch, depth });

    const systemPrompt = `You are Nova Code Analyzer, an expert at reverse-engineering product intent from codebases.

Your task is to analyze a Git repository and generate comprehensive documentation artifacts.

You must generate the following artifacts in a structured JSON format:
1. Spec Doc: Functional and non-functional requirements with acceptance criteria
2. Tech Spec: Architecture, components, data models, APIs, and dependencies
3. API Catalog: Detected endpoints with methods, paths, and parameters
4. Test Plan: Test coverage analysis, gaps, and suggested test cases
5. Risk Register: Technical debt, deprecated code, missing tests, security concerns

Output profile: ${outputProfile}
Analysis depth: ${depth}
Target languages: ${languages.join(', ')}

Generate realistic and detailed artifacts based on the repository context provided.`;

    const userPrompt = `Analyze this repository:
Repository: ${repoUrl}
Path: ${path || 'root'}
Branch: ${branch || 'main'}

Provide a comprehensive analysis with:
- Detected frameworks and technologies
- API endpoints and data models
- Architecture patterns
- Test coverage assessment
- Risk areas and improvement suggestions

Generate complete artifacts for each category.`;

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
            name: "generate_repo_analysis",
            description: "Generate comprehensive documentation artifacts from repository analysis",
            parameters: {
              type: "object",
              properties: {
                specDoc: {
                  type: "object",
                  properties: {
                    overview: { type: "string" },
                    functionalRequirements: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          description: { type: "string" },
                          priority: { type: "string", enum: ["must", "should", "could", "wont"] }
                        }
                      }
                    },
                    nonFunctionalRequirements: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          type: { type: "string" },
                          description: { type: "string" },
                          metric: { type: "string" }
                        }
                      }
                    },
                    acceptanceCriteria: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          requirement: { type: "string" },
                          criteria: { type: "array", items: { type: "string" } }
                        }
                      }
                    }
                  }
                },
                techSpec: {
                  type: "object",
                  properties: {
                    architecture: { type: "string" },
                    frameworks: { type: "array", items: { type: "string" } },
                    components: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          type: { type: "string" },
                          description: { type: "string" },
                          dependencies: { type: "array", items: { type: "string" } }
                        }
                      }
                    },
                    dataModels: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          fields: { type: "array", items: { type: "string" } },
                          relationships: { type: "array", items: { type: "string" } }
                        }
                      }
                    }
                  }
                },
                apiCatalog: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      method: { type: "string" },
                      path: { type: "string" },
                      description: { type: "string" },
                      parameters: { type: "array", items: { type: "string" } },
                      authentication: { type: "boolean" }
                    }
                  }
                },
                testPlan: {
                  type: "object",
                  properties: {
                    coverageScore: { type: "number" },
                    testedEndpoints: { type: "number" },
                    totalEndpoints: { type: "number" },
                    gaps: { type: "array", items: { type: "string" } },
                    suggestions: { type: "array", items: { type: "string" } }
                  }
                },
                riskRegister: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["security", "performance", "maintainability", "testing", "deprecated"] },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      description: { type: "string" },
                      location: { type: "string" },
                      recommendation: { type: "string" }
                    }
                  }
                }
              },
              required: ["specDoc", "techSpec", "apiCatalog", "testPlan", "riskRegister"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_repo_analysis" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI usage limit reached. Please add credits to your Lovable AI workspace.');
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-git-repo:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze repository',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
