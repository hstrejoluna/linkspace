import { Metadata } from 'next'
import LinkList from '@/components/links/link-list'

export const metadata: Metadata = {
  title: 'Manage Links | LinkSpace',
  description: 'View and manage all your saved links in one place',
}

export default function LinksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Your Links</h1>
      <LinkList />
    </div>
  )
} 