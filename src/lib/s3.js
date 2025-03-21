// src/lib/s3.js
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Generate a unique filename with a timestamp and random string
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const fileExtension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${fileExtension}`;
};

// Get S3 key based on file type and user ID
const getS3Key = (userId, fileType, fileName) => {
  const folders = {
    'profile': `users/${userId}/profile`,
    'provider': `providers/${userId}`,
    'product': `products/${userId}`,
    'blog': `blogs/${userId}`,
    'certification': `providers/${userId}/certifications`,
  };
  
  const folder = folders[fileType] || 'uploads';
  return `${folder}/${fileName}`;
};

// Upload a file to S3
export const uploadFileToS3 = async (file, userId, fileType) => {
  try {
    const uniqueFileName = generateUniqueFileName(file.name);
    const key = getS3Key(userId, fileType, uniqueFileName);
    
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
  }
};

// Get a presigned URL for temporary access to a file
export const getPresignedUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    // URL expires in 1 hour (3600 seconds)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate file access URL');
  }
};

// Delete a file from S3
export const deleteFileFromS3 = async (key) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
};

// Extract key from S3 URL
export const getKeyFromUrl = (url) => {
  const urlObj = new URL(url);
  // The key is the path without the leading slash
  return urlObj.pathname.slice(1);
};
 