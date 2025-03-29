// API Path: /api/admin/subscriptions
// File Path: src/app/api/admin/subscriptions/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Subscription from '@/models/subscription';
import User from '@/models/user';

export async function GET(request) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    
    // Calculate offset
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Add status filter if provided and not 'all'
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Build pipeline for aggregation
    const pipeline = [
      // Match stage (filtering)
      { $match: query },
      
      // Lookup user data (join with users collection)
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      
      // Unwind user array (created by lookup)
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Add search filter if provided
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { 'user.name': { $regex: search, $options: 'i' } },
                  { 'user.email': { $regex: search, $options: 'i' } },
                  { 'stripeSubscriptionId': { $regex: search, $options: 'i' } }
                ]
              }
            }
          ]
        : []),
      
      // Sort by creation date
      { $sort: { createdAt: -1 } },
      
      // Skip and limit for pagination
      { $skip: skip },
      { $limit: limit },
      
      // Project fields to return
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          stripeSubscriptionId: 1,
          stripePriceId: 1,
          currentPeriodStart: 1,
          currentPeriodEnd: 1,
          cancelAtPeriodEnd: 1,
          canceledAt: 1,
          createdAt: 1,
          updatedAt: 1,
          userName: '$user.name',
          userEmail: '$user.email',
          userRole: '$user.role'
        }
      }
    ];
    
    // Execute aggregation pipeline
    const subscriptions = await Subscription.aggregate(pipeline);
    
    // Count total documents for pagination
    const countPipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { 'user.name': { $regex: search, $options: 'i' } },
                  { 'user.email': { $regex: search, $options: 'i' } },
                  { 'stripeSubscriptionId': { $regex: search, $options: 'i' } }
                ]
              }
            }
          ]
        : []),
      { $count: 'total' }
    ];
    
    const countResult = await Subscription.aggregate(countPipeline);
    const totalSubscriptions = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalSubscriptions / limit);
    
    return NextResponse.json({
      success: true,
      subscriptions,
      currentPage: page,
      totalPages,
      totalSubscriptions
    });
    
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}