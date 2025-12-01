import { differenceInMinutes, differenceInSeconds, format, isAfter } from 'date-fns';
import { colors } from '../constants/colors';

// Format time remaining until expiry
export function formatTimeRemaining(expiresAt: string): string {
  const expiryDate = new Date(expiresAt);
  const now = new Date();

  if (isAfter(now, expiryDate)) {
    return 'Expired';
  }

  const diffMinutes = differenceInMinutes(expiryDate, now);

  if (diffMinutes <= 0) {
    const diffSeconds = differenceInSeconds(expiryDate, now);
    if (diffSeconds <= 0) {
      return 'Expired';
    }
    return `${diffSeconds}s left`;
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m left`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (minutes === 0) {
    return `${hours}h left`;
  }

  return `${hours}h ${minutes}m left`;
}

// Calculate percentage of time remaining
export function calculateTimePercentage(
  createdAt: string,
  expiresAt: string
): number {
  const created = new Date(createdAt).getTime();
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();

  if (now >= expires) {
    return 0;
  }

  const totalDuration = expires - created;
  const timeRemaining = expires - now;
  const percentage = (timeRemaining / totalDuration) * 100;

  return Math.max(0, Math.min(100, Math.round(percentage)));
}

// Get timer bar color based on percentage
export function getTimerColor(percentage: number): string {
  if (percentage > 50) {
    return colors.timerGreen;
  }
  if (percentage > 25) {
    return colors.timerYellow;
  }
  return colors.timerRed;
}

// Check if post is expired
export function isExpired(expiresAt: string): boolean {
  return isAfter(new Date(), new Date(expiresAt));
}

// Format timestamp for display
export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return format(date, 'MMM d');
}

// Format time for display (e.g., "3:45 PM")
export function formatTime(dateString: string): string {
  return format(new Date(dateString), 'h:mm a');
}

// Format date for display (e.g., "Dec 25, 2024")
export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

// Get milliseconds until expiry
export function getMillisecondsUntilExpiry(expiresAt: string): number {
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, expiryTime - now);
}
