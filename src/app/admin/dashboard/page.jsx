// src/app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    CreditCard,
    FileText,
    BarChart2,
    Settings,
    Loader2,
    ShoppingBag,
    PenLine,
    Search,
    Filter,
    ChevronDown,
    AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated, accountType } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalSubscribers: 0,
        totalProviders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        recentUsers: [],
        recentSubscriptions: []
    });
    const [activeTab, setActiveTab] = useState('overview');

    // Replace with this simplified version:
    useEffect(() => {
        if (!loading && isAuthenticated) {
            fetchDashboardData();
        }
    }, [loading, isAuthenticated]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // In a real application, you would fetch actual data from your API
            // For now, set mock data
            setDashboardData({
                totalUsers: 265,
                totalSubscribers: 142,
                totalProviders: 87,
                totalProducts: 314,
                totalRevenue: 28460,
                recentUsers: [
                    { id: '1', name: 'Jane Smith', email: 'jane@example.com', accountType: 'provider', subscriptionStatus: 'active', createdAt: '2025-03-15T10:23:01Z' },
                    { id: '2', name: 'John Doe', email: 'john@example.com', accountType: 'product_seller', subscriptionStatus: 'active', createdAt: '2025-03-14T14:56:33Z' },
                    { id: '3', name: 'Alice Johnson', email: 'alice@example.com', accountType: 'regular', subscriptionStatus: 'none', createdAt: '2025-03-13T09:12:45Z' },
                    { id: '4', name: 'Robert Williams', email: 'robert@example.com', accountType: 'provider', subscriptionStatus: 'past_due', createdAt: '2025-03-12T16:39:27Z' },
                    { id: '5', name: 'Emma Davis', email: 'emma@example.com', accountType: 'product_seller', subscriptionStatus: 'canceled', createdAt: '2025-03-11T11:05:18Z' },
                ],
                recentSubscriptions: [
                    { id: '101', userId: '1', plan: 'provider', status: 'active', amount: 20, createdAt: '2025-03-15T10:25:12Z' },
                    { id: '102', userId: '2', plan: 'product_seller', status: 'active', amount: 20, createdAt: '2025-03-14T15:02:47Z' },
                    { id: '103', userId: '4', plan: 'provider', status: 'past_due', amount: 20, createdAt: '2025-02-12T16:40:55Z' },
                    { id: '104', userId: '5', plan: 'product_seller', status: 'canceled', amount: 20, createdAt: '2025-01-11T11:08:36Z' },
                ]
            });
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    // If not authenticated or not admin, show placeholder while redirecting
    if (!isAuthenticated || accountType !== 'admin') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-gray-900">
                        {!isAuthenticated ? 'Please sign in to access the admin dashboard' : 'Unauthorized access'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">Redirecting...</p>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                return (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                            <div className="flex space-x-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                    <Filter className="h-5 w-5 mr-1" />
                                    <span>Filter</span>
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Account Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subscription
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData.recentUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.accountType === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    user.accountType === 'provider' ? 'bg-blue-100 text-blue-800' :
                                                        user.accountType === 'product_seller' ? 'bg-emerald-100 text-emerald-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.accountType.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                                                    user.subscriptionStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                                                        user.subscriptionStatus === 'canceled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.subscriptionStatus === 'none' ? 'No subscription' : user.subscriptionStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={`/admin/users/${user.id}`} className="text-emerald-600 hover:text-emerald-900 mr-3">
                                                    Edit
                                                </Link>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">{dashboardData.totalUsers}</span> users
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'subscriptions':
                return (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Subscription Management</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Plan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData.recentSubscriptions.map((subscription) => {
                                        // Find the corresponding user
                                        const user = dashboardData.recentUsers.find(u => u.id === subscription.userId);

                                        return (
                                            <tr key={subscription.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono text-gray-900">{subscription.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{user?.name || 'Unknown'}</div>
                                                    <div className="text-sm text-gray-500">{user?.email || 'No email'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscription.plan === 'provider' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                        {subscription.plan.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                                                            subscription.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {subscription.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${subscription.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(subscription.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/admin/subscriptions/${subscription.id}`} className="text-emerald-600 hover:text-emerald-900">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'content':
                return (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Provider Services</h2>
                            </div>
                            <div className="p-4 sm:p-6 flex flex-col items-center justify-center h-64 text-center">
                                <PenLine className="h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-gray-500">Provider services management will be available soon.</p>
                                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                    Create Service Template
                                </button>
                            </div>
                        </div>
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Product Listings</h2>
                            </div>
                            <div className="p-4 sm:p-6 flex flex-col items-center justify-center h-64 text-center">
                                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-gray-500">Product listings management will be available soon.</p>
                                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                    Create Product Template
                                </button>
                            </div>
                        </div>
                        <div className="bg-white shadow rounded-lg overflow-hidden md:col-span-2">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Blog Posts</h2>
                            </div>
                            <div className="p-4 sm:p-6 flex flex-col items-center justify-center h-64 text-center">
                                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-gray-500">Blog post management will be available soon.</p>
                                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                    Create Blog Post
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Admin Settings</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">General</h3>
                                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                                        <p>Configure general platform settings.</p>
                                    </div>
                                    <div className="mt-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">Allow New Registrations</h4>
                                                <p className="text-xs text-gray-500">Enable or disable new user registrations</p>
                                            </div>
                                            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                <input type="checkbox" id="toggle-registrations" className="sr-only" defaultChecked />
                                                <div className="h-6 bg-gray-200 rounded-full shadow-inner"></div>
                                                <div className="absolute block w-4 h-4 mt-1 ml-1 bg-white rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transition-transform duration-300 ease-in-out"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                                                <p className="text-xs text-gray-500">Put the platform in maintenance mode</p>
                                            </div>
                                            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                <input type="checkbox" id="toggle-maintenance" className="sr-only" />
                                                <div className="h-6 bg-gray-200 rounded-full shadow-inner"></div>
                                                <div className="absolute block w-4 h-4 mt-1 ml-1 bg-white rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transition-transform duration-300 ease-in-out"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription</h3>
                                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                                        <p>Configure subscription settings.</p>
                                    </div>
                                    <div className="mt-5 space-y-4">
                                        <div>
                                            <label htmlFor="provider-price" className="block text-sm font-medium text-gray-700">Provider Plan Price ($)</label>
                                            <div className="mt-1">
                                                <input type="number" name="provider-price" id="provider-price" defaultValue="20" className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="seller-price" className="block text-sm font-medium text-gray-700">Product Seller Plan Price ($)</label>
                                            <div className="mt-1">
                                                <input type="number" name="seller-price" id="seller-price" defaultValue="20" className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 flex justify-end border-t border-gray-200">
                                    <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                        Cancel
                                    </button>
                                    <button type="button" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'overview':
            default:
                return (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                                            <Users className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Users
                                                </dt>
                                                <dd className="text-lg font-semibold text-gray-900">
                                                    {dashboardData.totalUsers}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <Link href="/admin/users" className="font-medium text-emerald-600 hover:text-emerald-500">
                                            View all users
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                            <CreditCard className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Active Subscribers
                                                </dt>
                                                <dd className="text-lg font-semibold text-gray-900">
                                                    {dashboardData.totalSubscribers}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <Link href="/admin/subscriptions" className="font-medium text-emerald-600 hover:text-emerald-500">
                                            View all subscriptions
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                            <PenLine className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Service Providers
                                                </dt>
                                                <dd className="text-lg font-semibold text-gray-900">
                                                    {dashboardData.totalProviders}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <Link href="/admin/providers" className="font-medium text-emerald-600 hover:text-emerald-500">
                                            View all providers
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                            <ShoppingBag className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Products
                                                </dt>
                                                <dd className="text-lg font-semibold text-gray-900">
                                                    {dashboardData.totalProducts}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <Link href="/admin/products" className="font-medium text-emerald-600 hover:text-emerald-500">
                                            View all products
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Stats */}
                        <div className="mt-6 bg-white shadow rounded-lg">
                            <div className="px-5 py-4 border-b border-gray-200">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Revenue Overview</h3>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">${dashboardData.totalRevenue.toLocaleString()}</h4>
                                        <p className="text-gray-500">Total Revenue</p>
                                    </div>
                                    <div className="flex space-x-4">
                                        <select className="text-sm border-gray-300 rounded-md">
                                            <option>Last 7 days</option>
                                            <option>Last 30 days</option>
                                            <option>Last 3 months</option>
                                            <option>Last 12 months</option>
                                            <option>All time</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-6 h-64 flex items-center justify-center">
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <BarChart2 className="h-12 w-12 mr-3" />
                                        <p>Revenue chart visualization will appear here</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Users and Subscriptions */}
                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Recent Users */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Users</h3>
                                    <Link href="/admin/users" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                        View all
                                    </Link>
                                </div>
                                <div className="p-5">
                                    <div className="flow-root">
                                        <ul className="-my-5 divide-y divide-gray-200">
                                            {dashboardData.recentUsers.slice(0, 3).map((user) => (
                                                <li key={user.id} className="py-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                <span className="text-emerald-700 font-medium text-sm">
                                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {user.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.accountType === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                                user.accountType === 'provider' ? 'bg-blue-100 text-blue-800' :
                                                                    user.accountType === 'product_seller' ? 'bg-emerald-100 text-emerald-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {user.accountType.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Subscriptions */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Subscriptions</h3>
                                    <Link href="/admin/subscriptions" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                        View all
                                    </Link>
                                </div>
                                <div className="p-5">
                                    <div className="flow-root">
                                        <ul className="-my-5 divide-y divide-gray-200">
                                            {dashboardData.recentSubscriptions.slice(0, 3).map((subscription) => {
                                                // Find the corresponding user
                                                const user = dashboardData.recentUsers.find(u => u.id === subscription.userId);

                                                return (
                                                    <li key={subscription.id} className="py-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex-shrink-0">
                                                                <div className={`h-8 w-8 rounded-full ${subscription.plan === 'provider' ? 'bg-blue-100' : 'bg-emerald-100'} flex items-center justify-center`}>
                                                                    <span className={`${subscription.plan === 'provider' ? 'text-blue-700' : 'text-emerald-700'} font-medium text-sm`}>
                                                                        {subscription.plan === 'provider' ? 'P' : 'S'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {user?.name || 'Unknown User'}
                                                                </p>
                                                                <p className="text-sm text-gray-500 truncate">
                                                                    ${subscription.amount.toFixed(2)} - {subscription.plan.replace('_', ' ')}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                                    subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                                                                        subscription.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {subscription.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                Admin Dashboard
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        <button
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'subscriptions'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => setActiveTab('subscriptions')}
                        >
                            Subscriptions
                        </button>
                        <button
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'content'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => setActiveTab('content')}
                        >
                            Content Management
                        </button>
                        <button
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderTabContent()}
            </main>
        </div>
    );
}