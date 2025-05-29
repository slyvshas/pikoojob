"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Compass, Briefcase, Bookmark } from 'lucide-react';

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Find Jobs', icon: Briefcase },
  ];

  return (
    <div className="flex items-center gap-6">
      <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
        <Compass size={24} aria-hidden="true" />
        <span className="font-bold text-lg">PikooJobs</span>
      </Link>
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              "text-sm font-medium",
              pathname === item.href
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            )}
          >
            <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              <item.icon size={16} className="mr-1.5" aria-hidden="true" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
} 