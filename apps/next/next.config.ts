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
  i18n: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
    domains: [
      {
        domain: 'example.ru',
        defaultLocale: 'ru',
      }
    ],
  },
};

export default nextConfig;
