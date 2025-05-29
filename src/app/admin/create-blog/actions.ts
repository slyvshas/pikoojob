'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server-actions';
import { createBlog } from '@/lib/blogs';
import { revalidatePath } from 'next/cache';
import type { BlogPostFormData } from '@/lib/blogs';

export async function createBlogAction(formData: BlogPostFormData): Promise<{ success: boolean; message: string; blogId?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Authentication required." };
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error checking admin status:', profileError);
      return { success: false, message: "Error verifying admin status." };
    }

    if (!profile?.is_admin) {
      return { success: false, message: "Unauthorized. Admin access required." };
    }

    const blog = await createBlog(formData, user.id);
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${blog.slug}`);
    return { success: true, message: "Blog post created successfully!", blogId: blog.id };
  } catch (error) {
    console.error("Failed to create blog:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred." 
    };
  }
} 