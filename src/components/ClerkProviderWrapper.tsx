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
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
} 