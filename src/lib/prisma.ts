import { PrismaClient } from '../generated/prisma'
import path from 'path'
import fs from 'fs'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Possible locations for Prisma binary engines
const possiblePrismaPaths = [
  path.join(process.cwd(), 'src/generated/prisma'),
  path.join(process.cwd(), '.next/server'),
  path.join(process.cwd(), '.vercel/output/functions/_api/src/generated/prisma'),
  path.join(process.cwd(), '.prisma/client'),
  '/tmp/prisma-engines',
]

// Handle Prisma binary engine location in Vercel environment
try {
  // Define possible binary names based on the platform
  const binaryTargets = [
    'libquery_engine-rhel-openssl-3.0.x.so.node',
    'libquery_engine-debian-openssl-3.0.x.so.node',
    'libquery_engine-linux-musl-openssl-3.0.x.so.node'
  ]
    
  // Find the first available binary across all possible paths
  let foundBinary = false
  for (const prismaPath of possiblePrismaPaths) {
    if (!fs.existsSync(prismaPath)) continue
      
    for (const binaryTarget of binaryTargets) {
      const binaryPath = path.join(prismaPath, binaryTarget)
      if (fs.existsSync(binaryPath)) {
        process.env.PRISMA_QUERY_ENGINE_BINARY = binaryPath
        console.log(`Found Prisma binary at ${binaryPath}`)
        foundBinary = true
        break
      }
    }
      
    if (foundBinary) break
  }

  if (!foundBinary) {
    console.warn('No Prisma binary found in expected locations')
    // List available files in the directories for debugging
    for (const prismaPath of possiblePrismaPaths) {
      if (fs.existsSync(prismaPath)) {
        console.log(`Available files in ${prismaPath}:`, fs.readdirSync(prismaPath))
      } else {
        console.warn(`Path does not exist: ${prismaPath}`)
      }
    }
  }
} catch (error) {
  console.error('Error setting up Prisma binary path:', error)
}

let prisma: PrismaClient

try {
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Force Prisma to look in additional locations for the binary
      // This is a last resort if the binary is not found above
      errorFormat: 'pretty',
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} catch (error) {
  console.error('Error initializing PrismaClient:', error)
  throw error
}

export { prisma }