/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'polymarket-upload.s3.us-east-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'polymarket.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.polymarket.com',
      },
      {
        protocol: 'https',
        hostname: 'images.polymarket.com',
      },
      {
        protocol: 'https',
        hostname: 'kalshi.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.kalshi.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.kalshi.com',
      },
    ],
  },
};

export default nextConfig;
