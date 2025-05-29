"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image_url: string | null;
    author_name: string;
    published_at: string;
    tags: string[];
  };
}

export function BlogCard({ blog }: BlogCardProps) {
  const formattedDate = format(new Date(blog.published_at), 'MMMM d, yyyy');

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <article className="group relative overflow-hidden rounded-xl bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {blog.cover_image_url && (
          <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
            <Image
              src={blog.cover_image_url}
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="relative">
          <h2 className="mb-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
            {blog.title}
          </h2>
          
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {blog.excerpt}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary/50" />
              {blog.author_name}
            </span>
            <span>•</span>
            <time dateTime={blog.published_at}>{formattedDate}</time>
          </div>
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
} 