// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Compass, Briefcase, Bookmark, LogIn, LogOut, UserCircle, Settings, LifeBuoy, PlusCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types_db'; // Import Profile type
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Start true, set to false after initial auth check

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`[Header] No profile found for user ${userId}. This is normal if the profile hasn't been created yet.`);
        } else if (error.code === '42P01') {
          console.warn(`[Header] The 'profiles' table does not seem to exist in your Supabase database. User: ${userId}`);
        } else {
          console.error('[Header] Error fetching profile:', error.message);
        }
        setProfile(null);
      } else {
        setProfile(data as Profile | null);
        console.log('[Header] Profile fetched:', data); // DEBUG
      }
    };

    // onAuthStateChange will also handle the initial session check
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Header] onAuthStateChange event:', event, 'session user:', session?.user?.id); // DEBUG
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      // This will be called after the first auth state is processed (initial or changed)
      setIsLoadingUser(false);

      // Refresh server-side session/cookies for relevant events
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        console.log('[Header] Refreshing router due to event:', event); // DEBUG
        router.refresh();
      }

      // Handle redirection logic based on events
      if (event === 'SIGNED_IN') {
        if (pathname === '/login') {
          console.log('[Header] Signed in event, currently on /login, redirecting to /'); // DEBUG
          router.replace('/'); // Use replace to avoid login page in history
        }
      } else if (event === 'SIGNED_OUT') {
        // If on a protected route, redirect to home
        if (pathname.startsWith('/saved-jobs') || pathname.startsWith('/admin')) {
          console.log('[Header] Signed out event, redirecting from protected route to /'); // DEBUG
          router.push('/');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, pathname]); // pathname is needed to check if current path is /login for redirects

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange listener will handle router.refresh() and clearing profile
  };

  const navItems = [
    { href: '/', label: 'Find Jobs', icon: Briefcase, requiresAuth: false },
    { href: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark, requiresAuth: true },
  ];

  const displayName = profile?.full_name || profile?.username || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const isAdmin = profile?.is_admin === true;

  // Debug log for rendering state
  // console.log('[Header Render] User:', user?.id, 'Profile Admin:', profile?.is_admin, 'isAdmin:', isAdmin, 'isLoadingUser:', isLoadingUser);

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Compass size={28} aria-hidden="true" />
          <h1 className="text-xl sm:text-2xl font-bold">Career Compass</h1>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            if (item.requiresAuth && !user && !isLoadingUser) return null;
            if (item.requiresAuth && isLoadingUser) {
                 return (
                    <Skeleton key={item.href} className="h-8 w-24 rounded-md hidden sm:block" />
                 );
            }
            return (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "text-sm font-medium px-2 sm:px-3 py-1.5 h-auto",
                  pathname === item.href
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                  <item.icon size={16} className="mr-1 sm:mr-1.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden sr-only">{item.label}</span>
                </Link>
              </Button>
            );
          })}

          {isLoadingUser ? (
             <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                   {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName || "User Avatar"}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle size={24} className="text-muted-foreground" />
                    )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push('/admin/post-job')}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Post New Job</span>
                    </DropdownMenuItem>
                  )}
                  {/* Example items - customize as needed */}
                  {/* <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem> */}
                </DropdownMenuGroup>
                {(isAdmin) && <DropdownMenuSeparator />}
                {/* <DropdownMenuItem>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" asChild className="text-sm font-medium px-2 sm:px-3 py-1.5 h-auto">
              <Link href="/login">
                <LogIn size={16} className="mr-1 sm:mr-1.5" />
                 <span className="hidden sm:inline">Login</span>
                 <span className="sm:hidden sr-only">Login</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
