import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Link, NewLink } from '@/lib/types'

interface LinkState {
  links: Link[]
  isLoading: boolean
  error: string | null
}

interface LinkActions {
  fetchLinks: () => Promise<void>
  addLink: (link: NewLink) => Promise<void>
  updateLink: (id: string, link: Partial<NewLink>) => Promise<void>
  deleteLink: (id: string) => Promise<void>
  toggleLinkVisibility: (id: string) => Promise<void>
}

export type LinkStore = LinkState & LinkActions

export const useLinkStore = create<LinkStore>()(
  devtools(
    persist(
      (set, get) => ({
        links: [],
        isLoading: false,
        error: null,

        fetchLinks: async () => {
          try {
            set({ isLoading: true, error: null })
            
            const response = await fetch('/api/links')
            
            if (!response.ok) {
              throw new Error('Failed to fetch links')
            }
            
            const data = await response.json()
            set({ links: data, isLoading: false })
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false })
          }
        },
        
        addLink: async (link) => {
          try {
            set({ isLoading: true, error: null })
            
            const response = await fetch('/api/links', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(link),
            })
            
            if (!response.ok) {
              throw new Error('Failed to add link')
            }
            
            const newLink = await response.json()
            set((state) => ({ 
              links: [...state.links, newLink],
              isLoading: false 
            }))
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false })
          }
        },
        
        updateLink: async (id, linkUpdate) => {
          try {
            set({ isLoading: true, error: null })
            
            const response = await fetch(`/api/links/${id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(linkUpdate),
            })
            
            if (!response.ok) {
              throw new Error('Failed to update link')
            }
            
            const updatedLink = await response.json()
            set((state) => ({
              links: state.links.map((link) => (link.id === id ? updatedLink : link)),
              isLoading: false,
            }))
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false })
          }
        },
        
        deleteLink: async (id) => {
          try {
            set({ isLoading: true, error: null })
            
            const response = await fetch(`/api/links/${id}`, {
              method: 'DELETE',
            })
            
            if (!response.ok) {
              throw new Error('Failed to delete link')
            }
            
            set((state) => ({
              links: state.links.filter((link) => link.id !== id),
              isLoading: false,
            }))
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false })
          }
        },
        
        toggleLinkVisibility: async (id) => {
          const link = get().links.find((link) => link.id === id)
          
          if (!link) {
            set({ error: 'Link not found' })
            return
          }
          
          try {
            await get().updateLink(id, { isPublic: !link.isPublic })
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'An error occurred' })
          }
        },
      }),
      {
        name: 'link-storage',
        partialize: (state) => ({ links: state.links }),
      }
    )
  )
) 