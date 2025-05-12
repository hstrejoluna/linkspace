import { PrismaClient } from '../generated/prisma'
import path from 'path'
import fs from 'fs'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Handle Prisma binary engine location in Vercel environment
if (process.env.VERCEL === '1') {
  try {
    // Define possible binary names based on the platform
    const binaryTargets = [
      'libquery_engine-rhel-openssl-3.0.x.so.node',
      'libquery_engine-debian-openssl-3.0.x.so.node',
      'libquery_engine-linux-musl-openssl-3.0.x.so.node'
    ]
    
    // Find the first available binary
    let foundBinary = false
    for (const binaryTarget of binaryTargets) {
      const binaryPath = path.join(process.cwd(), 'src/generated/prisma', binaryTarget)
      if (fs.existsSync(binaryPath)) {
        process.env.PRISMA_QUERY_ENGINE_BINARY = binaryPath
        console.log(`Found Prisma binary at ${binaryPath}`)
        foundBinary = true
        break
      }
    }

    if (!foundBinary) {
      console.warn('No Prisma binary found in expected locations')
      // List available files in the directory for debugging
      const prismaDir = path.join(process.cwd(), 'src/generated/prisma')
      if (fs.existsSync(prismaDir)) {
        console.log('Available files in Prisma directory:', fs.readdirSync(prismaDir))
      } else {
        console.warn('Prisma directory does not exist:', prismaDir)
      }
    }
  } catch (error) {
    console.error('Error setting up Prisma binary path:', error)
  }
}

let prisma: PrismaClient

try {
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} catch (error) {
  console.error('Error initializing PrismaClient:', error)
  throw error
}

export { prisma }