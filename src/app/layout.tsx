import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';

// Dynamically import ClerkProvider to avoid SSR issues
const ClerkProviderWithNoSSR = dynamic(
  () => import('@clerk/nextjs').then((mod) => ({ default: mod.ClerkProvider })),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinkSpace',
  description: 'Share and organize your links',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProviderWithNoSSR publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <>
            <Navigation />
            <main>{children}</main>
          </>
        </ClerkProviderWithNoSSR>
      </body>
    </html>
  );
}
