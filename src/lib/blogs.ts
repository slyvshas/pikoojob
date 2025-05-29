import { createSupabaseServerClient } from '@/lib/supabase/server-actions';
import { createClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';
import { slugify } from '@/lib/utils';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  cover_image_url: string | null;
  tags: string[];
  published_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  published_at: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  tags: string[];
}

// Client-side functions
export async function getAllBlogs(): Promise<Blog[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllBlogs:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog> {
  const supabase = await createSupabaseServerClient();
  const { data: blog, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }

  return blog as Blog;
}

// Server-side functions
export async function createBlog(blogData: Omit<Blog, 'id' | 'slug' | 'created_at' | 'updated_at'>): Promise<Blog> {
  const supabase = await createSupabaseServerClient();
  const slug = slugify(blogData.title);

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([
      {
        ...blogData,
        author_name: 'Pikoo Staff',
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating blog:', error);
    throw error;
  }

  return data as Blog;
}

export async function updateBlog(id: string, blogData: Partial<Omit<Blog, 'id' | 'slug' | 'created_at' | 'updated_at'>>): Promise<Blog> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      ...blogData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog:', error);
    throw error;
  }

  return data as Blog;
}

export async function deleteBlog(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}

export async function getBlogsByAuthor(authorId: string): Promise<Blog[]> {
  const supabase = await createSupabaseServerClient();
  const { data: blogs, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('created_by', authorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching author blogs:', error);
    throw error;
  }

  return blogs as Blog[];
}

export async function getBlogsByTag(tag: string): Promise<Blog[]> {
  const supabase = await createSupabaseServerClient();
  const { data: blogs, error } = await supabase
    .from('blog_posts')
    .select('*')
    .contains('tags', [tag])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs by tag:', error);
    throw error;
  }

  return blogs as Blog[];
}

export async function createBlogPost(formData: FormData): Promise<Blog> {
  const supabase = await createSupabaseServerClient();
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;
  const coverImageUrl = formData.get('cover_image_url') as string;
  const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());
  const slug = slugify(title);

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      content,
      excerpt,
      cover_image_url: coverImageUrl || null,
      author_name: 'Pikoo Staff',
      published_at: new Date().toISOString(),
      tags,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating blog:', error);
    throw new Error('Failed to create blog post');
  }

  return data;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  // First check if the user is the creator of the blog post
  const { data: blog, error: fetchError } = await supabase
    .from('blog_posts')
    .select('created_by')
    .eq('id', id)
    .single();

  if (fetchError || !blog) {
    throw new Error('Blog post not found');
  }

  if (blog.created_by !== user.id) {
    throw new Error('Not authorized to delete this blog post');
  }

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog:', error);
    throw new Error('Failed to delete blog post');
  }
} 