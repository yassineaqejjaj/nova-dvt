import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMocks } from '@/test/mocks/supabase';
import {
  trackEvent,
  trackWorkflowStart,
  trackWorkflowComplete,
  trackArtifactCreated,
  trackAgentConversation,
} from '../analytics';

beforeEach(() => {
  resetSupabaseMocks();
});

describe('trackEvent', () => {
  it('inserts an event into analytics_events', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const builder = {
      insert: insertFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await trackEvent('user-123', 'artifact_created', { artifact_type: 'epic' });

    expect(mockSupabase.from).toHaveBeenCalledWith('analytics_events');
    expect(insertFn).toHaveBeenCalledWith({
      user_id: 'user-123',
      event_type: 'artifact_created',
      event_data: { artifact_type: 'epic' },
    });
  });

  it('uses empty object when no eventData provided', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const builder = {
      insert: insertFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await trackEvent('user-123', 'squad_created');

    expect(insertFn).toHaveBeenCalledWith({
      user_id: 'user-123',
      event_type: 'squad_created',
      event_data: {},
    });
  });

  it('does not throw on error — just logs', async () => {
    const builder = {
      insert: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: { message: 'fail' } }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await trackEvent('user-123', 'artifact_created');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('trackWorkflowStart', () => {
  it('tracks a workflow_feature_discovery event with started status', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const builder = {
      insert: insertFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await trackWorkflowStart('user-123', 'feature_discovery');

    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'workflow_feature_discovery',
        event_data: expect.objectContaining({ status: 'started' }),
      })
    );
  });
});

describe('trackWorkflowComplete', () => {
  it('tracks completion with latency', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const builder = {
      insert: insertFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const startTime = Date.now() - 5000; // 5 seconds ago
    await trackWorkflowComplete('user-123', 'roadmap', startTime);

    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'workflow_roadmap',
        event_data: expect.objectContaining({
          status: 'completed',
          latency: expect.any(Number),
        }),
      })
    );
  });
});

describe('trackArtifactCreated', () => {
  it('tracks an artifact creation event', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const builder = {
      insert: insertFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await trackArtifactCreated('user-123', 'story');

    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'artifact_created',
        event_data: { artifact_type: 'story' },
      })
    );
  });
});

describe('trackAgentConversation', () => {
  it('tracks an agent conversation event', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const builder = {
      insert: insertFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await trackAgentConversation('user-123', 'PM');

    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'agent_conversation',
        event_data: { role: 'PM' },
      })
    );
  });
});
