/**
 * Type definitions for the application models
 * These interfaces match the Prisma schema
 */

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
  links?: Link[];
  collections?: Collection[];
  followedBy?: User[];
  following?: User[];
}

export interface Link {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
  collections?: Collection[];
  tags?: Tag[];
  clicks: number;
  isPublic: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
  links?: Link[];
  isPublic: boolean;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
  links?: Link[];
} 