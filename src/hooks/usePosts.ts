import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useStore, selectPosts, selectFriendIds, selectUser } from '../stores/useStore';
import * as postsService from '../services/posts';
import { config } from '../constants/config';
import type { Post, CreatePostPayload, ReactionEmoji, Reaction } from '../types';

export function usePosts() {
  const user = useStore(selectUser);
  const posts = useStore(selectPosts);
  // Compute activePosts with useMemo to prevent infinite loops
  const activePosts = useMemo(
    () => posts.filter((post) => new Date(post.expires_at) > new Date()),
    [posts]
  );
  const friendIds = useStore(selectFriendIds);
  const { setPosts, addPost, updatePost, removePost, removeExpiredPosts, setIsLoading, setError } = useStore();

  // Local state for more granular loading control
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const newPostsSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  const deletionSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  const reactionsSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Load posts with pagination
  const loadPosts = useCallback(async (reset: boolean = false) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentLength = reset ? 0 : posts.length;
      const { data, error } = await postsService.getFriendsPosts(user.id, {
        limit: 20,
        offset: currentLength,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        if (reset) {
          setPosts(data);
        } else {
          // Append new posts, avoiding duplicates
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = data.filter(p => !existingIds.has(p.id));
            return [...prev, ...newPosts];
          });
        }
      }
    } catch (err) {
      console.error('Load posts error:', err);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [user, posts.length, setPosts, setIsLoading, setError]);

  // Load more posts for pagination
  const loadMorePosts = useCallback(async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await loadPosts(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, isRefreshing, loadPosts]);

  // Subscribe to new posts with error handling
  const subscribeToNewPosts = useCallback(() => {
    if (!user) return;

    try {
      // Unsubscribe from previous subscription
      if (newPostsSubRef.current) {
        try {
          newPostsSubRef.current.unsubscribe();
        } catch (unsubError) {
          console.error('Error unsubscribing from previous new posts subscription:', unsubError);
        }
        newPostsSubRef.current = null;
      }

      // Subscribe to new posts from friends
      const subscription = postsService.subscribeToNewPosts(
        user.id,
        friendIds,
        (newPost) => {
          try {
            addPost(newPost);
            console.log('New post added via realtime subscription:', newPost.id);
          } catch (err) {
            console.error('Error processing new post:', err);
          }
        }
      );
      
      newPostsSubRef.current = subscription;
      console.log('Subscribed to new posts realtime updates');
    } catch (err) {
      console.error('Error subscribing to new posts:', err);
    }
  }, [user, friendIds, addPost]);

  // Subscribe to post deletions with error handling
  const subscribeToPostDeletions = useCallback(() => {
    if (!user) return;

    try {
      if (deletionSubRef.current) {
        try {
          deletionSubRef.current.unsubscribe();
        } catch (unsubError) {
          console.error('Error unsubscribing from previous deletions subscription:', unsubError);
        }
        deletionSubRef.current = null;
      }

      const subscription = postsService.subscribeToPostDeletions((postId) => {
        try {
          removePost(postId);
          console.log('Post deleted via realtime subscription:', postId);
        } catch (err) {
          console.error('Error processing post deletion:', err);
        }
      });
      
      deletionSubRef.current = subscription;
      console.log('Subscribed to post deletions realtime updates');
    } catch (err) {
      console.error('Error subscribing to post deletions:', err);
    }
  }, [user, removePost]);

  // Subscribe to reactions on current posts with error handling
  const subscribeToReactions = useCallback(() => {
    if (!user || posts.length === 0) return;

    try {
      if (reactionsSubRef.current) {
        try {
          reactionsSubRef.current.unsubscribe();
        } catch (unsubError) {
          console.error('Error unsubscribing from previous reactions subscription:', unsubError);
        }
        reactionsSubRef.current = null;
      }

      const postIds = posts.map((p) => p.id);
      const sub = postsService.subscribeToReactions(
        postIds,
        (postId: string, reactions: Reaction[]) => {
          try {
            const myReaction = reactions.find((r) => r.user_id === user.id);
            updatePost(postId, { reactions, my_reaction: myReaction });
            console.log('Reactions updated via realtime for post:', postId);
          } catch (err) {
            console.error('Error processing reaction update:', err);
          }
        }
      );

      if (sub) {
        reactionsSubRef.current = sub;
        console.log(`Subscribed to reactions for ${postIds.length} posts`);
      }
    } catch (err) {
      console.error('Error subscribing to reactions:', err);
    }
  }, [user, posts, updatePost]);

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
    [user, addPost, setError, setIsCreating]
  );

  // Delete a post
  const deletePost = useCallback(
    async (postId: string) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await postsService.deletePost(postId, user.id);

        if (!result.error) {
          removePost(postId);
        }

        if (result.error) {
          setError(result.error.message);
        }

        return result;
      } catch (err) {
        console.error('Delete post error:', err);
        const error = { message: 'Failed to delete post' };
        setError(error.message);
        return { data: null, error };
      } finally {
        setIsLoading(false);
      }
    },
    [user, removePost, setIsLoading, setError]
  );

  // Add reaction to a post
  const addReaction = useCallback(
    async (postId: string, emoji: ReactionEmoji) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      try {
        const result = await postsService.addReaction(postId, user.id, emoji);

        if (result.data) {
          // Update the post's my_reaction in store
          updatePost(postId, { my_reaction: result.data });
        }

        return result;
      } catch (err) {
        console.error('Add reaction error:', err);
        return { data: null, error: { message: 'Failed to add reaction' } };
      }
    },
    [user, updatePost]
  );

  // Remove reaction from a post
  const removeReaction = useCallback(
    async (postId: string) => {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      try {
        const result = await postsService.removeReaction(postId, user.id);

        if (!result.error) {
          // Remove my_reaction from post in store
          updatePost(postId, { my_reaction: undefined });
        }

        return result;
      } catch (err) {
        console.error('Remove reaction error:', err);
        return { data: null, error: { message: 'Failed to remove reaction' } };
      }
    },
    [user, updatePost]
  );

  // Toggle reaction on a post
  const toggleReaction = useCallback(
    async (postId: string, emoji: ReactionEmoji) => {
      const post = posts.find((p) => p.id === postId);

      if (post?.my_reaction?.emoji === emoji) {
        return removeReaction(postId);
      }

      return addReaction(postId, emoji);
    },
    [posts, addReaction, removeReaction]
  );

  // Set up timer to remove expired posts
  useEffect(() => {
    const interval = setInterval(() => {
      removeExpiredPosts();
    }, config.TIMER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [removeExpiredPosts]);

  // Subscribe to new posts when friendIds change with proper cleanup
  useEffect(() => {
    subscribeToNewPosts();
    subscribeToPostDeletions();

    return () => {
      // Cleanup subscriptions with error handling
      if (newPostsSubRef.current) {
        try {
          newPostsSubRef.current.unsubscribe();
          console.log('Unsubscribed from new posts');
        } catch (err) {
          console.error('Error during new posts cleanup:', err);
        }
        newPostsSubRef.current = null;
      }
      if (deletionSubRef.current) {
        try {
          deletionSubRef.current.unsubscribe();
          console.log('Unsubscribed from post deletions');
        } catch (err) {
          console.error('Error during deletions cleanup:', err);
        }
        deletionSubRef.current = null;
      }
    };
  }, [subscribeToNewPosts, subscribeToPostDeletions]);

  // Subscribe to reactions when posts change with proper cleanup
  useEffect(() => {
    subscribeToReactions();

    return () => {
      if (reactionsSubRef.current) {
        try {
          reactionsSubRef.current.unsubscribe();
          console.log('Unsubscribed from reactions');
        } catch (err) {
          console.error('Error during reactions cleanup:', err);
        }
        reactionsSubRef.current = null;
      }
    };
  }, [subscribeToReactions]);

  // Refresh posts with refreshing state
  const refreshPosts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPosts(true); // Reset to load from start
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPosts]);

  return {
    posts,
    activePosts,
    isRefreshing,
    isCreating,
    loadPosts,
    loadMorePosts,
    refreshPosts,
    createPost,
    deletePost,
    addReaction,
    removeReaction,
    toggleReaction,
  };
}
