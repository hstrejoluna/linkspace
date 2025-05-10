import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkIcon, FolderIcon, BarChart3Icon } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.firstName}!</CardTitle>
            <CardDescription>
              This is your personal dashboard where you can manage your links and collections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/links" className="w-full">
                <Button variant="default" size="lg" className="w-full">
                  <LinkIcon className="mr-2 h-4 w-4" /> Manage Links
                </Button>
              </Link>
              <Link href="/collections" className="w-full">
                <Button variant="outline" size="lg" className="w-full">
                  <FolderIcon className="mr-2 h-4 w-4" /> Manage Collections
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Overview of your LinkSpace activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Link Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/links" className="w-full">
              <Button variant="link" className="w-full">
                <BarChart3Icon className="mr-2 h-4 w-4" /> View Detailed Analytics
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 