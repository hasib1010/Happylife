'use client';
// src/components/admin/AdminBlogs.js
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/authUtils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/admin/blogs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.message);
      toast.error(`Error loading blogs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      setLoading(true);
      const newStatus = blog.status === 'published' ? 'draft' : 'published';
      
      const response = await fetchWithAuth(`/api/admin/blogs/${blog._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus === 'published' ? 'publish' : 'unpublish'} blog`);
      }

      toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      
      // Refresh the blogs list
      fetchBlogs();
    } catch (err) {
      console.error('Error updating blog status:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (blog) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/admin/blogs/${blogToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }

      toast.success('Blog deleted successfully');
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
      
      // Refresh the blogs list
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      toast.error(`Error deleting blog: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Delete Confirmation Modal
  const DeleteModal = () => {
    if (!isDeleteModalOpen || !blogToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className="relative rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-medium">Delete Blog</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete "{blogToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBlog}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <span className="ml-2 text-gray-500">Loading blogs...</span>
      </div>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={fetchBlogs}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Blog Management</h2>
        <Link
          href="/admin/dashboard/blogs/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Blog
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Published Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      {blog.featuredImage ? (
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-md object-cover" src={blog.featuredImage} alt="" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-500">{blog.title?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        <div className="text-xs text-gray-500">By {blog.author?.name || 'Unknown Author'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : blog.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {blog.publishedAt ? formatDate(blog.publishedAt) : 'Not published'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/blogs/${blog._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(blog)}
                      className={`ml-4 ${
                        blog.status === 'published' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => openDeleteModal(blog)}
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No blogs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Delete Modal */}
      <DeleteModal />
    </div>
  );
}