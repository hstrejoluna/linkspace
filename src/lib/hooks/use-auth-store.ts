import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useLinksStore } from '@/store/use-links-store';

/**
 * A hook that synchronizes Clerk authentication state with our Zustand store
 * This ensures we have the userId available for fetching links
 */
export function useAuthStore() {
  const { user, isSignedIn } = useUser();
  
  // When Clerk auth state changes, update local storage
  useEffect(() => {
    if (isSignedIn && user?.id) {
      // Set userId in localStorage for use by the store
      localStorage.setItem('userId', user.id);
    } else {
      // Clear userId if not signed in
      localStorage.removeItem('userId');
    }
  }, [isSignedIn, user?.id]);
  
  // Fetch links when user is authenticated
  const fetchLinks = useLinksStore(state => state.fetchLinks);
  
  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchLinks();
    }
  }, [isSignedIn, user?.id, fetchLinks]);
  
  return { user, isSignedIn };
} 