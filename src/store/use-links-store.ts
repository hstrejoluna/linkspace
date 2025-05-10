import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Link } from '@/lib/models';
import { LinkRepository } from '@/lib/models/link-repository';
import { CreateLinkInput } from '@/lib/models/link-repository';

interface LinksState {
  links: Link[];
  isLoading: boolean;
  error: string | null;
  selectedLink: Link | null;
  selectedLinkId: string | null;
  
  // Fetch actions
  fetchLinks: () => Promise<void>;
  fetchLinkById: (id: string) => Promise<void>;
  
  // CRUD actions
  createLink: (data: CreateLinkInput) => Promise<Link | null>;
  updateLink: (id: string, data: Partial<Link>) => Promise<Link | null>;
  deleteLink: (id: string) => Promise<boolean>;
  
  // UI state actions
  setSelectedLinkId: (id: string | null) => void;
  resetError: () => void;
}

export const useLinksStore = create<LinksState>()(
  persist(
    (set, get) => ({
      links: [],
      isLoading: false,
      error: null,
      selectedLink: null,
      selectedLinkId: null,
      
      // Fetch actions
      fetchLinks: async () => {
        set({ isLoading: true, error: null });
        try {
          const userId = localStorage.getItem('userId'); // Get userId from auth
          if (!userId) {
            throw new Error('User not authenticated');
          }
          
          const { data, error } = await LinkRepository.findByUserId(userId);
          
          if (error) {
            throw error;
          }
          
          if (!data) {
            throw new Error('Failed to fetch links');
          }
          
          set({ links: data as Link[], isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
        }
      },
      
      fetchLinkById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await LinkRepository.findById(id);
          
          if (error) {
            throw error;
          }
          
          if (!data) {
            throw new Error('Link not found');
          }
          
          set({ 
            selectedLink: data as Link,
            selectedLinkId: id,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
        }
      },
      
      // CRUD actions
      createLink: async (data: CreateLinkInput) => {
        set({ isLoading: true, error: null });
        try {
          const { data: createdLink, error } = await LinkRepository.create(data);
          
          if (error) {
            throw error;
          }
          
          if (!createdLink) {
            throw new Error('Failed to create link');
          }
          
          const newLink = createdLink as Link;
          
          set((state) => ({ 
            links: [newLink, ...state.links],
            isLoading: false 
          }));
          
          return newLink;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
          return null;
        }
      },
      
      updateLink: async (id: string, data: Partial<Link>) => {
        set({ isLoading: true, error: null });
        try {
          const { data: updatedLink, error } = await LinkRepository.update(id, data);
          
          if (error) {
            throw error;
          }
          
          if (!updatedLink) {
            throw new Error('Failed to update link');
          }
          
          const updatedLinkData = updatedLink as Link;
          
          set((state) => ({ 
            links: state.links.map(link => 
              link.id === id ? { ...link, ...updatedLinkData } : link
            ),
            selectedLink: state.selectedLink?.id === id
              ? { ...state.selectedLink, ...updatedLinkData }
              : state.selectedLink,
            isLoading: false 
          }));
          
          return updatedLinkData;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
          return null;
        }
      },
      
      deleteLink: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await LinkRepository.delete(id);
          
          if (error) {
            throw error;
          }
          
          set((state) => ({ 
            links: state.links.filter(link => link.id !== id),
            selectedLink: state.selectedLink?.id === id ? null : state.selectedLink,
            selectedLinkId: state.selectedLinkId === id ? null : state.selectedLinkId,
            isLoading: false 
          }));
          
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
          return false;
        }
      },
      
      // UI state actions
      setSelectedLinkId: (id: string | null) => {
        set({ selectedLinkId: id });
        if (id) {
          const link = get().links.find(link => link.id === id) || null;
          set({ selectedLink: link });
        } else {
          set({ selectedLink: null });
        }
      },
      
      resetError: () => set({ error: null }),
    }),
    {
      name: 'links-storage',
      partialize: (state) => ({ selectedLinkId: state.selectedLinkId }),
    }
  )
); 