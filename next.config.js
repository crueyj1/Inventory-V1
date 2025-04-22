/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['jqqetydqvndhjcnefjic.supabase.co'], // Add if you use Supabase storage
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
