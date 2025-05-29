// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Compass, Briefcase, Bookmark, LogIn, LogOut, UserCircle, Settings, LifeBuoy, PlusCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
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
import { MainNav } from './MainNav';
import { UserNav } from '@/components/layout/UserNav';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Extract only plain properties from the user object
      const plainUser = session?.user ? {
        id: session.user.id,
        email: session.user.email,
        // Add other necessary plain user properties here
        // e.g., user_metadata, app_metadata, role if they are plain objects/types
        user_metadata: session.user.user_metadata, // Assuming user_metadata is plain
        app_metadata: session.user.app_metadata // Assuming app_metadata is plain
      } : null;
      
      setUser(plainUser);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
       // Extract only plain properties from the user object
      const plainUser = session?.user ? {
        id: session.user.id,
        email: session.user.email,
        // Add other necessary plain user properties here
        user_metadata: session.user.user_metadata, // Assuming user_metadata is plain
        app_metadata: session.user.app_metadata // Assuming app_metadata is plain
      } : null;

      setUser(plainUser);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <Link
              href="/blogs"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === '/blogs' ? "text-primary" : "text-muted-foreground"
              )}
            >
              Blog
            </Link>
            <UserNav user={user} profile={profile} />
          </nav>
        </div>
      </div>
    </header>
  );
}
