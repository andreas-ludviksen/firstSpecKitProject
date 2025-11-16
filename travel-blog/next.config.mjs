/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for production deployment to Cloudflare Pages
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
