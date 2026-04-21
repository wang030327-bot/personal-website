/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["p1.music.126.net", "p2.music.126.net", "p3.music.126.net", "p4.music.126.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.music.126.net",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
