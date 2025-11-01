import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { doc, setDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { CheckCircle2, X, Loader2 } from 'lucide-react';
import blueTick from '@/assets/blue-tick.png';

export function AdminVerification() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  useEffect(() => {
    fetchVerifiedUsers();
  }, []);

  const fetchVerifiedUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'verified_users'));
      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVerifiedUsers(users);
    } catch (error) {
      console.error('Error fetching verified users:', error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setDoc(doc(db, 'verified_users', email), {
        email,
        verifiedAt: new Date().toISOString(),
        verified: true,
        expiresAt: null // null means permanent verification
      });

      toast.success('User verified successfully!');
      setEmail('');
      fetchVerifiedUsers();
    } catch (error) {
      toast.error('Failed to verify user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVerification = async (email: string) => {
    try {
      await deleteDoc(doc(db, 'verified_users', email));
      toast.success('Verification removed successfully!');
      fetchVerifiedUsers();
    } catch (error) {
      toast.error('Failed to remove verification');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grant Blue Tick Verification</CardTitle>
          <CardDescription>Manually grant verified status to users</CardDescription>
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
                ℹ️ Verified users will see a blue tick next to their name and won't need to generate keys.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verified Users</CardTitle>
          <CardDescription>Manage users with blue tick verification</CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingUsers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : verifiedUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No verified users yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Verified At</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifiedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-2">
                      <img src={blueTick} alt="Verified" className="h-4 w-4" />
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveVerification(user.email)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
