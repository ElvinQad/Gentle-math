import type { Configuration } from 'webpack';

const path = require('path');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  images: {
    domains: ['*'], // Allow all domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all HTTP domains
        pathname: '/**',
      }
    ],
    minimumCacheTTL: 60,
  },
  // i18n: {
  //   locales: ['en', 'ru'],
  //   defaultLocale: 'en',
  // },
  webpack: (config: Configuration) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default config;


