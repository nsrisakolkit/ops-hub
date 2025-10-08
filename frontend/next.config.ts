import type { NextConfig } from 'next'

// serverActions: Enables server-side functions that can be called from client components
// bodySizeLimit: '2mb': Sets the maximum size for request bodies to 2 megabytes


// React Strict Mode is a development tool that:

// ✅ Detects side effects in components
// ✅ Warns about deprecated APIs
// ✅ Helps identify unsafe lifecycles
// ✅ Double-invokes functions to catch bugs
// ✅ Only runs in development (not production)

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  reactStrictMode: true,
}
export default nextConfig