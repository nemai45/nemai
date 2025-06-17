import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "ftqdfdhxdtekgjxrlggp.supabase.co",
      },
      {
        hostname: "res.cloudinary.com",
      }
    ],
    qualities: [100],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
