// src/app/api/directory/create/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Service from "@/models/service";
import { connectDB } from "@/lib/database";
import { z } from "zod";
import mongoose from "mongoose";

// Schema for directory listing validation
const directorySchema = z.object({
  businessName: z
    .string()
    .min(1, { message: 'Business name is required' })
    .max(100, { message: 'Business name must be less than 100 characters' }),
  description: z
    .string()
    .min(1, { message: 'Description is required' })
    .max(2000, { message: 'Description must be less than 2000 characters' }),
  category: z.string().min(1, { message: 'Category is required' }),
  subcategory: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),

  contact: z.object({
    email: z.string().email({ message: 'Valid email is required' }),
    phone: z.string().optional().nullable().or(z.literal('')),
    alternatePhone: z.string().optional().nullable().or(z.literal('')),
  }),

  website: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),

  socialMedia: z.object({
    facebook: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),
    twitter: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),
    instagram: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),
    linkedin: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),
    youtube: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),
    tiktok: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),
    pinterest: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable().or(z.literal('')),
    other: z.array(z.object({
      platform: z.string().min(1, { message: 'Platform name is required' }),
      url: z.string().url({ message: 'Please enter a valid URL' }),
    })).optional().default([]),
  }),

  location: z.object({
    coordinates: z.array(z.number()).optional().nullable(),
    address: z.object({
      street: z.string().optional().nullable().or(z.literal('')),
      city: z.string().optional().nullable().or(z.literal('')),
      state: z.string().optional().nullable().or(z.literal('')),
      zipCode: z.string().optional().nullable().or(z.literal('')),
      country: z.string().optional().nullable().or(z.literal('')),
    }),
    isRemote: z.boolean().default(false),
  }),

  businessHours: z.array(z.object({
    day: z.number().min(0).max(6),
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format" }),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format" }),
    isClosed: z.boolean().default(false),
  })).optional().default([]),

  features: z.array(z.string())
    .transform(features => features.filter(f => typeof f === 'string' && f.trim() !== ''))
    .default([''])
    .refine(features => features.length > 0, {
      message: 'At least one business feature is required'
    }),

  faqs: z.array(
    z.object({
      question: z.string().min(1, { message: 'Question is required' }),
      answer: z.string().min(1, { message: 'Answer is required' }),
    })
  ).default([]),

  tags: z.array(z.string()).default([]),

  // Subscription related fields
  subscriptionStatus: z.enum(['active', 'expired', 'canceled', 'trial']).default('trial'),
  subscriptionStartDate: z.date().or(z.string().transform(str => new Date(str))).default(new Date()),
  subscriptionEndDate: z.date().or(z.string().transform(str => new Date(str))).optional().nullable(),

  // Visibility controls
  isFeatured: z.boolean().default(false),
  featureExpiration: z.date().or(z.string().transform(str => new Date(str))).optional().nullable(),
  status: z.enum(['draft', 'published', 'suspended']).default('published'),
  isActive: z.boolean().default(true),
});

export async function POST(request) {
  await connectDB();

  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", session.user.email);

    // Parse request data
    const data = await request.json();
    console.log("Received data:", JSON.stringify(data).substring(0, 200) + "...");

    try {
      // Validate data against schema
      console.log("Validating data...");
      const validatedData = directorySchema.parse(data);
      console.log("Data validated successfully");

      // Format location for MongoDB
      const location = {
        ...(validatedData.location || {}),
      };

      // Only add type and coordinates if coordinates exist and are valid
      if (Array.isArray(validatedData.location?.coordinates) &&
        validatedData.location.coordinates.length === 2) {
        location.type = 'Point';
      }

      const featureExpiration = null;

      // Convert business hours to availability format for backward compatibility
      const availabilityData = {
        daysOfWeek: validatedData.businessHours
          .filter(hour => !hour.isClosed)
          .map(hour => hour.day),
        timeSlots: validatedData.businessHours
          .filter(hour => !hour.isClosed)
          .map(hour => ({
            startTime: hour.open,
            endTime: hour.close
          })),
        exceptions: []
      };

      // Create the directory listing
      console.log("Creating new directory listing...");

      const newListing = await Service.create({
        providerId: mongoose.Types.ObjectId.isValid(session.user.id)
          ? new mongoose.Types.ObjectId(session.user.id)
          : session.user.id,

        // For backward compatibility with Service model
        title: validatedData.businessName, // Use businessName as title
        price: 0, // Set a default price of 0
        pricingType: 'fixed',
        priceUnit: 'USD',
        isHighlighted: validatedData.isFeatured, // Map isFeatured to isHighlighted

        // Core business info
        businessName: validatedData.businessName,
        description: validatedData.description,
        category: validatedData.category,
        subcategory: validatedData.subcategory || null,

        // Media
        logo: validatedData.logo || null,
        coverImage: validatedData.coverImage || null,
        images: validatedData.logo ? [validatedData.logo] : [], // Use logo as first image for backward compatibility

        // Contact info
        contact: {
          email: validatedData.contact.email,
          phone: validatedData.contact.phone || null,
          alternatePhone: validatedData.contact.alternatePhone || null,
        },

        // Web presence
        website: validatedData.website || null,
        socialMedia: {
          facebook: validatedData.socialMedia.facebook || null,
          twitter: validatedData.socialMedia.twitter || null,
          instagram: validatedData.socialMedia.instagram || null,
          linkedin: validatedData.socialMedia.linkedin || null,
          youtube: validatedData.socialMedia.youtube || null,
          tiktok: validatedData.socialMedia.tiktok || null,
          pinterest: validatedData.socialMedia.pinterest || null,
          other: validatedData.socialMedia.other || [],
        },

        // Location
        location: location,

        // Hours - store in both formats for compatibility
        businessHours: validatedData.businessHours,
        availability: availabilityData,

        // Additional info
        features: validatedData.features,
        faqs: validatedData.faqs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        })),
        tags: validatedData.tags,

        // Subscription and visibility
        subscriptionStatus: validatedData.subscriptionStatus,
        subscriptionStartDate: validatedData.subscriptionStartDate,
        subscriptionEndDate: validatedData.subscriptionEndDate,
        status: validatedData.status,
        isActive: validatedData.isActive,
        isFeatured: false,  
        featureExpiration: null,

        // Default fields required by Service model
        bookingLeadTime: 24,
        cancellationPolicy: 'moderate',

        // Initialize analytics
        viewCount: 0,
        clickCount: 0,
        clickThroughRate: 0,
        bookingCount: 0,

        // Initialize ratings (even though not used)
        ratings: {
          average: 0,
          count: 0
        },
        reviews: []
      });

      console.log("Directory listing created successfully with ID:", newListing._id);

      // Return the created listing
      return NextResponse.json({
        success: true,
        message: "Directory listing created successfully",
        listing: {
          id: newListing._id,
          businessName: newListing.businessName,
          status: newListing.status,
          subscriptionStatus: newListing.subscriptionStatus
        }
      });
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationError.errors || validationError.message
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error creating directory listing:", error);

    return NextResponse.json(
      { error: "Failed to create directory listing", message: error.message },
      { status: 500 }
    );
  }
}