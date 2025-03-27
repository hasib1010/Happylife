'use client';
// src/app/products/page.js
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function ProductsIndexPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isActive } = useSubscription();
  
  const isSeller = session?.user?.role === 'seller';

  useEffect(() => {
    // If authenticated and user is a seller, redirect to dashboard/products
    if (session && isSeller) {
      router.push('/dashboard/products');
    }
  }, [session, isSeller, router]);

  // Public products listing page or loading state
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>
        
        {!session ? (
          // Public view of products
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Would typically fetch and display public products here */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="font-semibold text-xl mb-2">Sample Product</h2>
                <p className="text-gray-600 mb-4">This is where public products would be displayed.</p>
                <Link 
                  href="/auth/signin" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Sign in to see more
                </Link>
              </div>
            </div>
          </div>
        ) : !isSeller ? (
          // Logged in user who is not a seller
          <div>
            <p className="text-lg mb-4">Browse available products or become a seller to offer your own products.</p>
            <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg">
              <div className="px-6 py-10 sm:px-10">
                <h3 className="text-xl font-medium text-white">Become a Seller</h3>
                <div className="mt-2 text-sm text-purple-100">
                  <p>List your wellness products on our platform and reach customers seeking health and wellness solutions.</p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/subscription/choose"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-purple-600 bg-white hover:bg-purple-50"
                  >
                    Upgrade your account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Loading state
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}