import { getAllBlogs } from '@/lib/blogs';
import { BlogCard } from '@/components/blogs/BlogCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Career Compass',
  description: 'Career advice, industry insights, and job search tips.',
};

export default async function BlogsPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Career Insights & Advice</h1>
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog posts available yet.</p>
        </div>
      )}
    </div>
  );
} 