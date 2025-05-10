import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from './clerk-supabase';

/**
 * Syncs the current Clerk user with our database
 * @returns The synced user from our database
 */
export async function syncUser() {
  try {
    // Get the current Clerk user
    const user = await currentUser();
    
    if (!user) {
      return { data: null, error: new Error('No authenticated user') };
    }
    
    // Verify Prisma is initialized
    if (!prisma) {
      return { data: null, error: new Error('Database client not initialized') };
    }
    
    // Check if the user exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    // If the user exists, update their information
    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim(),
          image: user.imageUrl,
          updatedAt: new Date(),
        },
      });
      
      return { data: updatedUser, error: null };
    }
    
    // If the user doesn't exist, create a new user
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
        image: user.imageUrl,
      },
    });
    
    return { data: newUser, error: null };
  } catch (error) {
    console.error('Error syncing user:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

/**
 * Syncs the current Clerk user with Supabase
 */
export async function syncUserWithSupabase() {
  try {
    // Get the current Clerk user
    const user = await currentUser();
    
    if (!user) {
      return { data: null, error: new Error('No authenticated user') };
    }
    
    // Create a Supabase client
    const supabase = createServerSupabaseClient();
    
    // Check if the user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      return { data: null, error: new Error(fetchError.message) };
    }
    
    // If the user exists, update their information
    if (existingUser) {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim(),
          image_url: user.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        return { data: null, error: new Error(updateError.message) };
      }
      
      return { data: updatedUser, error: null };
    }
    
    // If the user doesn't exist, create a new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
        image_url: user.imageUrl,
      })
      .select()
      .single();
    
    if (createError) {
      return { data: null, error: new Error(createError.message) };
    }
    
    return { data: newUser, error: null };
  } catch (error) {
    console.error('Error syncing user with Supabase:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
} 