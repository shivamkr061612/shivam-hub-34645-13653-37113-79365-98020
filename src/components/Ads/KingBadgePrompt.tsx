import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { Crown, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function KingBadgePrompt() {
  const [show, setShow] = useState(false);
  const { user } = useAuth();
  const { isVerified } = useVerification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || isVerified) return;

    // Show prompt every 1 minute
    const interval = setInterval(() => {
      setShow(true);
      // Auto hide after 8s
      setTimeout(() => setShow(false), 8000);
    }, 60000);

    // Show first after 20s
    const firstTimeout = setTimeout(() => {
      setShow(true);
      setTimeout(() => setShow(false), 8000);
    }, 20000);

    return () => {
      clearInterval(interval);
      clearTimeout(firstTimeout);
    };
  }, [user, isVerified]);

  if (!user || isVerified) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          className="fixed bottom-4 left-3 right-3 z-50 max-w-md mx-auto"
        >
          <div className="relative bg-card border border-border rounded-2xl p-4 shadow-lg">
            <button
              onClick={() => setShow(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--orange))] flex items-center justify-center flex-shrink-0">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Get King Badge</p>
                <p className="text-xs text-muted-foreground mt-0.5">Remove all ads + Premium features</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-accent" />
                    Ad-free browsing
                  </div>
                </div>
              </div>
              <button
                onClick={() => { navigate('/buy-king-badge'); setShow(false); }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--orange))] text-white text-xs font-bold flex-shrink-0 hover:opacity-90 transition-opacity"
              >
                Buy Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
