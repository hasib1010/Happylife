// src/app/api/public/services/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/service';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get search params from URL
    const { searchParams } = new URL(request.url);
    
    // Build query object - only show published services for public view
    // Also check for subscription status - only show active or trial listings
    const query = { 
      status: 'published', 
      isActive: true,
      subscriptionStatus: { $in: ['active', 'trial'] }
    };
    
    // Filter by category if provided
    if (searchParams.has('category')) {
      query.category = searchParams.get('category');
    }
    
    // Filter by subcategory if provided
    if (searchParams.has('subcategory')) {
      query.subcategory = searchParams.get('subcategory');
    }
    
    // Enable text search if provided
    if (searchParams.has('search')) {
      const searchTerm = searchParams.get('search');
      // Update text search to include both businessName and description
      query.$text = { $search: searchTerm };
    }
    
    // Support location-based search
    if (searchParams.has('lat') && searchParams.has('lng') && searchParams.has('distance')) {
      const lat = parseFloat(searchParams.get('lat'));
      const lng = parseFloat(searchParams.get('lng'));
      const distance = parseInt(searchParams.get('distance')) || 10; // Default to 10km
      
      // Add geospatial query
      query['location.coordinates'] = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: distance * 1000 // Convert km to meters
        }
      };
    }
    
    // Filter for remote services only
    if (searchParams.has('remote') && searchParams.get('remote') === 'true') {
      query['location.isRemote'] = true;
    }
    
    // Get pagination params
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;
    
    // Handle sorting
    let sortOptions = {};
    
    // Featured services always at the top, but only if feature hasn't expired
    sortOptions.isFeatured = -1;
    
    if (searchParams.has('sort')) {
      const sortParam = searchParams.get('sort');
      
      switch (sortParam) {
        case 'popular':
          sortOptions.viewCount = -1;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        case 'oldest':
          sortOptions.createdAt = 1;
          break;
        case 'alphabetical':
          // Sort by businessName first, fallback to title for backward compatibility
          sortOptions.businessName = 1;
          sortOptions.title = 1;
          break;
        default:
          // Default to newest
          sortOptions.createdAt = -1;
      }
    } else {
      // Default sort by newest after featured
      sortOptions.createdAt = -1;
    }
    
    // Current date for checking featured status
    const now = new Date();
    
    // Add filter to only show listings with valid feature expiration
    const featuredQuery = {
      ...query,
      isFeatured: true, 
      featureExpiration: { $gt: now }
    };
    
    // Execute query with pagination
    const services = await Service.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'provider',
        select: 'name email profilePicture businessName'
      });
    
    // Get total count for pagination
    const totalServices = await Service.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalServices / limit);
    
    // Increment view count for each service viewed in list
    await Promise.all(
      services.map(service => 
        Service.updateOne(
          { _id: service._id },
          { $inc: { viewCount: 0.1 } }
        )
      )
    );
    
    // Extract unique categories for filter options
    const categories = await Service.distinct('category', { 
      status: 'published', 
      isActive: true,
      subscriptionStatus: { $in: ['active', 'trial'] }
    });
    
    // Get featured services count
    const featuredCount = await Service.countDocuments(featuredQuery);
    
    // Transform services to match directory model
    const transformedServices = services.map(service => {
      // Convert service document to plain object
      const serviceObj = service.toObject();
      
      return {
        id: serviceObj._id,
        businessName: serviceObj.businessName || serviceObj.title,
        description: serviceObj.description,
        category: serviceObj.category,
        subcategory: serviceObj.subcategory,
        logo: serviceObj.logo || (serviceObj.images && serviceObj.images.length > 0 ? serviceObj.images[0] : null),
        coverImage: serviceObj.coverImage,
        contact: serviceObj.contact || {
          email: serviceObj.provider?.email || '',
          phone: '',
          alternatePhone: ''
        },
        website: serviceObj.website || '',
        socialMedia: serviceObj.socialMedia || {},
        location: serviceObj.location,
        businessHours: serviceObj.businessHours || [],
        features: serviceObj.features || [],
        isFeatured: serviceObj.isFeatured && serviceObj.featureExpiration && new Date(serviceObj.featureExpiration) > now,
        featureExpiration: serviceObj.featureExpiration,
        viewCount: serviceObj.viewCount || 0,
        clickCount: serviceObj.clickCount || 0,
        provider: serviceObj.provider ? {
          id: serviceObj.provider._id,
          name: serviceObj.provider.name,
          businessName: serviceObj.provider.businessName,
          profilePicture: serviceObj.provider.profilePicture
        } : null,
        createdAt: serviceObj.createdAt,
        updatedAt: serviceObj.updatedAt
      };
    });
    
    return NextResponse.json({
      services: transformedServices,
      categories,
      filters: {
        featuredCount
      },
      pagination: {
        total: totalServices,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching directory listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch directory listings', message: error.message },
      { status: 500 }
    );
  }
}