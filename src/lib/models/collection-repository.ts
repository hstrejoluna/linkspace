import { prisma, safeDbOperation } from "./db";
import { Collection } from "./index";
import { createCollectionSchema } from "./schema";
import { z } from "zod";

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

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
  async update(id: string, data: Partial<Collection>) {
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