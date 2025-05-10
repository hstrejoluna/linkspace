import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const LinkUpdateSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isPublic: z.boolean().optional()
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const data = await req.json()
    
    const validationResult = LinkUpdateSchema.safeParse(data)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    // Verify link ownership
    const link = await prisma.link.findUnique({
      where: { id },
      select: { userId: true }
    })
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    
    if (link.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    // Verify link ownership
    const link = await prisma.link.findUnique({
      where: { id },
      select: { userId: true }
    })
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    
    if (link.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
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