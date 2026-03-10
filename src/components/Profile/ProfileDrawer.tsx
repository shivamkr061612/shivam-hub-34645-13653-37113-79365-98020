import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, Clock } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';
import { KingBadge } from '@/components/ui/KingBadge';
import { useKeyCountdown } from '@/hooks/useKeyCountdown';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const { user, isAdmin } = useAuth();
  const { isVerified } = useVerification();
  const { timeRemaining, hasKey } = useKeyCountdown();

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Profile</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold flex items-center gap-2">
                {user.displayName || 'Guest User'}
                {isVerified && <KingBadge size="md" />}
                {isAdmin && <Shield className="h-4 w-4 text-primary" />}
              </p>
              <p className="text-sm text-muted-foreground">{user.email || 'Anonymous'}</p>
            </div>
          </div>

          {hasKey && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Download Key Active</p>
                  <p className="text-xs text-accent font-bold">{timeRemaining} remaining</p>
                </div>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Access Enabled
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
