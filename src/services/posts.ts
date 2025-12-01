import { supabase, TABLES, BUCKETS } from './supabase';
import { config } from '../constants/config';
import type { Post, Reaction, ReactionEmoji, CreatePostPayload, ApiResponse } from '../types';

// Create a new post
export async function createPost(
  payload: CreatePostPayload
): Promise<ApiResponse<Post>> {
  try {
    const { userId, mediaUri, mediaType, caption, location } = payload;

    // Upload media to storage
    const fileExtension = mediaType === 'video' ? 'mp4' : 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;

    // Fetch the file as a blob
    const response = await fetch(mediaUri);
    const blob = await response.blob();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKETS.POST_MEDIA)
      .upload(fileName, blob, {
        contentType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        data: null,
        error: { message: 'Failed to upload media. Please try again.' },
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKETS.POST_MEDIA)
      .getPublicUrl(uploadData.path);

    const mediaUrl = urlData.publicUrl;

    // Calculate expiry time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.POST_EXPIRY_HOURS);

    // Validate location data
    if (!location || !location.name || location.lat === undefined || location.lng === undefined) {
      return {
        data: null,
        error: { message: 'Invalid location data. Please select a location.' },
      };
    }

    // Insert post record
    const { data: postData, error: postError } = await supabase
      .from(TABLES.POSTS)
      .insert({
        user_id: userId,
        media_url: mediaUrl,
        media_type: mediaType,
        thumbnail_url: mediaType === 'video' ? null : mediaUrl,
        caption: caption?.trim() || null,
        location_name: location.name,
        location_lat: location.lat,
        location_lng: location.lng,
        location_city: location.city || null,
        location_state: location.state || null,
        expires_at: expiresAt.toISOString(),
        view_count: 0,
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (postError) {
      console.error('Post insert error:', postError);
      return {
        data: null,
        error: { message: postError.message || 'Failed to create post. Please try again.' },
      };
    }

    // Update user stats
    await supabase.rpc('increment_user_posts', { user_id: userId });

    return { data: postData as Post, error: null };
  } catch (err) {
    console.error('Create post error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred. Please try again.' },
    };
  }
}

// Get friends' posts (non-expired)
export async function getFriendsPosts(
  userId: string
): Promise<ApiResponse<Post[]>> {
  try {
    // First get list of friend IDs
    const { data: friendships, error: friendsError } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (friendsError) {
      console.error('Friends fetch error:', friendsError);
      return {
        data: null,
        error: { message: 'Failed to load posts.' },
      };
    }

    const friendIds = friendships.map((f) => f.friend_id);

    // Also include own posts
    friendIds.push(userId);

    if (friendIds.length === 0) {
      return { data: [], error: null };
    }

    // Get non-expired posts from friends
    const { data: posts, error: postsError } = await supabase
      .from(TABLES.POSTS)
      .select(`
        *,
        user:profiles(*),
        reactions(*)
      `)
      .in('user_id', friendIds)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Posts fetch error:', postsError);
      return {
        data: null,
        error: { message: 'Failed to load posts.' },
      };
    }

    // Add my_reaction field to each post
    const postsWithMyReaction = posts.map((post) => {
      const myReaction = post.reactions?.find(
        (r: Reaction) => r.user_id === userId
      );
      return {
        ...post,
        my_reaction: myReaction || null,
      };
    });

    return { data: postsWithMyReaction as Post[], error: null };
  } catch (err) {
    console.error('Get friends posts error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Get user's own posts
export async function getMyPosts(
  userId: string,
  includeExpired: boolean = false
): Promise<ApiResponse<Post[]>> {
  try {
    let query = supabase
      .from(TABLES.POSTS)
      .select(`
        *,
        user:profiles(*),
        reactions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!includeExpired) {
      query = query.gt('expires_at', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('My posts fetch error:', error);
      return {
        data: null,
        error: { message: 'Failed to load your posts.' },
      };
    }

    return { data: data as Post[], error: null };
  } catch (err) {
    console.error('Get my posts error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Delete a post
export async function deletePost(
  postId: string,
  userId: string
): Promise<ApiResponse<null>> {
  try {
    // Get post to find media URL
    const { data: post, error: fetchError } = await supabase
      .from(TABLES.POSTS)
      .select('media_url, user_id')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return {
        data: null,
        error: { message: 'Post not found.' },
      };
    }

    // Verify ownership
    if (post.user_id !== userId) {
      return {
        data: null,
        error: { message: 'You can only delete your own posts.' },
      };
    }

    // Delete from storage
    try {
      const url = new URL(post.media_url);
      const path = url.pathname.split('/').slice(-2).join('/');
      await supabase.storage.from(BUCKETS.POST_MEDIA).remove([path]);
    } catch {
      console.warn('Failed to delete media from storage');
    }

    // Delete post record
    const { error: deleteError } = await supabase
      .from(TABLES.POSTS)
      .delete()
      .eq('id', postId);

    if (deleteError) {
      return {
        data: null,
        error: { message: 'Failed to delete post.' },
      };
    }

    // Update user stats
    await supabase.rpc('decrement_user_posts', { user_id: userId });

    return { data: null, error: null };
  } catch (err) {
    console.error('Delete post error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Add reaction to post
export async function addReaction(
  postId: string,
  userId: string,
  emoji: ReactionEmoji
): Promise<ApiResponse<Reaction>> {
  try {
    // Upsert reaction
    const { data, error } = await supabase
      .from(TABLES.REACTIONS)
      .upsert(
        {
          post_id: postId,
          user_id: userId,
          emoji,
        },
        {
          onConflict: 'post_id,user_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Add reaction error:', error);
      return {
        data: null,
        error: { message: 'Failed to add reaction.' },
      };
    }

    return { data: data as Reaction, error: null };
  } catch (err) {
    console.error('Add reaction error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Remove reaction from post
export async function removeReaction(
  postId: string,
  userId: string
): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from(TABLES.REACTIONS)
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      console.error('Remove reaction error:', error);
      return {
        data: null,
        error: { message: 'Failed to remove reaction.' },
      };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Remove reaction error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Get reactions for a post
export async function getPostReactions(
  postId: string
): Promise<ApiResponse<Reaction[]>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.REACTIONS)
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('post_id', postId);

    if (error) {
      console.error('Get reactions error:', error);
      return {
        data: null,
        error: { message: 'Failed to load reactions.' },
      };
    }

    return { data: data as Reaction[], error: null };
  } catch (err) {
    console.error('Get reactions error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Increment view count
export async function incrementViewCount(postId: string): Promise<void> {
  try {
    await supabase.rpc('increment_post_views', { post_id: postId });
  } catch (err) {
    console.error('Increment view count error:', err);
  }
}

// Subscribe to new posts from friends
export function subscribeToNewPosts(
  userId: string,
  friendIds: string[],
  onNewPost: (post: Post) => void
) {
  const allIds = [...friendIds, userId];

  return supabase
    .channel('posts-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: TABLES.POSTS,
        filter: `user_id=in.(${allIds.join(',')})`,
      },
      async (payload) => {
        // Fetch the complete post with user data
        const { data } = await supabase
          .from(TABLES.POSTS)
          .select(`
            *,
            user:profiles(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onNewPost(data as Post);
        }
      }
    )
    .subscribe();
}

// Subscribe to post deletions
export function subscribeToPostDeletions(
  onPostDeleted: (postId: string) => void
) {
  return supabase
    .channel('posts-deletions')
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: TABLES.POSTS,
      },
      (payload) => {
        if (payload.old && payload.old.id) {
          onPostDeleted(payload.old.id);
        }
      }
    )
    .subscribe();
}

// Subscribe to reactions on posts
export function subscribeToReactions(
  postIds: string[],
  onReactionChange: (postId: string, reactions: Reaction[]) => void
) {
  if (postIds.length === 0) return null;

  return supabase
    .channel('reactions-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.REACTIONS,
        filter: `post_id=in.(${postIds.join(',')})`,
      },
      async (payload) => {
        const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
        if (!postId) return;

        // Fetch updated reactions for the post
        const { data } = await supabase
          .from(TABLES.REACTIONS)
          .select(`
            *,
            user:profiles(*)
          `)
          .eq('post_id', postId);

        if (data) {
          onReactionChange(postId, data as Reaction[]);
        }
      }
    )
    .subscribe();
}

// Get a single post by ID
export async function getPostById(
  postId: string
): Promise<ApiResponse<Post>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.POSTS)
      .select(`
        *,
        user:profiles(*),
        reactions(*)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: 'Post not found.' },
      };
    }

    return { data: data as Post, error: null };
  } catch (err) {
    console.error('Get post by ID error:', err);
    return {
      data: null,
      error: { message: 'Failed to load post.' },
    };
  }
}

// Check if a post has expired
export function isPostExpired(post: Post): boolean {
  return new Date(post.expires_at) <= new Date();
}

// Get time remaining until expiry in milliseconds
export function getTimeRemaining(post: Post): number {
  const expiresAt = new Date(post.expires_at).getTime();
  const now = Date.now();
  return Math.max(0, expiresAt - now);
}

// Get time remaining as a formatted string
export function getTimeRemainingFormatted(post: Post): string {
  const remaining = getTimeRemaining(post);
  if (remaining === 0) return 'Expired';

  const minutes = Math.floor(remaining / 60000);
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}
