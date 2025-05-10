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
          
          const response = await LinkRepository.findByUserId(userId);
          if (!response) {
            throw new Error('Failed to fetch links');
          }
          
          set({ links: response, isLoading: false });
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
          const response = await LinkRepository.findById(id);
          if (!response) {
            throw new Error('Link not found');
          }
          
          set({ 
            selectedLink: response,
            selectedLinkId: response.id,
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
          const response = await LinkRepository.create(data);
          if (!response) {
            throw new Error('Failed to create link');
          }
          
          set((state) => ({ 
            links: [response, ...state.links],
            isLoading: false 
          }));
          
          return response;
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
          const response = await LinkRepository.update(id, data);
          if (!response) {
            throw new Error('Failed to update link');
          }
          
          set((state) => ({ 
            links: state.links.map(link => 
              link.id === id ? { ...link, ...response } : link
            ),
            selectedLink: state.selectedLink?.id === id
              ? { ...state.selectedLink, ...response }
              : state.selectedLink,
            isLoading: false 
          }));
          
          return response;
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
          await LinkRepository.delete(id);
          
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