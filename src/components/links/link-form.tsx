'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useLinkStore } from '@/lib/stores/link-store'
import { Link, NewLink } from '@/lib/types'

const linkSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }),
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  image: z.string().nullable().optional(),
  isPublic: z.boolean().default(true),
})

type FormData = z.infer<typeof linkSchema>

interface LinkFormProps {
  link?: Link
  isEditing?: boolean
}

/**
 * LinkForm Component
 * 
 * Form for creating new links or editing existing ones.
 * Uses Zustand store for state management.
 */
export default function LinkForm({ link, isEditing = false }: LinkFormProps) {
  const router = useRouter()
  const { addLink, updateLink, isLoading, error } = useLinkStore()
  
  const [formData, setFormData] = useState<FormData>({
    url: '',
    title: '',
    description: '',
    isPublic: true,
  })
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  
  // If editing, populate form with existing link data
  useEffect(() => {
    if (isEditing && link) {
      setFormData({
        url: link.url,
        title: link.title,
        description: link.description || '',
        isPublic: link.isPublic,
      })
    }
  }, [isEditing, link])
  
  // Helper to convert empty strings to null for submission
  const prepareFormData = (data: FormData): NewLink => {
    return {
      ...data,
      description: data.description?.trim() === '' ? null : data.description,
      image: null // We're not handling images in this form
    }
  }
  
  // Update form data when user inputs change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmissionError(null)
    
    try {
      // Validate form data
      const validationResult = linkSchema.safeParse(formData)
      
      if (!validationResult.success) {
        const errors: Record<string, string> = {}
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message
          }
        })
        setFormErrors(errors)
        return
      }
      
      const preparedData = prepareFormData(validationResult.data)
      
      if (isEditing && link) {
        await updateLink(link.id, preparedData)
      } else {
        await addLink(preparedData)
      }
      
      // Navigate back to links page after successful submission
      router.push('/dashboard/links')
    } catch (err) {
      setSubmissionError('An error occurred while saving the link. Please try again.')
      console.error('Form submission error:', err)
    }
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Edit Link' : 'Add New Link'}
      </h2>
      
      {submissionError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {submissionError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com"
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.url ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.url && (
            <p className="mt-1 text-sm text-red-500">{formErrors.url}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a title for your link"
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add a description (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Make this link public
          </label>
        </div>
        
        <div className="flex space-x-4 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Saving...'}
              </span>
            ) : (
              isEditing ? 'Update Link' : 'Add Link'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/dashboard/links')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 