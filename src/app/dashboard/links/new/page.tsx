import { Metadata } from 'next'
import LinkForm from '@/components/links/link-form'

export const metadata: Metadata = {
  title: 'Add New Link | LinkSpace',
  description: 'Add a new link to your collection',
}

export default function NewLinkPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Link</h1>
      <LinkForm />
    </div>
  )
} 