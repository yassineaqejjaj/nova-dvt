import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Tool definitions for structured tool calling
const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "canvas_generator",
      description: "Generate a business canvas (Lean Canvas, Business Model, Value Proposition)",
      parameters: {
        type: "object",
        properties: {
          canvas_type: { type: "string", enum: ["lean_canvas", "business_model", "value_proposition"] },
          project_context: { type: "string", description: "Context for the canvas" }
        },
        required: ["canvas_type", "project_context"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "story_writer",
      description: "Create user stories with acceptance criteria",
      parameters: {
        type: "object",
        properties: {
          feature_description: { type: "string" },
          user_type: { type: "string" },
          context: { type: "string" }
        },
        required: ["feature_description", "user_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "impact_plotter",
      description: "Create an impact vs effort analysis",
      parameters: {
        type: "object",
        properties: {
          items: { type: "array", items: { type: "string" } },
          context: { type: "string" }
        },
        required: ["items"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "roadmap_planner",
      description: "Create a product roadmap",
      parameters: {
        type: "object",
        properties: {
          features: { type: "array", items: { type: "string" } },
          timeframe: { type: "string" },
          context: { type: "string" }
        },
        required: ["features"]
      }
    }
  }
];

interface AgentRegistryEntry {
  agent_key: string;
  name: string;
  specialty: string;
  system_prompt: string;
  decision_style: string;
  tools_allowed: string[];
  priorities: string[];
  biases: string | null;
  capabilities: string[];
  is_conductor: boolean;
  max_tokens: number;
  temperature: number;
}

interface OrchestratorPlan {
  goals: string[];
  assignedAgents: { agentKey: string; task: string; priority: number }[];
  expectedRounds: number;
  conductorNotes: string;
  shouldActivateConductor: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}

// Determine if conductor should activate based on query complexity
function assessComplexity(message: string, agentCount: number): 'simple' | 'moderate' | 'complex' {
  const complexIndicators = [
    'stratégie', 'décision', 'arbitrer', 'choisir entre', 'trade-off',
    'comparer', 'prioriser', 'roadmap', 'architecture', 'migration'
  ];
  const simpleIndicators = ['comment', 'qu\'est-ce que', 'explique', 'définis'];
  
  const lowerMessage = message.toLowerCase();
  const complexScore = complexIndicators.filter(i => lowerMessage.includes(i)).length;
  const simpleScore = simpleIndicators.filter(i => lowerMessage.includes(i)).length;
  
  if (complexScore >= 2 || agentCount > 3) return 'complex';
  if (complexScore >= 1 || simpleScore === 0) return 'moderate';
  return 'simple';
}

// Build orchestrator plan
async function buildOrchestratorPlan(
  message: string,
  agents: AgentRegistryEntry[],
  conversationHistory: any[]
): Promise<OrchestratorPlan> {
  const complexity = assessComplexity(message, agents.length);
  
  const planPrompt = `Tu es le Conducteur Nova, un orchestrateur de discussions multi-agents.

AGENTS DISPONIBLES:
${agents.filter(a => !a.is_conductor).map(a => `- ${a.name} (${a.specialty}): ${a.capabilities.join(', ')}`).join('\n')}

MESSAGE UTILISATEUR: ${message}

HISTORIQUE RÉCENT:
${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content.slice(0, 100)}`).join('\n')}

Ta mission: Créer un plan d'orchestration.

Réponds en JSON:
{
  "goals": ["Objectif 1 de cette discussion", "Objectif 2"],
  "assignedAgents": [
    {"agentKey": "agent-key", "task": "Ce que cet agent doit faire", "priority": 1}
  ],
  "expectedRounds": 1-3,
  "conductorNotes": "Notes internes sur la stratégie",
  "shouldActivateConductor": true/false
}

Règles:
- Assigne 2-4 agents max
- priority: 1 = parle en premier, 2 = réagit, 3 = synthétise
- Active le conducteur si la discussion risque de diverger ou s'il y a des tensions prévisibles`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un orchestrateur. Réponds UNIQUEMENT en JSON valide.' },
          { role: 'user', content: planPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Plan generation failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }
    
    const plan = JSON.parse(jsonMatch[0]);
    return {
      ...plan,
      complexity,
      shouldActivateConductor: plan.shouldActivateConductor ?? (complexity === 'complex')
    };
  } catch (error) {
    console.error('Error building plan:', error);
    // Fallback plan
    return {
      goals: ['Répondre à la question utilisateur'],
      assignedAgents: agents.slice(0, 2).map((a, i) => ({
        agentKey: a.agent_key,
        task: i === 0 ? 'Répondre en premier' : 'Réagir et compléter',
        priority: i + 1
      })),
      expectedRounds: 1,
      conductorNotes: 'Plan de fallback - orchestration simplifiée',
      shouldActivateConductor: false,
      complexity
    };
  }
}

