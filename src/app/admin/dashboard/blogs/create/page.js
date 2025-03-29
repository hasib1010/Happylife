'use client';
// src/app/admin/dashboard/blogs/create/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BlogForm from '@/components/blogs/BlogForm';
import Link from 'next/link';

export default function AdminCreateBlogPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/dashboard/blogs/create');
      return;
    }
    
    if (sessionStatus === 'authenticated') {
      // Check if user is an admin
      if (session?.user?.role !== 'admin') {
        router.push('/admin/dashboard');
        return;
      }
      setLoading(false);
    }
  }, [sessionStatus, session, router]);

  if (loading || sessionStatus === 'loading') {
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

  // Pass admin-specific props to BlogForm
  const adminBlogFormProps = {
    isAdmin: true,
    adminUserId: session.user.id,
    initialData: {
      status: 'published', // Default to published for admin
      // Other default values can be set here
    },
    onSuccess: (blogId) => {
      // Redirect to admin blog list after successful creation
      router.push('/admin/dashboard/blogs');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create a New Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Admin Blog Creation Panel
          </p>
        </div>
        <Link
          href="/admin/dashboard/blogs"
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
          Back to Blog Management
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <BlogForm {...adminBlogFormProps} />
      </div>
    </div>
  );
}