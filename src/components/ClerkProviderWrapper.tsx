'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ClerkProviderWrapperProps {
  children: ReactNode;
  publishableKey?: string;
}

export default function ClerkProviderWrapper({ 
  children,
  publishableKey
}: ClerkProviderWrapperProps) {
  // Use environment variable directly if not provided as prop
  const clerkPubKey = publishableKey || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPubKey) {
    console.error('Missing Clerk publishable key');
  }
  
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {children}
    </ClerkProvider>
  );
} 