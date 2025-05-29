-- Create a new storage bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true);

-- Allow public access to read blog images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'blog-images' );

-- Allow authenticated users to upload blog images
create policy "Authenticated users can upload blog images"
on storage.objects for insert
with check (
  bucket_id = 'blog-images'
  and auth.role() = 'authenticated'
);

-- Allow users to update their own blog images
create policy "Users can update their own blog images"
on storage.objects for update
using (
  bucket_id = 'blog-images'
  and auth.uid() = owner
);

-- Allow users to delete their own blog images
create policy "Users can delete their own blog images"
on storage.objects for delete
using (
  bucket_id = 'blog-images'
  and auth.uid() = owner
); 