// src/app/api/public/profile/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Service from '@/models/service';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const userId = params.id;
    console.log('Fetching public profile for user:', userId);
    
    // Fetch user with selected fields only (exclude sensitive information)
    const user = await User.findById(userId).select(
      'name email profilePicture bio phoneNumber address businessName businessDescription categories role createdAt updatedAt'
    );
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Only allow viewing public profiles of providers and sellers
    if (!['provider', 'seller'].includes(user.role)) {
      console.log('User is not a provider or seller');
      return NextResponse.json({ error: 'Profile not available' }, { status: 403 });
    }
    
    // Fetch services/listings associated with this user
    const services = await Service.find({
      provider: userId,
      status: 'published',
      isActive: true,
      // Only include services with active subscriptions
      subscriptionStatus: { $in: ['active', 'trial'] }
    })
    .select('_id title businessName logo coverImage category subcategory description isFeatured featureExpiration')
    .sort({ isFeatured: -1, createdAt: -1 }) // Featured first, then newest
    .limit(6); // Limit to 6 services
    
    console.log(`Found ${services.length} active services for user`);
    
    // Check if featured listings have valid expiration
    const now = new Date();
    const transformedServices = services.map(service => {
      const serviceObj = service.toObject();
      serviceObj.id = serviceObj._id;
      delete serviceObj._id;
      
      // Check if featured with valid expiration
      serviceObj.isFeatured = service.isFeatured && 
                        service.featureExpiration && 
                        new Date(service.featureExpiration) > now;
      
      return serviceObj;
    });
    
    // Format the response
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      address: user.address,
      businessName: user.businessName,
      businessDescription: user.businessDescription,
      categories: user.categories,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    console.log('Successfully retrieved public profile');
    return NextResponse.json({
      user: responseUser,
      services: transformedServices
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', message: error.message },
      { status: 500 }
    );
  }
}