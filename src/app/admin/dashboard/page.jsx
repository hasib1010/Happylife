'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/authUtils';
import toast from 'react-hot-toast';

// Admin Components (we'll define these next)
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminUsersList from '@/components/admin/AdminUsersList';
import AdminSubscriptions from '@/components/admin/AdminSubscriptions';
import AdminServices from '@/components/admin/AdminServices';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminBlogs from '@/components/admin/AdminBlogs';

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch admin dashboard stats
  const fetchAdminStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/admin/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin statistics');
      }
      
      const data = await response.json();
      setAdminStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err.message);
      toast.error(`Error loading admin data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is admin on component mount
  useEffect(() => {
    if (!authLoading && !loading) {
      if (!isAuthenticated) {
        toast.error('You must be logged in to access this page');
        router.push('/auth/signin?callbackUrl=/admin/dashboard');
        return;
      }
      
      if (!hasRole('admin')) {
        toast.error('You do not have permission to access the admin dashboard');
        router.push('/dashboard');
        return;
      }
    }
  }, [authLoading, loading, isAuthenticated, hasRole, router]);

  // Fetch admin stats when component mounts
  useEffect(() => {
    if (isAuthenticated && hasRole('admin')) {
      fetchAdminStats();
    }
  }, [isAuthenticated, hasRole, fetchAdminStats]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          <p className="mt-4 text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!isAuthenticated || !hasRole('admin')) {
    return null; // Redirect is handled in useEffect
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Error Loading Admin Dashboard</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={fetchAdminStats}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Render different components based on active tab */}
        {activeTab === 'overview' && <AdminOverview stats={adminStats} />}
        {activeTab === 'users' && <AdminUsersList />}
        {activeTab === 'subscriptions' && <AdminSubscriptions />}
        {activeTab === 'services' && <AdminServices />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'blogs' && <AdminBlogs />}
      </div>
    </div>
  );
}