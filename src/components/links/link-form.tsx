'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLinksStore } from '@/store/use-links-store';
import { Link } from '@/lib/models';
import { createLinkSchema } from '@/lib/models/schema';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { XIcon, PlusIcon } from 'lucide-react';

// Extend the createLinkSchema to make sure required fields are present
const linkFormSchema = createLinkSchema
  .extend({
    id: z.string().optional(),
    url: z.string().url({ message: 'Please enter a valid URL' }),
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional().nullable(),
    isPublic: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  })
  .refine((data) => {
    if (data.url && !data.url.startsWith('http')) {
      return { url: 'URL must start with http:// or https://' };
    }
    return true;
  });

type LinkFormValues = z.infer<typeof linkFormSchema>;

interface LinkFormProps {
  linkId?: string;
  onSuccess?: () => void;
}

export function LinkForm({ linkId, onSuccess }: LinkFormProps) {
  const { user } = useUser();
  const { links, selectedLink, isLoading, createLink, updateLink, fetchLinkById } = useLinksStore();
  const [tagInput, setTagInput] = useState('');
  
  // Initialize the form
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      url: '',
      title: '',
      description: '',
      isPublic: true,
      tags: [],
    },
  });
  
  // Fetch link data if editing
  useEffect(() => {
    if (linkId) {
      // If we already have the link in the store
      const link = links.find(l => l.id === linkId) || selectedLink;
      
      if (link) {
        // Set form values from existing link
        form.reset({
          id: link.id,
          url: link.url,
          title: link.title,
          description: link.description || '',
          isPublic: link.isPublic,
          tags: link.tags?.map(tag => tag.name) || [],
        });
      } else {
        // Fetch the link if not in the store
        fetchLinkById(linkId);
      }
    }
  }, [linkId, links, selectedLink, fetchLinkById, form]);
  
  // Update form values when selectedLink changes (after fetch)
  useEffect(() => {
    if (linkId && selectedLink && selectedLink.id === linkId) {
      form.reset({
        id: selectedLink.id,
        url: selectedLink.url,
        title: selectedLink.title,
        description: selectedLink.description || '',
        isPublic: selectedLink.isPublic,
        tags: selectedLink.tags?.map(tag => tag.name) || [],
      });
    }
  }, [selectedLink, linkId, form]);
  
  const onSubmit = async (values: LinkFormValues) => {
    if (!user?.id) return;
    
    try {
      if (linkId) {
        // Update existing link
        await updateLink(linkId, {
          ...values,
          userId: user.id,
        });
      } else {
        // Create new link
        await createLink({
          ...values,
          userId: user.id,
        });
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving link:', error);
    }
  };
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues('tags') || [];
    const normalizedTag = tagInput.trim().toLowerCase();
    
    // Prevent duplicate tags
    if (!currentTags.includes(normalizedTag)) {
      form.setValue('tags', [...currentTags, normalizedTag]);
    }
    
    setTagInput('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue(
      'tags',
      currentTags.filter((tag: string) => tag !== tagToRemove)
    );
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  if (isLoading && linkId) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="md" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com" 
                  {...field} 
                  autoFocus={!linkId}
                />
              </FormControl>
              <FormDescription>
                The web address of the link
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Link title" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive title for your link
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the link (optional)" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Add context or notes about this link
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public Link</FormLabel>
                <FormDescription>
                  Public links can be viewed by anyone with the right permissions
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex">
                <FormControl>
                  <Input 
                    placeholder="Add tags..."
                    value={tagInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  className="ml-2"
                  onClick={handleAddTag}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <FormDescription>
                Press Enter or click + to add tags
              </FormDescription>
              <FormMessage />
              
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {field.value.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </FormItem>
          )}
        />
        
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {linkId ? 'Update Link' : 'Create Link'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 