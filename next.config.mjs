// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'happylife.service.s3.ap-southeast-2.amazonaws.com',
        pathname: '/**', // Accept ALL images from this hostname
      },
      {
        protocol: 'https',
        hostname: 's3.ap-southeast-2.amazonaws.com',
        pathname: '/**', // Accept ALL images from this hostname
      },
    ],
  },
};

export default nextConfig;