import { CreateBlogForm } from '@/components/blogs/CreateBlogForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Blog Post | Career Compass Admin',
  description: 'Create a new blog post for Career Compass.',
};

export default function CreateBlogPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Blog Post</h1>
      <CreateBlogForm />
    </div>
  );
} 