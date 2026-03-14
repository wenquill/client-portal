import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      // Google OAuth profile pictures
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Supabase Storage (replace with your project ref if desired)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
