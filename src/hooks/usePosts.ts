import { useEffect, useCallback, useRef, useState } from 'react';
import { useStore, selectPosts, selectActivePosts, selectFriendIds, selectUser } from '../stores/useStore';
import * as postsService from '../services/posts';
import { config } from '../constants/config';
import type { Post, CreatePostPayload, ReactionEmoji, Reaction } from '../types';

export function usePosts() {
  const user = useStore(selectUser);
  const posts = useStore(selectPosts);
  const activePosts = useStore(selectActivePosts);
  const friendIds = useStore(selectFriendIds);
  const { setPosts, addPost, updatePost, removePost, removeExpiredPosts, setIsLoading, setError } = useStore();

  // Local state for more granular loading control
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const newPostsSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  const deletionSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  const reactionsSubRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Load posts
  const loadPosts = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await postsService.getFriendsPosts(user.id);

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

  // Subscribe to new posts
  const subscribeToNewPosts = useCallback(() => {
    if (!user) return;

    // Unsubscribe from previous subscription
    if (newPostsSubRef.current) {
      newPostsSubRef.current.unsubscribe();
    }

    // Subscribe to new posts from friends
    newPostsSubRef.current = postsService.subscribeToNewPosts(
      user.id,
      friendIds,
      (newPost) => {
        addPost(newPost);
      }
    );
  }, [user, friendIds, addPost]);

  // Subscribe to post deletions
  const subscribeToPostDeletions = useCallback(() => {
    if (!user) return;

    if (deletionSubRef.current) {
      deletionSubRef.current.unsubscribe();
    }

    deletionSubRef.current = postsService.subscribeToPostDeletions((postId) => {
      removePost(postId);
    });
  }, [user, removePost]);

  // Subscribe to reactions on current posts
  const subscribeToReactions = useCallback(() => {
    if (!user || posts.length === 0) return;

    if (reactionsSubRef.current) {
      reactionsSubRef.current.unsubscribe();
    }

    const postIds = posts.map((p) => p.id);
    const sub = postsService.subscribeToReactions(
      postIds,
      (postId: string, reactions: Reaction[]) => {
        const myReaction = reactions.find((r) => r.user_id === user.id);
        updatePost(postId, { reactions, my_reaction: myReaction });
      }
    );

    if (sub) {
      reactionsSubRef.current = sub;
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
    [user, addPost, setError]
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

  // Subscribe to new posts when friendIds change
  useEffect(() => {
    subscribeToNewPosts();
    subscribeToPostDeletions();

    return () => {
      if (newPostsSubRef.current) {
        newPostsSubRef.current.unsubscribe();
      }
      if (deletionSubRef.current) {
        deletionSubRef.current.unsubscribe();
      }
    };
  }, [subscribeToNewPosts, subscribeToPostDeletions]);

  // Subscribe to reactions when posts change
  useEffect(() => {
    subscribeToReactions();

    return () => {
      if (reactionsSubRef.current) {
        reactionsSubRef.current.unsubscribe();
      }
    };
  }, [subscribeToReactions]);

  // Refresh posts with refreshing state
  const refreshPosts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPosts();
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
    refreshPosts,
    createPost,
    deletePost,
    addReaction,
    removeReaction,
    toggleReaction,
  };
}
