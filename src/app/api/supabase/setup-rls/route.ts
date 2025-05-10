import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { setupRLSForLinkSpace } from '@/lib/supabase/apply-rls';

/**
 * This API route sets up Row Level Security for the LinkSpace project
 * It can only be run by administrators
 */
export async function POST(request: Request) {
  try {
    // Check if the user is authenticated and has admin rights
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin (you should implement your own admin check)
    // For example, check against a list of admin user IDs or query a database
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    const isAdmin = adminUserIds.includes(userId);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Set up RLS for the LinkSpace project
    const result = await setupRLSForLinkSpace();
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'RLS setup completed successfully', details: result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting up RLS:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to set up RLS',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * This API route can be tested using the following command:
 * 
 * curl -X POST http://localhost:3000/api/supabase/setup-rls \
 *      -H "Authorization: Bearer <clerk-token>"
 * 
 * Note: You'll need to replace <clerk-token> with a valid Clerk session token
 * for an admin user.
 */ 