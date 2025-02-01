import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    // Optional: You can also use remotePatterns for more secure configuration
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'images.unsplash.com',
    //     pathname: '/**',
    //   },
    // ],
  },
};

export default nextConfig;
