import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/_not-found(.*)'
]);

// This function can be marked `async` if using `await` inside
export default clerkMiddleware(async (auth, req) => {
  // If it's a public route, allow access without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // For all other routes, require authentication
  const authObject = await auth();
  if (!authObject.userId) {
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

// Stop Middleware running on static files and public folder
export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files
    '/((?!.+\\.[\\w]+$|_next).*)',
    // Include root route
    '/',
    // Include API routes
    '/(api|trpc)(.*)',
  ],
}; 