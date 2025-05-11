'use client';

import { useSession } from '@clerk/nextjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

/**
 * React hook to use Supabase with Clerk authentication
 * @returns A Supabase client authenticated with the current user's Clerk session
 */
export function useSupabase() {
  const { session } = useSession();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (!session) return;

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.getToken()}`
          }
        }
      }
    );

    setSupabaseClient(client);
  }, [session]);

  return supabaseClient;
} 