/** @type {import('next').NextConfig} */

// Content-Security-Policy. Everything the app needs is self-hosted (Next/font,
// Recharts, Radix, inline SVG logo), profile pictures are data: URLs, and there
// are no third-party client scripts, so a tight policy works. `'unsafe-inline'`
// on script-src is required for Next's inline bootstrap; the other directives
// still block clickjacking, base-tag injection, plugins and cross-origin posts.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  // Allow Stripe Checkout / Customer Portal as form-submission redirect targets.
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "object-src 'none'",
]
  .join("; ")
  .concat(";");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
