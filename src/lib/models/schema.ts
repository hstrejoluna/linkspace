import { z } from "zod";

/**
 * Zod schemas for validation
 * These schemas match the Prisma models and TypeScript interfaces
 */

export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const linkSchema = z.object({
  id: z.string().cuid(),
  url: z.string().url(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  image: z.string().url().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().cuid(),
  clicks: z.number().int().nonnegative(),
  isPublic: z.boolean(),
});

export const collectionSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().cuid(),
  isPublic: z.boolean(),
});

export const tagSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(50),
  createdAt: z.date(),
});

// Input schemas for creating new records
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createLinkSchema = linkSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  clicks: true,
}).extend({
  tags: z.array(z.string()).optional(),
});

export const createCollectionSchema = collectionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createTagSchema = tagSchema.omit({
  id: true,
  createdAt: true,
}); 