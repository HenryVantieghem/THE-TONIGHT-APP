/**
 * Scena - useRealtime Hook
 * Generic realtime subscription hook with connection status
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export const useRealtime = (
  channelName: string,
  config: {
    event: string;
    schema: string;
    table: string;
    filter?: string;
  },
  callback: (payload: any) => void,
  enabled = true
) => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus('disconnected');
      return;
    }

    // Create channel
    const channel = supabase.channel(channelName);

    // Configure subscription
    const subscription = channel.on(
      'postgres_changes',
      {
        event: config.event as any,
        schema: config.schema,
        table: config.table,
        ...(config.filter && { filter: config.filter }),
      },
      callback
    );

    // Subscribe
    subscription.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setStatus('connected');
      } else if (status === 'CLOSED') {
        setStatus('disconnected');
      } else if (status === 'CHANNEL_ERROR') {
        setStatus('disconnected');
      }
    });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [channelName, config.event, config.schema, config.table, config.filter, enabled]);

  return { status };
};

