import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/auth/SessionProvider'; // NextAuth wrapper
import { AuthProvider } from '@/components/auth/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HappyLife.Services - Health & Wellness Directory',
  description: 'Find trusted health and wellness providers and products and blogs for your holistic well-being journey .',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow"> 
                <SubscriptionProvider>
                  <Toaster position="top-right" />
                  {children}
                </SubscriptionProvider>
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}