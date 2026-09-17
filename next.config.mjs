const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;
const mediaBase = mediaUrl ? new URL(mediaUrl) : null;
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: mediaBase
      ? [
          {
            protocol: mediaBase.protocol.slice(0, -1),
            hostname: mediaBase.hostname,
            port: mediaBase.port,
            pathname: mediaBase.pathname.replace(/\/$/, "") + "/**",
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
