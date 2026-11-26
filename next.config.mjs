/** @type {import("next").NextConfig} */
const nextConfig = {
  // Static editorial manual served from public/ ahead of Next.js routing.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/index.html",
        },
      ],
    }
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/assets/framerusercontent.com/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/assets/framerusercontent.com/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/fonts.gstatic.com/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/framerusercontent.com/sites/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/crema-living.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/crema-living.css",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/downloads/crema-logo-kit.zip",
        headers: [
          { key: "Content-Type", value: "application/zip" },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="crema-logo-kit.zip"',
          },
        ],
      },
      {
        source: "/downloads/crema-design-tokens.zip",
        headers: [
          { key: "Content-Type", value: "application/zip" },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="crema-design-tokens.zip"',
          },
        ],
      },
      {
        source: "/downloads/crema-colour-production-sheet.pdf",
        headers: [
          { key: "Content-Type", value: "application/pdf" },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="crema-colour-production-sheet.pdf"',
          },
        ],
      },
    ]
  },
}

export default nextConfig
