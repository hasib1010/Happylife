// src/app/api/directory/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Service from "@/models/service";
import mongoose from "mongoose";
import { connectDB } from "@/lib/database";

export async function GET(request) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const subscriptionStatus = searchParams.get('subscriptionStatus');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }
    
    console.log("Fetching directory listings with filters:", { 
      providerId, 
      category, 
      status, 
      subscriptionStatus, 
      featured 
    });
    
    // Build query with all possible filters
    const query = {};
    
    // Provider filter
    if (providerId) {
      try {
        if (mongoose.Types.ObjectId.isValid(providerId)) {
          query.$or = [
            { providerId: providerId },                            // String match
            { providerId: new mongoose.Types.ObjectId(providerId) } // ObjectId match
          ];
        } else {
          query.providerId = providerId; // Just use string if not valid ObjectId
        }
      } catch (err) {
        console.error("Error with providerId format:", err);
        query.providerId = providerId; // Fallback to string
      }
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Subscription status filter
    if (subscriptionStatus) {
      query.subscriptionStatus = subscriptionStatus;
    }
    
    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
      // Only show featured listings that haven't expired
      query.featureExpiration = { $gt: new Date() };
    } else if (featured === 'false') {
      query.isFeatured = false;
    }
    
    console.log("Final query:", JSON.stringify(query));
    
    // Fetch directory listings with pagination
    const listings = await Service.find(query)
      .sort({ isFeatured: -1, createdAt: -1 }) // Featured first, then newest
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Service.countDocuments(query);
    
    console.log(`Found ${listings.length} directory listings (total: ${total})`);
    
    return NextResponse.json({
      success: true,
      listings: listings.map(listing => ({
        id: listing._id,
        businessName: listing.businessName || listing.title, // Handle both formats
        category: listing.category,
        subcategory: listing.subcategory,
        logo: listing.logo,
        description: listing.description,
        location: listing.location,
        website: listing.website,
        contact: listing.contact,
        status: listing.status,
        isFeatured: listing.isFeatured,
        subscriptionStatus: listing.subscriptionStatus,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        viewCount: listing.viewCount,
        clickCount: listing.clickCount,
        clickThroughRate: listing.clickThroughRate,
        provider: listing.provider ? {
          id: listing.provider._id,
          name: listing.provider.name,
          email: listing.provider.email,
          profilePicture: listing.provider.profilePicture
        } : null
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching directory listings:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch directory listings", message: error.message },
      { status: 500 }
    );
  }
}