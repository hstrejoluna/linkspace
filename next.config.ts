import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  experimental: {
    // This ensures Prisma's query engine is properly handled
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
