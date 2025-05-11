import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, LinkIcon, FolderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/links/new" className="flex items-center">
            <PlusCircle className="mr-2" />
            Create New Link
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.firstName}!</h2>
        <p className="text-gray-600 mb-4">
          This is your personal dashboard where you can manage your links and collections.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Button asChild>
            <Link href="/dashboard/links" className="flex items-center justify-center">
              <LinkIcon className="mr-2" />
              Manage Links
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/collections" className="flex items-center justify-center">
              <FolderIcon className="mr-2" />
              Manage Collections
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-700">Total Links</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-700">Collections</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-700">Link Clicks</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
} 