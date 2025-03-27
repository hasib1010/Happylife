'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

// UI Components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import {
    Plus,
    Trash2,
    MapPin,
    Clock,
    Camera,
    XCircle,
    Loader2,
    Upload,
    Info,
    Link as LinkIcon,
    Building,
    MessageSquare,
    Star,
    Check,
    X,
    ArrowLeft,
    Save
} from 'lucide-react';

import { cn } from '@/lib/utils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Schema for directory listing form validation
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
    subcategory: z.string().optional(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    contact: z.object({
        email: z.string().email({ message: 'Valid email is required' }),
        phone: z.string().optional(),
        alternatePhone: z.string().optional(),
    }),
    website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    socialMedia: z.object({
        facebook: z.union([
            z.string().url({ message: 'Please enter a valid URL' }),
            z.string().length(0),
            z.string().optional()
        ]),
        twitter: z.union([
            z.string().url({ message: 'Please enter a valid URL' }),
            z.string().length(0),
            z.string().optional()
        ]),
        instagram: z.union([
            z.string().url({ message: 'Please enter a valid URL' }),
            z.string().length(0),
            z.string().optional()
        ]),
        linkedin: z.union([
            z.string().url({ message: 'Please enter a valid URL' }),
            z.string().length(0),
            z.string().optional()
        ]),
        youtube: z.union([
            z.string().url({ message: 'Please enter a valid URL' }),
            z.string().length(0),
            z.string().optional()
        ]),
        tiktok: z.union([
            z.string().url({ message: 'Please enter a valid URL' }),
            z.string().length(0),
            z.string().optional()
        ]),
        pinterest: z.union([
            z.string().url({ message: 'Please enter a valid URL' }),
            z.string().length(0),
            z.string().optional()
        ]),
        other: z.array(z.object({
            platform: z.string().min(1, { message: 'Platform name is required' }),
            url: z.string().url({ message: 'Please enter a valid URL' }),
        })).optional(),
    }),
    location: z.object({
        coordinates: z.tuple([z.number(), z.number()]).optional(),
        address: z.object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            country: z.string().optional(),
        }),
        isRemote: z.boolean().default(false),
    }),
    businessHours: z.array(z.object({
        day: z.number().min(0).max(6),
        open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format" }),
        close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format" }),
        isClosed: z.boolean().default(false),
    })).optional(),
    features: z.array(z.string().min(1, { message: 'Feature cannot be empty' })).default([]),
    faqs: z.array(
        z.object({
            question: z.string().min(1, { message: 'Question is required' }),
            answer: z.string().min(1, { message: 'Answer is required' }),
        })
    ).default([]),
    tags: z.array(z.string()).default([]),
    isFeatured: z.boolean().default(false),
    status: z.string().optional(),
});

// Available categories with subcategories
const categories = [
    { name: 'Health & Wellness', subcategories: ['Fitness', 'Yoga', 'Nutrition', 'Mental Health', 'Massage', 'Traditional Medicine'] },
    { name: 'Home Services', subcategories: ['Cleaning', 'Gardening', 'Repairs', 'Interior Design', 'Moving', 'Home Organization'] },
    { name: 'Education', subcategories: ['Tutoring', 'Language Learning', 'Test Preparation', 'Skills Development', 'Career Coaching'] },
    { name: 'Professional Services', subcategories: ['Legal Advice', 'Financial Consulting', 'Marketing', 'Web Development', 'Content Creation'] },
    { name: 'Retail', subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Specialty', 'Groceries'] },
    { name: 'Beauty & Personal Care', subcategories: ['Hair Styling', 'Makeup', 'Skincare', 'Nail Services', 'Personal Styling'] },
    { name: 'Restaurants & Food', subcategories: ['Fine Dining', 'Fast Food', 'Cafe', 'Bakery', 'Ethnic Cuisine'] },
    { name: 'Arts & Entertainment', subcategories: ['Galleries', 'Theaters', 'Studios', 'Music Venues', 'Event Spaces'] },
    { name: 'Technology', subcategories: ['Software', 'Hardware', 'Consulting', 'Repairs', 'Training'] },
    { name: 'Others', subcategories: ['Pet Services', 'Automotive', 'Travel', 'Spiritual Services', 'Custom Services'] },
];

// Days of week options
const daysOfWeekOptions = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
];

