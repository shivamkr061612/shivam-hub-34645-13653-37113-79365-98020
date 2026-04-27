import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restrictToEmail?: string;
  onSuccess?: () => void;
  defaultMode?: 'signin' | 'signup';
  title?: string;
  description?: string;
}

export function AuthDialog({
  open,
  onOpenChange,
  restrictToEmail,
  onSuccess,
  defaultMode = 'signin',
  title,
  description,
}: AuthDialogProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState(restrictToEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created! Welcome.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      if (restrictToEmail && email.toLowerCase() !== restrictToEmail.toLowerCase()) {
        await signOut(auth);
        toast.error('Only the admin can log in here.');
        return;
      }

      toast.success('Welcome!');
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
        errorMessage = 'Account not found. Try signing up.';
      } else if (errorCode === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered. Please sign in.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (restrictToEmail && result.user.email?.toLowerCase() !== restrictToEmail.toLowerCase()) {
        await signOut(auth);
        toast.error('Only the admin can log in here.');
        return;
      }
      toast.success('Signed in with Google!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[80]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'signup' ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            {title || (mode === 'signup' ? 'Create Account' : 'Sign In')}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Please wait...' : 'Continue with Google'}
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!restrictToEmail}
                placeholder="you@example.com"
                className={`pl-9 ${restrictToEmail ? 'bg-muted' : ''}`}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="pl-9"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading || googleLoading}>
            {loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        {!restrictToEmail && (
          <p className="text-center text-xs text-muted-foreground">
            {mode === 'signup' ? (
              <>Already have an account?{' '}
                <button onClick={() => setMode('signin')} className="text-primary font-semibold hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>New here?{' '}
                <button onClick={() => setMode('signup')} className="text-primary font-semibold hover:underline">
                  Create an account
                </button>
              </>
            )}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
