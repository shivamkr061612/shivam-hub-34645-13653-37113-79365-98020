import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restrictToEmail?: string;
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, restrictToEmail, onSuccess }: AuthDialogProps) {
  const [email, setEmail] = useState(restrictToEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (restrictToEmail && email.toLowerCase() !== restrictToEmail.toLowerCase()) {
        await signOut(auth);
        toast.error('Maintenance mode: only the admin can log in.');
        return;
      }
      toast.success('Welcome back!');
      onOpenChange(false);
      onSuccess?.();
      setEmail('');
      setPassword('');
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = 'Authentication failed';
      
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (errorCode === 'auth/user-not-found') {
        errorMessage = 'Account not found.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[80]">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!restrictToEmail}
              className={restrictToEmail ? 'bg-muted' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : 'Login'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
