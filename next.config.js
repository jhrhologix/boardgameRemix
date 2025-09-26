/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002', 'localhost:3003', 'localhost:3004'],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Allow our own API routes for BGG images
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/bgg-image/**',
      },
      // Allow Cloudinary images
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dmp6byebm/image/upload/**',
      },
    ],
    unoptimized: false, // Enable optimization for our API images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
}

module.exports = nextConfig 