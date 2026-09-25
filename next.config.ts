import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: { "/**": ["./src/fonts/og/**/*", "./drizzle/**/*"] },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/today", destination: "/lottery-sambad-today", permanent: true },
      { source: "/1pm", destination: "/lottery-sambad-1pm-result", permanent: true },
      { source: "/6pm", destination: "/lottery-sambad-6pm-result", permanent: true },
      { source: "/8pm", destination: "/lottery-sambad-8pm-result", permanent: true },
      { source: "/yesterday", destination: "/lottery-sambad-yesterday-result", permanent: true },
    ];
  },
};

export default nextConfig;
