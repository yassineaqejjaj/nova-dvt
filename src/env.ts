import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
});

function getEnvVariables() {
  // Fallback to hardcoded values for backward compatibility
  // These are public anon keys (read-only) — safe to have as defaults
  const raw = {
    VITE_SUPABASE_URL:
      import.meta.env.VITE_SUPABASE_URL ?? 'https://pwjuvfclcltphuuwlsdr.supabase.co',
    VITE_SUPABASE_ANON_KEY:
      import.meta.env.VITE_SUPABASE_ANON_KEY ??
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3anV2ZmNsY2x0cGh1dXdsc2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTEwODUsImV4cCI6MjA3MjQ4NzA4NX0.dxZda9ijmXhSVU2B2RCqVWnx0dq7RBI7AhBI3lowYzo',
  };

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    console.error('Environment validation failed:', formatted);
    throw new Error(`Invalid environment variables: ${JSON.stringify(formatted)}`);
  }

  return result.data;
}

export const env = getEnvVariables();
