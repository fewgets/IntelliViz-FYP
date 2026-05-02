/** @type {import('next').NextConfig} */
let withBundleAnalyzer = (config) => config;

try {
  // Optional in local setups; enabled with ANALYZE=true
  withBundleAnalyzer = (await import("@next/bundle-analyzer")).default({
    enabled: process.env.ANALYZE === "true",
  });
} catch {
  withBundleAnalyzer = (config) => config;
}

const nextConfig = {
  allowedDevOrigins: ["http://10.73.20.100:3000", "10.73.20.100"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  turbopack: {
    root: '.',
  },
}

export default withBundleAnalyzer(nextConfig)
