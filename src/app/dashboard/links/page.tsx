import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LinksDashboard } from '@/components/links/links-dashboard';

export const metadata = {
  title: 'Manage Links | LinkSpace',
  description: 'Create, organize, and share your links with LinkSpace',
};

export default async function LinksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Manage Your Links</h1>
      
      <LinksDashboard />
    </div>
  );
} 