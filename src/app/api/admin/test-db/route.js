
// src/app/api/admin/test-db/route.js
import { NextResponse } from 'next/server';
import { connectToMongoose } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Test Mongoose connection
    await connectToMongoose();
    
    // Get connection status
    const status = mongoose.connection.readyState;
    let statusText = '';
    
    switch (status) {
      case 0:
        statusText = 'Disconnected';
        break;
      case 1:
        statusText = 'Connected';
        break;
      case 2:
        statusText = 'Connecting';
        break;
      case 3:
        statusText = 'Disconnecting';
        break;
      default:
        statusText = 'Unknown';
    }
    
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    
    return NextResponse.json({
      success: true,
      message: `Connected to database: ${dbName} (Status: ${statusText})`,
      status: statusText,
      database: dbName
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}