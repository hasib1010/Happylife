'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/components/auth/AuthProvider';

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}