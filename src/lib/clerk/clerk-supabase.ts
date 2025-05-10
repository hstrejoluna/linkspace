import { createClient } from '@supabase/supabase-js';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Creates a Supabase client for server-side use with Clerk authentication
 * @returns A Supabase client authenticated with the current user's Clerk session
 */
export async function createServerSupabaseClient() {
  try {
    // Get the token from Clerk
    const { getToken } = await auth();
    const token = await getToken({ template: 'supabase' });
    
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        },
        auth: {
          persistSession: false,
        },
      }
    );
  } catch (error) {
    console.error('Error creating server Supabase client:', error);
    
    // Return an anonymous client if there's an error
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    );
  }
}

/**
 * Creates a Supabase client for client-side use with Clerk authentication
 * @param getToken - Function to get the Clerk token
 * @returns A Supabase client authenticated with the provided token
 */
export function createClientSupabaseClient(getToken: () => Promise<string | null>) {
  return async () => {
    try {
      const token = await getToken();
      
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          },
        }
      );
    } catch (error) {
      console.error('Error creating client Supabase client:', error);
      
      // Return an anonymous client if there's an error
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  };
} 