/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@packages/ui"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  reactStrictMode: false,
  output: "standalone",
};

export default nextConfig
