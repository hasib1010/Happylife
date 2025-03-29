'use client';
// src/app/admin/dashboard/blogs/edit/[id]/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { fetchWithAuth } from '@/lib/authUtils';
import BlogForm from '@/components/blogs/BlogForm';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminEditBlogPage({ params }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);
  const blogId = params.id;

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetchWithAuth(`/api/admin/blogs/${blogId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }
        
        const data = await response.json();
        setBlog(data.blog);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError(err.message);
        toast.error(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus === 'authenticated' && session?.user?.role === 'admin') {
      fetchBlog();
    }
  }, [blogId, sessionStatus, session]);

  // Check authentication and admin role
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/admin/dashboard/blogs/edit/${blogId}`);
      return;
    }
    
    if (sessionStatus === 'authenticated' && session?.user?.role !== 'admin') {
      toast.error('You need admin privileges to edit this blog');
      router.push('/dashboard');
      return;
    }
  }, [sessionStatus, session, router, blogId]);

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Blog</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard/blogs')}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Blog List
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Blog Not Found</h2>
          <p className="text-yellow-600 mb-4">The blog you're trying to edit doesn't exist or has been removed.</p>
          <Link
            href="/admin/dashboard/blogs"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  // Pass admin-specific props to BlogForm
  const adminBlogFormProps = {
    isAdmin: true,
    isEditing: true,
    initialData: blog,
    onSuccess: () => {
      toast.success('Blog updated successfully');
      router.push('/admin/dashboard/blogs');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Admin Blog Editing Panel
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/blogs/${blog._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            View Live
          </Link>
          <Link
            href="/admin/dashboard/blogs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Blog List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <BlogForm {...adminBlogFormProps} />
      </div>
    </div>
  );
}