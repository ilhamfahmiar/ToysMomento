/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Replicate API output images
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
      },
      // Replicate CDN
      {
        protocol: "https",
        hostname: "**.replicate.com",
      },
    ],
  },
};

export default nextConfig;
