import { supabase } from '@/integrations/supabase/client';

export type EventType = 
  | 'workflow_feature_discovery'
  | 'workflow_roadmap'
  | 'workflow_sprint'
  | 'workflow_tech_spec'
  | 'artifact_created'
  | 'agent_conversation'
  | 'context_created'
  | 'context_updated'
  | 'squad_created'
  | 'squad_updated';

export interface EventData {
  status?: 'started' | 'completed' | 'abandoned';
  latency?: number;
  artifact_type?: 'epic' | 'story' | 'canvas' | 'impact_analysis';
  role?: 'PM' | 'Designer' | 'Dev';
  [key: string]: any;
}

export async function trackEvent(
  userId: string,
  eventType: EventType,
  eventData?: EventData
) {
  try {
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData || {}
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Helper to track workflow start
export async function trackWorkflowStart(
  userId: string,
  workflowType: 'feature_discovery' | 'roadmap' | 'sprint' | 'tech_spec'
) {
  return trackEvent(userId, `workflow_${workflowType}` as EventType, {
    status: 'started',
    timestamp: Date.now()
  });
}

// Helper to track workflow completion with latency
export async function trackWorkflowComplete(
  userId: string,
  workflowType: 'feature_discovery' | 'roadmap' | 'sprint' | 'tech_spec',
  startTime: number
) {
  const latency = Math.round((Date.now() - startTime) / 1000);
  return trackEvent(userId, `workflow_${workflowType}` as EventType, {
    status: 'completed',
    latency
  });
}

// Helper to track artifact creation
export async function trackArtifactCreated(
  userId: string,
  artifactType: 'epic' | 'story' | 'canvas' | 'impact_analysis'
) {
  return trackEvent(userId, 'artifact_created', {
    artifact_type: artifactType
  });
}

// Helper to track agent conversation
export async function trackAgentConversation(
  userId: string,
  role: 'PM' | 'Designer' | 'Dev'
) {
  return trackEvent(userId, 'agent_conversation', {
    role
  });
}