// Retrieve relevant memories for an agent
async function retrieveAgentMemories(
  supabaseClient: any,
  agentKey: string,
  userId: string,
  squadId?: string
): Promise<string[]> {
  try {
    let query = supabaseClient
      .from('agent_memory')
      .select('content, importance, memory_type')
      .eq('agent_key', agentKey)
      .eq('user_id', userId)
      .order('importance', { ascending: false })
      .limit(5);

    if (squadId) {
      query = query.eq('squad_id', squadId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((m: any) => `[${m.memory_type}] ${m.content}`);
  } catch (error) {
    console.error('Error retrieving memories:', error);
    return [];
  }
}

// Build agent system prompt with registry data and context
function buildAgentSystemPrompt(
  agent: AgentRegistryEntry,
  phase: string,
  task: string,
  memories: string[],
  projectContext?: string
): string {
  const memorySection = memories.length > 0 
    ? `\n\nMÉMOIRE CONTEXTUELLE:\n${memories.join('\n')}\n`
    : '';

  const phaseInstructions: Record<string, string> = {
    proposal: `Tu es en phase de PROPOSITION. Partage ta perspective initiale sur le sujet.`,
    critique: `Tu es en phase de CRITIQUE. Analyse les propositions des autres agents. Identifie les forces, faiblesses, et propose des améliorations.`,
    reconciliation: `Tu es en phase de RÉCONCILIATION. Cherche un terrain d'entente. Propose une synthèse qui intègre les meilleures idées.`
  };

  return `${agent.system_prompt}

STYLE DE DÉCISION: ${agent.decision_style}
PRIORITÉS: ${agent.priorities.join(' > ')}
${agent.biases ? `BIAIS CONNU: ${agent.biases}` : ''}

${projectContext ? `CONTEXTE PROJET: ${projectContext}\n` : ''}
${memorySection}

PHASE ACTUELLE: ${phaseInstructions[phase] || 'Réponds naturellement.'}
TA TÂCHE SPÉCIFIQUE: ${task}

OUTILS DISPONIBLES: ${agent.tools_allowed.join(', ')}
Si tu souhaites utiliser un outil, indique-le clairement dans ta réponse.

FORMAT DE RÉPONSE STRUCTURÉ:
Tu DOIS structurer ta réponse avec ces éléments (en JSON imbriqué dans ta réponse textuelle):
- Ton analyse principale (texte naturel)
- Puis un bloc JSON avec: {\"stance\": \"ta position en 1 phrase\", \"key_points\": [\"point 1\", \"point 2\"], \"confidence\": 0.0-1.0, \"tradeoffs\": [\"compromis potentiel\"], \"next_action\": \"prochaine étape suggérée\"}

RÈGLES ABSOLUES:
- Ne te présente JAMAIS ("Je suis...", "En tant que...")
- Va droit au but
- Apporte une valeur NOUVELLE à chaque intervention
- Si tu proposes un outil, utilise le format: [OUTIL: nom_outil] avec les paramètres`;
}

// Parse structured response from agent
function parseAgentResponse(content: string, agentKey: string, agentName: string): any {
  // Try to extract JSON metadata
  const jsonMatch = content.match(/\{[\s\S]*?\"stance\"[\s\S]*?\}/);
  let metadata = {
    stance: '',
    key_points: [],
    confidence: 0.7,
    tradeoffs: [],
    next_action: ''
  };

  if (jsonMatch) {
    try {
      metadata = { ...metadata, ...JSON.parse(jsonMatch[0]) };
      // Remove JSON from visible content
      content = content.replace(jsonMatch[0], '').trim();
    } catch (e) {
      // Keep default metadata
    }
  }

  // Detect tool calls
  const toolCalls: any[] = [];
  const toolMatches = content.matchAll(/\[OUTIL:\s*(\w+)\]([^[]*)/g);
  for (const match of toolMatches) {
    toolCalls.push({
      id: `tool-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: match[1],
      args: { context: match[2].trim() },
      status: 'pending'
    });
  }

  return {
    agentKey,
    agentName,
    content: content.replace(/\[OUTIL:[^\]]*\][^[]*/g, '').trim(),
    stance: metadata.stance,
    keyPoints: metadata.key_points || [],
    confidence: metadata.confidence || 0.7,
    tradeoffs: metadata.tradeoffs || [],
    nextAction: metadata.next_action,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined
  };
}

// Save memories from conversation
async function saveAgentMemories(
  supabaseClient: any,
  userId: string,
  squadId: string | undefined,
  responses: any[]
): Promise<any[]> {
  const memoriesToSave: any[] = [];

  for (const response of responses) {
    // Save key points as facts
    for (const point of response.keyPoints || []) {
      if (point.length > 20) {
        memoriesToSave.push({
          agent_key: response.agentKey,
          user_id: userId,
          squad_id: squadId || null,
          memory_type: 'fact',
          content: point,
          importance: response.confidence || 0.5
        });
      }
    }

    // Save stance as preference
    if (response.stance && response.stance.length > 10) {
      memoriesToSave.push({
        agent_key: response.agentKey,
        user_id: userId,
        squad_id: squadId || null,
        memory_type: 'preference',
        content: response.stance,
        importance: 0.6
      });
    }
  }

  if (memoriesToSave.length > 0) {
    try {
      const { data, error } = await supabaseClient
        .from('agent_memory')
        .insert(memoriesToSave)
        .select();
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error saving memories:', error);
      return [];
    }
  }

  return [];
}

// Save pending actions
async function savePendingActions(
  supabaseClient: any,
  userId: string,
  squadId: string | undefined,
  responses: any[]
): Promise<any[]> {
  const actions: any[] = [];

  for (const response of responses) {
    for (const toolCall of response.toolCalls || []) {
      actions.push({
        user_id: userId,
        squad_id: squadId || null,
        agent_key: response.agentKey,
        agent_name: response.agentName,
        action_type: toolCall.name,
        action_label: `${response.agentName} propose: ${toolCall.name}`,
        action_args: toolCall.args,
        status: 'pending',
        priority: 5
      });
    }
  }

  if (actions.length > 0) {
    try {
      const { data, error } = await supabaseClient
        .from('agent_actions')
        .insert(actions)
        .select();
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error saving actions:', error);
      return [];
    }
  }

  return [];
}

// Generate synthesis from responses
async function generateSynthesis(
  responses: any[],
  goals: string[]
): Promise<string> {
  const synthesisPrompt = `Tu es le Conducteur Nova. Synthétise ces réponses d'agents:

OBJECTIFS DE LA DISCUSSION:
${goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

RÉPONSES DES AGENTS:
${responses.map(r => `**${r.agentName}** (confiance: ${Math.round((r.confidence || 0.7) * 100)}%):
Position: ${r.stance || 'Non spécifiée'}
Points clés: ${(r.keyPoints || []).join(', ') || r.content.slice(0, 150)}`).join('\n\n')}

Génère une SYNTHÈSE en 2-3 phrases qui:
1. Identifie les points de consensus
2. Signale les tensions non résolues
3. Propose la prochaine action concrète`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un facilitateur. Sois concis et actionnable.' },
          { role: 'user', content: synthesisPrompt }
        ],
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating synthesis:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const body = await req.json();
    const {
      message,
      squadId,
      contextId,
      agents,
      conversationHistory = [],
      projectContext,
      responseMode = 'structured',
      phase = 'proposal'
    } = body;

    console.log(`[Orchestrator] Processing message for ${agents?.length || 0} agents`);

    // Step 1: Build orchestration plan
    const plan = await buildOrchestratorPlan(message, agents || [], conversationHistory);
    console.log(`[Orchestrator] Plan created: ${plan.complexity} complexity, ${plan.assignedAgents.length} agents assigned`);

    // Step 2: Execute agents in order of priority
    const responses: any[] = [];
    const sortedTasks = [...plan.assignedAgents].sort((a, b) => a.priority - b.priority);

    for (const task of sortedTasks) {
      const agent = (agents || []).find((a: AgentRegistryEntry) => a.agent_key === task.agentKey);
      if (!agent || agent.is_conductor) continue;

      // Retrieve agent memories
      const memories = await retrieveAgentMemories(supabaseClient, agent.agent_key, user.id, squadId);

      // Build system prompt
      const systemPrompt = buildAgentSystemPrompt(agent, phase, task.task, memories, projectContext);

      // Build messages with conversation history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-8),
        { role: 'user', content: message }
      ];

      // Add previous responses from this round for context
      if (responses.length > 0) {
        const contextMessage = responses.map(r => 
          `[${r.agentName}]: ${r.content.slice(0, 200)}`
        ).join('\n');
        messages.push({
          role: 'assistant',
          content: `Réponses précédentes de ce tour:\n${contextMessage}`
        });
      }

      // Get max tokens based on response mode
      let maxTokens = agent.max_tokens || 400;
      if (responseMode === 'short') maxTokens = 200;
      if (responseMode === 'detailed') maxTokens = 600;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages,
            max_tokens: maxTokens,
            temperature: agent.temperature || 0.7,
            tools: TOOL_DEFINITIONS.filter(t => 
              agent.tools_allowed.includes(t.function.name)
            ),
          }),
        });

        if (!response.ok) {
          console.error(`Agent ${agent.name} failed:`, response.status);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Check for tool calls in the response
        const toolCalls = data.choices[0].message.tool_calls || [];

        const parsed = parseAgentResponse(content || '', agent.agent_key, agent.name);
        
        // Add any tool calls from the API response
        if (toolCalls.length > 0) {
          parsed.toolCalls = [
            ...(parsed.toolCalls || []),
            ...toolCalls.map((tc: any) => ({
              id: tc.id,
              name: tc.function.name,
              args: JSON.parse(tc.function.arguments || '{}'),
              status: 'pending'
            }))
          ];
        }

        parsed.metadata = {
          tokensUsed: data.usage?.total_tokens || 0,
          responseTime: 0,
          phase,
          round: 1
        };

        responses.push(parsed);
      } catch (error) {
        console.error(`Error calling agent ${agent.name}:`, error);
      }
    }

    // Step 3: Generate synthesis if conductor is active
    let synthesis: string | undefined;
    if (plan.shouldActivateConductor && responses.length > 1) {
      synthesis = await generateSynthesis(responses, plan.goals);
    }

    // Step 4: Save memories and pending actions
    const memoryUpdates = await saveAgentMemories(supabaseClient, user.id, squadId, responses);
    const pendingActions = await savePendingActions(supabaseClient, user.id, squadId, responses);

    // Step 5: Create/update orchestration session
    let sessionId: string | undefined;
    try {
      const { data: sessionData, error: sessionError } = await supabaseClient
        .from('orchestration_sessions')
        .insert({
          user_id: user.id,
          squad_id: squadId || null,
          context_id: contextId || null,
          session_type: 'deliberation',
          current_round: 1,
          phase,
          assigned_agents: plan.assignedAgents.map(a => a.agentKey),
          goals: plan.goals,
          tasks: plan.assignedAgents,
          round_outputs: [{ round: 1, phase, responses, synthesis }],
          conductor_notes: plan.conductorNotes,
          is_active: true
        })
        .select('id')
        .single();

      if (!sessionError && sessionData) {
        sessionId = sessionData.id;
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }

    console.log(`[Orchestrator] Complete: ${responses.length} responses, ${pendingActions.length} pending actions`);

    return new Response(JSON.stringify({
      plan,
      responses,
      synthesis,
      pendingActions: responses.flatMap(r => r.toolCalls || []),
      sessionId,
      phase,
      round: 1,
      conductorActive: plan.shouldActivateConductor,
      memoryUpdates
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Orchestrator error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
