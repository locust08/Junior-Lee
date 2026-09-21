/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    const bookingApiPort = process.env.BOOKING_API_PORT || '3001';

    return [
      {
        source: '/api/bookings/:path*',
        destination: `http://127.0.0.1:${bookingApiPort}/api/bookings/:path*`,
      },
      {
        source: '/api/test/:path*',
        destination: `http://127.0.0.1:${bookingApiPort}/api/test/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
