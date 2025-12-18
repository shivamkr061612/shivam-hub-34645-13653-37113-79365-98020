import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Construction, Shield, Clock, Sparkles } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthDialog } from '@/components/Auth/AuthDialog';

export function MaintenancePopup() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [description, setDescription] = useState('');
  const [updateVersion, setUpdateVersion] = useState('');
  const [endTime, setEndTime] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Listen to maintenance status in real-time
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'maintenance'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const enabled = data?.enabled || false;
          setMaintenanceMode(enabled);
          setDescription(data?.description || '');
          setUpdateVersion(data?.updateVersion || '');
          setEndTime(data?.endTime || '');
          
          // If maintenance is on and user is not admin and not on admin page
          if (enabled && !isAdmin && location.pathname !== '/admin') {
            setOpen(true);
            // Redirect to home page if not already there
            if (location.pathname !== '/') {
              navigate('/');
            }
          } else {
            setOpen(false);
          }
        }
      },
      (error) => {
        console.error('Error listening to maintenance status:', error);
      }
    );

    return () => unsubscribe();
  }, [isAdmin, location.pathname, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!endTime) return;

    const updateCountdown = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const handleAdminAccess = () => {
    if (user) {
      setOpen(false);
      navigate('/admin');
    } else {
      setShowAuth(true);
    }
  };

  // Auto-navigate to admin after successful login
  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false);
      setOpen(false);
      navigate('/admin');
    }
  }, [user, showAuth, navigate]);

  if (!maintenanceMode || isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing the dialog unless user is admin or navigating to admin
      if (!newOpen && !isAdmin) {
        return;
      }
      setOpen(newOpen);
    }}>
      <DialogContent className="sm:max-w-md glass-effect border-2 border-primary/50 neon-border z-[70]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto mb-4"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center neon-border">
              <Construction className="h-10 w-10 text-white animate-pulse" />
            </div>
          </motion.div>
          
          <DialogTitle className="text-2xl text-center gradient-text">
            Site Under Maintenance
          </DialogTitle>
          
          <DialogDescription className="text-center text-base space-y-4 pt-4">
            {updateVersion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">Update Version: {updateVersion}</span>
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              {description || "We're currently performing scheduled maintenance to improve your experience."}
            </motion.p>

            {endTime && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Time Remaining</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Days', value: countdown.days },
                    { label: 'Hours', value: countdown.hours },
                    { label: 'Min', value: countdown.minutes },
                    { label: 'Sec', value: countdown.seconds }
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="text-2xl font-bold text-primary">{String(item.value).padStart(2, '0')}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm"
            >
              Please check back soon. We apologize for any inconvenience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-border/50"
            >
              <Button
                onClick={handleAdminAccess}
                variant="outline"
                className="w-full gap-2 border-2 border-primary/50 hover:border-primary hover:shadow-neon"
              >
                <Shield className="h-4 w-4" />
                Admin Panel Access
              </Button>
            </motion.div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>

      <AuthDialog 
        open={showAuth} 
        onOpenChange={setShowAuth}
        restrictToEmail="techshivam0616@gmail.com"
        onSuccess={() => {
          setShowAuth(false);
          setOpen(false);
          navigate('/admin');
        }}
      />
    </Dialog>
  );
}
