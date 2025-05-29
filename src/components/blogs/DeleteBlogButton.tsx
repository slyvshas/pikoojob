'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteBlogButtonProps {
  blogId: string;
}

export function DeleteBlogButton({ blogId }: DeleteBlogButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete blog post');
      }

      toast.success('Blog post deleted successfully');
      router.push('/blogs');
      router.refresh();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="relative overflow-hidden bg-destructive/90 hover:bg-destructive transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-destructive to-destructive/80 opacity-0 hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Post
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="glass">
        <AlertDialogHeader>
          <AlertDialogTitle className="gradient-text">Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the blog post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-muted/80">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="relative overflow-hidden bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-destructive to-destructive/80 opacity-0 hover:opacity-100 transition-opacity" />
            <span className="relative">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 