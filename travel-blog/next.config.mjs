/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export to non-Vercel hosts
  },
};

export default nextConfig;
