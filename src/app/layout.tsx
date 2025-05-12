import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import ClerkProviderWrapper from '@/components/ClerkProviderWrapper';

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
        <ClerkProviderWrapper publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <Navigation />
          <main>{children}</main>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
