// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      `${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
      'happylife.service.s3.ap-southeast-2.amazonaws.com',
      'lh3.googleusercontent.com', // For Google profile pictures
    ],
  }, 
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;