import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jqwqgiqfvjdxaohzvjuv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Allow large HEIC/RAW file uploads to the image API route (up to 25MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const rules: any[] = [];

    if (isProd) {
      rules.push({
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      });
    }

    rules.push(
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/cart',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/checkout',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/account/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/:path((?!api|_next|static|fonts|cart|checkout|account).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=600',
          },
        ],
      },
    );

    return rules;
  },
  async redirects() {
    return [
      {
        source: '/adim',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/admi',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/admn',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/adminn',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
