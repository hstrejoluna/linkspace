const fs = require('fs');
const path = require('path');

// This script runs during Vercel runtime initialization

// Check if we're running in Vercel
if (process.env.VERCEL === '1') {
  console.log('Running in Vercel environment');
  
  try {
    // Detect and set the appropriate Prisma binary path
    const possibleBinaryLocations = [
      // Common locations in Vercel environment
      path.join(process.cwd(), 'src/generated/prisma'),
      path.join(process.cwd(), '.next/server'),
      path.join(process.cwd(), '.vercel/output/functions/_api/src/generated/prisma'),
      path.join(process.cwd(), '.prisma/client'),
      '/tmp/prisma-engines',
    ];
    
    // Binary names for different platforms
    const possibleBinaries = [
      'libquery_engine-rhel-openssl-3.0.x.so.node',
      'libquery_engine-debian-openssl-3.0.x.so.node', 
      'libquery_engine-linux-musl-openssl-3.0.x.so.node'
    ];
    
    // Find the first available binary
    let foundBinary = false;
    
    for (const location of possibleBinaryLocations) {
      if (!fs.existsSync(location)) continue;
      
      console.log(`Checking for Prisma binaries in: ${location}`);
      const files = fs.readdirSync(location);
      console.log(`Found files: ${files.join(', ')}`);
      
      for (const binary of possibleBinaries) {
        const binaryPath = path.join(location, binary);
        if (fs.existsSync(binaryPath)) {
          console.log(`Found Prisma binary: ${binaryPath}`);
          process.env.PRISMA_QUERY_ENGINE_BINARY = binaryPath;
          foundBinary = true;
          break;
        }
      }
      
      if (foundBinary) break;
    }
    
    if (!foundBinary) {
      console.warn('No Prisma binary found in expected locations');
    }
  } catch (error) {
    console.error('Error in Vercel runtime configuration:', error);
  }
} 