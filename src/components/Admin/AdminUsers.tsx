import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Ban, CheckCircle, Shield } from 'lucide-react';
import blueTick from '@/assets/blue-tick.png';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch from downloads to get all users who have interacted
      const downloadsSnapshot = await getDocs(collection(db, 'downloads'));
      const userMap = new Map();
      
      downloadsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userId && !userMap.has(data.userId)) {
          userMap.set(data.userId, {
            id: data.userId,
            email: data.userEmail,
            displayName: data.userEmail?.split('@')[0] || 'User'
          });
        }
      });

      // Fetch user stats (ban status, verified status)
      const usersWithStats = await Promise.all(
        Array.from(userMap.values()).map(async (user) => {
          const userStatsDoc = await getDoc(doc(db, 'user_stats', user.id));
          const verifiedDoc = await getDoc(doc(db, 'verified_users', user.email));
          
          return {
            ...user,
            banned: userStatsDoc.exists() ? userStatsDoc.data()?.banned || false : false,
            verified: verifiedDoc.exists() ? verifiedDoc.data()?.verified || false : false
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      const userStatsRef = doc(db, 'user_stats', userId);
      await setDoc(userStatsRef, {
        banned: !currentStatus,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast.success(currentStatus ? '✅ User unbanned successfully' : '🚫 User banned successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Error toggling ban:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage registered users</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                  user.banned 
                    ? 'border-destructive/50 bg-destructive/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{user.displayName || 'Anonymous'}</p>
                      {user.verified && (
                        <img src={blueTick} alt="Verified" className="h-4 w-4 object-contain" />
                      )}
                      {user.banned && (
                        <Shield className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant={user.banned ? 'default' : 'destructive'}
                  size="sm"
                  onClick={() => toggleBan(user.id, user.banned)}
                >
                  {user.banned ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unban
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
