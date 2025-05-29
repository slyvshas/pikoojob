import { getBlogBySlug, deleteBlog } from '@/lib/blogs';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { createSupabaseServerClient } from '@/lib/supabase/server-actions';
import { cookies } from 'next/headers';
import { DeleteBlogButton } from '@/components/blogs/DeleteBlogButton';
import { format } from 'date-fns';
import type { Metadata } from 'next';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    return {
      title: 'Blog Not Found',
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    notFound();
  }

  // Get the current user to check if they can delete the blog
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const canDelete = user?.id === blog.created_by;

  const formattedDate = format(new Date(blog.published_at), 'MMMM d, yyyy');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-2xl bg-card p-8 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />
            
            <div className="relative">
              <Link 
                href="/blogs"
                className="group mb-8 inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
                Back to Blogs
              </Link>

              <h1 className="mb-6 text-4xl font-bold tracking-tight gradient-text">
                {blog.title}
              </h1>

              <div className="mb-8 flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary/50" />
                  {blog.author_name}
                </span>
                <span>•</span>
                <time dateTime={blog.published_at}>{formattedDate}</time>
              </div>

              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
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

              {blog.cover_image_url && (
                <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={blog.cover_image_url}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {canDelete && (
                <div className="mt-8 flex justify-end">
                  <DeleteBlogButton blogId={blog.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 