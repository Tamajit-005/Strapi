import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // The wasm route reads this file with fs at request time. Next's file tracer
  // cannot see a path built from process.cwd(), so name it explicitly or the
  // deployed function ships without it.
  outputFileTracingIncludes: {
    "/dotlottie/player-wasm": ["./src/dotlottie/player.wasm.br"],
  },

  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    // Later rules win on duplicate keys, so the catch-all comes first and the
    // specific rules after it.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=259200, stale-while-revalidate=86400" },
          ...security,
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      // Loader player + animation: versioned assets, keep them out of the
      // 3-day HTML cache and let the CDN hold them for a week. The wasm module
      // never changes under this path, so it can be cached forever. The
      // immutable rule must come after the wildcard or the wildcard wins.
      {
        source: "/dotlottie/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=604800, stale-while-revalidate=2592000" },
        ],
      },
      {
        source: "/dotlottie/player-wasm",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/loaders/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=604800, stale-while-revalidate=2592000" },
        ],
      },
    ];
  },
};

export default nextConfig;
