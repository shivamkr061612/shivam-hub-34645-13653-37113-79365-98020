import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { ref, set, serverTimestamp } from 'firebase/database';
import app, { realtimeDb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VAPID_KEY = 'BBDP_czFf4h09bgLieTEniI1scI6cplpjiOHIpkowb4AOfoq6jnBFTYVJ3BKBqXMng9mRo08OdcnaYLvjQQkznQ';

interface UsePushNotificationsReturn {
  permission: NotificationPermission | 'unsupported';
  token: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Check if messaging is supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = await isSupported();
      if (!supported) {
        setPermission('unsupported');
        console.log('Push notifications not supported in this browser');
      } else if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };
    checkSupport();
  }, []);

  // Save token to Realtime Database
  const saveTokenToDatabase = useCallback(async (fcmToken: string) => {
    if (!user) return;
    
    try {
      const tokenRef = ref(realtimeDb, `tokens/${user.uid}`);
      await set(tokenRef, {
        token: fcmToken,
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
      });
      console.log('FCM token saved to database');
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  }, [user]);

  // Setup foreground message handler
  useEffect(() => {
    const setupForegroundHandler = async () => {
      const supported = await isSupported();
      if (!supported) return;

      try {
        const messaging = getMessaging(app);
        
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          
          const title = payload.notification?.title || 'New Notification';
          const body = payload.notification?.body || '';
          
          // Show toast for foreground notifications
          toast(title, {
            description: body,
            duration: 5000,
          });

          // Also show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(title, {
              body,
              icon: '/favicon.ico',
            });
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up foreground handler:', error);
      }
    };

    setupForegroundHandler();
  }, []);

  // Request permission and get token
  const requestPermission = useCallback(async () => {
    // Check basic browser support first
    if (!('Notification' in window)) {
      toast.error('Your browser does not support notifications');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      toast.error('Service workers are not supported in this browser');
      return;
    }

    const supported = await isSupported();
    if (!supported) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);

    try {
      // Check current permission - if denied, show helpful message
      const currentPermission = Notification.permission;
      
      if (currentPermission === 'denied') {
        toast.error('Notifications blocked! To enable: Open browser settings → Site permissions → Notifications → Allow for this site', {
          duration: 8000,
        });
        setPermission('denied');
        setIsLoading(false);
        return;
      }

      // Register service worker
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
        await navigator.serviceWorker.ready;
      } catch (swError) {
        console.error('Service Worker registration failed:', swError);
        toast.error('Failed to setup notifications. Please refresh and try again.');
        setIsLoading(false);
        return;
      }

      // Request permission - this shows the browser prompt
      const notificationPermission = await Notification.requestPermission();
      console.log('Permission result:', notificationPermission);
      setPermission(notificationPermission);

      if (notificationPermission === 'denied') {
        toast.error('Notifications blocked! Go to browser settings → Site permissions → Notifications to enable.', {
          duration: 8000,
        });
        setIsLoading(false);
        return;
      }

      if (notificationPermission !== 'granted') {
        toast.info('Notification permission not granted');
        setIsLoading(false);
        return;
      }

      // Get FCM token
      const messaging = getMessaging(app);
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (fcmToken) {
        console.log('FCM Token obtained successfully');
        setToken(fcmToken);
        await saveTokenToDatabase(fcmToken);
        toast.success('Notifications enabled! You will receive updates on your device.');
      } else {
        toast.error('Could not get notification token. Please try again.');
      }
    } catch (error: any) {
      console.error('Notification error:', error);
      
      if (error?.code === 'messaging/permission-blocked') {
        toast.error('Notifications blocked in browser settings. Please enable manually.', { duration: 8000 });
      } else if (error?.code === 'messaging/unsupported-browser') {
        toast.error('Your browser does not support push notifications.');
      } else {
        toast.error('Failed to enable notifications. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [saveTokenToDatabase]);

  // Auto-request token if already granted and user is logged in
  useEffect(() => {
    const autoGetToken = async () => {
      if (permission === 'granted' && user && !token) {
        const supported = await isSupported();
        if (!supported) return;

        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          const messaging = getMessaging(app);
          const fcmToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          if (fcmToken) {
            setToken(fcmToken);
            await saveTokenToDatabase(fcmToken);
          }
        } catch (error) {
          console.error('Error auto-getting token:', error);
        }
      }
    };

    autoGetToken();
  }, [permission, user, token, saveTokenToDatabase]);

  return {
    permission,
    token,
    isLoading,
    requestPermission,
  };
}
