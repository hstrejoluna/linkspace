import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.firstName}!</h2>
        <p className="text-gray-600 mb-4">
          This is your personal dashboard where you can manage your links and collections.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Link 
            href="/links" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center"
          >
            Manage Links
          </Link>
          <Link 
            href="/collections" 
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded text-center"
          >
            Manage Collections
          </Link>
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