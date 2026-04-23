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
      // Hugging Face Spaces output
      {
        protocol: "https",
        hostname: "**.hf.space",
      },
      {
        protocol: "https",
        hostname: "akhaliq-animeganv2.hf.space",
      },
    ],
  },
};

export default nextConfig;
