import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-actions';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // First check if the user is the creator of the blog post
    const { data: blog, error: fetchError } = await supabase
      .from('blog_posts')
      .select('created_by')
      .eq('id', params.id)
      .single();

    if (fetchError || !blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    if (blog.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this blog post' },
        { status: 403 }
      );
    }

    // Delete the blog post
    const { error: deleteError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting blog:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/blogs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 