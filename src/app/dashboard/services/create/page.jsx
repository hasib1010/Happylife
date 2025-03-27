"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Plus,
  Trash2,
  MapPin,
  Clock,
  Tag,
  Camera,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Upload,
  Info,
  Link,
  Building,
  MessageSquare,
  Star,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { toast, Toaster } from 'react-hot-toast';
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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    facebook: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    twitter: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    instagram: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    linkedin: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    youtube: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    tiktok: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    pinterest: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
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

const DirectoryForm = () => {
  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [formCompletion, setFormCompletion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);

  // Initialize form with validation schema
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
        isClosed: day.value === 0 || day.value === 6, // Default closed on weekends
      })),
      features: [''],
      faqs: [{ question: '', answer: '' }],
      tags: [],
      isFeatured: false,
    },
    mode: 'onChange',
  });

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

  // Update subcategories when category changes
  useEffect(() => {
    const category = categories.find(cat => cat.name === selectedCategory);
    if (category) {
      setSubcategories(category.subcategories);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  // Update form completion percentage
  useEffect(() => {
    const values = form.getValues();
    let completed = 0;
    let total = 5; // Count critical fields only

    if (values.businessName) completed++;
    if (values.description) completed++;
    if (values.category) completed++;
    if (values.contact.email) completed++;
    if (values.website ||
      values.socialMedia.facebook ||
      values.socialMedia.instagram ||
      values.socialMedia.twitter) completed++;

    setFormCompletion(Math.floor((completed / total) * 100));
  }, [form.watch()]);


  const onSubmit = async (data) => {
    console.log("Form submission started", data);
    setIsLoading(true);

    try {
      // Format the data to match API expectations
      const directoryData = {
        ...data,
        // Remove empty features
        features: data.features.filter(feature => feature.trim() !== ''),
        // Remove empty FAQs
        faqs: data.faqs.filter(faq => faq.question.trim() !== '' && faq.answer.trim() !== ''),
        // Ensure proper location formatting
        location: {
          ...data.location,
          coordinates: data.location.coordinates || undefined,
        },
        // Status is always draft on initial creation
        status: 'draft',
        // Default to active
        isActive: true,
        // Set subscription status to trial by default
        subscriptionStatus: 'trial',
        subscriptionStartDate: new Date().toISOString(),
        // Set trial period to 14 days
        subscriptionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };

      console.log("Formatted data for API:", JSON.stringify(directoryData).substring(0, 200) + "...");

      // Submit data to the API - UPDATED ENDPOINT HERE
      console.log("Sending request to API...");
      const response = await fetch('/api/services/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(directoryData),
      });

      console.log("API response status:", response.status);
      const result = await response.json();
      console.log("API response data:", result);

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create directory listing');
      }

      // Show success message
      toast.success("Directory listing created successfully!");

      // Optional: Redirect to the directory listing or detail page
      // window.location.href = '/dashboard/directory';

      console.log("Directory listing created successfully:", result);
    } catch (error) {
      console.error("Error creating directory listing:", error);
      toast.error(error.message || "Failed to create directory listing");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setUploadProgress(0);

    try {
      // Validate file
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

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload file
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

      // Update form
      form.setValue('logo', result.fileUrl);
      setUploadProgress(100);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');

      // Cleanup preview on error
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
      // Validate file
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

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload file
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

      // Update form
      form.setValue('coverImage', result.fileUrl);
      setUploadProgress(100);
      toast.success('Cover image uploaded successfully');
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast.error('Failed to upload cover image');

      // Cleanup preview on error
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
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [logoPreview, coverPreview]);

  // Form step content
  const steps = [
    {
      title: "Basic Information",
      icon: <Info className="h-5 w-5" />,
      description: "Core business details"
    },
    {
      title: "Contact & Social",
      icon: <Link className="h-5 w-5" />,
      description: "Contact information and social media"
    },
    {
      title: "Branding",
      icon: <Camera className="h-5 w-5" />,
      description: "Logo and cover image"
    },
    {
      title: "Location",
      icon: <MapPin className="h-5 w-5" />,
      description: "Where your business is located"
    },
    {
      title: "Business Hours",
      icon: <Clock className="h-5 w-5" />,
      description: "When you're open"
    },
    {
      title: "Additional Info",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Features, FAQs and extra details"
    }
  ];

  return (
    <div className="container mx-auto p-4 pb-20 max-w-5xl">
      <Toaster position="top-right" />

      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Directory Listing</h1>
            <p className="text-muted-foreground">Showcase your business in our directory</p>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-user.avif" alt="User" />
              <AvatarFallback>UK</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">Your Business Profile</p>
              <p className="text-muted-foreground">Setting up a new listing</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Form completion</span>
            <span className="font-medium">{formCompletion}%</span>
          </div>
          <Progress value={formCompletion} className="h-2" />
        </div>
      </div>

      {/* Step indicator */}
      <div className="hidden md:flex items-center justify-between mb-8 bg-muted/30 rounded-lg p-2">
        {steps.map((step, index) => (
          <Button
            key={index}
            variant={currentStep === index ? "default" : "ghost"}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2",
              currentStep === index ? "bg-primary text-primary-foreground" : "",
              currentStep > index ? "text-primary" : ""
            )}
            onClick={() => setCurrentStep(index)}
          >
            <div className="flex items-center gap-1.5">
              {currentStep > index ? (
                <Check className="h-4 w-4" />
              ) : (
                step.icon
              )}
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* Mobile stepper */}
      <div className="flex md:hidden items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <span className="text-sm font-medium">
          Step {currentStep + 1} of {steps.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >

          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>Enter the core details about your business</CardDescription>
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
                          className="text-lg"
                        />
                      </FormControl>
                      <FormDescription>
                        Your official business name as you want it displayed in the directory
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
                            form.setValue('subcategory', '');
                          }}
                          defaultValue={field.value}
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
                          defaultValue={field.value}
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
                          placeholder="Tell visitors about your business, what makes you unique, and what products or services you offer..."
                          {...field}
                          rows={8}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Be specific about what you offer and your expertise</span>
                        <span>{field.value.length}/2000 characters</span>
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
                          {field.value.map((tag, index) => (
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


              </CardContent>
            </Card>
          )}

          {/* Step 2: Contact & Social */}
          {currentStep === 1 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  <span>Contact & Social Media</span>
                </CardTitle>
                <CardDescription>Add your contact information and social media links</CardDescription>
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
                    Add your social media profiles to increase visibility and engagement
                  </p>

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
                              />
                            </FormControl>
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
          )}

          {/* Step 3: Branding */}
          {currentStep === 2 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <span>Business Branding</span>
                </CardTitle>
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
                              URL.revokeObjectURL(logoPreview);
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
                            URL.revokeObjectURL(coverPreview);
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
          )}

          {/* Step 4: Location */}
          {currentStep === 3 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Business Location</span>
                </CardTitle>
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

                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center p-4">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                        <h3 className="text-lg font-medium mb-1">Map Location</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Pin your exact location on the map
                        </p>
                        <Button variant="outline" className="gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>Set Map Location</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Business Hours */}
          {currentStep === 4 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Business Hours</span>
                </CardTitle>
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
          )}

          {/* Step 6: Additional Info */}
          {currentStep === 5 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Additional Information</span>
                </CardTitle>
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
                    {featureFields.length === 0 && (
                      // This ensures there's always at least one feature field
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="features.0"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="E.g., Free WiFi, Pet Friendly, Wheelchair Accessible"
                                  value=""
                                  onChange={(e) => {
                                    // Create the first feature field
                                    appendFeature(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

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
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation and submission buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  "Create Directory Listing"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DirectoryForm;