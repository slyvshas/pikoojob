import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Add Supabase storage hostnames if you plan to use Supabase Storage for avatars
      // Example: ppdprbmlnxntojwjjkbu.supabase.co (your project ref)
      {
        protocol: 'https',
        hostname: 'ppdprbmlnxntojwjjkbu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
       // Allow avatars from GitHub
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
