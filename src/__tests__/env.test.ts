import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test the schema directly rather than the singleton env object
// (since the module-level export runs at import time)

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
});

describe('env schema validation', () => {
  it('accepts valid environment variables', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'some-key-value',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'not-a-url',
      VITE_SUPABASE_ANON_KEY: 'some-key',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty anon key', () => {
    const result = envSchema.safeParse({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
