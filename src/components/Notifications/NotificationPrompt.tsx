import { useState, useEffect } from 'react';
import { Bell, X, Loader2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';

const DISMISS_KEY = 'notification_prompt_dismissed';
const LATER_KEY = 'notification_prompt_later';
const SHOW_COUNT_KEY = 'notification_prompt_show_count';
const LATER_DURATION = 2 * 60 * 60 * 1000; // 2 hours (reduced from 24 hours)
const MAX_DISMISS_BEFORE_RESET = 3; // After 3 dismisses, reset and show again

export function NotificationPrompt() {
  const { permission, isLoading, requestPermission } = usePushNotifications();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [showCount, setShowCount] = useState(0);

  useEffect(() => {
    const checkVisibility = () => {
      // Only show for logged in users with default permission
      if (!user || permission !== 'default') {
        setIsVisible(false);
        return;
      }
      
      // Check show count - reset after max dismisses
      const storedCount = parseInt(localStorage.getItem(SHOW_COUNT_KEY) || '0', 10);
      setShowCount(storedCount);
      
      // Check if user dismissed permanently
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed === 'true') {
        // After MAX_DISMISS_BEFORE_RESET times, reset and show again
        if (storedCount >= MAX_DISMISS_BEFORE_RESET) {
          localStorage.removeItem(DISMISS_KEY);
          localStorage.setItem(SHOW_COUNT_KEY, '0');
          setIsVisible(true);
          return;
        }
        setIsVisible(false);
        return;
      }
      
      // Check "later" timing
      const laterTime = localStorage.getItem(LATER_KEY);
      if (laterTime) {
        const laterTimestamp = parseInt(laterTime, 10);
        if (Date.now() < laterTimestamp) {
          setIsVisible(false);
          return;
        }
        // Clear expired later preference
        localStorage.removeItem(LATER_KEY);
      }
      
      setIsVisible(true);
    };
    
    checkVisibility();
    
    // Re-check every 30 seconds in case later time expires
    const interval = setInterval(checkVisibility, 30000);
    return () => clearInterval(interval);
  }, [user, permission]);

  const handleLater = () => {
    localStorage.setItem(LATER_KEY, String(Date.now() + LATER_DURATION));
    const newCount = showCount + 1;
    localStorage.setItem(SHOW_COUNT_KEY, String(newCount));
    setIsVisible(false);
  };

  const handleClose = () => {
    const newCount = showCount + 1;
    localStorage.setItem(SHOW_COUNT_KEY, String(newCount));
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsVisible(false);
  };

  const handleEnable = async () => {
    await requestPermission();
    localStorage.removeItem(DISMISS_KEY);
    localStorage.removeItem(LATER_KEY);
    localStorage.removeItem(SHOW_COUNT_KEY);
    setIsVisible(false);
  };

  // Don't show if not visible, not supported, or already granted/denied
  if (!isVisible || permission === 'unsupported' || permission === 'granted' || permission === 'denied') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Enable Notifications</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-2 -mt-1"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              🎁 Get notified about special offers, blue tick deals & new content!
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleEnable}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Enable
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLater}
                disabled={isLoading}
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
