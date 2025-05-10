'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Share2, Globe, Lock } from 'lucide-react';

type Link = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
};

/**
 * LinkListWithRLS Component
 * 
 * This component demonstrates how to fetch data from Supabase with Row Level Security.
 * It shows links that belong to the currently authenticated user.
 */
export default function LinkListWithRLS() {
  const { session, isLoaded } = useSession();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for the session to load
    if (!isLoaded) return;

    async function fetchLinks() {
      try {
        setLoading(true);
        setError(null);

        // Create a Supabase client with the Clerk session token
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: session ? `Bearer ${await session.getToken({ template: 'supabase' })}` : '',
              },
            },
          }
        );

        // Fetch links from Supabase
        // RLS ensures we only get links that belong to the authenticated user
        const { data, error } = await supabase
          .from('links')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLinks(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching links:', err);
        setError('Failed to load links. Please try again.');
        setLoading(false);
      }
    }

    fetchLinks();
  }, [session, isLoaded]);

  // Handle the case where the user is not signed in
  if (isLoaded && !session) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Links</h2>
        <p className="text-gray-600">Please sign in to view your links.</p>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Links</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading your links...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Links</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Toggle the public/private status of a link
  async function toggleLinkVisibility(linkId: string, isPublic: boolean) {
    try {
      // Create a Supabase client with the Clerk session token
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: session ? `Bearer ${await session.getToken({ template: 'supabase' })}` : '',
            },
          },
        }
      );

      // Update the link visibility
      // RLS ensures we can only update links that belong to the authenticated user
      const { error } = await supabase
        .from('links')
        .update({ is_public: !isPublic })
        .eq('id', linkId);

      if (error) throw error;

      // Update the local state
      setLinks((prevLinks) =>
        prevLinks.map((link) =>
          link.id === linkId ? { ...link, is_public: !isPublic } : link
        )
      );
    } catch (err) {
      console.error('Error updating link visibility:', err);
      setError('Failed to update link visibility. Please try again.');
    }
  }

  // Render the links
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Your Links</h2>
      
      {links.length === 0 ? (
        <p className="text-gray-600">You don't have any links yet.</p>
      ) : (
        <ul className="space-y-4">
          {links.map((link) => (
            <li key={link.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-blue-600">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {link.title}
                    </a>
                  </h3>
                  {link.description && <p className="text-gray-600 mt-1">{link.description}</p>}
                  <p className="text-gray-400 text-sm mt-2">
                    {new Date(link.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleLinkVisibility(link.id, link.is_public)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title={link.is_public ? 'Make private' : 'Make public'}
                  >
                    {link.is_public ? (
                      <Globe className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title="Share link"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 