'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for client-side use
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}; 