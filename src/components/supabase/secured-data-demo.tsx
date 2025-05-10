'use client';

import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { Link } from '@/generated/prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Lock, Globe } from 'lucide-react';

interface SecuredDataDemoProps {
  title?: string;
  description?: string;
}

/**
 * Component that demonstrates fetching data with Row Level Security
 * RLS ensures users can only see their own links or public links
 */
export default function SecuredDataDemo({ 
  title = "Your Links",
  description = "This component demonstrates Row Level Security. You can only see your own links and public links shared by others."
}: SecuredDataDemoProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch links when the user is signed in
  useEffect(() => {
    const fetchLinks = async () => {
      if (!isLoaded || !isSignedIn) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // The RLS policies will automatically filter the data
        // to only return links owned by the current user + public links from others
        const { data, error } = await supabase
          .from('Link')
          .select('*')
          .order('createdAt', { ascending: false });
          
        if (error) throw new Error(error.message);
        setLinks(data || []);
      } catch (error) {
        console.error('Error fetching links:', error);
        setError(error instanceof Error ? error.message : 'Failed to load links');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLinks();
  }, [isSignedIn, isLoaded, user?.id]);

  // Create a new link
  const createNewLink = async () => {
    if (!isSignedIn) return;
    
    try {
      const supabase = createClient();
      
      // RLS will automatically set the user ID
      const { error } = await supabase
        .from('Link')
        .insert({
          url: 'https://example.com/new-link',
          title: 'My New Link',
          description: 'A link created through the UI',
          isPublic: true,
          userId: user.id,
        });
        
      if (error) throw new Error(error.message);
      
      // Refresh the links
      const { data } = await supabase
        .from('Link')
        .select('*')
        .order('createdAt', { ascending: false });
        
      setLinks(data || []);
    } catch (error) {
      console.error('Error creating link:', error);
      setError(error instanceof Error ? error.message : 'Failed to create link');
    }
  };
  
  if (!isLoaded) {
    return <LoadingState />;
  }
  
  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please sign in to view your links</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="p-4 text-red-500 bg-red-50 rounded-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No links found</p>
            <Button onClick={createNewLink} className="mt-4">Create Your First Link</Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} currentUserId={user.id} />
            ))}
          </ul>
        )}
      </CardContent>
      
      <CardFooter>
        <Button onClick={createNewLink}>Add New Link</Button>
      </CardFooter>
    </Card>
  );
}

// Helper components

function LinkCard({ link, currentUserId }: { link: Link, currentUserId: string }) {
  const isOwnedByUser = link.userId === currentUserId;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{link.title}</CardTitle>
          <div className="flex items-center space-x-1">
            {isOwnedByUser ? (
              <span className="text-xs text-gray-500">Yours</span>
            ) : (
              <span className="text-xs text-gray-500">Shared</span>
            )}
            {link.isPublic ? (
              <Globe className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </div>
        <CardDescription className="text-xs truncate">
          {link.url}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700">
          {link.description || "No description"}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="text-xs text-gray-500">
          {new Date(link.createdAt).toLocaleDateString()}
        </div>
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-500 flex items-center gap-1"
        >
          Visit <ExternalLink className="h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-2/3 mt-1" />
          </CardHeader>
          <CardContent className="pb-2">
            <Skeleton className="h-4 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-3 w-1/4" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 