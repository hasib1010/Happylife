'use client';
// src/app/blogs/[id]/page.js
import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function BlogDetailPage({ params }) {
    const { id } = use(params);

    const { data: session, status: sessionStatus } = useSession();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState(null);

    useEffect(() => {
        fetchBlog();
    }, [id]);

    useEffect(() => {
        if (blog) {
            fetchComments();
            fetchRelatedBlogs();
        }
    }, [blog]);

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

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/blogs/${id}/comments`);

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data = await response.json();
            setComments(data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };
    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await fetch(`/api/blogs/${id}/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            // Refresh comments
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment. Please try again.');
        }
    };
    const fetchRelatedBlogs = async () => {
        if (!blog || !blog.tags || blog.tags.length === 0) return;

        try {
            // Build the query from tags or category
            const queryParams = new URLSearchParams();
            if (blog.category) {
                queryParams.set('category', blog.category);
            } else if (blog.tags.length > 0) {
                queryParams.set('tag', blog.tags[0]);
            }
            queryParams.set('limit', '3'); // Only fetch 3 related blogs

            const response = await fetch(`/api/blogs?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch related blogs');
            }

            const data = await response.json();
            // Filter out the current blog
            const filtered = data.blogs.filter(relatedBlog => relatedBlog._id !== blog._id);
            setRelatedBlogs(filtered.slice(0, 3)); // Just to be sure we limit to 3
        } catch (error) {
            console.error('Error fetching related blogs:', error);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();

        if (!commentInput.trim()) return;

        setSubmittingComment(true);
        setCommentError(null);

        try {
            const response = await fetch(`/api/blogs/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: commentInput,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong');
            }

            setCommentInput('');
            fetchComments(); // Refresh comments
        } catch (error) {
            console.error('Error submitting comment:', error);
            setCommentError(error.message || 'Something went wrong');
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatDate = (date) => {
        try {
            return format(new Date(date), 'MMM d, yyyy');
        } catch {
            return 'Unknown date';
        }
    };

    const handleLikeComment = async (commentId) => {
        if (!session) return; // Require login

        try {
            const response = await fetch(`/api/blogs/${id}/comments/${commentId}/like`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to like comment');
            }

            fetchComments(); // Refresh comments
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };
    if (!id) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4">Error</h2>
                    <p className="mb-4 text-gray-600">Blog ID not found</p>
                    <Link
                        href="/blogs"
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Back to Blogs
                    </Link>
                </div>
            </div>
        );
    }
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading article...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
                    <p className="mb-4 text-gray-600">{error}</p>
                    <Link
                        href="/blogs"
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Back to Blogs
                    </Link>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4">Blog Not Found</h2>
                    <p className="mb-4 text-gray-600">
                        The article you're looking for could not be found or may have been removed.
                    </p>
                    <Link
                        href="/blogs"
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Browse All Blogs
                    </Link>
                </div>
            </div>
        );
    }

    // Check if this is a draft and not viewable
    if (blog.status === 'draft' && (!session || blog.author._id !== session.user.id)) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4">Not Available</h2>
                    <p className="mb-4 text-gray-600">
                        This article is currently a draft and not yet published.
                    </p>
                    <Link
                        href="/blogs"
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Browse Published Blogs
                    </Link>
                </div>
            </div>
        );
    }

    // Format the date
    const publishDate = blog.publishedAt
        ? formatDate(blog.publishedAt)
        : 'Not published yet';

    // Check if the current user is the author
    const isAuthor = session?.user && blog.author._id === session.user.id;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Author actions bar */}
            {isAuthor && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 flex justify-between items-center">
                    <div>
                        <span className="text-sm text-gray-500">You are viewing your blog post as it appears to readers.</span>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={`/blogs/edit/${blog._id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                        <Link
                            href="/dashboard/blogs"
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>
                </div>
            )}

            {/* Blog header */}
            <header className="mb-8">
                {blog.category && (
                    <div className="mb-2">
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {blog.category}
                        </span>
                    </div>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

                {blog.summary && (
                    <p className="text-xl text-gray-500 mb-6">{blog.summary}</p>
                )}

                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        {blog.author.profilePicture ? (
                            <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={blog.author.profilePicture}
                                alt={blog.author.name}
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                {blog.author.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{blog.author.name}</p>
                        <div className="flex items-center">
                            <time dateTime={blog.publishedAt} className="text-sm text-gray-500">
                                {publishDate}
                            </time>
                            <span className="mx-1 text-gray-500">·</span>
                            <span className="text-sm text-gray-500">
                                {blog.viewCount || 0} {blog.viewCount === 1 ? 'view' : 'views'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Featured image */}
            {blog.featuredImage && (
                <div className="mb-8 rounded-lg overflow-hidden">
                    <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-auto object-cover"
                    />
                </div>
            )}

            {/* Blog content */}
            <article className="prose lg:prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </article>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-sm font-medium text-gray-500 mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                        {blog.tags.map(tag => (
                            <Link
                                key={tag}
                                href={`/blogs?tag=${tag}`}
                                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Author box */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        {blog.author.profilePicture ? (
                            <img
                                className="h-14 w-14 rounded-full object-cover"
                                src={blog.author.profilePicture}
                                alt={blog.author.name}
                            />
                        ) : (
                            <div className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                                {blog.author.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">About {blog.author.name}</h3>
                        <p className="text-gray-500 mt-1">
                            {blog.author.bio || `Author of ${blog.title}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* More from author */}
            {relatedBlogs.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">More from this author</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {relatedBlogs.map(relatedBlog => (
                            <div key={relatedBlog._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {relatedBlog.featuredImage ? (
                                    <div className="h-40 bg-gray-200 relative">
                                        <img
                                            src={relatedBlog.featuredImage}
                                            alt={relatedBlog.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-40 bg-gray-200 flex items-center justify-center">
                                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="text-md font-semibold text-gray-900 truncate">
                                        <Link href={`/blogs/${relatedBlog._id}`} className="hover:text-blue-600">
                                            {relatedBlog.title}
                                        </Link>
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                        {relatedBlog.summary || relatedBlog.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comments section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

                {/* Comment form */}
                {session ? (
                    <form onSubmit={submitComment} className="mb-8">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                {session?.user?.image ? (
                                    <img src={session?.user?.image} alt={session?.user?.name} className="h-10 w-10 rounded-full" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="relative">
                                    <textarea
                                        rows={3}
                                        name="comment"
                                        id="comment"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Add a comment..."
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        required
                                    />
                                </div>
                                {commentError && (
                                    <p className="mt-2 text-sm text-red-600">{commentError}</p>
                                )}
                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                        Be respectful and constructive in your comments.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !commentInput.trim()}
                                        className={`
                      inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                      ${submittingComment || !commentInput.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                    `}
                                    >
                                        {submittingComment ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-4 mb-8 text-center">
                        <p className="text-gray-700">
                            Please <Link href="/login" className="text-blue-600 hover:text-blue-500">sign in</Link> to leave a comment.
                        </p>
                    </div>
                )}

                {/* Comments list */}
                {comments.length > 0 ? (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex space-x-3">
                                    <div className="flex-shrink-0">
                                        {comment.user?.profilePicture ? (
                                            <img src={comment.user.profilePicture} alt={comment.user?.name || 'User'} className="h-10 w-10 rounded-full" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {comment.user?.name || 'Anonymous'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(comment.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-700">
                                    <p>{comment.content}</p>
                                </div>

                                <div className="mt-2 flex items-center space-x-4">
                                    <button
                                        onClick={() => handleLikeComment(comment._id)}
                                        className={`flex items-center text-sm text-gray-500 hover:text-blue-600 ${comment?.likedBy?.includes(session?.user?.id) ? 'text-blue-600' : ''}`}
                                        disabled={!session}
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        <span>{comment.likes || 0}</span>
                                    </button>
                                    {(
                                        (session?.user && comment.user?._id === session.user.id) ||  // Comment author
                                        isAuthor ||                                                 // Blog author
                                        session?.user?.role === 'admin'                            // Admin user
                                    ) && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="flex items-center text-sm text-gray-500 hover:text-red-600 cursor-pointer"
                                            >
                                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span>Delete</span>
                                            </button>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>

                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                    </div>
                )}
            </div>
        </div>
    );
}