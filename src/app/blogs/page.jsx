'use client';
// src/app/blogs/page.js
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

// Content component that uses searchParams
function BlogsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const query = searchParams.get('query');
  const pageNumber = parseInt(searchParams.get('page') || '1');

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: pageNumber,
    limit: 10,
    pages: 0
  });

  useEffect(() => {
    fetchBlogs();
  }, [category, tag, query, pageNumber]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      // Build query string
      const queryParams = new URLSearchParams();
      if (category) queryParams.set('category', category);
      if (tag) queryParams.set('tag', tag);
      if (query) queryParams.set('query', query);
      queryParams.set('page', pageNumber.toString());
      queryParams.set('limit', '12');

      const response = await fetch(`/api/blogs?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data = await response.json();
      setBlogs(data.blogs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('search');

    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);

    router.push(`/blogs?${params.toString()}`);
  };

  const navigateToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/blogs?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Error loading blogs: {error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchBlogs}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Get the active filters
  const activeFilters = [];
  if (category) activeFilters.push({ type: 'Category', value: category });
  if (tag) activeFilters.push({ type: 'Tag', value: tag });
  if (query) activeFilters.push({ type: 'Search', value: query });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-2">
          Our Blog
        </h1>
        <p className="text-lg text-gray-500 text-center mb-8">
          Insights, tips, and stories from our community
        </p>

        {/* Search and filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-grow">
              <input
                type="text"
                name="search"
                placeholder="Search articles..."
                defaultValue={query || ''}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-sm font-medium text-gray-700">Active filters:</h3>
              {activeFilters.map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex rounded-md items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {filter.type}: {filter.value}
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      if (filter.type === 'Category') params.delete('category');
                      if (filter.type === 'Tag') params.delete('tag');
                      if (filter.type === 'Search') params.delete('query');
                      router.push(`/blogs?${params.toString()}`);
                    }}
                    className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-900 focus:outline-none focus:bg-blue-200 focus:text-blue-900"
                  >
                    <span className="sr-only">Remove filter for {filter.value}</span>
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                  </button>
                </span>
              ))}
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => router.push('/blogs')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* No results */}
        {blogs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No blogs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeFilters.length > 0
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back later for new content.'}
            </p>
          </div>
        )}

        {/* Blog posts grid */}
        <div className="mt-12 space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          {blogs.map((blog) => (
            <div key={blog._id} className="group relative bg-white overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Featured image */}
              <div className="h-48 bg-gray-200 group-hover:opacity-75 transition-opacity">
                {blog.featuredImage ? (
                  <Link href={`/blogs/${blog._id}`} className=" ">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                    <svg className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Category */}
                {blog.category && (
                  <div className="mb-2">
                    <Link
                      href={`/blogs?category=${encodeURIComponent(blog.category)}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {blog.category}
                    </Link>
                  </div>
                )}

                {/* Title and link */}
                <Link href={`/blogs/${blog._id}`} className="block mt-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                    {blog.title}
                  </h3>
                  <p className="mt-3 text-base text-gray-500 line-clamp-3">
                    {blog.summary || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'}
                  </p>
                </Link>

                {/* Meta info */}
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    {blog.author?.profilePicture ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={blog.author.profilePicture}
                        alt={blog.author.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {blog.author?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {blog.author?.name || 'Anonymous'}
                    </p>
                    <div className="flex text-sm text-gray-500">
                      <time dateTime={blog.publishedAt}>
                        {blog.publishedAt ? format(new Date(blog.publishedAt), 'MMM d, yyyy') : 'Not published'}
                      </time>
                      <span className="mx-1">·</span>
                      <span>{blog.viewCount || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-12 pt-6">
            <div className="-mt-px flex w-0 flex-1">
              <button
                onClick={() => navigateToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium ${pagination.page === 1
                    ? 'cursor-not-allowed text-gray-300'
                    : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                <svg
                  className="mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
            </div>
            <div className="hidden md:-mt-px md:flex">
              {Array.from({ length: pagination.pages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === pagination.page;

                return (
                  <button
                    key={i}
                    onClick={() => navigateToPage(pageNum)}
                    disabled={isCurrentPage}
                    className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${isCurrentPage
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <div className="-mt-px flex w-0 flex-1 justify-end">
              <button
                onClick={() => navigateToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium ${pagination.page === pagination.pages
                    ? 'cursor-not-allowed text-gray-300'
                    : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Next
                <svg
                  className="ml-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function BlogsListLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blogs...</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function BlogsListPage() {
  return (
    <Suspense fallback={<BlogsListLoading />}>
      <BlogsListContent />
    </Suspense>
  );
}