import { useEffect, useCallback, useState, useMemo } from 'react';
import { useStore, selectPosts, selectUser } from '../stores/useStore';
import * as postsService from '../services/posts';
import { config } from '../constants/config';
import type { CreatePostPayload, ReactionEmoji } from '../types';

export function usePosts() {
  const user = useStore(selectUser);
  const posts = useStore(selectPosts);
  const { setPosts, addPost, updatePost, removePost, removeExpiredPosts, setIsLoading, setError } = useStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Filter active (non-expired) posts
  const activePosts = useMemo(
    () => posts.filter((post) => new Date(post.expires_at) > new Date()),
    [posts]
  );

  // Load posts from friends
  const loadPosts = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await postsService.getFriendsPosts(user.id, { limit: 50 });

      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Load posts error:', err);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [user, setPosts, setIsLoading, setError]);

  // Refresh posts (pull-to-refresh)
  const refreshPosts = useCallback(async () => {
    setIsRefreshing(true);
    await loadPosts();
    setIsRefreshing(false);
  }, [loadPosts]);

  // Create a new post
  const createPost = useCallback(
    async (payload: Omit<CreatePostPayload, 'userId'>) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      setIsCreating(true);
      setError(null);

      try {
        const result = await postsService.createPost({
          ...payload,
          userId: user.id,
        });

        if (result.data) {
          addPost(result.data);
        }

        if (result.error) {
          setError(result.error.message);
        }

        return result;
      } catch (err) {
        console.error('Create post error:', err);
        const error = { message: 'Failed to create post' };
        setError(error.message);
        return { data: null, error };
      } finally {
        setIsCreating(false);
      }
    },
    [user, addPost, setError]
  );

  // Delete a post
  const deletePost = useCallback(
    async (postId: string) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      try {
        const result = await postsService.deletePost(postId, user.id);

        if (!result.error) {
          removePost(postId);
        }

        return result;
      } catch (err) {
        console.error('Delete post error:', err);
        return { data: null, error: { message: 'Failed to delete post' } };
      }
    },
    [user, removePost]
  );

  // Toggle reaction (add or remove)
  const toggleReaction = useCallback(
    async (postId: string, emoji: ReactionEmoji) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      const post = posts.find((p) => p.id === postId);

      // If already reacted with same emoji, remove it
      if (post?.my_reaction?.emoji === emoji) {
        const result = await postsService.removeReaction(postId, user.id);
        if (!result.error) {
          updatePost(postId, { my_reaction: undefined });
        }
        return result;
      }

      // Otherwise add/change reaction
      const result = await postsService.addReaction(postId, user.id, emoji);
      if (result.data) {
        updatePost(postId, { my_reaction: result.data });
      }
      return result;
    },
    [user, posts, updatePost]
  );

  // Remove expired posts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      removeExpiredPosts();
    }, config.TIMER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [removeExpiredPosts]);

  return {
    posts,
    activePosts,
    isRefreshing,
    isCreating,
    loadPosts,
    loadMorePosts: loadPosts, // Alias for compatibility
    refreshPosts,
    createPost,
    deletePost,
    toggleReaction,
    // Keep for backward compatibility
    addReaction: (postId: string, emoji: ReactionEmoji) => toggleReaction(postId, emoji),
    removeReaction: async (postId: string) => {
      if (!user) return { data: null, error: { message: 'Not authenticated' } };
      const result = await postsService.removeReaction(postId, user.id);
      if (!result.error) {
        updatePost(postId, { my_reaction: undefined });
      }
      return result;
    },
  };
}
