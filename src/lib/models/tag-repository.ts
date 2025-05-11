import { prisma } from "@/lib/prisma";
import { createTagSchema } from "./schema";
import { z } from "zod";

export type CreateTagInput = z.infer<typeof createTagSchema>;

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
 * Repository for Tag model operations
 */
export const TagRepository = {
  /**
   * Find a tag by ID
   */
  async findById(id: string) {
    return safeDbOperation(() => 
      prisma.tag.findUnique({
        where: { id },
      })
    );
  },

  /**
   * Find a tag by name
   */
  async findByName(name: string) {
    return safeDbOperation(() => 
      prisma.tag.findUnique({
        where: { name },
      })
    );
  },

  /**
   * Find all tags
   */
  async findAll() {
    return safeDbOperation(() => 
      prisma.tag.findMany({
        include: {
          _count: {
            select: {
              links: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })
    );
  },

  /**
   * Create a new tag
   */
  async create(data: CreateTagInput) {
    return safeDbOperation(() => 
      prisma.tag.create({
        data,
      })
    );
  },

  /**
   * Get links by tag
   */
  async getLinks(id: string) {
    return safeDbOperation(() => 
      prisma.tag.findUnique({
        where: { id },
        include: {
          links: {
            where: {
              isPublic: true,
            },
            include: {
              user: true,
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
   * Find popular tags
   */
  async findPopular(limit = 10) {
    return safeDbOperation(async () => {
      const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: {
              links: true,
            },
          },
        },
      });
      
      // Sort by link count and take the top ones
      return tags
        .sort((a, b) => b._count.links - a._count.links)
        .slice(0, limit);
    });
  },
}; 