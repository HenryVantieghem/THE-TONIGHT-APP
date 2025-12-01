import { supabase, TABLES } from './supabase';
import type { Post, User, LocationData } from '../types';

// Mock users for testing
const MOCK_USERS: Omit<User, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    username: 'alex_martinez',
    avatar_url: null,
  },
  {
    username: 'sarah_chen',
    avatar_url: null,
  },
  {
    username: 'mike_johnson',
    avatar_url: null,
  },
  {
    username: 'emma_wilson',
    avatar_url: null,
  },
  {
    username: 'david_kim',
    avatar_url: null,
  },
];

// Mock locations
const MOCK_LOCATIONS: LocationData[] = [
  {
    name: 'Central Park',
    lat: 40.785091,
    lng: -73.968285,
    city: 'New York',
    state: 'NY',
  },
  {
    name: 'Golden Gate Bridge',
    lat: 37.8199,
    lng: -122.4783,
    city: 'San Francisco',
    state: 'CA',
  },
  {
    name: 'Santa Monica Pier',
    lat: 34.0089,
    lng: -118.4973,
    city: 'Los Angeles',
    state: 'CA',
  },
  {
    name: 'Millennium Park',
    lat: 41.8825,
    lng: -87.6244,
    city: 'Chicago',
    state: 'IL',
  },
  {
    name: 'Space Needle',
    lat: 47.6205,
    lng: -122.3493,
    city: 'Seattle',
    state: 'WA',
  },
];

// Mock captions
const MOCK_CAPTIONS = [
  'Beautiful sunset tonight! 🌅',
  'Having the best time with friends!',
  'This place is amazing ✨',
  'Can\'t believe I\'m here!',
  'Living my best life tonight 💫',
  'What a view!',
  'Making memories that last',
  'Tonight was perfect',
  'So grateful for this moment',
  'This is what life is about',
];

/**
 * Create mock users in the database
 * Note: This requires authentication and proper RLS policies
 */
export async function createMockUsers(): Promise<void> {
  console.log('Creating mock users...');
  
  // Note: In a real scenario, you'd need to create auth users first
  // This is a simplified version that assumes users exist
  // For testing, you might want to create these via Supabase dashboard or migrations
  
  try {
    // Check if mock users already exist
    const { data: existingUsers } = await supabase
      .from(TABLES.PROFILES)
      .select('username')
      .in('username', MOCK_USERS.map(u => u.username || '').filter(Boolean));

    const existingUsernames = new Set(existingUsers?.map(u => u.username) || []);
    const usersToCreate = MOCK_USERS.filter(u => !existingUsernames.has(u.username || ''));

    if (usersToCreate.length === 0) {
      console.log('Mock users already exist');
      return;
    }

    console.log(`Creating ${usersToCreate.length} mock users...`);
    // Note: This would require proper auth setup
    // For now, just log what would be created
    console.log('Mock users to create:', usersToCreate.map(u => u.username));
  } catch (error) {
    console.error('Error creating mock users:', error);
  }
}

/**
 * Generate mock posts for testing
 * This creates posts with placeholder media URLs
 */
export async function generateMockPosts(currentUserId: string): Promise<void> {
  console.log('Generating mock posts...');

  try {
    // Get all users (including mock users)
    const { data: users } = await supabase
      .from(TABLES.PROFILES)
      .select('id, username')
      .limit(10);

    if (!users || users.length === 0) {
      console.log('No users found. Create users first.');
      return;
    }

    const postsToCreate = [];
    const now = new Date();

    // Create 2-3 posts per user
    for (const user of users) {
      if (user.id === currentUserId) continue; // Skip current user

      const numPosts = Math.floor(Math.random() * 2) + 2; // 2-3 posts

      for (let i = 0; i < numPosts; i++) {
        const location = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
        const caption = MOCK_CAPTIONS[Math.floor(Math.random() * MOCK_CAPTIONS.length)];
        const mediaType = Math.random() > 0.7 ? 'video' : 'image';
        
        // Create expiry time (some expired, some active)
        const expiresAt = new Date(now);
        if (Math.random() > 0.3) {
          // 70% chance of active post
          expiresAt.setHours(expiresAt.getHours() + Math.random() * 0.8 + 0.2); // 0.2-1 hour
        } else {
          // 30% chance of expired post
          expiresAt.setHours(expiresAt.getHours() - Math.random() * 2 - 0.5); // 0.5-2.5 hours ago
        }

        postsToCreate.push({
          user_id: user.id,
          media_url: `https://picsum.photos/800/1000?random=${Date.now()}-${user.id}-${i}`,
          media_type: mediaType,
          thumbnail_url: mediaType === 'image' ? null : `https://picsum.photos/400/400?random=${Date.now()}-${user.id}-${i}`,
          caption: Math.random() > 0.3 ? caption : null, // 70% have captions
          location_name: location.name,
          location_lat: location.lat,
          location_lng: location.lng,
          location_city: location.city || null,
          location_state: location.state || null,
          expires_at: expiresAt.toISOString(),
          view_count: Math.floor(Math.random() * 100),
        });
      }
    }

    if (postsToCreate.length === 0) {
      console.log('No posts to create');
      return;
    }

    // Insert posts in batches
    const batchSize = 5;
    for (let i = 0; i < postsToCreate.length; i += batchSize) {
      const batch = postsToCreate.slice(i, i + batchSize);
      const { error } = await supabase
        .from(TABLES.POSTS)
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Created batch ${i / batchSize + 1} (${batch.length} posts)`);
      }
    }

    console.log(`Successfully created ${postsToCreate.length} mock posts`);
  } catch (error) {
    console.error('Error generating mock posts:', error);
  }
}

/**
 * Create mock friendships for testing
 */
export async function createMockFriendships(currentUserId: string): Promise<void> {
  console.log('Creating mock friendships...');

  try {
    // Get all users except current user
    const { data: users } = await supabase
      .from(TABLES.PROFILES)
      .select('id')
      .neq('id', currentUserId)
      .limit(5);

    if (!users || users.length === 0) {
      console.log('No other users found for friendships');
      return;
    }

    const friendshipsToCreate = users.map(user => ({
      user_id: currentUserId,
      friend_id: user.id,
      status: 'accepted' as const,
    }));

    // Check existing friendships
    const { data: existing } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .select('friend_id')
      .eq('user_id', currentUserId)
      .in('friend_id', friendshipsToCreate.map(f => f.friend_id));

    const existingFriendIds = new Set(existing?.map(f => f.friend_id) || []);
    const newFriendships = friendshipsToCreate.filter(
      f => !existingFriendIds.has(f.friend_id)
    );

    if (newFriendships.length === 0) {
      console.log('All friendships already exist');
      return;
    }

    const { error } = await supabase
      .from(TABLES.FRIENDSHIPS)
      .insert(newFriendships);

    if (error) {
      console.error('Error creating friendships:', error);
    } else {
      console.log(`Created ${newFriendships.length} friendships`);
    }
  } catch (error) {
    console.error('Error creating mock friendships:', error);
  }
}

/**
 * Initialize all mock data
 */
export async function initializeMockData(currentUserId: string): Promise<void> {
  console.log('Initializing mock data...');
  
  try {
    await createMockUsers();
    await createMockFriendships(currentUserId);
    await generateMockPosts(currentUserId);
    
    console.log('Mock data initialization complete!');
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}

