// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Compass, Briefcase, Bookmark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Find Jobs', icon: Briefcase },
    { href: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  ];

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Compass size={28} aria-hidden="true" />
          <h1 className="text-xl sm:text-2xl font-bold">Career Compass</h1>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium px-2 sm:px-3 py-1.5 h-auto", // Adjusted padding and height
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
          ))}
        </nav>
      </div>
    </header>
  );
}
