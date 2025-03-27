// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'happylife.service.s3.ap-southeast-2.amazonaws.com',
        pathname: '/products/**',
      },
    ],
  },
};

export default nextConfig;