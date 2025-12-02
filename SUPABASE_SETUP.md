# EXPERIENCES - Supabase Database Setup

## Project Reference
- **Project ID:** fgoonvotrhuavidqrtdh
- **MCP URL:** https://mcp.supabase.com/mcp?project_ref=fgoonvotrhuavidqrtdh

---

## Database Schema

### Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| profiles | User profiles | id, username, avatar_url |
| posts | Ephemeral posts | id, user_id, media_url, expires_at |
| friendships | Friend connections | user_id, friend_id, status |
| reactions | Post reactions | post_id, user_id, emoji |
| blocked_users | Block list | blocker_id, blocked_id |
| user_stats | Aggregate stats | user_id, total_posts, total_friends |

---

## Complete SQL Schema

### 1. Profiles Table

```sql
-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Username uniqueness index (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles (LOWER(username));

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 2. Posts Table

```sql
-- Ephemeral posts (1 hour expiry)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  thumbnail_url TEXT,
  caption TEXT,
  -- Location fields (all OPTIONAL)
  location_name TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_city TEXT,
  location_state TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  -- Stats
  view_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_expires_at_idx ON public.posts(expires_at);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);

-- RLS Policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Users can view posts from friends (non-expired)
CREATE POLICY "Users can view friends posts"
  ON public.posts FOR SELECT
  USING (
    expires_at > NOW() AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'accepted'
        AND (
          (user_id = auth.uid() AND friend_id = posts.user_id) OR
          (friend_id = auth.uid() AND user_id = posts.user_id)
        )
      )
    )
  );

-- Users can create their own posts
CREATE POLICY "Users can create own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Friendships Table

```sql
-- Friend relationships
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);

-- RLS Policies
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they're part of
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friend requests
CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they're part of
CREATE POLICY "Users can update own friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);
```

### 4. Reactions Table

```sql
-- Emoji reactions to posts
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('😊', '❤️', '🔥', '💯')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

-- Indexes
CREATE INDEX IF NOT EXISTS reactions_post_id_idx ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS reactions_user_id_idx ON public.reactions(user_id);

-- RLS Policies
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions on visible posts
CREATE POLICY "Users can view reactions"
  ON public.reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = reactions.post_id
      AND expires_at > NOW()
    )
  );

-- Users can add reactions
CREATE POLICY "Users can add reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove own reactions
CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Blocked Users Table

```sql
-- Block list
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS blocked_users_blocker_idx ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS blocked_users_blocked_idx ON public.blocked_users(blocked_id);

-- RLS Policies
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own blocks
CREATE POLICY "Users can view own blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can create blocks"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Users can remove blocks
CREATE POLICY "Users can delete own blocks"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);
```

### 6. User Stats Table

```sql
-- Aggregate user statistics
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_posts INTEGER DEFAULT 0,
  total_friends INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create stats for new users
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- RLS Policies
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Stats are viewable by everyone
CREATE POLICY "Stats are viewable by everyone"
  ON public.user_stats FOR SELECT
  USING (true);

-- Only system can update stats (via triggers/functions)
CREATE POLICY "System can update stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Storage Buckets

### Post Media Bucket

```sql
-- Create bucket (via Supabase Dashboard or API)
-- Bucket name: post-media
-- Public: false (use signed URLs)
-- File size limit: 10MB
-- Allowed MIME types: image/*, video/*
```

**Storage Policies:**

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload post media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access
CREATE POLICY "Public can view post media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Avatars Bucket

```sql
-- Create bucket (via Supabase Dashboard or API)
-- Bucket name: avatars
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*
```

**Storage Policies:**

```sql
-- Allow authenticated users to upload their avatar
CREATE POLICY "Users can upload avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to update their avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Real-time Subscriptions

Enable real-time for these tables in Supabase Dashboard:

1. **posts** - For new post notifications
2. **friendships** - For friend request updates
3. **reactions** - For reaction updates

---

## Edge Functions (Optional)

### Cleanup Expired Posts (Cron Job)

```typescript
// supabase/functions/cleanup-expired-posts/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Delete expired posts
  const { error } = await supabase
    .from('posts')
    .delete()
    .lt('expires_at', new Date().toISOString())

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
```

Schedule via Supabase Dashboard or pg_cron:
```sql
SELECT cron.schedule(
  'cleanup-expired-posts',
  '*/15 * * * *', -- Every 15 minutes
  $$DELETE FROM public.posts WHERE expires_at < NOW()$$
);
```

---

## Common Queries Reference

### Get Friends' Posts (Feed)

```typescript
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    user:profiles(*),
    reactions(*)
  `)
  .gt('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .limit(20);
```

### Check Username Availability

```typescript
const { data } = await supabase
  .from('profiles')
  .select('username')
  .ilike('username', username)
  .single();

const isAvailable = !data;
```

### Get Friend Requests

```typescript
const { data: requests } = await supabase
  .from('friendships')
  .select(`
    *,
    user:profiles!friendships_user_id_fkey(*)
  `)
  .eq('friend_id', userId)
  .eq('status', 'pending');
```

### Accept Friend Request

```typescript
const { error } = await supabase
  .from('friendships')
  .update({ status: 'accepted' })
  .eq('id', friendshipId);
```

### Create Post

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({
    user_id: userId,
    media_url: mediaUrl,
    media_type: 'image',
    caption: caption,
    location_name: location?.name, // Optional
    location_lat: location?.lat,
    location_lng: location?.lng,
    location_city: location?.city,
    location_state: location?.state,
  })
  .select()
  .single();
```

### Add Reaction

```typescript
const { error } = await supabase
  .from('reactions')
  .upsert({
    post_id: postId,
    user_id: userId,
    emoji: '❤️',
  });
```

---

## Environment Variables

Required in `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://fgoonvotrhuavidqrtdh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Verification Checklist

- [ ] All tables created with correct columns
- [ ] RLS policies enabled on all tables
- [ ] Storage buckets created (post-media, avatars)
- [ ] Storage policies configured
- [ ] Real-time enabled for posts, friendships, reactions
- [ ] Triggers for auto-creating profiles and stats
- [ ] Username uniqueness constraint (case-insensitive)
- [ ] Location fields are nullable (not required)
- [ ] expires_at defaults to NOW() + 1 hour
