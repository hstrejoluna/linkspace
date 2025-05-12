const fs = require('fs');
const path = require('path');

/**
 * This script runs before the application starts to verify if Prisma binaries
 * are available in the expected locations. It's useful for debugging deployment issues.
 */
function checkPrismaBinaries() {
  console.log('Checking for Prisma binaries...');
  
  const possiblePrismaPaths = [
    path.join(process.cwd(), 'src/generated/prisma'),
    path.join(process.cwd(), '.next/server'),
    path.join(process.cwd(), '.vercel/output/functions/_api/src/generated/prisma'),
    path.join(process.cwd(), '.prisma/client'),
    '/tmp/prisma-engines',
    path.join(process.cwd(), '.next/server/chunks'),
    path.join(process.cwd(), '.next/standalone/src/generated/prisma')
  ];
  
  const binaryTargets = [
    'libquery_engine-rhel-openssl-3.0.x.so.node',
    'libquery_engine-debian-openssl-3.0.x.so.node',
    'libquery_engine-linux-musl-openssl-3.0.x.so.node'
  ];
  
  console.log('Environment info:');
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Architecture:', process.arch);
  console.log('Current working directory:', process.cwd());
  
  // Check each possible path
  let foundBinary = false;
  
  for (const prismaPath of possiblePrismaPaths) {
    console.log(`\nChecking path: ${prismaPath}`);
    
    if (!fs.existsSync(prismaPath)) {
      console.log(`Path does not exist: ${prismaPath}`);
      continue;
    }
    
    console.log(`Directory exists. Contents:`, fs.readdirSync(prismaPath));
    
    // Check for engine binaries
    for (const binaryTarget of binaryTargets) {
      const binaryPath = path.join(prismaPath, binaryTarget);
      if (fs.existsSync(binaryPath)) {
        console.log(`✅ Found engine binary: ${binaryPath}`);
        foundBinary = true;
      }
    }
  }
  
  if (!foundBinary) {
    console.warn('❌ No Prisma engine binaries found in any of the expected locations!');
    console.log('This may cause the application to fail when connecting to the database.');
  } else {
    console.log('\n✅ Prisma engine binaries found successfully.');
  }
}

checkPrismaBinaries(); 