import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // External packages that should not be bundled by Next.js
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Workaround for Prisma compatibility with Vercel
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add the Prisma folder to webpack's file watching
      config.watchOptions = config.watchOptions || {};
      
      // Ensure ignored is an array before spreading
      const ignoredPaths = Array.isArray(config.watchOptions.ignored) 
        ? config.watchOptions.ignored 
        : [];
      
      config.watchOptions.ignored = [
        ...ignoredPaths,
        '!**/node_modules/.prisma/**'
      ];
    }
    return config;
  },
};

export default nextConfig;
