import { vi } from 'vitest';

// ---------- helpers ----------
function createMockQueryBuilder() {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};

  const methods = [
    'select',
    'insert',
    'update',
    'upsert',
    'delete',
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'in',
    'order',
    'limit',
    'single',
    'maybeSingle',
    'filter',
    'match',
    'range',
    'head',
  ];

  // Every chainable method returns the builder itself
  for (const method of methods) {
    builder[method] = vi.fn().mockReturnValue(builder);
  }

  // Terminal methods resolve to a default empty result
  builder.single = vi.fn().mockResolvedValue({ data: null, error: null });
  builder.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

  // Make the builder itself thenable so `await supabase.from(...).select(...)` works
  (builder as any).then = (resolve: any) =>
    Promise.resolve({ data: [], error: null, count: 0 }).then(resolve);

  return builder;
}

// ---------- mock channels ----------
function createMockChannel() {
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  };
  return channel;
}

// ---------- main mock ----------
export const mockSupabase = {
  from: vi.fn(() => createMockQueryBuilder()),
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  channel: vi.fn(() => createMockChannel()),
  removeChannel: vi.fn(),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
};

// Auto-mock the client module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

/**
 * Configure `supabase.from(tableName)` to resolve with custom data for tests.
 *
 * Usage:
 * ```ts
 * mockTable('profiles', { data: { display_name: 'Alice' }, error: null });
 * ```
 */
export function mockTable(
  _tableName: string,
  response: { data: unknown; error: unknown; count?: number }
) {
  const builder = createMockQueryBuilder();

  // Override terminal methods
  builder.single = vi.fn().mockResolvedValue(response);
  builder.maybeSingle = vi.fn().mockResolvedValue(response);
  (builder as any).then = (resolve: any) => Promise.resolve(response).then(resolve);

  mockSupabase.from.mockReturnValue(builder);
  return builder;
}

/**
 * Reset all mocks between tests.
 */
export function resetSupabaseMocks() {
  mockSupabase.from.mockClear();
  mockSupabase.auth.getSession.mockClear();
  mockSupabase.auth.getUser.mockClear();
  mockSupabase.auth.onAuthStateChange.mockClear();
  mockSupabase.channel.mockClear();
  mockSupabase.removeChannel.mockClear();
  mockSupabase.functions.invoke.mockClear();
}
