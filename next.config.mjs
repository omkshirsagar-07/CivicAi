/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep native server libraries out of the bundler's graph — they are
  // resolved from node_modules at runtime inside Route Handlers.
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;
