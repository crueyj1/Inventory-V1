/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable server components for this version
  experimental: {
    appDir: true,
  }
};

module.exports = nextConfig;
