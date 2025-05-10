/**
 * Configuration for Clerk authentication
 */

export const clerkConfig = {
  // Paths that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/terms',
    '/privacy'
  ],
  
  // Paths that require authentication
  protectedRoutes: [
    '/dashboard(.*)',
    '/profile(.*)',
    '/collections(.*)',
    '/links(.*)'
  ],
  
  // After sign in path
  afterSignInUrl: '/dashboard',
  
  // After sign up path
  afterSignUpUrl: '/dashboard',
  
  // Sign in path
  signInUrl: '/sign-in',
  
  // Sign up path
  signUpUrl: '/sign-up'
}; 