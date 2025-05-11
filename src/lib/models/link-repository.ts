import { prisma } from "@/lib/prisma";
import { Link } from "./index";
import { createLinkSchema } from "./schema";
import { z } from "zod";
import { Prisma } from '@/generated/prisma';

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

/**
 * Helper function to safely execute database operations
 */
async function safeDbOperation<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error("Database error:", error);
    return { data: null, error: error instanceof Error ? error : new Error("An unknown database error occurred") };
  }
}

/**
 * Repository for Link model operations
 */
export const LinkRepository = {
  /**
   * Find a link by ID
   */
  async findById(id: string) {
    return safeDbOperation(() => 
      prisma.link.findUnique({
        where: { id },
        include: {
          user: true,
          tags: true,
          collections: true,
        },
      })
    );
  },

  /**
   * Find links by user ID
   */
  async findByUserId(userId: string) {
    return safeDbOperation(() => 
      prisma.link.findMany({
        where: { userId },
        include: {
          tags: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  },

  /**
   * Find public links by user ID
   */
  async findPublicByUserId(userId: string) {
    return safeDbOperation(() => 
      prisma.link.findMany({
        where: { 
          userId,
          isPublic: true,
        },
        include: {
          tags: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  },

  /**
   * Create a new link
   */
  async create(data: CreateLinkInput) {
    const { tags, ...linkData } = data;
    
    return safeDbOperation(async () => {
      // Create or connect tags if provided
      if (tags && tags.length > 0) {
        return prisma.link.create({
          data: {
            ...linkData,
            tags: {
              connectOrCreate: tags.map(tagName => ({
                where: { name: tagName },
                create: { name: tagName },
              })),
            },
          },
          include: {
            tags: true,
          },
        });
      }
      
      return prisma.link.create({
        data: linkData,
      });
    });
  },

  /**
   * Update a link
   */
  async update(id: string, data: Prisma.LinkUpdateInput) {
    return safeDbOperation(() => 
      prisma.link.update({
        where: { id },
        data,
      })
    );
  },

  /**
   * Delete a link
   */
  async delete(id: string) {
    return safeDbOperation(() => 
      prisma.link.delete({
        where: { id },
      })
    );
  },

  /**
   * Increment link click count
   */
  async incrementClicks(id: string) {
    return safeDbOperation(() => 
      prisma.link.update({
        where: { id },
        data: {
          clicks: {
            increment: 1,
          },
        },
      })
    );
  },

  /**
   * Find links by tag
   */
  async findByTag(tagName: string) {
    return safeDbOperation(() => 
      prisma.link.findMany({
        where: {
          tags: {
            some: {
              name: tagName,
            },
          },
          isPublic: true,
        },
        include: {
          user: true,
          tags: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  },

  /**
   * Add link to collection
   */
  async addToCollection(linkId: string, collectionId: string) {
    return safeDbOperation(() => 
      prisma.link.update({
        where: { id: linkId },
        data: {
          collections: {
            connect: { id: collectionId },
          },
        },
      })
    );
  },

  /**
   * Remove link from collection
   */
  async removeFromCollection(linkId: string, collectionId: string) {
    return safeDbOperation(() => 
      prisma.link.update({
        where: { id: linkId },
        data: {
          collections: {
            disconnect: { id: collectionId },
          },
        },
      })
    );
  },
}; 