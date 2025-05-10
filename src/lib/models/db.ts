import { PrismaClient } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * Helper function to handle database errors
 */
export function handleDbError(error: unknown): Error {
  console.error("Database error:", error);
  
  if (error instanceof PrismaClientInitializationError) {
    return new Error("Failed to connect to the database. Please check your connection.");
  }
  
  if (error instanceof Error) {
    return error;
  }
  
  return new Error("An unknown database error occurred");
}

/**
 * Helper function to safely execute database operations
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleDbError(error) };
  }
} 