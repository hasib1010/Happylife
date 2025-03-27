'use client';
// src/app/blogs/edit/[id]/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import BlogForm from '@/components/blogs/BlogForm';
import Link from 'next/link';

export default function EditBlogPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push(`/login?callbackUrl=/blogs/edit/${id}`);
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchBlog();
    }
  }, [sessionStatus, id, router]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${id}`);
      
      if (response.status === 404) {
        setError('Blog not found');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog');
      }
      
      const data = await response.json();
      setBlog(data.blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if the user has an active subscription
  const canEditBlog = hasActiveSubscription();

  if (loading || sessionStatus === 'loading' || subscriptionLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <Link 
            href="/dashboard/blogs" 
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  if (!canEditBlog) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Required</h2>
          <p className="mb-4 text-gray-600">
            An active subscription is required to edit blog posts. Upgrade your plan to unlock this feature.
          </p>
          <Link 
            href="/subscription" 
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Subscription Options
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Blog Not Found</h2>
          <p className="mb-4 text-gray-600">
            The blog you're trying to edit could not be found or you don't have permission to edit it.
          </p>
          <Link 
            href="/dashboard/blogs" 
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your blog content and settings
          </p>
        </div>
        <Link
          href="/dashboard/blogs"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Back to Blogs
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <BlogForm blog={blog} mode="edit" />
      </div>
    </div>
  );
}