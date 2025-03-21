// src/app/admin/layout.jsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, CreditCard, FileText, BarChart2, Settings, Home, Menu, X, LogOut
} from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);

  // Debug: verify admin status when component mounts
  useEffect(() => {
    console.log('Admin layout - Current user:', user);
    console.log('Account type:', user?.accountType);
    console.log('Current cookies:', document.cookie);
    
    // Check if cookies are correctly set for middleware
    if (user) {
      const cookies = document.cookie.split(';');
      
      // Check for user_info cookie
      const userInfoCookie = cookies.find(c => c.trim().startsWith('user_info='));
      if (userInfoCookie) {
        try {
          const cookieValue = userInfoCookie.split('=')[1];
          const decodedValue = decodeURIComponent(cookieValue);
          const parsedValue = JSON.parse(decodedValue);
          
          console.log('User info cookie parsed:', parsedValue);
          
          if (parsedValue.accountType !== 'admin') {
            console.warn('User in cookie is not an admin: ' + parsedValue.accountType);
            
            // Fix the cookie - update it with correct role
            if (user.accountType === 'admin') {
              console.log('Fixing admin cookie...');
              
              // Directly set the cookie with correct admin role
              const fixedCookieValue = encodeURIComponent(JSON.stringify({
                id: user.id,
                accountType: 'admin'
              }));
              
              document.cookie = `user_info=${fixedCookieValue}; path=/; max-age=${60*60*24}; SameSite=Lax`;
            }
          } else {
            console.log('User info cookie correctly indicates admin role');
            setAuthVerified(true);
          }
        } catch (e) {
          console.error('Error checking user_info cookie:', e);
        }
      } else {
        console.warn('No user_info cookie found!');
        
        // Recreate the cookie
        if (user.accountType === 'admin') {
          console.log('Recreating admin cookie...');
          
          const cookieValue = encodeURIComponent(JSON.stringify({
            id: user.id,
            accountType: 'admin'
          }));
          
          document.cookie = `user_info=${cookieValue}; path=/; max-age=${60*60*24}; SameSite=Lax`;
          
          // Also ensure session token is set
          if (user.sessionToken) {
            document.cookie = `session_token=${user.sessionToken}; path=/; max-age=${60*60*24}; SameSite=Lax`;
          }
        }
      }
      
      // Check for session_token cookie
      const sessionTokenCookie = cookies.find(c => c.trim().startsWith('session_token='));
      if (!sessionTokenCookie && user.sessionToken) {
        console.warn('No session_token cookie found! Recreating...');
        document.cookie = `session_token=${user.sessionToken}; path=/; max-age=${60*60*24}; SameSite=Lax`;
      }
    }
  }, [user]);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart2, current: pathname === '/admin/dashboard' },
    { name: 'Users', href: '/admin/users', icon: Users, current: pathname.startsWith('/admin/users') },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard, current: pathname.startsWith('/admin/subscriptions') },
    { name: 'Content', href: '/admin/content', icon: FileText, current: pathname.startsWith('/admin/content') },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: pathname.startsWith('/admin/settings') },
  ];

  // If user is not an admin, show error message (this is a fallback)
  if (user && user.accountType !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to access the admin area.</p>
          <p className="mb-6">Your current role: <span className="font-semibold">{user.accountType}</span></p>
          <div className="flex justify-between">
            <Link href="/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Go to Dashboard
            </Link>
            <button 
              onClick={signOut} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`${sidebarOpen ? 'fixed' : 'hidden'} md:hidden inset-0 flex z-40`}>
        <div
          className={`${sidebarOpen ? 'fixed' : 'hidden'} inset-0 bg-gray-600 bg-opacity-75`}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-emerald-600">HappyLife Admin</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${item.current
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <item.icon className={`${item.current ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-4 h-6 w-6`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={signOut}
              className="flex-shrink-0 group block w-full"
            >
              <div className="flex items-center">
                <div>
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.name || 'Admin User'}
                  </p>
                  <div className="flex items-center text-sm font-medium text-red-500 group-hover:text-red-700">
                    <LogOut className="mr-1 h-4 w-4" />
                    Sign out
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-emerald-600">HappyLife Admin</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${item.current
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon className={`${item.current ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={signOut}
                className="flex-shrink-0 w-full group flex items-center"
              >
                <div>
                  <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.name || 'Admin User'}
                  </p>
                  <div className="flex items-center text-xs font-medium text-red-500 group-hover:text-red-700">
                    <LogOut className="mr-1 h-3 w-3" />
                    Sign out
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          {/* Page header */}
          <div className="flex md:hidden mb-4 shadow-sm bg-white">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center w-full">
              <div className="flex items-center">
                <Link href="/">
                  <Home className="h-6 w-6 text-emerald-600 mr-2" />
                </Link>
                <h1 className="text-lg font-semibold text-gray-900">
                  {navigation.find(nav => nav.current)?.name || 'Admin Panel'}
                </h1>
              </div>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}