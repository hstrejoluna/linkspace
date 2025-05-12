import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // This is needed for Prisma to work properly in Vercel
  outputFileTracing: true,
  experimental: {
    // This ensures Prisma's query engine is properly handled
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
