// src/app/layout.js
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/auth';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import './globals.css';

// Import the database initialization
import '@/lib/db';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'HappyLife.Services',
    template: '%s | HappyLife.Services',
  },
  description: 'Find holistic wellness products and trusted providers in one place',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <NavigationMenu />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}