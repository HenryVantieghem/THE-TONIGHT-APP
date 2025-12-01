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
    const contentType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

    // Get session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return {
        data: null,
        error: { message: 'Not authenticated. Please log in again.' },
      };
    }

    // Read file using fetch (works reliably in React Native, same approach as avatar uploads)
    // This avoids deprecated expo-file-system methods and works with all file types including HEIC
    let fileBlob: Blob;
    try {
      // Use fetch to read the file - React Native fetch handles file:// URIs correctly
      const response = await fetch(mediaUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      }

      fileBlob = await response.blob();

      if (!fileBlob || fileBlob.size === 0) {
        return {
          data: null,
          error: { message: 'Media file is empty. Please try capturing again.' },
        };
      }

      // Check file size (max 10MB)
      const maxSize = config.MAX_MEDIA_SIZE_MB * 1024 * 1024;
      if (fileBlob.size > maxSize) {
        return {
          data: null,
          error: { 
            message: `File is too large. Maximum size is ${config.MAX_MEDIA_SIZE_MB}MB.` 
          },
        };
      }

      console.log(`File read successfully: ${fileBlob.size} bytes`);
    } catch (fileError: any) {
      console.error('File read error:', fileError);
      console.error('Media URI:', mediaUri);
      console.error('Error details:', JSON.stringify(fileError, null, 2));
      
      // More specific error messages
      let errorMessage = 'Failed to read media file. Please try capturing again.';
      if (fileError.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (fileError.message?.includes('fetch')) {
        errorMessage = 'Failed to access media file. Please try capturing again.';
      } else if (fileError.message?.includes('ENOENT') || fileError.message?.includes('not found')) {
        errorMessage = 'Media file not found. Please try capturing again.';
      } else if (fileError.message?.includes('permission') || fileError.message?.includes('Permission')) {
        errorMessage = 'Permission denied. Please grant media access and try again.';
      } else if (mediaType === 'video') {
        errorMessage = 'Failed to read video file. Please try recording again.';
      } else if (mediaType === 'image') {
        errorMessage = 'Failed to read image file. Please try capturing again.';
      }
      
      return {
        data: null,
        error: { message: errorMessage },
      };
    }

    // Upload to Supabase storage using Blob
    // Supabase storage accepts Blob objects in React Native
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKETS.POST_MEDIA)
      .upload(fileName, fileBlob, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      const errorMessage = uploadError.message?.includes('duplicate') 
        ? 'A file with this name already exists. Please try again.'
        : mediaType === 'video'
        ? 'Failed to upload video. The file may be too large. Please try again.'
        : 'Failed to upload image. Please try again.';
      return {
        data: null,
        error: { message: errorMessage },
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKETS.POST_MEDIA)
      .getPublicUrl(fileName);

    const mediaUrl = urlData.publicUrl;

    // Calculate expiry time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.POST_EXPIRY_HOURS);

    // Validate location data
    if (!location) {
      return {
        data: null,
        error: { message: 'Location is required. Please select a location.' },
      };
    }

    if (!location.name || location.name.trim() === '') {
      return {
        data: null,
        error: { message: 'Location name is required. Please select a valid location.' },
      };
    }

    // Validate location coordinates are valid numbers
    const lat = typeof location.lat === 'number' ? location.lat : parseFloat(String(location.lat));
    const lng = typeof location.lng === 'number' ? location.lng : parseFloat(String(location.lng));

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return {
        data: null,
        error: { message: 'Invalid location coordinates. Please select a valid location.' },
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
        location_name: location.name.trim(),
        location_lat: lat,
        location_lng: lng,
        location_city: location.city?.trim() || null,
        location_state: location.state?.trim() || null,
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

    // Update user stats (non-blocking, don't fail if this errors)
    try {
      const { error: statsError } = await supabase.rpc('increment_user_posts', { user_id: userId });
      if (statsError) {
        console.warn('Failed to increment user posts count:', statsError);
        // Don't fail the post creation if stats update fails
      }
    } catch (statsErr) {
      console.warn('Error updating user stats:', statsErr);
      // Continue even if stats update fails
    }

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

    // Update user stats (non-blocking, don't fail if this errors)
    try {
      const { error: statsError } = await supabase.rpc('decrement_user_posts', { user_id: userId });
      if (statsError) {
        console.warn('Failed to decrement user posts count:', statsError);
        // Don't fail the deletion if stats update fails
      }
    } catch (statsErr) {
      console.warn('Error updating user stats:', statsErr);
      // Continue even if stats update fails
    }

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
    const { error } = await supabase.rpc('increment_post_views', { post_id: postId });
    if (error) {
      console.warn('Failed to increment view count:', error);
    }
  } catch (err) {
    console.warn('Increment view count error:', err);
    // Silently fail - view count is not critical
  }
}

// Subscribe to new posts from friends
export function subscribeToNewPosts(
  userId: string,
  friendIds: string[],
  onNewPost: (post: Post) => void
) {
  const allIds = [...friendIds, userId];
  
  // Format UUIDs properly for the filter (wrap in quotes if needed)
  const formattedIds = allIds.map(id => `"${id}"`).join(',');

  const channel = supabase
    .channel(`posts-realtime-${userId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: TABLES.POSTS,
        filter: `user_id=in.(${formattedIds})`,
      },
      async (payload) => {
        try {
          // Fetch the complete post with user data
          const { data, error } = await supabase
            .from(TABLES.POSTS)
            .select(`
              *,
              user:profiles(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data && !error) {
            onNewPost(data as Post);
          } else if (error) {
            console.error('Error fetching new post:', error);
          }
        } catch (err) {
          console.error('Error processing new post:', err);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to new posts');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel error:', err);
      } else if (status === 'TIMED_OUT') {
        console.warn('Subscription timed out, retrying...');
      } else if (status === 'CLOSED') {
        console.warn('Subscription closed');
      }
    });

  return channel;
}

// Subscribe to post deletions
export function subscribeToPostDeletions(
  onPostDeleted: (postId: string) => void
) {
  const channel = supabase
    .channel(`posts-deletions-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: TABLES.POSTS,
      },
      (payload) => {
        try {
          if (payload.old && payload.old.id) {
            onPostDeleted(payload.old.id as string);
          }
        } catch (err) {
          console.error('Error processing post deletion:', err);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to post deletions');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Deletion channel error:', err || 'Unknown error');
      } else if (status === 'TIMED_OUT') {
        console.warn('Deletion subscription timed out');
      } else if (status === 'CLOSED') {
        console.warn('Deletion subscription closed');
      }
    });

  return channel;
}

// Subscribe to reactions on posts
export function subscribeToReactions(
  postIds: string[],
  onReactionChange: (postId: string, reactions: Reaction[]) => void
) {
  if (postIds.length === 0) return null;

  // Format UUIDs properly for the filter
  const formattedIds = postIds.map(id => `"${id}"`).join(',');

  const channel = supabase
    .channel(`reactions-realtime-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.REACTIONS,
        filter: `post_id=in.(${formattedIds})`,
      },
      async (payload) => {
        try {
          const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
          if (!postId) return;

          // Fetch updated reactions for the post
          const { data, error } = await supabase
            .from(TABLES.REACTIONS)
            .select(`
              *,
              user:profiles(*)
            `)
            .eq('post_id', postId);

          if (data && !error) {
            onReactionChange(postId as string, data as Reaction[]);
          } else if (error) {
            console.error('Error fetching reactions:', error);
          }
        } catch (err) {
          console.error('Error processing reaction change:', err);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to reactions');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Reactions channel error:', err);
      }
    });

  return channel;
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
