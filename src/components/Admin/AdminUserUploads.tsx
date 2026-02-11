import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Check, X, Clock, Eye, Loader2 } from 'lucide-react';

interface UserUploadItem {
  id: string;
  title: string;
  description: string;
  publisher: string;
  info: string;
  link: string;
  thumbnail: string;
  screenshots: string[];
  rating: number;
  votes: number;
  section: string;
  status: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string;
}

export function AdminUserUploads() {
  const [uploads, setUploads] = useState<UserUploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'user_uploads'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as UserUploadItem[];
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUploads(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch uploads');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: UserUploadItem) => {
    setProcessing(item.id);
    try {
      // Add to the actual section collection
      await addDoc(collection(db, item.section), {
        title: item.title,
        description: item.description,
        publisher: item.publisher,
        infoLabel: item.section === 'courses' ? 'Course Info' : item.section === 'bundles' ? 'Reel Bundle Info' : 'Asset Info',
        infoText: item.info,
        downloadUrl: item.link,
        thumbnail: item.thumbnail,
        itemImage: item.thumbnail,
        screenshots: item.screenshots || [],
        rating: item.rating || 4.5,
        votes: item.votes || 0,
        versions: [{ name: item.title, size: 'Unknown', link: item.link }],
        downloadCount: 0,
        isPremium: false,
        createdAt: new Date().toISOString(),
        uploadedBy: item.userId,
        uploadedByName: item.userName,
      });

      // Award coins to the user
      const coinSettingsDoc = await getDoc(doc(db, 'app_settings', 'coin_settings'));
      const coinsPerUpload = coinSettingsDoc.exists() ? (coinSettingsDoc.data().coinsPerUpload || 10) : 10;

      const userCoinRef = doc(db, 'user_coins', item.userId);
      const userCoinDoc = await getDoc(userCoinRef);
      const currentCoins = userCoinDoc.exists() ? (userCoinDoc.data().coins || 0) : 0;

      await updateDoc(doc(db, 'user_uploads', item.id), { status: 'approved' });

      // Update or create user coins
      if (userCoinDoc.exists()) {
        await updateDoc(userCoinRef, { coins: currentCoins + coinsPerUpload });
      } else {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(userCoinRef, {
          coins: coinsPerUpload,
          userId: item.userId,
          email: item.userEmail,
          name: item.userName,
        });
      }

      toast.success(`Approved! ${item.userName} earned ${coinsPerUpload} coins.`);
      fetchUploads();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await updateDoc(doc(db, 'user_uploads', id), { status: 'rejected' });
      toast.success('Upload rejected');
      fetchUploads();
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'user_uploads', id));
      toast.success('Deleted');
      fetchUploads();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const pending = uploads.filter(u => u.status === 'pending');
  const processed = uploads.filter(u => u.status !== 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          User Uploads ({pending.length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pending.length === 0 && <p className="text-muted-foreground text-center py-4">No pending uploads</p>}

        {pending.map(item => (
          <div key={item.id} className="border rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              {item.thumbnail && (
                <img src={item.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover border" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">by {item.userName} ({item.userEmail})</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize">{item.section}</Badge>
                  <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{item.description}</p>
            {item.info && <p className="text-sm"><span className="font-medium">Info:</span> {item.info}</p>}
            <p className="text-sm"><span className="font-medium">Link:</span> <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary underline">{item.link}</a></p>

            {item.screenshots?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {item.screenshots.map((s, i) => (
                  <img key={i} src={s} alt="" className="w-20 h-16 rounded-lg object-cover border" />
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleApprove(item)} disabled={processing === item.id} className="gap-1">
                {processing === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleReject(item.id)} disabled={processing === item.id} className="gap-1">
                <X className="h-3 w-3" /> Reject
              </Button>
            </div>
          </div>
        ))}

        {processed.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-muted-foreground">Processed</h3>
            {processed.map(item => (
              <div key={item.id} className="border rounded-lg p-3 mb-2 flex items-center justify-between">
                <div>
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-muted-foreground ml-2">by {item.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.status === 'approved' ? 'default' : 'destructive'} className="capitalize">{item.status}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
