-- Create LIKES table
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  post_id uuid references posts not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id) -- Prevent duplicate likes
);

-- Enable RLS
alter table likes enable row level security;

-- Policies
create policy "Likes are viewable by everyone"
  on likes for select
  using ( true );

create policy "Authenticated users can insert likes"
  on likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes"
  on likes for delete
  using ( auth.uid() = user_id );

-- Optional: Realtime
alter publication supabase_realtime add table likes;
