import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    // This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // This is needed for Prisma to work properly in Vercel
  outputFileTracing: true,
  // Optimize output trace to exclude unnecessary files
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild-linux-64/bin',
    ],
  },
  // Include Prisma binaries in the trace
  outputFileTracingIncludes: {
    '*': ['node_modules/.prisma/**/*', 'src/generated/prisma/**/*'],
  },
  // This ensures Prisma's query engine is properly handled
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add the Prisma folder to webpack's file watching
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [...(config.watchOptions?.ignored || []), '!**/node_modules/.prisma/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
