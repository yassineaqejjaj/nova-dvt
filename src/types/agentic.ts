/**
 * Agentic System Types
 * Defines the complete type system for multi-agent orchestration
 */

// ============================================
// AGENT REGISTRY TYPES
// ============================================

export interface AgentRegistryEntry {
  id: string;
  agent_key: string;
  name: string;
  specialty: string;
  avatar: string | null;
  backstory: string | null;
  system_prompt: string;
  decision_style: 'analytical' | 'creative' | 'socratic' | 'balanced';
  tools_allowed: string[];
  priorities: string[];
  biases: string | null;
  capabilities: string[];
  tags: string[];
  family_color: string;
  role: string | null;
  is_conductor: boolean;
  max_tokens: number;
  temperature: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// ORCHESTRATION TYPES
// ============================================

export type OrchestrationPhase = 'planning' | 'proposal' | 'critique' | 'reconciliation' | 'complete';

export interface OrchestratorPlan {
  goals: string[];
  assignedAgents: AgentTask[];
  expectedRounds: number;
  conductorNotes: string;
  shouldActivateConductor: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface AgentTask {
  agentKey: string;
  task: string;
  priority: number;
  expectedOutput: string;
}

export interface RoundOutput {
  round: number;
  phase: OrchestrationPhase;
  responses: AgentResponse[];
  synthesis?: string;
  openPoints: string[];
  resolvedPoints: string[];
}

export interface AgentResponse {
  agentKey: string;
  agentName: string;
  content: string;
  stance?: string;
  keyPoints: string[];
  confidence: number;
  tradeoffs?: string[];
  nextAction?: string;
  toolCalls?: ToolCall[];
  metadata: AgentResponseMetadata;
}

export interface AgentResponseMetadata {
  tokensUsed: number;
  responseTime: number;
  phase: OrchestrationPhase;
  round: number;
}

// ============================================
// TOOL CALLING TYPES
// ============================================

export type ToolType = 
  | 'canvas_generator'
  | 'story_writer'
  | 'impact_plotter'
  | 'roadmap_planner'
  | 'user_persona_builder'
  | 'tech_spec_generator'
  | 'estimation_tool'
  | 'kpi_generator'
  | 'research_synthesizer'
  | 'decision_maker'
  | 'synthesizer';

export interface ToolCall {
  id: string;
  name: ToolType;
  args: Record<string, any>;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  result?: any;
  error?: string;
}

export interface ToolDefinition {
  name: ToolType;
  description: string;
  parameters: Record<string, ToolParameter>;
  requiredParams: string[];
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  default?: any;
}

// ============================================
// AGENT ACTION QUEUE TYPES
// ============================================

export type ActionStatus = 'pending' | 'approved' | 'executed' | 'rejected';

export interface AgentAction {
  id: string;
  user_id: string;
  squad_id: string | null;
  agent_key: string;
  agent_name: string;
  action_type: string;
  action_label: string;
  action_args: Record<string, any>;
  status: ActionStatus;
  priority: number;
  result: any | null;
  error_message: string | null;
  created_at: string;
  executed_at: string | null;
  expires_at: string | null;
}

// ============================================
// AGENT MEMORY TYPES
// ============================================

export type MemoryType = 'fact' | 'decision' | 'preference' | 'summary';

export interface AgentMemory {
  id: string;
  agent_key: string;
  user_id: string;
  squad_id: string | null;
  context_id: string | null;
  memory_type: MemoryType;
  content: string;
  importance: number;
  metadata: Record<string, any>;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoryRetrievalResult {
  memories: AgentMemory[];
  relevanceScores: number[];
}

// ============================================
// ORCHESTRATION SESSION TYPES
// ============================================

export interface OrchestrationSession {
  id: string;
  user_id: string;
  squad_id: string | null;
  context_id: string | null;
  session_type: 'deliberation' | 'synthesis' | 'decision';
  current_round: number;
  max_rounds: number;
  phase: OrchestrationPhase;
  assigned_agents: string[];
  goals: string[];
  tasks: AgentTask[];
  round_outputs: RoundOutput[];
  final_synthesis: any | null;
  conductor_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// CONDUCTOR TYPES
// ============================================

export interface ConductorDecision {
  shouldContinue: boolean;
  nextPhase: OrchestrationPhase;
  agentsToPause: string[];
  agentsToActivate: string[];
  synthesisNeeded: boolean;
  roundComplete: boolean;
  finalDecision?: string;
}

export interface ConductorConfig {
  maxRounds: number;
  autoActivate: boolean;
  complexityThreshold: number; // 0-1, when to activate conductor
  synthesisFrequency: number; // Every N rounds
}

// ============================================
// DELIBERATION TYPES
// ============================================

export interface DeliberationState {
  currentRound: number;
  phase: OrchestrationPhase;
  proposals: AgentResponse[];
  critiques: AgentResponse[];
  finalPositions: AgentResponse[];
  consensus: string[];
  tensions: Tension[];
}

export interface Tension {
  id: string;
  agentA: string;
  agentB: string;
  topic: string;
  positionA: string;
  positionB: string;
  resolved: boolean;
  resolution?: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface OrchestratorRequest {
  message: string;
  squadId?: string;
  contextId?: string;
  agents: AgentRegistryEntry[];
  conversationHistory: ConversationMessage[];
  selectedArtifacts?: any[];
  responseMode?: 'short' | 'structured' | 'detailed';
  steeringMode?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentKey?: string;
  agentName?: string;
}

export interface OrchestratorResponse {
  plan: OrchestratorPlan;
  responses: AgentResponse[];
  synthesis?: string;
  pendingActions: ToolCall[];
  sessionId: string;
  phase: OrchestrationPhase;
  round: number;
  conductorActive: boolean;
  memoryUpdates: AgentMemory[];
}

// ============================================
// UI STATE TYPES
// ============================================

export interface AgenticChatState {
  orchestrationSession: OrchestrationSession | null;
  pendingActions: AgentAction[];
  isOrchestratorActive: boolean;
  currentPhase: OrchestrationPhase;
  currentRound: number;
  conductorMessages: string[];
}
