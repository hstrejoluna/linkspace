import { prisma, safeDbOperation } from "./db";
import { User } from "./index";
import { createUserSchema } from "./schema";
import { z } from "zod";

export type CreateUserInput = z.infer<typeof createUserSchema>;

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
  async update(id: string, data: Partial<User>) {
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