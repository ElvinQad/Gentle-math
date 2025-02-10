import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/trends/**',
      },
      {
        protocol: 'https',
        hostname: '**', // For other external URLs
      },
    ],
  },
  // i18n: {
  //   locales: ['en', 'ru'],
  //   defaultLocale: 'en',
  //   domains: [
  //     {
  //       domain: 'example.ru',
  //       defaultLocale: 'ru',
  //     },
  //   ],
  // },
};

export default nextConfig;
