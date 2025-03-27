// src/app/api/services/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Service from '@/models/service';
import User from '@/models/user';

// DELETE service by ID
export async function DELETE(request, { params }) {
    try {
        // Get authenticated user
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'You must be signed in to delete a service' },
                { status: 401 }
            );
        }

        await dbConnect();

        const serviceId = params.id;
        console.log(`Attempting to delete service with ID: ${serviceId}`);

        // Find the service to delete
        const service = await Service.findById(serviceId);

        if (!service) {
            console.log('Service not found');
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            );
        }

        // Check if user is authorized to delete this service
        // Allow if user is the provider or an admin
        const isOwner = service.provider &&
            (service.provider.toString() === session.user.id ||
                service.provider._id?.toString() === session.user.id ||
                service.provider === session.user.id);
        const isAdmin = session.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            console.log('Unauthorized deletion attempt');
            return NextResponse.json(
                { error: 'You are not authorized to delete this service' },
                { status: 403 }
            );
        }

        // Delete the service
        const deletedService = await Service.findByIdAndDelete(serviceId);

        if (!deletedService) {
            return NextResponse.json(
                { error: 'Failed to delete service' },
                { status: 500 }
            );
        }

        console.log(`Service deleted successfully: ${serviceId}`);

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Service deleted successfully',
            serviceId
        });

    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json(
            { error: 'Failed to delete service', message: error.message },
            { status: 500 }
        );
    }
}

// GET service by ID
export async function GET(request, { params }) {
    try {
        await dbConnect();

        const serviceId = params.id;
        console.log(`Fetching service details for ID: ${serviceId}`);

        // Find the service
        const service = await Service.findById(serviceId)
            .populate({
                path: 'provider',
                select: 'name profilePicture businessName email'
            });

        if (!service) {
            console.log('Service not found');
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            );
        }

        // Return the service data
        return NextResponse.json({
            service: {
                id: service._id,
                businessName: service.businessName || service.title,
                description: service.description,
                category: service.category,
                subcategory: service.subcategory,
                logo: service.logo,
                coverImage: service.coverImage,
                images: service.images,
                contact: service.contact,
                website: service.website,
                socialMedia: service.socialMedia,
                location: service.location,
                businessHours: service.businessHours,
                features: service.features,
                faqs: service.faqs,
                tags: service.tags,
                status: service.status,
                isFeatured: service.isFeatured,
                featureExpiration: service.featureExpiration,
                subscriptionStatus: service.subscriptionStatus,
                viewCount: service.viewCount,
                clickCount: service.clickCount,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
                provider: service.provider
            }
        });

    } catch (error) {
        console.error('Error fetching service details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service details', message: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'You must be signed in to update a service' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fix: Properly await the params object before accessing its properties
        const params = await context.params;
        const serviceId = params.id;
        console.log(`Attempting to update service with ID: ${serviceId}`);

        // Find the service to update
        const existingService = await Service.findById(serviceId);

        if (!existingService) {
            console.log('Service not found');
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            );
        }

        // Check if user is authorized to update this service
        // Allow if user is the provider or an admin
        const isOwner = existingService.provider &&
            (existingService.provider.toString() === session.user.id ||
                existingService.provider._id?.toString() === session.user.id ||
                existingService.provider === session.user.id);
        const isAdmin = session.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            console.log('Unauthorized update attempt');
            return NextResponse.json(
                { error: 'You are not authorized to update this service' },
                { status: 403 }
            );
        }

        // Parse the request body
        const updateData = await request.json();
        console.log('Update data received:', JSON.stringify(updateData).substring(0, 200) + '...');

        // Fields that are allowed to be updated
        const allowedFields = [
            'businessName',
            'description',
            'category',
            'subcategory',
            'logo',
            'coverImage',
            'contact',
            'website',
            'socialMedia',
            'location',
            'businessHours',
            'features',
            'faqs',
            'tags',
            'status'
        ];

        // Create an update object with only allowed fields
        const updateObj = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateObj[field] = updateData[field];
            }
        });

        // Additional validation for status changes
        if (updateObj.status && updateObj.status !== existingService.status) {
            console.log(`Status change requested: ${existingService.status} -> ${updateObj.status}`);

            // If moving to published, set publishedAt date
            if (updateObj.status === 'published' && !existingService.publishedAt) {
                updateObj.publishedAt = new Date();
            }
        }

        // Special handling for specific fields
        if (updateObj.features) {
            // Remove empty features
            updateObj.features = updateObj.features.filter(f => f && f.trim() !== '');
        }

        if (updateObj.faqs) {
            // Remove empty FAQs
            updateObj.faqs = updateObj.faqs.filter(
                faq => faq.question && faq.question.trim() !== '' &&
                    faq.answer && faq.answer.trim() !== ''
            );
        }

        // If location is defined, ensure coordinates are properly formatted
        if (updateObj.location) {
            if (!updateObj.location.coordinates) {
                updateObj.location.coordinates = undefined;
            }
        }

        // Special handling for socialMedia URLs (clean up empty values)
        if (updateObj.socialMedia) {
            const socialMedia = updateObj.socialMedia;

            // Convert empty strings to undefined for cleaner storage
            for (const platform of ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest']) {
                if (socialMedia[platform] === '') {
                    socialMedia[platform] = undefined;
                }
            }

            // Filter out empty entries in the "other" array
            if (Array.isArray(socialMedia.other)) {
                socialMedia.other = socialMedia.other.filter(
                    item => item && item.platform && item.platform.trim() !== '' &&
                        item.url && item.url.trim() !== ''
                );
            }
        }

        // Clean up website field if it's an empty string
        if (updateObj.website === '') {
            updateObj.website = undefined;
        }

        // Update the service
        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            { $set: updateObj },
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return NextResponse.json(
                { error: 'Failed to update service' },
                { status: 500 }
            );
        }

        console.log(`Service updated successfully: ${serviceId}`);

        // Return success response with updated service data
        return NextResponse.json({
            success: true,
            message: 'Service updated successfully',
            service: {
                id: updatedService._id,
                businessName: updatedService.businessName || updatedService.title,
                status: updatedService.status,
                category: updatedService.category,
                updatedAt: updatedService.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json(
            { error: 'Failed to update service', message: error.message },
            { status: 500 }
        );
    }
}