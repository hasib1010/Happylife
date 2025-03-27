'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Loader2, Plus, X, Image as ImageIcon, Star } from 'lucide-react';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CreateProduct() {
    const router = useRouter();
    const { data: session } = useSession();
    const { isActive } = useSubscription();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('basic');
    const [images, setImages] = useState([]);
    const [features, setFeatures] = useState(['']);
    const [specifications, setSpecifications] = useState([{ name: '', value: '' }]);
    const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
    const [businessHours, setBusinessHours] = useState([
        { day: 0, open: '09:00', close: '17:00', isClosed: false }, // Sunday
        { day: 1, open: '09:00', close: '17:00', isClosed: false }, // Monday
        { day: 2, open: '09:00', close: '17:00', isClosed: false }, // Tuesday
        { day: 3, open: '09:00', close: '17:00', isClosed: false }, // Wednesday
        { day: 4, open: '09:00', close: '17:00', isClosed: false }, // Thursday
        { day: 5, open: '09:00', close: '17:00', isClosed: false }, // Friday
        { day: 6, open: '09:00', close: '17:00', isClosed: true },  // Saturday
    ]);
    const [tags, setTags] = useState('');

    // Check if user has an active subscription
    if (!isActive) {
        router.push('/subscription');
        return null;
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        control,
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: '',
            subcategory: '',
            price: '',
            discountPrice: '',
            currency: 'USD',
            status: 'draft',
            isActive: true,
            stock: '', // Add stock field with default empty value
            'contact.email': session?.user?.email || '',
            'contact.phone': '',
            'contact.website': '',
            'location.address': '',
            'location.city': '',
            'location.state': '',
            'location.country': '',
            'location.zipCode': '',
            'location.isRemote': false,
        },
    });

    const handleImagesUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 10;
            });
        }, 500);

        const uploadPromises = files.map(async (file) => {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`File ${file.name} exceeds 5MB limit`);
                return null;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error(`File ${file.name} is not an image`);
                return null;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'products');

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Upload failed');
                }

                const data = await response.json();
                return data.fileUrl;
            } catch (error) {
                console.error('Error uploading file:', error);
                toast.error(`Failed to upload ${file.name}: ${error.message}`);
                return null;
            }
        });

        try {
            const results = await Promise.all(uploadPromises);
            const validUrls = results.filter(url => url !== null);

            clearInterval(progressInterval);
            setUploadProgress(100);

            setTimeout(() => {
                setImages(prev => [...prev, ...validUrls]);
                setIsUploading(false);
                setUploadProgress(0);
                toast.success(`${validUrls.length} image(s) uploaded successfully`);
            }, 500);
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Error processing uploads:', error);
            toast.error('Something went wrong with the upload');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const removeImage = async (index) => {
        try {
            const imageUrl = images[index];

            // Delete from S3
            const response = await fetch('/api/delete-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileUrl: imageUrl }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Delete failed');
            }

            // Remove from state
            const newImages = [...images];
            newImages.splice(index, 1);
            setImages(newImages);
            toast.success('Image removed successfully');
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error(`Failed to remove image: ${error.message}`);
        }
    };

    // Feature management
    const addFeature = useCallback(() => {
        setFeatures(prev => [...prev, '']);
    }, []);

    const removeFeature = useCallback((index) => {
        setFeatures(prev => {
            const newFeatures = [...prev];
            newFeatures.splice(index, 1);
            return newFeatures;
        });
    }, []);

    const updateFeature = useCallback((index, value) => {
        setFeatures(prev => {
            const newFeatures = [...prev];
            newFeatures[index] = value;
            return newFeatures;
        });
    }, []);

    // Specification management
    const addSpecification = useCallback(() => {
        setSpecifications(prev => [...prev, { name: '', value: '' }]);
    }, []);

    const removeSpecification = useCallback((index) => {
        setSpecifications(prev => {
            const newSpecs = [...prev];
            newSpecs.splice(index, 1);
            return newSpecs;
        });
    }, []);

    const updateSpecification = useCallback((index, field, value) => {
        setSpecifications(prev => {
            const newSpecs = [...prev];
            newSpecs[index][field] = value;
            return newSpecs;
        });
    }, []);

    // FAQ management
    const addFaq = useCallback(() => {
        setFaqs(prev => [...prev, { question: '', answer: '' }]);
    }, []);

    const removeFaq = useCallback((index) => {
        setFaqs(prev => {
            const newFaqs = [...prev];
            newFaqs.splice(index, 1);
            return newFaqs;
        });
    }, []);

    const updateFaq = useCallback((index, field, value) => {
        setFaqs(prev => {
            const newFaqs = [...prev];
            newFaqs[index][field] = value;
            return newFaqs;
        });
    }, []);

    // Business hours management
    const updateBusinessHour = useCallback((index, field, value) => {
        setBusinessHours(prev => {
            const newHours = [...prev];
            newHours[index][field] = value;
            return newHours;
        });
    }, []);

    const getDayName = (day) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            // Validate required images
            if (images.length === 0) {
                toast.error('Please upload at least one image');
                setIsSubmitting(false);
                return;
            }

            // Format tags
            const formattedTags = tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            // Prepare product data
            const productData = {
                ...data,
                price: parseFloat(data.price),
                discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : undefined,
                stock: parseInt(data.stock, 10) || 0, // Parse stock as integer with fallback to 0
                images,
                features: features.filter((feature) => feature.trim().length > 0),
                specifications: specifications.filter((spec) => spec.name.trim().length > 0 && spec.value.trim().length > 0),
                faqs: faqs.filter((faq) => faq.question.trim().length > 0 && faq.answer.trim().length > 0),
                tags: formattedTags,
                businessHours: businessHours.filter(hour =>
                    !hour.isClosed || (hour.isClosed && hour.day !== undefined)
                ),
                // Explicitly set these fields
                isFeatured: false, // Products are not featured by default
                featureExpiration: null, // No feature expiration date
            };

            // Send to API
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to create product');
            }

            const result = await response.json();
            toast.success('Product created successfully!');

            // Redirect to the product listing page
            router.push('/dashboard/products');
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error(error.message || 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <Card className="w-full shadow-md">
                <CardHeader className="bg-gray-50 border-b rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">Create New Product</CardTitle>
                            <CardDescription>Add a new product to your directory listing</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard/products')}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardHeader>

                <Tabs defaultValue="basic" className="p-6" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-6 mb-6">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="media">Images</TabsTrigger>
                        <TabsTrigger value="specs">Specifications</TabsTrigger>
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                        <TabsTrigger value="hours">Hours</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TabsContent value="basic">
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">
                                            Title <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            placeholder="Product title"
                                            {...register('title', { required: 'Title is required', maxLength: 100 })}
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                        {watch('title')?.length > 0 && (
                                            <p className="text-sm text-gray-500">{watch('title').length}/100 characters</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">
                                            Category <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="category"
                                            className={`flex h-10 w-full rounded-md border ${errors.category ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                                            {...register('category', { required: 'Category is required' })}
                                        >
                                            <option value="">Select a category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Clothing">Clothing</option>
                                            <option value="Home & Garden">Home & Garden</option>
                                            <option value="Services">Services</option>
                                            <option value="Books">Books</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subcategory">Subcategory</Label>
                                        <Input
                                            id="subcategory"
                                            placeholder="Subcategory (optional)"
                                            {...register('subcategory')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...register('status')}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                        <p className="text-sm text-gray-500">Draft products are not visible to customers</p>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="description">
                                            Description <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Detailed product description"
                                            rows={5}
                                            {...register('description', { required: 'Description is required', maxLength: 2000 })}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                                        {watch('description')?.length > 0 && (
                                            <p className="text-sm text-gray-500">{watch('description').length}/2000 characters</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        disabled
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('details')}
                                    >
                                        Next: Details
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="details">
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">
                                            Price <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex">
                                            <select
                                                id="currency"
                                                className="flex w-20 rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...register('currency')}
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="CAD">CAD</option>
                                                <option value="AUD">AUD</option>
                                            </select>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                className={`rounded-l-none ${errors.price ? 'border-red-500' : ''}`}
                                                {...register('price', { required: 'Price is required', min: 0 })}
                                            />
                                        </div>
                                        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discountPrice">Discount Price</Label>
                                        <Input
                                            id="discountPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00 (optional)"
                                            {...register('discountPrice', { min: 0 })}
                                        />
                                        <p className="text-sm text-gray-500">Leave empty if no discount</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="Available quantity"
                                            className={errors.stock ? 'border-red-500' : ''}
                                            {...register('stock', {
                                                required: 'Stock quantity is required',
                                                min: { value: 0, message: 'Stock cannot be negative' },
                                                valueAsNumber: true
                                            })}
                                        />
                                        {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
                                        <p className="text-sm text-gray-500">Enter 0 for out of stock items</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isActive"
                                            {...register('isActive')}
                                            defaultChecked={true}
                                        />
                                        <Label htmlFor="isActive" className="font-medium">
                                            Active Listing
                                        </Label>
                                    </div>

                                    <div className="md:col-span-2 pt-4">
                                        <Label className="text-lg font-medium">Tags</Label>
                                        <p className="text-sm text-gray-500 mb-2">Enter tags separated by commas</p>
                                        <Input
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            placeholder="e.g., electronics, smartphone, budget"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Tags help customers find your product</p>
                                    </div>
                                </div>

                                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                                    <Star className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="flex flex-col">
                                        <span className="font-medium">Want to boost your listing's visibility?</span>
                                        <span className="text-sm text-blue-600">Feature your product after creation for increased visibility in search results.</span>
                                    </AlertDescription>
                                </Alert>

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => setActiveTab('basic')}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('media')}
                                    >
                                        Next: Images
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="media">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-lg font-medium">
                                        Product Images <span className="text-red-500">*</span>
                                    </Label>
                                    <p className="text-sm text-gray-500 mb-4">Upload high-quality images of your product. First image will be used as main image.</p>

                                    <div className="grid gap-6">
                                        <div className="flex items-center gap-4">
                                            <Label
                                                htmlFor="images"
                                                className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-center transition-colors hover:bg-gray-100"
                                            >
                                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                                <p className="mt-1 text-sm text-gray-500">Drag & drop or click to upload</p>
                                                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                                                <Input
                                                    id="images"
                                                    type="file"
                                                    multiple
                                                    className="sr-only"
                                                    onChange={handleImagesUpload}
                                                    accept="image/*"
                                                    disabled={isUploading}
                                                />
                                            </Label>
                                        </div>

                                        {isUploading && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Uploading...</span>
                                                    <span className="text-sm font-medium">{uploadProgress}%</span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {images.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                                                {images.map((image, index) => (
                                                    <div key={index} className="relative group border rounded-md overflow-hidden" style={{ aspectRatio: '1/1' }}>
                                                        <div className="w-full h-full relative bg-gray-100 flex items-center justify-center">
                                                            {/* Use img tag instead of Next.js Image component for more reliable rendering */}
                                                            <img
                                                                src={image}
                                                                alt={`Product image ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Replace with placeholder on error
                                                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                                                                    e.currentTarget.classList.add("p-4");
                                                                    console.error(`Failed to load image: ${image}`);
                                                                }}
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeImage(index)}
                                                            type="button"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                        {index === 0 && (
                                                            <Badge className="absolute bottom-1 left-1 bg-blue-500">Main</Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => setActiveTab('details')}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('specs')}
                                    >
                                        Next: Specifications
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="specs">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-lg font-medium">Features</Label>
                                        <Button
                                            type="button"
                                            onClick={addFeature}
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            <Plus className="h-4 w-4" /> Add Feature
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-500">List the key features of your product.</p>

                                    <div className="space-y-3">
                                        {features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input
                                                    value={feature}
                                                    onChange={(e) => updateFeature(index, e.target.value)}
                                                    placeholder="Enter a product feature"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-lg font-medium">Specifications</Label>
                                        <Button
                                            type="button"
                                            onClick={addSpecification}
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            <Plus className="h-4 w-4" /> Add Specification
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-500">Add technical specifications for your product.</p>

                                    <div className="space-y-3">
                                        {specifications.map((spec, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input
                                                    value={spec.name}
                                                    onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                                                    placeholder="Name (e.g., Weight)"
                                                    className="flex-1"
                                                />
                                                <Input
                                                    value={spec.value}
                                                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                                    placeholder="Value (e.g., 5 lbs)"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    type="button"
                                                    onClick={() => removeSpecification(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-lg font-medium">FAQs</Label>
                                        <Button
                                            type="button"
                                            onClick={addFaq}
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            <Plus className="h-4 w-4" /> Add FAQ
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-500">Add frequently asked questions and answers.</p>

                                    <div className="space-y-6">
                                        {faqs.map((faq, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={faq.question}
                                                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                        placeholder="Question"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        type="button"
                                                        onClick={() => removeFaq(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    value={faq.answer}
                                                    onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                    placeholder="Answer"
                                                    rows={3}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => setActiveTab('media')}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('contact')}
                                    >
                                        Next: Contact Info
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="contact">
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact.email">
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="contact.email"
                                            type="email"
                                            placeholder="contact@example.com"
                                            {...register('contact.email', { required: 'Contact email is required' })}
                                            className={errors['contact.email'] ? 'border-red-500' : ''}
                                        />
                                        {errors['contact.email'] && (
                                            <p className="text-red-500 text-sm">{errors['contact.email'].message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact.phone">Phone</Label>
                                        <Input
                                            id="contact.phone"
                                            type="tel"
                                            placeholder="+1 (123) 456-7890"
                                            {...register('contact.phone')}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="contact.website">Website</Label>
                                        <Input
                                            id="contact.website"
                                            type="url"
                                            placeholder="https://example.com"
                                            {...register('contact.website')}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <Label className="text-lg font-medium">Location</Label>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="location.isRemote"
                                            {...register('location.isRemote')}
                                        />
                                        <Label htmlFor="location.isRemote">
                                            This is a remote/online service
                                        </Label>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="location.address">Address</Label>
                                            <Input
                                                id="location.address"
                                                placeholder="123 Main St"
                                                {...register('location.address')}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location.city">City</Label>
                                            <Input
                                                id="location.city"
                                                placeholder="City"
                                                {...register('location.city')}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location.state">State/Province</Label>
                                            <Input
                                                id="location.state"
                                                placeholder="State/Province"
                                                {...register('location.state')}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location.country">Country</Label>
                                            <Input
                                                id="location.country"
                                                placeholder="Country"
                                                {...register('location.country')}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location.zipCode">Postal/ZIP Code</Label>
                                            <Input
                                                id="location.zipCode"
                                                placeholder="Postal/ZIP Code"
                                                {...register('location.zipCode')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => setActiveTab('specs')}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('hours')}
                                    >
                                        Next: Business Hours
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="hours">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-lg font-medium">Business Hours</Label>
                                    <p className="text-sm text-gray-500 mb-4">Set your business hours for this product or service.</p>

                                    <div className="overflow-x-auto rounded-md border">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="p-3 text-left font-medium">Day</th>
                                                    <th className="p-3 text-left font-medium">Open</th>
                                                    <th className="p-3 text-left font-medium">Close</th>
                                                    <th className="p-3 text-left font-medium">Closed</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {businessHours.map((hour, index) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="p-3">{getDayName(hour.day)}</td>
                                                        <td className="p-3">
                                                            <Input
                                                                type="time"
                                                                value={hour.open}
                                                                onChange={(e) => updateBusinessHour(index, 'open', e.target.value)}
                                                                className="w-32"
                                                                disabled={hour.isClosed}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <Input
                                                                type="time"
                                                                value={hour.close}
                                                                onChange={(e) => updateBusinessHour(index, 'close', e.target.value)}
                                                                className="w-32"
                                                                disabled={hour.isClosed}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center">
                                                                <Checkbox
                                                                    id={`closed-${index}`}
                                                                    checked={hour.isClosed}
                                                                    onCheckedChange={(checked) => updateBusinessHour(index, 'isClosed', checked)}
                                                                />
                                                                <Label htmlFor={`closed-${index}`} className="ml-2">
                                                                    Closed
                                                                </Label>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <Alert>
                                    <AlertDescription>
                                        Review all information before submitting. Your product will be created with the status you selected.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => setActiveTab('contact')}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="min-w-[120px]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Product'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </form>
                </Tabs>
            </Card>
        </div>
    );
}