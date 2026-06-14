'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * useOrderNotification
 * Subscribes to Supabase Realtime on the orders table.
 * On new INSERT → plays preloaded cha-ching.mp3 + shows browser notification.
 * Prevents duplicate sounds/notifications for the same order ID.
 */
export function useOrderNotification() {
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedOrderIds = useRef<Set<string>>(new Set());
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Pre-load audio for instant playback
    const audio = new Audio('/audio/cha-ching.mp3');
    audio.volume = 1.0; // 100% volume
    audio.preload = 'auto';
    audioRef.current = audio;

    // 🔊 Browser audio context unlock pattern (requires user interaction first)
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          // Immediately pause and reset after unlocking
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          console.log('[OrderNotification] Audio context unlocked successfully');
        }).catch(err => {
          console.warn('[OrderNotification] Audio context unlock failed:', err);
        });
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }

    // Subscribe to orders table INSERT events
    const channel = supabase
      .channel('admin-new-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const orderId = payload.new?.id;
          const orderNumber = payload.new?.order_number;

          // Deduplicate to prevent multiple triggers for same order
          if (!orderId || playedOrderIds.current.has(orderId)) return;
          playedOrderIds.current.add(orderId);

          // Play preloaded sound at 100% volume
          if (audioRef.current) {
            try {
              audioRef.current.currentTime = 0;
              await audioRef.current.play();
            } catch (err) {
              console.warn('[OrderNotification] Audio play blocked by browser policy:', err);
              // Fallback: try recreating if browser instance was garbage collected/broken
              try {
                const fallbackAudio = new Audio('/audio/cha-ching.mp3');
                fallbackAudio.volume = 1.0;
                await fallbackAudio.play();
              } catch (e2) {
                console.warn('[OrderNotification] Fallback audio play also blocked:', e2);
              }
            }
          }

          // Show browser notification (PWA-compatible using Service Worker if available)
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const displayOrderNum = orderNumber ? ` #${orderNumber}` : '';
              const notificationTitle = 'New Order';
              const notificationOptions: any = {
                body: `A new order has been received${displayOrderNum}`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: `order-${orderId}`,
                renotify: false,
              };

              // Use Service Worker registration if available to ensure display on PWA / mobile background
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(async (reg) => {
                  try {
                    await reg.showNotification(notificationTitle, notificationOptions);
                  } catch (swErr) {
                    console.warn('[OrderNotification] SW showNotification failed, using fallback:', swErr);
                    // Fallback to standard Notification construction
                    const n = new Notification(notificationTitle, notificationOptions);
                    n.onclick = () => {
                      window.focus();
                      n.close();
                    };
                  }
                });
              } else {
                const n = new Notification(notificationTitle, notificationOptions);
                n.onclick = () => {
                  window.focus();
                  n.close();
                };
              }
            } catch (e) {
              console.warn('[OrderNotification] Notification display failed:', e);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[OrderNotification] Subscribed to orders realtime');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[OrderNotification] Realtime channel error');
        }
      });

    channelRef.current = channel;

    // Correct cleanup on unmount
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
