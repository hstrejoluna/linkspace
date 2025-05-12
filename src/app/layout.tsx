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
        <ClerkProviderWrapper publishableKey="pk_test_bmF0aXZlLW9yaW9sZS0yMC5jbGVyay5hY2NvdW50cy5kZXYk">
          <Navigation />
          <main>{children}</main>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
