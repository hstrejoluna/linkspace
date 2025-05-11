import { prisma } from "@/lib/prisma";
import { Collection } from "./index";
import { createCollectionSchema } from "./schema";
import { z } from "zod";
import { Prisma } from '@/generated/prisma';

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

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
 * Repository for Collection model operations
 */
export const CollectionRepository = {
  /**
   * Find a collection by ID
   */
  async findById(id: string) {
    return safeDbOperation(() => 
      prisma.collection.findUnique({
        where: { id },
        include: {
          links: true,
          user: true,
        },
      })
    );
  },

  /**
   * Find collections by user ID
   */
  async findByUserId(userId: string) {
    return safeDbOperation(() => 
      prisma.collection.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              links: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  },

  /**
   * Find public collections by user ID
   */
  async findPublicByUserId(userId: string) {
    return safeDbOperation(() => 
      prisma.collection.findMany({
        where: { 
          userId,
          isPublic: true,
        },
        include: {
          _count: {
            select: {
              links: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  },

  /**
   * Create a new collection
   */
  async create(data: CreateCollectionInput) {
    return safeDbOperation(() => 
      prisma.collection.create({
        data,
      })
    );
  },

  /**
   * Update a collection
   */
  async update(id: string, data: Prisma.CollectionUpdateInput) {
    return safeDbOperation(() => 
      prisma.collection.update({
        where: { id },
        data,
      })
    );
  },

  /**
   * Delete a collection
   */
  async delete(id: string) {
    return safeDbOperation(() => 
      prisma.collection.delete({
        where: { id },
      })
    );
  },

  /**
   * Get links in a collection
   */
  async getLinks(id: string) {
    return safeDbOperation(() => 
      prisma.collection.findUnique({
        where: { id },
        include: {
          links: {
            include: {
              tags: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })
    );
  },

  /**
   * Add a link to a collection
   */
  async addLink(id: string, linkId: string) {
    return safeDbOperation(() => 
      prisma.collection.update({
        where: { id },
        data: {
          links: {
            connect: { id: linkId },
          },
        },
      })
    );
  },

  /**
   * Remove a link from a collection
   */
  async removeLink(id: string, linkId: string) {
    return safeDbOperation(() => 
      prisma.collection.update({
        where: { id },
        data: {
          links: {
            disconnect: { id: linkId },
          },
        },
      })
    );
  },
}; 