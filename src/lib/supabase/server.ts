import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type CookieOptions } from '@supabase/ssr';

/**
 * Creates a Supabase client for server-side use
 */
export const createClient = async () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );
}; 