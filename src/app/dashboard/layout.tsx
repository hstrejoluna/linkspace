import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/clerk/user-sync';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Sync the user to ensure they exist in the database
  const { data: syncedUser, error } = await syncUser();

  if (error) {
    console.error('Error syncing user:', error);
    // Continue anyway to show the UI but log the error
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 