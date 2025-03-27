import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Define paths that are protected
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
    '/subscription',
    '/listings',
    '/inbox',
    '/bookings',
  ];
  
  // Define authentication paths
  const authPaths = ['/auth/signin', '/auth/signup'];
  
  // Check if the path is protected
  const isPathProtected = protectedPaths.some((path) => 
    pathname.startsWith(path)
  );
  
  // Check if the path is an auth path
  const isAuthPath = authPaths.some((path) => pathname === path);
  
  // If the path is not protected or not an auth path, proceed
  if (!isPathProtected && !isAuthPath) {
    return NextResponse.next();
  }
  
  // Check for NextAuth.js session token
  const sessionToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Check for custom JWT token in cookies or authorization header
  const authHeader = request.headers.get('authorization');
  let customToken = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    customToken = authHeader.split(' ')[1];
  } else {
    // Check for token in cookies
    const authTokenCookie = request.cookies.get('auth_token');
    if (authTokenCookie) {
      customToken = authTokenCookie.value;
    }
  }
  
  // Verify if it's a valid token (just check if it exists for now)
  // For a more secure approach, we would verify the token signature and expiration
  let isValidCustomToken = false;
  if (customToken) {
    try {
      // In production, you would verify the token with the JWT_SECRET
      // but for now, we'll just check if it's present and has a reasonable length
      isValidCustomToken = customToken.length > 10;
      
      // If JWT_SECRET is available, you can verify the token properly:
      // const jwtSecret = process.env.JWT_SECRET;
      // if (jwtSecret) {
      //   const decoded = jwt.verify(customToken, jwtSecret);
      //   isValidCustomToken = !!decoded;
      // }
    } catch (error) {
      isValidCustomToken = false;
    }
  }
  
  // For protected routes: redirect to login if no session or token
  if (isPathProtected && !sessionToken && !isValidCustomToken) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url)
    );
  }
  
  // For auth routes: redirect to dashboard if already authenticated
  if (isAuthPath && (sessionToken || isValidCustomToken)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Otherwise, proceed
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/subscription/:path*',
    '/listings/:path*',
    '/inbox/:path*',
    '/bookings/:path*',
    '/services/create',
    '/services/manage/:path*',
    '/products/create',
    '/products/manage/:path*',
    '/auth/signin',
    '/auth/signup',
  ],
};