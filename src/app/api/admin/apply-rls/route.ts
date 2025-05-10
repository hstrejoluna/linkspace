import { NextRequest, NextResponse } from 'next/server';
import { setupRLSForLinkSpace } from '@/lib/supabase/apply-rls';

/**
 * POST /api/admin/apply-rls
 * 
 * Admin-only endpoint to apply Row Level Security to all LinkSpace tables
 * Requires an admin API key for authorization
 */
export async function POST(request: NextRequest) {
  try {
    // Validate that this is an admin request
    const { adminKey } = await request.json();
    
    // Check if the admin key is valid
    if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid admin key' },
        { status: 401 }
      );
    }

    // Apply RLS to all tables
    const result = await setupRLSForLinkSpace();

    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in apply-rls endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Prevent this endpoint from being used with GET requests
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
} 