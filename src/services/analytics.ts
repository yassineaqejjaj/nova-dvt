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
  artifact_type?: 'epic' | 'story' | 'canvas' | 'impact_analysis' | 'tech_spec';
  role?: 'PM' | 'Designer' | 'Dev';
  [key: string]: unknown;
}

export async function trackEvent(
  userId: string,
  eventType: EventType,
  eventData?: EventData
): Promise<void> {
  const { error } = await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: eventType,
    event_data: (eventData || {}) as any,
  });

  if (error) {
    console.error('Error tracking event:', error);
  }
}

export async function trackWorkflowStart(
  userId: string,
  workflowType: 'feature_discovery' | 'roadmap' | 'sprint' | 'tech_spec'
): Promise<void> {
  await trackEvent(userId, `workflow_${workflowType}` as EventType, {
    status: 'started',
  });
}

export async function trackWorkflowComplete(
  userId: string,
  workflowType: 'feature_discovery' | 'roadmap' | 'sprint' | 'tech_spec',
  startTime: number
): Promise<void> {
  const latency = Math.round((Date.now() - startTime) / 1000);
  await trackEvent(userId, `workflow_${workflowType}` as EventType, {
    status: 'completed',
    latency,
  });
}

export async function trackArtifactCreated(
  userId: string,
  artifactType: 'epic' | 'story' | 'canvas' | 'impact_analysis' | 'tech_spec'
): Promise<void> {
  await trackEvent(userId, 'artifact_created', {
    artifact_type: artifactType,
  });
}

export async function trackAgentConversation(
  userId: string,
  role: 'PM' | 'Designer' | 'Dev'
): Promise<void> {
  await trackEvent(userId, 'agent_conversation', { role });
}
