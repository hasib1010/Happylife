// src/app/admin/dashboard/layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminDashboardLayout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    // Authentication and authorization check
    useEffect(() => {
        if (status === 'loading') return;

        // Only redirect if not authenticated or not admin
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/admin/dashboard');
            return;
        }

        if (session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }

        setIsLoading(false);
    }, [status, session, router]);


    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className=" ">
            {children}
        </div>
    );
}