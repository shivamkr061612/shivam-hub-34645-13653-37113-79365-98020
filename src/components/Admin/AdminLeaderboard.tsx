import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trophy, Medal, Award } from 'lucide-react';

export function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const downloadsSnapshot = await getDocs(collection(db, 'downloads'));
      const downloads = downloadsSnapshot.docs.map(doc => doc.data());

      // Count downloads per user
      const userDownloads: { [key: string]: { email: string; count: number } } = {};
      downloads.forEach((download: any) => {
        if (download.userId) {
          if (!userDownloads[download.userId]) {
            userDownloads[download.userId] = {
              email: download.userEmail,
              count: 0
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
        <CardTitle>Download Leaderboard</CardTitle>
        <CardDescription>Top users by download count</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading leaderboard...</div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <div key={user.userId} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-12 flex justify-center">
                  {getIcon(index)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.count} downloads</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
