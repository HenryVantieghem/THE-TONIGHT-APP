import { supabase, TABLES, CHANNELS } from './supabase';
import type { User, Friendship, ApiResponse } from '../types';

// Get all accepted friends
export async function getFriends(
  userId: string
): Promise<ApiResponse<Friendship[]>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select(`
        *,
        friend:profiles!friendships_friend_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get friends error:', error);
      return {
        data: null,
        error: { message: 'Failed to load friends.' },
      };
    }

    return { data: data as Friendship[], error: null };
  } catch (err) {
    console.error('Get friends error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Get friend IDs only (for quick lookups)
export async function getFriendIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Get friend IDs error:', error);
      return [];
    }

    return data.map((f) => f.friend_id);
  } catch (err) {
    console.error('Get friend IDs error:', err);
    return [];
  }
}

// Get pending incoming friend requests
export async function getPendingRequests(
  userId: string
): Promise<ApiResponse<Friendship[]>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select(`
        *,
        user:profiles!friendships_user_id_fkey(*)
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get pending requests error:', error);
      return {
        data: null,
        error: { message: 'Failed to load friend requests.' },
      };
    }

    return { data: data as Friendship[], error: null };
  } catch (err) {
    console.error('Get pending requests error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Get outgoing pending requests
export async function getSentRequests(
  userId: string
): Promise<ApiResponse<Friendship[]>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select(`
        *,
        friend:profiles!friendships_friend_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get sent requests error:', error);
      return {
        data: null,
        error: { message: 'Failed to load sent requests.' },
      };
    }

    return { data: data as Friendship[], error: null };
  } catch (err) {
    console.error('Get sent requests error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Send a friend request
export async function sendFriendRequest(
  userId: string,
  friendId: string
): Promise<ApiResponse<Friendship>> {
  try {
    // Check if already friends or pending
    const { data: existing } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select('*')
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
      )
      .maybeSingle();

    if (existing) {
      return {
        data: null,
        error: { message: 'Friend request already exists.' },
      };
    }

    // Check if blocked
    const { data: blocked } = await supabase
      .from(TABLES.BLOCKED_USERS)
      .select('id')
      .or(
        `and(user_id.eq.${userId},blocked_user_id.eq.${friendId}),and(user_id.eq.${friendId},blocked_user_id.eq.${userId})`
      )
      .maybeSingle();

    if (blocked) {
      return {
        data: null,
        error: { message: 'Unable to send friend request.' },
      };
    }

    // Create pending friendship
    const { data, error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      })
      .select(`
        *,
        friend:profiles!friendships_friend_id_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Send friend request error:', error);
      return {
        data: null,
        error: { message: 'Failed to send friend request.' },
      };
    }

    return { data: data as Friendship, error: null };
  } catch (err) {
    console.error('Send friend request error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Accept a friend request
export async function acceptFriendRequest(
  friendshipId: string,
  userId: string,
  requesterId: string
): Promise<ApiResponse<null>> {
  try {
    // Update the pending request to accepted
    const { error: updateError } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (updateError) {
      console.error('Accept request update error:', updateError);
      return {
        data: null,
        error: { message: 'Failed to accept friend request.' },
      };
    }

    // Create the reverse friendship record
    const { error: insertError } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .insert({
        user_id: userId,
        friend_id: requesterId,
        status: 'accepted',
      });

    if (insertError) {
      console.error('Accept request insert error:', insertError);
      // Continue anyway as the main friendship was created
    }

    // Update both users' friend counts
    await supabase.rpc('increment_user_friends', { user_id: userId });
    await supabase.rpc('increment_user_friends', { user_id: requesterId });

    return { data: null, error: null };
  } catch (err) {
    console.error('Accept friend request error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Decline a friend request
export async function declineFriendRequest(
  friendshipId: string
): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .delete()
      .eq('id', friendshipId);

    if (error) {
      console.error('Decline request error:', error);
      return {
        data: null,
        error: { message: 'Failed to decline friend request.' },
      };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Decline friend request error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Remove a friend
export async function removeFriend(
  userId: string,
  friendId: string
): Promise<ApiResponse<null>> {
  try {
    // Delete both direction records
    const { error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .delete()
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
      );

    if (error) {
      console.error('Remove friend error:', error);
      return {
        data: null,
        error: { message: 'Failed to remove friend.' },
      };
    }

    // Update both users' friend counts
    await supabase.rpc('decrement_user_friends', { user_id: userId });
    await supabase.rpc('decrement_user_friends', { user_id: friendId });

    return { data: null, error: null };
  } catch (err) {
    console.error('Remove friend error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Block a user
export async function blockUser(
  userId: string,
  blockedUserId: string
): Promise<ApiResponse<null>> {
  try {
    // Add to blocked users
    const { error: blockError } = await supabase
      .from(TABLES.BLOCKED_USERS)
      .insert({
        user_id: userId,
        blocked_user_id: blockedUserId,
      });

    if (blockError && blockError.code !== '23505') {
      // Ignore duplicate error
      console.error('Block user error:', blockError);
      return {
        data: null,
        error: { message: 'Failed to block user.' },
      };
    }

    // Remove friendship if exists
    await supabase
      .from(TABLES.FRIENDSHIPS)
      .delete()
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${blockedUserId}),and(user_id.eq.${blockedUserId},friend_id.eq.${userId})`
      );

    return { data: null, error: null };
  } catch (err) {
    console.error('Block user error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Unblock a user
export async function unblockUser(
  userId: string,
  blockedUserId: string
): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from(TABLES.BLOCKED_USERS)
      .delete()
      .eq('user_id', userId)
      .eq('blocked_user_id', blockedUserId);

    if (error) {
      console.error('Unblock user error:', error);
      return {
        data: null,
        error: { message: 'Failed to unblock user.' },
      };
    }

    return { data: null, error: null };
  } catch (err) {
    console.error('Unblock user error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Get blocked users
export async function getBlockedUsers(
  userId: string
): Promise<ApiResponse<User[]>> {
  try {
    const { data, error } = await supabase
      .from(TABLES.BLOCKED_USERS)
      .select(`
        blocked_user:profiles!blocked_users_blocked_user_id_fkey(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Get blocked users error:', error);
      return {
        data: null,
        error: { message: 'Failed to load blocked users.' },
      };
    }

    // Extract the user objects - blocked_user is a single object from the foreign key relationship
    const users = data
      .map((d) => {
        const blockedUser = d.blocked_user;
        // Handle both array and single object cases from Supabase
        if (Array.isArray(blockedUser)) {
          return blockedUser[0] as User | undefined;
        }
        return blockedUser as User | null;
      })
      .filter((u): u is User => u != null);

    return { data: users, error: null };
  } catch (err) {
    console.error('Get blocked users error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Search users by username
export async function searchUsers(
  query: string,
  currentUserId: string
): Promise<ApiResponse<User[]>> {
  try {
    if (!query.trim()) {
      return { data: [], error: null };
    }

    // Get blocked user IDs
    const { data: blocked } = await supabase
      .from(TABLES.BLOCKED_USERS)
      .select('blocked_user_id')
      .eq('user_id', currentUserId);

    const blockedIds = blocked?.map((b) => b.blocked_user_id) || [];

    // Search users
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .ilike('username', `%${query.toLowerCase()}%`)
      .neq('id', currentUserId)
      .limit(20);

    if (error) {
      console.error('Search users error:', error);
      return {
        data: null,
        error: { message: 'Failed to search users.' },
      };
    }

    // Filter out blocked users
    const filteredUsers = data.filter(
      (u) => !blockedIds.includes(u.id)
    );

    return { data: filteredUsers as User[], error: null };
  } catch (err) {
    console.error('Search users error:', err);
    return {
      data: null,
      error: { message: 'An unexpected error occurred.' },
    };
  }
}

// Get friendship status with a user
export async function getFriendshipStatus(
  userId: string,
  targetUserId: string
): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted'> {
  try {
    const { data } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select('*')
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${userId})`
      )
      .maybeSingle();

    if (!data) return 'none';

    if (data.status === 'accepted') return 'accepted';

    if (data.user_id === userId) return 'pending_sent';

    return 'pending_received';
  } catch (err) {
    console.error('Get friendship status error:', err);
    return 'none';
  }
}

// Subscribe to new friend requests
export function subscribeToFriendRequests(
  userId: string,
  onNewRequest: (friendship: Friendship) => void
) {
  return supabase
    .channel(CHANNELS.FRIENDSHIPS)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: TABLES.FRIENDSHIPS,
        filter: `friend_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch complete friendship with user data
        const { data } = await supabase
          .from(TABLES.FRIENDSHIPS)
          .select(`
            *,
            user:profiles!friendships_user_id_fkey(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data && data.status === 'pending') {
          onNewRequest(data as Friendship);
        }
      }
    )
    .subscribe();
}

// Subscribe to friendship status changes
export function subscribeToFriendshipChanges(
  userId: string,
  onAccepted: (friendId: string) => void,
  onRemoved: (friendId: string) => void
) {
  return supabase
    .channel('friendship-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: TABLES.FRIENDSHIPS,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new.status === 'accepted') {
          onAccepted(payload.new.friend_id);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: TABLES.FRIENDSHIPS,
      },
      (payload) => {
        // Check if this deletion affects the current user
        if (
          payload.old.user_id === userId ||
          payload.old.friend_id === userId
        ) {
          const removedId =
            payload.old.user_id === userId
              ? payload.old.friend_id
              : payload.old.user_id;
          onRemoved(removedId);
        }
      }
    )
    .subscribe();
}

// Get friend count
export async function getFriendCount(
  userId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Get friend count error:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Get friend count error:', err);
    return 0;
  }
}

// Get pending request count
export async function getPendingRequestCount(
  userId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select('id', { count: 'exact', head: true })
      .eq('friend_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Get pending request count error:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Get pending request count error:', err);
    return 0;
  }
}

// Check if user is blocked
export async function isUserBlocked(
  userId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from(TABLES.BLOCKED_USERS)
      .select('id')
      .or(
        `and(user_id.eq.${userId},blocked_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},blocked_user_id.eq.${userId})`
      )
      .maybeSingle();

    return !!data;
  } catch (err) {
    console.error('Is user blocked error:', err);
    return false;
  }
}
