/**
 * Scena - Realtime Context
 * Centralized realtime subscription management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface RealtimeContextType {
  status: ConnectionStatus;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    let channel: any = null;
    let checkInterval: NodeJS.Timeout | null = null;

    try {
      if (__DEV__) {
        console.log('[RealtimeContext] Initializing...');
      }
      // Monitor Realtime connection status
      channel = supabase.channel('connection-monitor');
      
      channel.subscribe((subscribeStatus: string) => {
        try {
          if (subscribeStatus === 'SUBSCRIBED') {
            setStatus('connected');
            if (__DEV__) {
              console.log('[RealtimeContext] Connected');
            }
          } else if (subscribeStatus === 'CLOSED' || subscribeStatus === 'CHANNEL_ERROR') {
            setStatus('disconnected');
            if (__DEV__) {
              console.log('[RealtimeContext] Disconnected');
            }
          }
        } catch (error) {
          if (__DEV__) {
            console.error('[RealtimeContext] Error in subscription handler:', error);
          }
        }
      });

      // Check for reconnection
      checkInterval = setInterval(() => {
        try {
          if (status === 'disconnected') {
            setStatus('connecting');
            // Supabase will auto-reconnect
          }
        } catch (error) {
          if (__DEV__) {
            console.error('[RealtimeContext] Error in reconnection check:', error);
          }
        }
      }, 5000);
    } catch (error) {
      if (__DEV__) {
        console.error('[RealtimeContext] Error initializing:', error);
      }
      setStatus('disconnected');
    }

    return () => {
      try {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        if (channel) {
          channel.unsubscribe();
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[RealtimeContext] Error cleaning up:', error);
        }
      }
    };
  }, [status]);

  const value: RealtimeContextType = {
    status,
    isConnected: status === 'connected',
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

