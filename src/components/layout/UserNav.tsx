"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, PlusCircle, UserCircle, Settings, LifeBuoy, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@supabase/supabase-js';
import type { Profile } from '@/types_db';

interface UserNavProps {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

export function UserNav({ user, profile, isLoading }: UserNavProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const displayName = profile?.full_name || profile?.username || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const isAdmin = profile?.is_admin === true;

  if (isLoading) {
    return <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button 
          variant="outline" 
          onClick={() => router.push('/login')}
          className="h-8 px-2 sm:h-9 sm:px-4 text-xs sm:text-sm"
        >
          <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Sign In</span>
          <span className="sm:hidden">Login</span>
        </Button>
        <Button 
          variant="default" 
          onClick={() => router.push('/signup')}
          className="h-8 px-2 sm:h-9 sm:px-4 text-xs sm:text-sm"
        >
          <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Sign Up</span>
          <span className="sm:hidden">Join</span>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName || 'User avatar'}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <UserCircle className="h-6 w-6 sm:h-8 sm:w-8" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 sm:w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isAdmin && (
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-sm py-2"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 