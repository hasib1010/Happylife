// src/app/api/upload/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { uploadFileToS3, getKeyFromUrl, deleteFileFromS3 } from '@/lib/s3';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has active subscription for certain file types
    if (['provider', 'product', 'blog', 'certification'].includes(fileType) && 
        session.user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { message: 'Active subscription required' },
        { status: 403 }
      );
    }

    // Access form data with formData()
    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('fileType') || 'general';
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert FormData file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const mimetype = file.type;

    // Create file object for S3 upload
    const fileObject = {
      buffer,
      name: filename,
      mimetype
    };

    // Upload to S3
    const fileUrl = await uploadFileToS3(fileObject, session.user.id, fileType);

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        type: mimetype,
        name: filename,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'File upload failed' },
      { status: 500 }
    );
  }
}
