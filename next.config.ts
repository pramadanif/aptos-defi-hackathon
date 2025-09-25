import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg'],
  // Vercel configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: ['img.freepik.com', 'images.unsplash.com', 'plus.unsplash.com'],
  }
};

export default nextConfig;