// Social media platforms with icons
const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/yourbusiness' },
    { id: 'twitter', name: 'Twitter/X', placeholder: 'https://twitter.com/yourbusiness' },
    { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/yourbusiness' },
    { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourbusiness' },
    { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/c/yourbusiness' },
    { id: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@yourbusiness' },
    { id: 'pinterest', name: 'Pinterest', placeholder: 'https://pinterest.com/yourbusiness' },
];

export default function ServiceEditPage() {
    return (
        <ProtectedRoute allowedRoles={['provider', 'admin']}>
            <EditServiceForm />
        </ProtectedRoute>
    );
}

function EditServiceForm() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const formRef = useRef(null);

    // State hooks
    const [isLoading, setIsLoading] = useState(false);
    const [service, setService] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("basic");
    const [logoPreview, setLogoPreview] = useState('');
    const [coverPreview, setCoverPreview] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [submitting, setIsSubmitting ] = useState(false);

    // Form instance with proper configuration
    const form = useForm({
        resolver: zodResolver(directorySchema),
        defaultValues: {
            businessName: '',
            description: '',
            category: '',
            subcategory: '',
            logo: '',
            coverImage: '',
            contact: {
                email: '',
                phone: '',
                alternatePhone: '',
            },
            website: '',
            socialMedia: {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: '',
                youtube: '',
                tiktok: '',
                pinterest: '',
                other: [],
            },
            location: {
                coordinates: undefined,
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                },
                isRemote: false,
            },
            businessHours: daysOfWeekOptions.map(day => ({
                day: day.value,
                open: '09:00',
                close: '17:00',
                isClosed: day.value === 0 || day.value === 6,
            })),
            features: [''],
            faqs: [{ question: '', answer: '' }],
            tags: [],
            isFeatured: false,
            status: 'draft',
        },
        mode: 'onChange',
        shouldUnregister: false,
    });

    const { isDirty, isValid, isSubmitting } = form.formState;

    // Initialize field arrays for dynamic form elements
    const {
        fields: featureFields,
        append: appendFeature,
        remove: removeFeature,
    } = useFieldArray({
        control: form.control,
        name: 'features',
    });

    const {
        fields: faqFields,
        append: appendFAQ,
        remove: removeFAQ,
    } = useFieldArray({
        control: form.control,
        name: 'faqs',
    });

    const {
        fields: otherSocialFields,
        append: appendSocial,
        remove: removeSocial,
    } = useFieldArray({
        control: form.control,
        name: 'socialMedia.other',
    });

    // Fetch service data
    useEffect(() => {
        const fetchService = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/services/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch service');
                }
                const data = await response.json();
                setService(data.service);
                setSelectedCategory(data.service.category);

                if (data.service.logo) setLogoPreview(data.service.logo);
                if (data.service.coverImage) setCoverPreview(data.service.coverImage);

                const formValues = {
                    ...data.service,
                    contact: data.service.contact || {
                        email: data.service.provider?.email || '',
                        phone: '',
                        alternatePhone: '',
                    },
                    socialMedia: data.service.socialMedia || {
                        facebook: '',
                        twitter: '',
                        instagram: '',
                        linkedin: '',
                        youtube: '',
                        tiktok: '',
                        pinterest: '',
                        other: [],
                    },
                    location: data.service.location || {
                        coordinates: undefined,
                        address: {
                            street: '',
                            city: '',
                            state: '',
                            zipCode: '',
                            country: '',
                        },
                        isRemote: false,
                    },
                    businessHours: data.service.businessHours || daysOfWeekOptions.map(day => ({
                        day: day.value,
                        open: '09:00',
                        close: '17:00',
                        isClosed: day.value === 0 || day.value === 6,
                    })),
                    features: data.service.features || [''],
                    faqs: data.service.faqs?.length > 0 ? data.service.faqs : [{ question: '', answer: '' }],
                    tags: data.service.tags || [],
                };

                form.reset(formValues);
            } catch (error) {
                console.error('Error fetching service:', error);
                setError(error.message || 'An error occurred while loading the service');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchService();
        }
    }, [id, form]);
    useEffect(() => {
        // If there are errors and the form has been submitted
        if (Object.keys(form.formState.errors).length > 0 && form.formState.submitCount > 0) {
            // Find the first tab with an error
            const tabsWithErrors = [
                { tab: "basic", hasErrors: hasErrorsInBasicTab() },
                { tab: "contact", hasErrors: hasErrorsInContactTab() },
                { tab: "branding", hasErrors: hasErrorsInBrandingTab() },
                { tab: "location", hasErrors: hasErrorsInLocationTab() },
                { tab: "hours", hasErrors: hasErrorsInHoursTab() },
                { tab: "extra", hasErrors: hasErrorsInExtraTab() }
            ];

            const firstTabWithError = tabsWithErrors.find(t => t.hasErrors)?.tab;

            if (firstTabWithError && firstTabWithError !== activeTab) {
                // Switch to the tab with errors
                setActiveTab(firstTabWithError);

                // Show a toast message about validation errors
                toast.error(`Please fix validation errors in the ${getTabDisplayName(firstTabWithError)} section`);
            }

            // Log validation errors for debugging
            console.log("Form validation errors:", form.formState.errors);
        }
    }, [form.formState.errors, form.formState.submitCount, activeTab]);

    // Helper functions to check for errors in each tab
    function hasErrorsInBasicTab() {
        const { errors } = form.formState;
        return !!errors.businessName || !!errors.description ||
            !!errors.category || !!errors.subcategory ||
            !!errors.tags || !!errors.status;
    }

    function hasErrorsInContactTab() {
        const { errors } = form.formState;
        return !!errors.contact || !!errors.website || !!errors.socialMedia;
    }

    function hasErrorsInBrandingTab() {
        const { errors } = form.formState;
        return !!errors.logo || !!errors.coverImage;
    }

    function hasErrorsInLocationTab() {
        const { errors } = form.formState;
        return !!errors.location;
    }

    function hasErrorsInHoursTab() {
        const { errors } = form.formState;
        return !!errors.businessHours;
    }

    function hasErrorsInExtraTab() {
        const { errors } = form.formState;
        return !!errors.features || !!errors.faqs;
    }

    function getTabDisplayName(tabId) {
        const tabNames = {
            basic: "Basic Information",
            contact: "Contact & Social",
            branding: "Branding",
            location: "Location",
            hours: "Business Hours",
            extra: "Additional Information"
        };
        return tabNames[tabId] || tabId;
    }
    // Update subcategories when category changes
    useEffect(() => {
        const category = categories.find(cat => cat.name === selectedCategory);
        if (category) {
            setSubcategories(category.subcategories);
        } else {
            setSubcategories([]);
        }
    }, [selectedCategory]);

    // Handle logo upload
    const handleLogoUpload = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageUploading(true);
        setUploadProgress(0);

        try {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo image must be less than 2MB');
                setImageUploading(false);
                return;
            }

            if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) {
                toast.error('Unsupported file format');
                setImageUploading(false);
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);

            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'directory/logos');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload logo');
            }

            const result = await response.json();
            form.setValue('logo', result.fileUrl, { shouldDirty: true });
            setUploadProgress(100);
            toast.success('Logo uploaded successfully');
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Failed to upload logo');
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
                setLogoPreview('');
            }
        } finally {
            setTimeout(() => {
                setImageUploading(false);
                setUploadProgress(0);
            }, 500);
        }
    }, [form]);

    // Handle cover image upload
    const handleCoverUpload = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageUploading(true);
        setUploadProgress(0);

        try {
            if (file.size > 4 * 1024 * 1024) {
                toast.error('Cover image must be less than 4MB');
                setImageUploading(false);
                return;
            }

            if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) {
                toast.error('Unsupported file format');
                setImageUploading(false);
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            setCoverPreview(previewUrl);

            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'directory/covers');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload cover image');
            }

            const result = await response.json();
            form.setValue('coverImage', result.fileUrl, { shouldDirty: true });
            setUploadProgress(100);
            toast.success('Cover image uploaded successfully');
        } catch (error) {
            console.error('Error uploading cover image:', error);
            toast.error('Failed to upload cover image');
            if (coverPreview) {
                URL.revokeObjectURL(coverPreview);
                setCoverPreview('');
            }
        } finally {
            setTimeout(() => {
                setImageUploading(false);
                setUploadProgress(0);
            }, 500);
        }
    }, [form]);

    // Cleanup image previews on unmount
    useEffect(() => {
        return () => {
            if (logoPreview && !logoPreview.startsWith('http')) URL.revokeObjectURL(logoPreview);
            if (coverPreview && !coverPreview.startsWith('http')) URL.revokeObjectURL(coverPreview);
        };
    }, [logoPreview, coverPreview]);

    // Form submission handler
    // Form submission handler with more robust error handling
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        console.log("Form submission started", data);

        try {
            // Preprocess the data to handle empty social media URLs
            const preprocessedData = {
                ...data,

                // Convert empty strings to undefined for URL fields
                website: data.website?.trim() === "" ? undefined : data.website,

                // Handle social media URLs
                socialMedia: {
                    ...data.socialMedia,
                    facebook: data.socialMedia.facebook?.trim() === "" ? undefined : data.socialMedia.facebook,
                    twitter: data.socialMedia.twitter?.trim() === "" ? undefined : data.socialMedia.twitter,
                    instagram: data.socialMedia.instagram?.trim() === "" ? undefined : data.socialMedia.instagram,
                    linkedin: data.socialMedia.linkedin?.trim() === "" ? undefined : data.socialMedia.linkedin,
                    youtube: data.socialMedia.youtube?.trim() === "" ? undefined : data.socialMedia.youtube,
                    tiktok: data.socialMedia.tiktok?.trim() === "" ? undefined : data.socialMedia.tiktok,
                    pinterest: data.socialMedia.pinterest?.trim() === "" ? undefined : data.socialMedia.pinterest,

                    // Filter out empty platform/URL pairs from "other" array
                    other: data.socialMedia.other?.filter(item =>
                        item.platform.trim() !== "" && item.url.trim() !== ""
                    ) || []
                },

                // Format the rest of your data as before
                features: data.features.filter(feature => feature.trim() !== ''),
                faqs: data.faqs.filter(faq => faq.question.trim() !== '' && faq.answer.trim() !== ''),
                location: {
                    ...data.location,
                    coordinates: data.location.coordinates || undefined,
                },
                status: data.status || service.status || 'draft',
            };

            console.log("Preprocessed data for API:", preprocessedData);

            // Continue with your API submission...
            const response = await fetch(`/api/services/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preprocessedData),
            });

            // Rest of your code remains the same...
        } catch (error) {
            console.error("Error updating service:", error);
            toast.error(error.message || "Failed to update service");
        } finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium text-muted-foreground">Loading service...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-destructive" />
                    <h2 className="mt-4 text-xl font-bold">Failed to load service</h2>
                    <p className="mt-2 text-muted-foreground">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => router.push('/dashboard/services')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Services
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 pb-20 max-w-5xl">
            <Toaster position="top-right" />

            {/* Header section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => router.push('/dashboard/services')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                        </Button>
                        <h1 className="text-2xl font-bold">Edit Business Listing</h1>
                    </div>
                    <p className="text-muted-foreground">Update your business information in our directory</p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            service?.status === 'published' ? 'success' :
                                service?.status === 'draft' ? 'outline' :
                                    service?.status === 'suspended' ? 'destructive' :
                                        'secondary'
                        }
                        className="text-xs px-2 py-1"
                    >
                        Status: {service?.status.charAt(0).toUpperCase() + service?.status.slice(1)}
                    </Badge>
                    {service?.isFeatured && (
                        <Badge variant="default" className="bg-yellow-500 text-xs px-2 py-1">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                        </Badge>
                    )}
                </div>
            </div>

            {/* Tabs navigation */}
            <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8">
                    <TabsTrigger value="basic" className="gap-2">
                        <Building className="h-4 w-4" />
                        <span>Basic Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="gap-2">
                        <LinkIcon className="h-4 w-4" />
                        <span>Contact & Social</span>
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="gap-2">
                        <Camera className="h-4 w-4" />
                        <span>Branding</span>
                    </TabsTrigger>
                    <TabsTrigger value="location" className="gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                    </TabsTrigger>
                    <TabsTrigger value="hours" className="gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Hours</span>
                    </TabsTrigger>
                    <TabsTrigger value="extra" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Additional Info</span>
                    </TabsTrigger>
                </TabsList>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
                        {/* Tab: Basic Information */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Core details about your business</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="businessName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Name*</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="E.g., Acme Corporation"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Your official business name as you want it displayed
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category*</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            setSelectedCategory(value);
                                                            // Only reset subcategory if category changes
                                                            if (value !== selectedCategory) {
                                                                form.setValue('subcategory', '');
                                                            }
                                                        }}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem key={category.name} value={category.name}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="subcategory"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subcategory</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={subcategories.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={subcategories.length === 0 ? "Select a category first" : "Select a subcategory"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {subcategories.map((subcategory) => (
                                                                <SelectItem key={subcategory} value={subcategory}>
                                                                    {subcategory}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Description*</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell visitors about your business, what makes you unique..."
                                                        {...field}
                                                        rows={8}
                                                        className="resize-none"
                                                    />
                                                </FormControl>
                                                <FormDescription className="flex justify-between">
                                                    <span>Be specific about what you offer and your expertise</span>
                                                    <span>{field.value?.length || 0}/2000 characters</span>
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags</FormLabel>
                                                <FormControl>
                                                    <div className="flex flex-wrap gap-2">
                                                        {field.value?.map((tag, index) => (
                                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                                {tag}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newTags = [...field.value];
                                                                        newTags.splice(index, 1);
                                                                        field.onChange(newTags);
                                                                    }}
                                                                    className="text-muted-foreground hover:text-destructive"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                        <Input
                                                            type="text"
                                                            placeholder="Add tags (press enter)"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && e.target.value.trim()) {
                                                                    e.preventDefault();
                                                                    field.onChange([...field.value, e.target.value.trim()]);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                            className="w-auto flex-1 min-w-[120px]"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    Add keywords that will help users find your business
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Listing Status</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="published">Published</SelectItem>
                                                        <SelectItem value="suspended">Suspended</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Control the visibility of your listing in the directory
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Contact & Social */}
                        <TabsContent value="contact" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact & Social Media</CardTitle>
                                    <CardDescription>How customers can reach you</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="contact.email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address*</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="contact@yourbusiness.com"
                                                            {...field}
                                                            type="email"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        This email will be visible to directory users
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="website"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Website</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://www.yourbusiness.com"
                                                            {...field}
                                                            type="url"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Your business website URL
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="contact.phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="+1 (555) 123-4567"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Primary contact number
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="contact.alternatePhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Alternate Phone</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="+1 (555) 987-6543"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Secondary contact number (optional)
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-4">
                                        <Label className="text-base">Social Media Links</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Add your social media profiles to increase visibility
                                        </p>

                                        {/* Replace the social media fields in your form with this version */}
                                        <div className="space-y-4">
                                            {socialPlatforms.map((platform) => (
                                                <FormField
                                                    key={platform.id}
                                                    control={form.control}
                                                    name={`socialMedia.${platform.id}`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{platform.name}</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder={platform.placeholder}
                                                                    {...field}
                                                                    type="url"
                                                                    // This onChange handler normalizes the input
                                                                    onChange={(e) => {
                                                                        // For empty inputs, store empty string (which will pass validation)
                                                                        const value = e.target.value.trim() === "" ? "" : e.target.value;
                                                                        field.onChange(value);
                                                                    }}
                                                                    // Add a "clear" button for better UX
                                                                    className="pr-10"
                                                                />
                                                            </FormControl>
                                                            {field.value && (
                                                                <button
                                                                    type="button"
                                                                    className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                                                                    onClick={() => field.onChange("")}
                                                                    tabIndex={-1}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            <FormDescription>
                                                                Optional - leave blank if not applicable
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Other Social Platforms</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => appendSocial({ platform: '', url: '' })}
                                                    className="gap-1"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add Platform
                                                </Button>
                                            </div>

                                            {otherSocialFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-3 items-start">
                                                    <FormField
                                                        control={form.control}
                                                        name={`socialMedia.other.${index}.platform`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormLabel>Platform Name</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="E.g., Snapchat"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`socialMedia.other.${index}.url`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-[2]">
                                                                <FormLabel>URL</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="https://..."
                                                                        {...field}
                                                                        type="url"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="mt-8"
                                                        onClick={() => removeSocial(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Branding */}
                        <TabsContent value="branding" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Branding</CardTitle>
                                    <CardDescription>Upload your logo and cover image</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-4">
                                        <Label>Business Logo</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted/50">
                                                {logoPreview ? (
                                                    <>
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (!logoPreview.startsWith('http')) URL.revokeObjectURL(logoPreview);
                                                                setLogoPreview('');
                                                                form.setValue('logo', '');
                                                            }}
                                                            className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-destructive hover:text-white transition-colors"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <label
                                                        htmlFor="logo-upload"
                                                        className={cn(
                                                            "flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-accent/50 transition-colors",
                                                            imageUploading ? "opacity-50 cursor-not-allowed" : ""
                                                        )}
                                                    >
                                                        {imageUploading ? (
                                                            <div className="flex flex-col items-center justify-center p-4">
                                                                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                                                <span className="text-xs text-center">Uploading... {uploadProgress}%</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center p-4">
                                                                <Upload className="h-6 w-6 mb-2" />
                                                                <span className="text-xs text-center">Upload Logo</span>
                                                            </div>
                                                        )}
                                                        <input
                                                            id="logo-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleLogoUpload}
                                                            disabled={imageUploading}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium mb-1">Logo Guidelines:</h4>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    <li>• Square format recommended (1:1 ratio)</li>
                                                    <li>• Maximum file size: 2MB</li>
                                                    <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                                                    <li>• Will be displayed in search results and your profile</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Cover Image</Label>
                                        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted/50">
                                            {coverPreview ? (
                                                <>
                                                    <img
                                                        src={coverPreview}
                                                        alt="Cover preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!coverPreview.startsWith('http')) URL.revokeObjectURL(coverPreview);
                                                            setCoverPreview('');
                                                            form.setValue('coverImage', '');
                                                        }}
                                                        className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-destructive hover:text-white transition-colors"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <label
                                                    htmlFor="cover-upload"
                                                    className={cn(
                                                        "flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-accent/50 transition-colors",
                                                        imageUploading ? "opacity-50 cursor-not-allowed" : ""
                                                    )}
                                                >
                                                    {imageUploading ? (
                                                        <div className="flex flex-col items-center justify-center p-4">
                                                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                                            <span className="text-sm text-center">Uploading... {uploadProgress}%</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center p-4">
                                                            <Upload className="h-8 w-8 mb-2" />
                                                            <span className="text-sm font-medium">Upload Cover Image</span>
                                                            <p className="text-xs text-muted-foreground mt-1">Recommended size: 1200x400px</p>
                                                        </div>
                                                    )}
                                                    <input
                                                        id="cover-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleCoverUpload}
                                                        disabled={imageUploading}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            A high-quality banner image that represents your business. Will be displayed at the top of your directory page.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Location */}
                        <TabsContent value="location" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Location</CardTitle>
                                    <CardDescription>Where your business is located</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="location.isRemote"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-lg">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>This is a remote or online business</FormLabel>
                                                    <FormDescription>
                                                        Check if your business operates primarily online or doesn't have a physical location
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {!form.watch('location.isRemote') && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="location.address.street"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Street Address</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="123 Main St" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="location.address.city"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>City</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="New York" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="location.address.state"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>State/Province</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="NY" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="location.address.zipCode"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>ZIP/Postal Code</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="10001" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="location.address.country"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Country</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="United States" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Business Hours */}
                        <TabsContent value="hours" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Hours</CardTitle>
                                    <CardDescription>When your business is open to customers</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Hours of Operation</Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="w-80 text-sm">
                                                            Set your regular business hours for each day of the week.
                                                            If you're closed on a specific day, toggle the "Closed" option.
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>

                                        <div className="space-y-4">
                                            {daysOfWeekOptions.map((day, index) => (
                                                <div key={day.value} className="grid grid-cols-[1fr,auto,auto,auto] gap-3 items-center">
                                                    <p className="font-medium">{day.label}</p>

                                                    <FormField
                                                        control={form.control}
                                                        name={`businessHours.${index}.open`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="time"
                                                                        {...field}
                                                                        disabled={form.watch(`businessHours.${index}.isClosed`)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`businessHours.${index}.close`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="time"
                                                                        {...field}
                                                                        disabled={form.watch(`businessHours.${index}.isClosed`)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`businessHours.${index}.isClosed`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm font-normal cursor-pointer">
                                                                    Closed
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Additional Info */}
                        <TabsContent value="extra" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                    <CardDescription>Features and frequently asked questions</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Business Features</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary"
                                                onClick={() => appendFeature('')}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Feature
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {featureFields.map((field, index) => (
                                                <div key={field.id} className="flex items-center gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`features.${index}`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="E.g., Free WiFi, Pet Friendly, Wheelchair Accessible"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            // Don't remove the last field, just clear it
                                                            if (featureFields.length === 1) {
                                                                form.setValue(`features.${index}`, '');
                                                            } else {
                                                                removeFeature(index);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {featureFields.length === 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => appendFeature('')}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Your First Feature
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Add key features or amenities that make your business stand out
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Frequently Asked Questions</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary"
                                                onClick={() => appendFAQ({ question: '', answer: '' })}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add FAQ
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            {faqFields.map((field, index) => (
                                                <div key={field.id} className="space-y-2 border p-4 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 space-y-2">
                                                            <FormField
                                                                control={form.control}
                                                                name={`faqs.${index}.question`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Question {index + 1}</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="E.g., What are your hours?"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name={`faqs.${index}.answer`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Answer</FormLabel>
                                                                        <FormControl>
                                                                            <Textarea
                                                                                placeholder="Provide a clear answer..."
                                                                                {...field}
                                                                                rows={3}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="ml-2"
                                                            onClick={() => removeFAQ(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            {faqFields.length === 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => appendFAQ({ question: '', answer: '' })}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Your First FAQ
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>


                        {/* Save button section - Fixed version */}
                        {/* Save button */}
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/services')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>

                            {/* Use the Button component for consistency */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Debug button - add temporarily for testing, remove in production */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-muted-foreground mb-2">
                                Form state: {form.formState.isValid ? 'Valid' : 'Invalid'},
                                Submit state: {isSubmitting ? 'Submitting' : 'Ready'}
                            </p>
                            <button
                                type="button"
                                className="text-xs text-blue-500 hover:underline"
                                onClick={() => {
                                    // Force reset the submitting state
                                    setIsSubmitting(false);
                                    console.log("Manually reset isSubmitting state");
                                    console.log("Current form errors:", form.formState.errors);
                                }}
                            >
                                Reset submission state
                            </button>
                        </div>
                    </form>
                </Form>
            </Tabs>

        </div>
    );
}