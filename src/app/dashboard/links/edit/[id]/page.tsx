'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import LinkForm from '@/components/links/link-form'
import { useLinkStore } from '@/lib/stores/link-store'
import { Link } from '@/lib/types'

export default function EditLinkPage() {
  const params = useParams()
  const router = useRouter()
  const { links, fetchLinks, isLoading, error } = useLinkStore()
  const [link, setLink] = useState<Link | null>(null)
  const [isLoadingLink, setIsLoadingLink] = useState(true)
  
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] || ''
  
  useEffect(() => {
    const loadLink = async () => {
      setIsLoadingLink(true)
      
      try {
        // First check if we have the link in the store
        let existingLink = links.find(l => l.id === id)
        
        // If not, fetch it from the API
        if (!existingLink) {
          await fetchLinks()
          existingLink = useLinkStore.getState().links.find(l => l.id === id)
        }
        
        if (existingLink) {
          setLink(existingLink)
        } else {
          // If still not found, redirect back to the links page
          console.error('Link not found')
          router.push('/dashboard/links')
        }
      } catch (err) {
        console.error('Error loading link:', err)
      } finally {
        setIsLoadingLink(false)
      }
    }
    
    loadLink()
  }, [id, links, fetchLinks, router])
  
  if (isLoadingLink) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Link</h1>
        <div className="p-6 bg-white rounded-lg shadow-sm flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-2">Loading link details...</span>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Link</h1>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/links')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Links
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Link</h1>
      {link && <LinkForm link={link} isEditing={true} />}
    </div>
  )
} 