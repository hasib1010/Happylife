
// src/app/api/upload/delete/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getKeyFromUrl, deleteFileFromS3 } from '@/lib/s3';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileUrl } = await request.json();
    
    if (!fileUrl) {
      return NextResponse.json(
        { message: 'No file URL provided' },
        { status: 400 }
      );
    }

    // Verify the file belongs to the user
    // This is a simple check - in production you might want more validation
    const key = getKeyFromUrl(fileUrl);
    if (!key.includes(session.user.id)) {
      return NextResponse.json(
        { message: 'Access denied: Not your file' },
        { status: 403 }
      );
    }

    // Delete file from S3
    await deleteFileFromS3(key);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { message: 'File deletion failed' },
      { status: 500 }
    );
  }
}