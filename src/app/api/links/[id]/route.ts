import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/clerk/user-sync'

const LinkUpdateSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isPublic: z.boolean().optional()
})

export async function PATCH(
  request: Request
) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify Prisma is initialized
    if (!prisma) {
      console.error('Prisma client is not initialized')
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    // Sync the user to ensure they exist in the database
    const { data: syncedUser, error: syncError } = await syncUser()
    
    if (syncError || !syncedUser) {
      console.error('Error syncing user:', syncError)
      return NextResponse.json(
        { error: 'Failed to sync user' },
        { status: 500 }
      )
    }

    // Extract the ID from the URL
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    const data = await request.json()
    
    const validationResult = LinkUpdateSchema.safeParse(data)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    // Find the link to ensure it belongs to the user
    const link = await prisma.link.findUnique({
      where: { id }
    })
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    
    if (link.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Update the link
    const updatedLink = await prisma.link.update({
      where: { id },
      data: validationResult.data
    })
    
    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify Prisma is initialized
    if (!prisma) {
      console.error('Prisma client is not initialized')
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    // Sync the user to ensure they exist in the database
    const { data: syncedUser, error: syncError } = await syncUser()
    
    if (syncError || !syncedUser) {
      console.error('Error syncing user:', syncError)
      return NextResponse.json(
        { error: 'Failed to sync user' },
        { status: 500 }
      )
    }
    
    // Extract the ID from the URL
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    // Find the link to ensure it belongs to the user
    const link = await prisma.link.findUnique({
      where: { id }
    })
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    
    if (link.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Delete the link
    await prisma.link.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 