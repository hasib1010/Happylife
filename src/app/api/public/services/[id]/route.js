// src/app/api/public/services/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/service';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const serviceId = params.id;
    console.log('Fetching directory listing details:', serviceId);
    
    // Fetch the service with population
    const service = await Service.findById(serviceId)
      .populate({
        path: 'provider',
        select: 'name profilePicture businessName email phoneNumber bio'
      });
    
    if (!service) {
      console.log('Directory listing not found');
      return NextResponse.json({ error: 'Directory listing not found' }, { status: 404 });
    }
    
    // Only published and active services with valid subscription are visible to public
    if (service.status !== 'published' || !service.isActive || 
        !['active', 'trial'].includes(service.subscriptionStatus)) {
      console.log('Directory listing not available:', {
        status: service.status,
        isActive: service.isActive,
        subscriptionStatus: service.subscriptionStatus
      });
      return NextResponse.json({ error: 'Directory listing not available' }, { status: 403 });
    }
    
    // Track view count
    await Service.updateOne(
      { _id: serviceId },
      { $inc: { viewCount: 1 } }
    );
    console.log('Incremented view count');
    
    // Find related listings in the same category
    const relatedServices = await Service.find({
      _id: { $ne: serviceId },
      category: service.category,
      status: 'published',
      isActive: true,
      subscriptionStatus: { $in: ['active', 'trial'] }
    })
    .sort({ isFeatured: -1, viewCount: -1 }) // Featured first, then most viewed
    .limit(3)
    .select('businessName title logo images category contact')
    .populate({
      path: 'provider',
      select: 'name businessName profilePicture'
    });
    
    console.log(`Found ${relatedServices.length} related listings`);
    
    // Check if this listing is featured with a valid expiration date
    const now = new Date();
    const isFeatured = service.isFeatured && 
                      service.featureExpiration && 
                      new Date(service.featureExpiration) > now;
    
    // Transform to directory listing format
    const transformedService = {
      id: service._id,
      businessName: service.businessName || service.title,
      description: service.description,
      category: service.category,
      subcategory: service.subcategory,
      logo: service.logo || (service.images && service.images.length > 0 ? service.images[0] : null),
      coverImage: service.coverImage,
      contact: service.contact || {
        email: service.provider?.email || '',
        phone: service.provider?.phoneNumber || '',
        alternatePhone: ''
      },
      website: service.website || '',
      socialMedia: service.socialMedia || {},
      location: service.location,
      businessHours: service.businessHours || [],
      features: service.features || [],
      faqs: service.faqs || [],
      tags: service.tags || [],
      isFeatured: isFeatured,
      featureExpiration: isFeatured ? service.featureExpiration : null,
      viewCount: service.viewCount || 0,
      clickCount: service.clickCount || 0,
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      provider: service.provider ? {
        id: service.provider._id,
        name: service.provider.name,
        businessName: service.provider.businessName,
        profilePicture: service.provider.profilePicture,
        email: service.provider.email,
        bio: service.provider.bio
      } : null
    };
    
    // Transform related listings
    const transformedRelated = relatedServices.map(related => ({
      id: related._id,
      businessName: related.businessName || related.title,
      category: related.category,
      logo: related.logo || (related.images && related.images.length > 0 ? related.images[0] : null),
      contact: related.contact || {},
      provider: related.provider ? {
        name: related.provider.name,
        businessName: related.provider.businessName,
        profilePicture: related.provider.profilePicture
      } : null
    }));
    
    // Format the response
    const response = {
      service: transformedService,
      relatedServices: transformedRelated
    };
    
    console.log('Successfully retrieved directory listing details');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching directory listing details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch directory listing details', message: error.message },
      { status: 500 }
    );
  }
}