import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trophy, Medal, Award, Calendar } from 'lucide-react';
import blueTick from '@/assets/blue-tick.png';

export function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekEnd, setWeekEnd] = useState<string>('');

  useEffect(() => {
    checkAndResetWeekly();
    fetchLeaderboard();
  }, []);

  const getWeekKey = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    return weekStart.toISOString().split('T')[0];
  };

  const getWeekEnd = () => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + (6 - now.getDay())); // End of week (Saturday)
    return weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const checkAndResetWeekly = async () => {
    try {
      const currentWeek = getWeekKey();
      const weekEndDate = getWeekEnd();
      setWeekEnd(weekEndDate);
      
      const leaderboardRef = doc(db, 'leaderboard_meta', 'current_week');
      const leaderboardDoc = await getDocs(query(collection(db, 'leaderboard_meta')));
      
      // Check if we need to reset (new week started)
      const metaDoc = leaderboardDoc.docs.find(d => d.id === 'current_week');
      if (!metaDoc || metaDoc.data()?.weekKey !== currentWeek) {
        // Archive old leaderboard and start new week
        await setDoc(leaderboardRef, {
          weekKey: currentWeek,
          startedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error checking weekly reset:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const currentWeek = getWeekKey();
      
      // Fetch this week's downloads only
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const downloadsSnapshot = await getDocs(
        query(
          collection(db, 'downloads'),
          where('downloadedAt', '>=', weekStart.toISOString())
        )
      );
      
      const downloads = downloadsSnapshot.docs.map(doc => doc.data());

      // Get verification status for users
      const verifiedUsersSnapshot = await getDocs(collection(db, 'verified_users'));
      const verifiedEmails = new Set(
        verifiedUsersSnapshot.docs
          .filter(doc => doc.data()?.verified === true)
          .map(doc => doc.id)
      );

      // Count downloads per user
      const userDownloads: { [key: string]: { email: string; count: number; verified: boolean } } = {};
      downloads.forEach((download: any) => {
        if (download.userId) {
          if (!userDownloads[download.userId]) {
            userDownloads[download.userId] = {
              email: download.userEmail,
              count: 0,
              verified: verifiedEmails.has(download.userEmail)
            };
          }
          userDownloads[download.userId].count++;
        }
      });

      // Convert to array and sort
      const sorted = Object.entries(userDownloads)
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setLeaderboard(sorted);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-orange-600" />;
    return <span className="text-muted-foreground font-bold">#{index + 1}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Download Leaderboard
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          This Week - Resets every Sunday (Ends: {weekEnd})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No downloads this week yet
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const isTop3 = index < 3;
              const bgClass = isTop3 
                ? index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/50' 
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/50'
                  : 'bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/50'
                : 'border-border';

              return (
                <div 
                  key={user.userId} 
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${bgClass} ${isTop3 ? 'shadow-lg' : ''}`}
                >
                  <div className="w-12 flex justify-center">
                    {getIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{user.email}</p>
                      {user.verified && (
                        <img src={blueTick} alt="Verified" className="h-4 w-4 object-contain" />
                      )}
                      {isTop3 && (
                        <Badge variant={index === 0 ? 'default' : 'secondary'} className="animate-pulse">
                          TOP {index + 1}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{user.count} downloads this week</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
