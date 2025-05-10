import { UserRepository } from "./user-repository";
import { createClient } from "@/lib/supabase/server";

/**
 * Service to sync Supabase auth with our database
 */
export const AuthService = {
  /**
   * Sync Supabase user with our database
   */
  async syncUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error("No authenticated user") };
    }

    // Check if user exists in our database
    const { data: existingUser, error: findError } = await UserRepository.findByEmail(user.email!);

    if (findError) {
      return { data: null, error: findError };
    }

    // If user exists, return it
    if (existingUser) {
      return { data: existingUser, error: null };
    }

    // If user doesn't exist, create it
    const { data: newUser, error: createError } = await UserRepository.create({
      email: user.email!,
      name: user.user_metadata.full_name || null,
      image: user.user_metadata.avatar_url || null,
    });

    if (createError) {
      return { data: null, error: createError };
    }

    return { data: newUser, error: null };
  },

  /**
   * Get the current user from Supabase and our database
   */
  async getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: null };
    }

    // Get user from our database
    const { data: dbUser, error } = await UserRepository.findByEmail(user.email!);

    if (error) {
      return { data: null, error };
    }

    return { data: dbUser, error: null };
  },
}; 