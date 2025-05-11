'use client'

import { useEffect } from 'react'
import { Loader2, Share2, Globe, Lock, Trash, Edit, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLinkStore } from '@/lib/stores/link-store'

/**
 * LinkList Component
 * 
 * Displays a list of user's links with the ability to view, edit, share and delete them.
 * Data is managed through the Zustand link store.
 */
export default function LinkList() {
  const router = useRouter()
  const { links, isLoading, error, fetchLinks, deleteLink, toggleLinkVisibility } = useLinkStore()
  
  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  // Handle the case where there's an error
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Links</h2>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => fetchLinks()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show loading state
  if (isLoading && links.length === 0) {
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

  // Handle editing a link
  const handleEdit = (id: string) => {
    router.push(`/dashboard/links/edit/${id}`)
  }

  // Handle viewing a link
  const handleView = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Render the links
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Links</h2>
        <button 
          onClick={() => router.push('/dashboard/links/new')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add New Link
        </button>
      </div>
      
      {links.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-4">You don't have any links yet.</p>
          <button
            onClick={() => router.push('/dashboard/links/new')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {links.map((link) => (
            <li key={link.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h3 className="font-medium text-blue-600 truncate max-w-md">
                    {link.title}
                  </h3>
                  <p className="text-gray-500 text-sm truncate max-w-md">{link.url}</p>
                  {link.description && (
                    <p className="text-gray-600 mt-1 line-clamp-2">{link.description}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleView(link.url)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => toggleLinkVisibility(link.id)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title={link.isPublic ? 'Make private' : 'Make public'}
                  >
                    {link.isPublic ? (
                      <Globe className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(link.id)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title="Edit link"
                  >
                    <Edit className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title="Delete link"
                  >
                    <Trash className="w-5 h-5 text-red-600" />
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