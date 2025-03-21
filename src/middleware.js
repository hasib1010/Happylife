// src/middleware.js
import { NextResponse } from 'next/server';
import { ROLES, mapAccountTypeToRole } from '@/lib/constants';

// Protected routes configuration
const protectedRoutes = {
  admin: {
    pathStart: '/admin',
    requiredRoles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  provider: {
    pathStart: '/dashboard/provider',
    requiredRoles: [ROLES.PROVIDER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  seller: {
    pathStart: '/dashboard/products',
    requiredRoles: [ROLES.PRODUCT_SELLER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  dashboard: {
    pathStart: '/dashboard',
    requiredRoles: [ROLES.REGULAR, ROLES.PROVIDER, ROLES.PRODUCT_SELLER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
};

export async function middleware(request) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and public assets
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/static/') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = Object.values(protectedRoutes).some(
    route => pathname.startsWith(route.pathStart)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get authentication cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const userInfoCookie = request.cookies.get('user_info')?.value;

  // If no access token, redirect to login
  if (!accessToken) {
    console.log('No access token found, redirecting to login');
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url));
  }

  // If no user info cookie, refresh might be needed
  if (!userInfoCookie) {
    // Try to handle this with a client-side refresh
    // For now, redirect to refresh endpoint which will then redirect back
    console.log('No user info cookie found, redirecting to refresh');
    return NextResponse.redirect(new URL(`/api/auth/refresh?redirect=${encodeURIComponent(pathname)}`, request.url));
  }

  // Parse user info
  let userInfo;
  try {
    userInfo = JSON.parse(decodeURIComponent(userInfoCookie));
  } catch (error) {
    console.error('Error parsing user info cookie:', error);
    // Invalid user info cookie, redirect to login
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}&error=invalid_session`, request.url));
  }

  // Check role-based access for each protected route type
  for (const [key, route] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route.pathStart)) {
      // Get user role or map from accountType for backward compatibility
      const userRole = userInfo.role || mapAccountTypeToRole(userInfo.accountType);
      
      if (!route.requiredRoles.includes(userRole)) {
        console.log(`Access denied for role ${userRole} to ${pathname}`);
        
        // Determine appropriate redirect based on user role
        let redirectPath = '/dashboard';
        
        if ([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(userRole)) {
          redirectPath = '/admin/dashboard';
        } else if (userRole === ROLES.PROVIDER) {
          redirectPath = '/dashboard/provider';
        } else if (userRole === ROLES.PRODUCT_SELLER) {
          redirectPath = '/dashboard/products';
        }
        
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  // If all checks pass, allow the request
  return NextResponse.next();
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Include all routes except:
    // - API routes
    // - Next.js internal routes
    // - Static files
    // - Auth pages
    '/((?!api|_next|static|auth).*)',
  ],
};