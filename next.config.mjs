/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@inventorypro/types", "@inventorypro/validators"],
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
