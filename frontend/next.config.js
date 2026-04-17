/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Add these for better image handling
    unoptimized: false,
    domains: ['res.cloudinary.com'],
  },
  // Ensure trailing slashes don't break images
  trailingSlash: false,
}

module.exports = nextConfig