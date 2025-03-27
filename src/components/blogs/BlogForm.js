'use client';
// src/components/blogs/BlogForm.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
const BasicEditor = dynamic(() => import('@/components/common/BasicEditor'), {
    ssr: false,
    loading: () => (
        <div className="border border-gray-300 rounded-md p-4 min-h-[300px] bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Loading editor...</p>
            </div>
        </div>
    ),
});
export default function BlogForm({ blog, mode = 'create' }) {
    const router = useRouter();
    const isEditMode = mode === 'edit';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        category: '',
        tags: '',
        featuredImage: '',
        metaTitle: '',
        metaDescription: '',
        status: 'draft',
    });

    // Available blog categories
    const categories = [
        'Business',
        'Marketing',
        'Technology',
        'Health & Wellness',
        'Education',
        'Lifestyle',
        'Finance',
        'Travel',
        'Food',
        'Entertainment',
        'Other',
    ];

    // Initialize form with blog data if in edit mode
    useEffect(() => {
        if (isEditMode && blog) {
            setFormData({
                title: blog.title || '',
                summary: blog.summary || '',
                content: blog.content || '',
                category: blog.category || '',
                tags: blog.tags ? blog.tags.join(', ') : '',
                featuredImage: blog.featuredImage || '',
                metaTitle: blog.metaTitle || '',
                metaDescription: blog.metaDescription || '',
                status: blog.status || 'draft',
            });
        }
    }, [isEditMode, blog]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content) => {
        setFormData((prev) => ({ ...prev, content }));
    };

    // Handle image upload from the editor
    const handleImageUpload = async (file) => {
        if (!file) return null;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image size should be less than 5MB');
        }

        // Only allow image files
        if (!file.type.startsWith('image/')) {
            throw new Error('Only image files are allowed');
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "blogs/content");

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.fileUrl;
    };

    const handleFeaturedImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        // Only allow image files
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed');
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "blogs/featured");

        setIsSubmitting(true);

        fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }
                return response.json();
            })
            .then(data => {
                setFormData(prev => ({ ...prev, featuredImage: data.fileUrl }));
                setError(null);
            })
            .catch(err => {
                console.error('Error uploading image:', err);
                setError('Failed to upload image. Please try again.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };
    const handleRemoveFeaturedImage = async () => {
        if (!formData.featuredImage) return;

        try {
            const response = await fetch('/api/delete-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileUrl: formData.featuredImage }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            // Update the form state
            setFormData(prev => ({ ...prev, featuredImage: '' }));
        } catch (error) {
            console.error('Error removing image:', error);
            setError('Failed to remove image. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        // Validate form
        if (!formData.title || !formData.content) {
            setError('Title and content are required');
            setIsSubmitting(false);
            return;
        }

        // Process tags from comma-separated string to array
        const processedTags = formData.tags
            ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [];

        try {
            const apiUrl = isEditMode
                ? `/api/blogs/${blog._id}`
                : '/api/blogs';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(apiUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    tags: processedTags,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save blog');
            }

            setSuccess(true);

            // Redirect after successful submission
            if (isEditMode) {
                // Stay on edit page with success message
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            } else {
                // Redirect to blogs management page after creation
                setTimeout(() => {
                    router.push('/dashboard/blogs');
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving blog:', error);
            setError(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">
                                Blog successfully {isEditMode ? 'updated' : 'created'}!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter a compelling title for your blog"
                        maxLength={200}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        {formData.title.length}/200 characters
                    </p>
                </div>

                <div className="col-span-2">
                    <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                        Summary
                    </label>
                    <textarea
                        name="summary"
                        id="summary"
                        rows={3}
                        value={formData.summary}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Brief summary of your blog (appears in previews)"
                        maxLength={500}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        {formData.summary.length}/500 characters
                    </p>
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Tags
                    </label>
                    <input
                        type="text"
                        name="tags"
                        id="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter tags separated by commas"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        E.g., business, marketing, tips
                    </p>
                </div>

                <div className="col-span-2">
                    <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
                        Featured Image
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                        {formData.featuredImage ? (
                            <div className="relative h-32 w-32 overflow-hidden rounded-md border border-gray-300">
                                <img
                                    src={formData.featuredImage}
                                    alt="Featured"
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveFeaturedImage}
                                    className="absolute top-1 right-1 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                                >
                                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-md border-2 border-dashed border-gray-300">
                                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                        <div>
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-medium text-blue-600 shadow-sm hover:text-blue-500"
                            >
                                {formData.featuredImage ? 'Change Image' : 'Upload Image'}
                            </label>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFeaturedImageChange}
                                className="sr-only"
                            />
                            <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-2">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content *
                    </label>
                    <div className="mt-1">
                        <BasicEditor
                            content={formData.content}
                            onChange={handleContentChange}
                            onImageUpload={handleImageUpload}
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Use the toolbar to format text, add images, links, and more. The editor supports right-to-left languages.
                    </p>
                </div>
                <div className="col-span-2">
                    <hr className="my-4" />
                    <h3 className="text-lg font-medium text-gray-900">SEO Settings (Optional)</h3>
                </div>

                <div className="col-span-2">
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                        Meta Title
                    </label>
                    <input
                        type="text"
                        name="metaTitle"
                        id="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Custom title for search engines"
                        maxLength={100}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        {formData.metaTitle.length}/100 characters (if left blank, the blog title will be used)
                    </p>
                </div>

                <div className="col-span-2">
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                        Meta Description
                    </label>
                    <textarea
                        name="metaDescription"
                        id="metaDescription"
                        rows={2}
                        value={formData.metaDescription}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Description for search engine results"
                        maxLength={250}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        {formData.metaDescription.length}/250 characters (if left blank, the blog summary will be used)
                    </p>
                </div>

                <div className="col-span-2">
                    <hr className="my-4" />
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                name="status"
                                id="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${isSubmitting
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>{isEditMode ? 'Update Blog' : 'Create Blog'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}