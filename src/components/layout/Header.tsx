// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Compass, Briefcase, Bookmark, LogIn, LogOut, UserCircle, Settings, LifeBuoy } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
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
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsLoadingUser(false);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Ensure client-side navigation reflects auth state, then refresh for server components
        if (pathname === '/login') {
            router.push('/');
        }
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        // Redirect to home or login after sign out
        if (pathname.startsWith('/saved-jobs')) { // or any other protected route
            router.push('/');
        } else {
            router.refresh(); // Refresh current page if not a protected one
        }
      }
    });

    // Check initial session
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsLoadingUser(false);
    };
    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle router.refresh() or redirects
  };

  const navItems = [
    { href: '/', label: 'Find Jobs', icon: Briefcase, requiresAuth: false },
    { href: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark, requiresAuth: true },
  ];

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
                 return ( // Skeleton for nav items that require auth while user is loading
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
             <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                   {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || user.email || "User Avatar"}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full"
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
                      {user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {/* Example items - customize as needed */}
                  {/* <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
                </DropdownMenuGroup>
                {/* <DropdownMenuSeparator /> */}
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
