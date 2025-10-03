import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export function AdminVerification() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, 'verified_users', email), {
        email,
        verifiedAt: new Date().toISOString(),
        verified: true
      });

      toast.success('User verified successfully!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to verify user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blue Tick Verification</CardTitle>
        <CardDescription>Grant verified status to users</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verifyEmail">User Email *</Label>
            <Input
              id="verifyEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {loading ? 'Verifying...' : 'Grant Blue Tick'}
          </Button>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              ℹ️ Verified users will see a blue tick next to their name in their profile.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
