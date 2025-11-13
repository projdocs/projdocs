/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  reactStrictMode: false,
  output: "standalone"
}

export default nextConfig
