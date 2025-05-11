export type Link = {
  id: string
  url: string
  title: string
  description: string | null
  image: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  clicks: number
}

export type NewLink = {
  url: string
  title: string
  description?: string | null
  image?: string | null
  isPublic: boolean
} 