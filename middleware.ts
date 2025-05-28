import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Profile } from '@/types_db'; // Import Profile type

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session: currentSession } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // Protect /saved-jobs route
  if (!currentSession && pathname.startsWith('/saved-jobs')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!currentSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(url);
    }

    // Check if the user is an admin
    let profile: Pick<Profile, 'is_admin'> | null = null;
    let profileErrorObj: any = null;

    try {
        const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentSession.user.id)
        .single<Pick<Profile, 'is_admin'>>();
        
        profile = data;
        profileErrorObj = error;
    } catch (e) { // Catch unexpected errors during the call itself
        profileErrorObj = e;
    }
    

    if (profileErrorObj) {
      if (profileErrorObj.code === 'PGRST116') { // No profile row found
        // This is expected if a user exists in auth but not in profiles yet.
        console.log(`[Middleware] No profile found for user ${currentSession.user.id} during admin check. User will be treated as non-admin.`);
      } else if (profileErrorObj.code === '42P01') { // Table doesn't exist
        console.warn(`[Middleware] The 'profiles' table does not seem to exist in Supabase. Admin check for user ${currentSession.user.id} will fail.`);
      } else {
        console.error('[Middleware] Error fetching profile for admin check:', profileErrorObj.message);
      }
    }

    if (!profile || !profile.is_admin) {
      // Not an admin or error fetching profile, redirect to home or an unauthorized page
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'unauthorized_admin_access');
      console.log(`[Middleware] Admin access denied for user ${currentSession.user.id} to path ${pathname}. Profile: ${JSON.stringify(profile)}`);
      return NextResponse.redirect(url);
    }
  }
  
  // If user is logged in and tries to access /login, redirect to home
  if (currentSession && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (Supabase OAuth callback)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
