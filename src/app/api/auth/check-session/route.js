// src/app/api/auth/check-session/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const cookies = request.cookies;
  const sessionToken = cookies.get('session_token')?.value;
  const userInfo = cookies.get('user_info')?.value;
  
  let parsedUserInfo = null;
  try {
    if (userInfo) {
      parsedUserInfo = JSON.parse(decodeURIComponent(userInfo));
    }
  } catch (e) {
    console.error('Error parsing user info cookie:', e);
  }
  
  return NextResponse.json({
    hasSessionToken: !!sessionToken,
    hasUserInfo: !!userInfo,
    accountType: parsedUserInfo?.accountType || 'none',
    parsedUserInfo,
    allCookies: Object.fromEntries(
      Array.from(cookies.getAll()).map(cookie => [cookie.name, cookie.value])
    ),
    timestamp: new Date().toISOString()
  });
}