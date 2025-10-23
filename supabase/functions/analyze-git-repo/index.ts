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

    const systemPrompt = `You are Nova Code Analyzer, an expert product manager and technical architect who excels at reverse-engineering comprehensive product documentation from codebases.

Your task is to analyze a Git repository and generate detailed, production-ready documentation similar to a comprehensive Product Requirements Document (PRD) combined with technical specifications.

Generate the following comprehensive sections:

1. EXECUTIVE SUMMARY
   - Product overview and vision
   - Problem statement and target audience
   - Value proposition

2. PRODUCT CONTEXT
   - Business context and market analysis
   - Competitive landscape
   - Constraints and assumptions

3. USER RESEARCH
   - Detailed user personas with goals, pain points, and behaviors
   - User journey maps showing stages, actions, thoughts, and opportunities

4. FEATURES & REQUIREMENTS
   - Features with categories, priorities (MoSCoW), and detailed user stories
   - Functional requirements with acceptance criteria
   - Non-functional requirements with metrics and targets

5. TECHNICAL SPECIFICATIONS
   - Architecture overview with patterns and components
   - Frameworks, integrations, and data models
   - Detailed component responsibilities and dependencies

6. API DOCUMENTATION
   - Complete API catalog with methods, parameters, and responses
   - Authentication requirements

7. QUALITY ASSURANCE
   - Test strategy and coverage analysis
   - Test types, gaps, and critical paths
   - Suggestions for improvement

8. RISK MANAGEMENT
   - Comprehensive risk register with severity, impact, and mitigation
   - Technical debt and security concerns

9. ROADMAP & PLANNING
   - Phased roadmap with timelines and deliverables
   - Dependencies between phases

10. SUCCESS METRICS
    - KPIs with targets and measurement methods

Output profile: ${outputProfile}
Analysis depth: ${depth}
Target languages: ${languages.join(', ')}

Generate realistic, detailed, and actionable documentation. Be specific and thorough.`;

    const userPrompt = `Analyze this repository:
Repository: ${repoUrl}
Path: ${path || 'root'}
Branch: ${branch || 'main'}

Provide a comprehensive analysis covering all aspects from business context to technical implementation.
Generate complete, detailed documentation for each section.`;

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
            description: "Generate comprehensive product and technical documentation from repository analysis",
            parameters: {
              type: "object",
              properties: {
                executive: {
                  type: "object",
                  properties: {
                    overview: { type: "string" },
                    productVision: { type: "string" },
                    problemStatement: { type: "string" },
                    targetAudience: { type: "string" },
                    valueProposition: { type: "string" }
                  },
                  required: ["overview", "productVision", "problemStatement", "targetAudience", "valueProposition"]
                },
                context: {
                  type: "object",
                  properties: {
                    businessContext: { type: "string" },
                    marketAnalysis: { type: "string" },
                    competitiveLandscape: { type: "string" },
                    constraints: { type: "array", items: { type: "string" } },
                    assumptions: { type: "array", items: { type: "string" } }
                  }
                },
                personas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      role: { type: "string" },
                      goals: { type: "array", items: { type: "string" } },
                      painPoints: { type: "array", items: { type: "string" } },
                      behaviors: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                userJourneys: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      persona: { type: "string" },
                      stage: { type: "string" },
                      actions: { type: "array", items: { type: "string" } },
                      thoughts: { type: "array", items: { type: "string" } },
                      painPoints: { type: "array", items: { type: "string" } },
                      opportunities: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                features: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string" },
                      category: { type: "string" },
                      priority: { type: "string", enum: ["must", "should", "could", "wont"] },
                      userStories: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            acceptanceCriteria: { type: "array", items: { type: "string" } },
                            complexity: { type: "string", enum: ["XS", "S", "M", "L", "XL"] }
                          }
                        }
                      }
                    }
                  }
                },
                functionalRequirements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      description: { type: "string" },
                      priority: { type: "string", enum: ["must", "should", "could", "wont"] },
                      relatedFeatures: { type: "array", items: { type: "string" } }
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
                      metric: { type: "string" },
                      target: { type: "string" }
                    }
                  }
                },
                techSpec: {
                  type: "object",
                  properties: {
                    architecture: {
                      type: "object",
                      properties: {
                        overview: { type: "string" },
                        patterns: { type: "array", items: { type: "string" } },
                        components: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              type: { type: "string" },
                              description: { type: "string" },
                              responsibilities: { type: "array", items: { type: "string" } },
                              dependencies: { type: "array", items: { type: "string" } }
                            }
                          }
                        }
                      }
                    },
                    frameworks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          version: { type: "string" },
                          purpose: { type: "string" }
                        }
                      }
                    },
                    dataModels: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          fields: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                type: { type: "string" },
                                required: { type: "boolean" }
                              }
                            }
                          },
                          relationships: { type: "array", items: { type: "string" } }
                        }
                      }
                    },
                    integrations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          type: { type: "string" },
                          description: { type: "string" },
                          apis: { type: "array", items: { type: "string" } }
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
                      parameters: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            type: { type: "string" },
                            required: { type: "boolean" }
                          }
                        }
                      },
                      authentication: { type: "boolean" },
                      responses: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            code: { type: "number" },
                            description: { type: "string" }
                          }
                        }
                      }
                    }
                  }
                },
                testPlan: {
                  type: "object",
                  properties: {
                    strategy: { type: "string" },
                    coverageScore: { type: "number" },
                    testedEndpoints: { type: "number" },
                    totalEndpoints: { type: "number" },
                    testTypes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string" },
                          coverage: { type: "number" },
                          description: { type: "string" }
                        }
                      }
                    },
                    gaps: { type: "array", items: { type: "string" } },
                    suggestions: { type: "array", items: { type: "string" } },
                    criticalPaths: { type: "array", items: { type: "string" } }
                  }
                },
                riskRegister: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      description: { type: "string" },
                      location: { type: "string" },
                      impact: { type: "string" },
                      probability: { type: "string" },
                      mitigation: { type: "string" },
                      dependencies: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                roadmap: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phase: { type: "string" },
                      timeline: { type: "string" },
                      goals: { type: "array", items: { type: "string" } },
                      deliverables: { type: "array", items: { type: "string" } },
                      dependencies: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                kpis: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      target: { type: "string" },
                      measurement: { type: "string" }
                    }
                  }
                }
              },
              required: ["executive", "context", "personas", "features", "functionalRequirements", "nonFunctionalRequirements", "techSpec", "apiCatalog", "testPlan", "riskRegister", "roadmap", "kpis"],
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
