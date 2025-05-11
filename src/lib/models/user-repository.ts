import { prisma } from "@/lib/prisma";
import { User } from "./index";
import { createUserSchema } from "./schema";
import { z } from "zod";

export type CreateUserInput = z.infer<typeof createUserSchema>;

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
 * Repository for User model operations
 */
export const UserRepository = {
  /**
   * Find a user by ID
   */
  async findById(id: string) {
    return safeDbOperation(() => 
      prisma.user.findUnique({
        where: { id },
      })
    );
  },

  /**
   * Find a user by email
   */
  async findByEmail(email: string) {
    return safeDbOperation(() => 
      prisma.user.findUnique({
        where: { email },
      })
    );
  },

  /**
   * Create a new user
   */
  async create(data: CreateUserInput) {
    return safeDbOperation(() => 
      prisma.user.create({
        data,
      })
    );
  },

  /**
   * Update a user
   */
  async update(id: string, data: {
    email?: string;
    name?: string;
    image?: string | null;
    updatedAt?: Date;
  }) {
    return safeDbOperation(() => 
      prisma.user.update({
        where: { id },
        data,
      })
    );
  },

  /**
   * Get users followed by a user
   */
  async getFollowing(userId: string) {
    return safeDbOperation(() => 
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          following: true,
        },
      })
    );
  },

  /**
   * Get users who follow a user
   */
  async getFollowers(userId: string) {
    return safeDbOperation(() => 
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          followedBy: true,
        },
      })
    );
  },

  /**
   * Follow a user
   */
  async followUser(userId: string, targetUserId: string) {
    return safeDbOperation(() => 
      prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            connect: { id: targetUserId },
          },
        },
      })
    );
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string, targetUserId: string) {
    return safeDbOperation(() => 
      prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            disconnect: { id: targetUserId },
          },
        },
      })
    );
  },
}; 