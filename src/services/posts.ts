import { supabase, TABLES, BUCKETS } from './supabase';
import { config } from '../constants/config';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { prepareMediaForUpload, isFileTooLarge } from '../utils/media';
import type { Post, Reaction, ReactionEmoji, CreatePostPayload, ApiResponse } from '../types';

// Create a new post
export async function createPost(
  payload: CreatePostPayload
): Promise<ApiResponse<Post>> {
  console.log('🚀 [createPost] Starting post creation:', {
    userId: payload.userId,
    mediaType: payload.mediaType,
    hasCaption: !!payload.caption,
    hasLocation: !!payload.location,
    locationName: payload.location?.name,
    mediaUri: payload.mediaUri?.substring(0, 50) + '...',
  });

  try {
    const { userId, mediaUri, mediaType, caption, location } = payload;

    // Upload media to storage
    const fileExtension = mediaType === 'video' ? 'mp4' : 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;
    const contentType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

    console.log('🔐 [createPost] Getting session...');
    // Get session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('❌ [createPost] Session error:', sessionError);
      return {
        data: null,
        error: { message: 'Not authenticated. Please log in again.' },
      };
    }
    console.log('✅ [createPost] Session valid, user:', session.user.id);

    // Read file using expo-file-system (most reliable in React Native)
    let fileData: ArrayBuffer;
    let fileSize: number;
    let processedUri = mediaUri;

    console.log('📁 [createPost] Processing media file...');
    try {
      // Compress/prepare media for upload (images get compressed, videos pass through)
      console.log('🔄 [createPost] Preparing media for upload...');
      const preparedMedia = await prepareMediaForUpload(mediaUri, mediaType);
      processedUri = preparedMedia.uri;
      console.log('✅ [createPost] Media prepared:', {
        originalUri: mediaUri.substring(0, 50),
        processedUri: processedUri.substring(0, 50),
        size: preparedMedia.size,
      });

      // Get file info after compression
      const fileInfo = await FileSystem.getInfoAsync(processedUri);

      if (!fileInfo.exists) {
        console.error('❌ [createPost] File does not exist after preparation:', processedUri);
        return {
          data: null,
          error: { message: 'Media file not found after processing. Please try capturing again.' },
        };
      }

      // After exists check, we can safely access size
      const infoSize = fileInfo.size ?? 0;
      console.log('📊 [createPost] File info:', {
        exists: fileInfo.exists,
        size: infoSize,
        uri: processedUri.substring(0, 50),
      });

      fileSize = infoSize || preparedMedia.size || 0;

      // Check file size (max 10MB) - after compression
      if (isFileTooLarge(fileSize, config.MAX_MEDIA_SIZE_MB)) {
        console.error(`❌ [createPost] File too large: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(1)}MB)`);
        return {
          data: null,
          error: {
            message: `${mediaType === 'video' ? 'Video' : 'Photo'} is too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Maximum size is ${config.MAX_MEDIA_SIZE_MB}MB. Try capturing again.`
          },
        };
      }

      console.log('📖 [createPost] Reading file as base64...');
      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(processedUri, {
        encoding: 'base64',
      });

      if (!base64Data || base64Data.length === 0) {
        console.error('❌ [createPost] File read resulted in empty data');
        return {
          data: null,
          error: { message: 'Media file is empty or corrupted. Please try capturing again.' },
        };
      }

      console.log('🔄 [createPost] Converting base64 to ArrayBuffer...');
      // Convert base64 to ArrayBuffer
      fileData = decode(base64Data);

      console.log(`✅ [createPost] File prepared successfully: ${(fileSize / 1024).toFixed(1)}KB, type: ${mediaType}`);
    } catch (fileError: any) {
      console.error('File preparation error:', fileError);
      console.error('Original media URI:', mediaUri);
      console.error('Processed URI:', processedUri);
      console.error('Error details:', {
        name: fileError.name,
        message: fileError.message,
        stack: fileError.stack?.split('\n')[0],
      });
      
      // More specific error messages based on error type
      let errorMessage = 'Failed to prepare media file. Please try capturing again.';
      
      if (fileError.message?.includes('ENOENT') || fileError.message?.includes('not found')) {
        errorMessage = 'Media file not found on device. Please try capturing again.';
      } else if (fileError.message?.includes('EACCES') || fileError.message?.includes('permission') || fileError.message?.includes('Permission')) {
        errorMessage = 'Cannot access media file. Please check app permissions and try again.';
      } else if (fileError.message?.includes('ENOMEM') || fileError.message?.includes('memory')) {
        errorMessage = 'Not enough memory to process media. Please close other apps and try again.';
      } else if (fileError.message?.includes('decode') || fileError.message?.includes('base64')) {
        errorMessage = 'Media file is corrupted. Please try capturing again.';
      } else if (fileError.message?.includes('compress') || fileError.message?.includes('manipulate')) {
        errorMessage = 'Failed to compress media. Please try capturing again with a different photo.';
      } else if (mediaType === 'video') {
        errorMessage = 'Failed to process video file. Try recording a shorter video or capturing a photo instead.';
      } else if (mediaType === 'image') {
        errorMessage = 'Failed to process photo. Please try capturing again.';
      }
      
      return {
        data: null,
        error: { message: errorMessage, code: fileError.code || 'MEDIA_PREPARATION_ERROR' },
      };
    }

    console.log('☁️ [createPost] Uploading to Supabase storage...', {
      bucket: BUCKETS.POST_MEDIA,
      fileName,
      contentType,
      fileSize: (fileSize / 1024).toFixed(1) + 'KB',
    });
    // Upload to Supabase storage using ArrayBuffer
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKETS.POST_MEDIA)
      .upload(fileName, fileData, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ [createPost] Storage upload error:', uploadError);
      console.error('Upload error details:', {
        message: uploadError.message,
        statusCode: (uploadError as any).statusCode,
        error: (uploadError as any).error,
        bucket: BUCKETS.POST_MEDIA,
        fileName,
      });
      
      let errorMessage = 'Failed to upload media. Please try again.';
      
      if (uploadError.message?.includes('duplicate') || uploadError.message?.includes('already exists')) {
        errorMessage = 'Upload conflict. Please try again.';
      } else if (uploadError.message?.includes('size') || uploadError.message?.includes('too large')) {
        errorMessage = `${mediaType === 'video' ? 'Video' : 'Photo'} file is too large. Please try again with a smaller file.`;
      } else if (uploadError.message?.includes('network') || uploadError.message?.includes('timeout')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (uploadError.message?.includes('unauthorized') || uploadError.message?.includes('authentication')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (uploadError.message?.includes('quota') || uploadError.message?.includes('storage')) {
        errorMessage = 'Storage quota exceeded. Please contact support.';
      } else if (mediaType === 'video') {
        errorMessage = 'Failed to upload video. Please check your connection and try again.';
      } else {
        errorMessage = 'Failed to upload photo. Please check your connection and try again.';
      }
      
      return {
        data: null,
        error: { message: errorMessage, code: (uploadError as any).code || 'STORAGE_UPLOAD_ERROR' },
      };
    }

    console.log('✅ [createPost] Upload successful!', uploadData);

    // Get public URL
    console.log('🔗 [createPost] Getting public URL...');
    const { data: urlData } = supabase.storage
      .from(BUCKETS.POST_MEDIA)
      .getPublicUrl(fileName);

    const mediaUrl = urlData.publicUrl;
    console.log('✅ [createPost] Public URL:', mediaUrl);

    // Calculate expiry time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.POST_EXPIRY_HOURS);
    console.log('⏰ [createPost] Post will expire at:', expiresAt.toISOString());

    console.log('📍 [createPost] Processing location data...');
    // Location is now OPTIONAL - validate only if provided
    let locationName: string | null = null;
    let lat: number | null = null;
    let lng: number | null = null;
    let locationCity: string | null = null;
    let locationState: string | null = null;

    if (location && location.name && location.name.trim() !== '') {
      console.log('📍 [createPost] Location provided:', {
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        city: location.city,
        state: location.state,
      });
      // Validate location coordinates are valid numbers
      const parsedLat = typeof location.lat === 'number' ? location.lat : parseFloat(String(location.lat));
      const parsedLng = typeof location.lng === 'number' ? location.lng : parseFloat(String(location.lng));

      if (
        !isNaN(parsedLat) &&
        !isNaN(parsedLng) &&
        parsedLat >= -90 &&
        parsedLat <= 90 &&
        parsedLng >= -180 &&
        parsedLng <= 180
      ) {
        locationName = location.name.trim();
        lat = parsedLat;
        lng = parsedLng;
        locationCity = location.city?.trim() || null;
        locationState = location.state?.trim() || null;
        console.log('✅ [createPost] Location validated and parsed');
      } else {
        console.warn('⚠️ [createPost] Location coordinates invalid, will post without location');
      }
    } else {
      console.log('ℹ️ [createPost] No location provided, posting without location');
    }

    console.log('💾 [createPost] Inserting post record into database...');
    // Insert post record - location fields can be null
    const { data: postData, error: postError } = await supabase
      .from(TABLES.POSTS)
      .insert({
        user_id: userId,
        media_url: mediaUrl,
        media_type: mediaType,
        thumbnail_url: mediaType === 'video' ? null : mediaUrl,
        caption: caption?.trim() || null,
        location_name: locationName,
        location_lat: lat,
        location_lng: lng,
        location_city: locationCity,
        location_state: locationState,
        expires_at: expiresAt.toISOString(),
        view_count: 0,
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (postError) {
      console.error('❌ [createPost] Post insert error:', postError);
      console.error('Post insert error details:', {
        message: postError.message,
        code: postError.code,
        details: postError.details,
        hint: postError.hint,
      });
      return {
        data: null,
        error: { message: postError.message || 'Failed to create post. Please try again.' },
      };
    }

    console.log('✅ [createPost] Post record created successfully!', {
      postId: postData.id,
      hasLocation: !!locationName,
    });

    // Update user stats (non-blocking, don't fail if this errors)
    console.log('📊 [createPost] Updating user stats...');
    try {
      const { error: statsError } = await supabase.rpc('increment_user_posts', { user_id: userId });
      if (statsError) {
        console.warn('⚠️ [createPost] Failed to increment user posts count:', statsError);
        // Don't fail the post creation if stats update fails
      } else {
        console.log('✅ [createPost] User stats updated');
      }
    } catch (statsErr) {
      console.warn('⚠️ [createPost] Error updating user stats:', statsErr);
      // Continue even if stats update fails
    }

    console.log('🎉 [createPost] POST CREATED SUCCESSFULLY!', {
      postId: postData.id,
      mediaUrl: mediaUrl.substring(0, 60) + '...',
      hasLocation: !!locationName,
      expiresAt: expiresAt.toISOString(),
    });

    return { data: postData as Post, error: null };
  } catch (err) {
    console.error('❌ [createPost] UNEXPECTED ERROR:', err);
    console.error('Error details:', {
      name: (err as any)?.name,
      message: (err as any)?.message,
      stack: (err as any)?.stack?.split('\n').slice(0, 3).join('\n'),
    });
    return {
      data: null,
      error: { message: 'An unexpected error occurred. Please try again.' },
    };
  }
}

// Get friends' posts (non-expired) with pagination
export async function getFriendsPosts(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<ApiResponse<Post[]>> {
  try {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    // First get list of friend IDs
    const { data: friendships, error: friendsError } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (friendsError) {
      console.error('Friends fetch error:', friendsError);
      return {
        data: null,
        error: { message: 'Failed to load posts.' },
      };
    }

    // Extract friend IDs (the other user in each friendship)
    const friendIds = (friendships || []).map((f: any) => 
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );

    // Also include own posts
    friendIds.push(userId);

    if (friendIds.length === 0) {
      return { data: [], error: null };
    }

    // Get non-expired posts from friends with pagination
    const { data: posts, error: postsError } = await supabase
      .from(TABLES.POSTS)
      .select(`
        *,
        user:profiles(*),
        reactions(*)
      `)
      .in('user_id', friendIds)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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
