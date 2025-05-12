const fs = require('fs');
const path = require('path');

/**
 * This script copies Prisma engine binaries to the correct location
 * for Vercel deployment. It's meant to be run during the build process.
 */
async function copyPrismaEngines() {
  try {
    console.log('Starting Prisma engines copy process...');
    console.log('Current working directory:', process.cwd());
    
    // Define source and destination directories
    const sourceDir = path.join(process.cwd(), 'src/generated/prisma');
    
    // Define multiple possible destination directories for Vercel
    const destDirs = [
      path.join(process.cwd(), '.vercel/output/functions/_api/src/generated/prisma'),
      path.join(process.cwd(), '.next/server/chunks/src/generated/prisma'),
      path.join(process.cwd(), '.next/server/app/api/src/generated/prisma'),
      path.join(process.cwd(), '.next/standalone/src/generated/prisma'),
      path.join(process.cwd(), '.next/server/src/generated/prisma'),
      path.join(process.cwd(), '.next/server'),
      path.join(process.cwd(), 'src/generated/prisma'),
      path.join(process.cwd(), '.prisma/client'),
      path.join(process.cwd(), '/tmp/prisma-engines')
    ];
    
    console.log('Source directory:', sourceDir);
    
    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error(`Source directory does not exist: ${sourceDir}`);
      console.log('Checking parent directories...');
      
      // List contents of parent directories for debugging
      const parentDir = path.dirname(sourceDir);
      if (fs.existsSync(parentDir)) {
        console.log(`Contents of ${parentDir}:`, fs.readdirSync(parentDir));
      }
      
      return;
    }
    
    // List contents of source directory
    console.log(`Contents of ${sourceDir}:`, fs.readdirSync(sourceDir));
    
    // Find all engine binaries
    const engineFiles = fs.readdirSync(sourceDir).filter(file => 
      file.includes('libquery_engine') || 
      file.includes('engine')
    );
    
    console.log('Found engine files:', engineFiles);
    
    if (engineFiles.length === 0) {
      console.warn('No engine files found in source directory!');
      return;
    }
    
    // Copy to each destination directory
    for (const destDir of destDirs) {
      console.log('Destination directory:', destDir);
      
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        console.log(`Creating directory: ${destDir}`);
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy each engine file
      for (const file of engineFiles) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        
        console.log(`Copying ${sourcePath} to ${destPath}`);
        try {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Successfully copied ${file} to ${destDir}`);
        } catch (error) {
          console.error(`Error copying ${file} to ${destDir}:`, error);
        }
      }
      
      // Verify the files were copied
      if (fs.existsSync(destDir)) {
        console.log(`Contents of ${destDir}:`, fs.readdirSync(destDir));
      }
    }
    
    console.log('Successfully copied Prisma engine files!');
  } catch (error) {
    console.error('Error copying Prisma engines:', error);
    // Don't exit with error code as this should not fail the build
    console.log('Continuing build process despite error...');
  }
}

copyPrismaEngines(); 