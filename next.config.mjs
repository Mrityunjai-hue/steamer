/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./prisma/steamer.db', './steamer.db'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.cloudflare.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'shared.cloudflare.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'media.steampowered.com',
      },
      {
        protocol: 'https',
        hostname: 'shared.akamai.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.akamai.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'steamcdn-a.akamaihd.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

