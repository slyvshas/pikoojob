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
  const [profile, setProfile] = useState<Profile | null>(null); // State for profile data
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*') // Fetch all profile fields
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data as Profile | null); // Cast to Profile
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setProfile(null); // Reset profile on auth change

      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setIsLoadingUser(false);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (pathname === '/login') {
            router.push('/');
        }
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        if (pathname.startsWith('/saved-jobs') || pathname.startsWith('/admin')) { // Also redirect from admin if logged out
            router.push('/');
        } else {
            router.refresh();
        }
      }
    });

    // Check initial session
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
        setIsLoadingUser(false);
    };
    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null); // Clear profile on logout
    // The onAuthStateChange listener will handle router.refresh() or redirects
  };

  const navItems = [
    { href: '/', label: 'Find Jobs', icon: Briefcase, requiresAuth: false },
    { href: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark, requiresAuth: true },
  ];

  const displayName = profile?.full_name || profile?.username || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const isAdmin = profile?.is_admin === true;


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
                {(isAdmin) && <DropdownMenuSeparator />} {/* Separator only if admin items were shown */}
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
