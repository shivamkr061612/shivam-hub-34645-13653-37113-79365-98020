import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Coins, Megaphone, Loader2, Crown } from 'lucide-react';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import { PageTransition } from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';

interface PromotionPlan {
  id: string;
  name: string;
  description: string;
  coinsCost: number;
  durationDays: number;
}

export default function Promotions() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [coins, setCoins] = useState(0);
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [channelName, setChannelName] = useState('');
  const [channelLink, setChannelLink] = useState('');
  const [bannerImage, setBannerImage] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const plansSnap = await getDocs(collection(db, 'promotion_plans'));
      setPlans(plansSnap.docs.map(d => ({ id: d.id, ...d.data() })) as PromotionPlan[]);

      if (user) {
        const coinDoc = await getDoc(doc(db, 'user_coins', user.uid));
        if (coinDoc.exists()) {
          setCoins(coinDoc.data().coins || 0);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPromotion = async (plan: PromotionPlan) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (coins < plan.coinsCost) {
      toast.error('Not enough coins! Upload more content to earn coins.');
      return;
    }

    if (!channelName.trim() || !channelLink.trim()) {
      toast.error('Please enter your channel name and link');
      return;
    }

    setBuying(plan.id);
    try {
      // Deduct coins
      await updateDoc(doc(db, 'user_coins', user.uid), {
        coins: coins - plan.coinsCost,
      });

      // Create promotional banner
      await addDoc(collection(db, 'promotional_banners'), {
        name: channelName,
        description: `Promoted by ${user.displayName || 'User'} - ${plan.name}`,
        imageUrl: bannerImage || 'https://via.placeholder.com/800x400/1a1a2e/e94560?text=' + encodeURIComponent(channelName),
        link: channelLink,
        order: 99,
        active: true,
        isUserPromotion: true,
        userId: user.uid,
        planId: plan.id,
        expiresAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      });

      setCoins(prev => prev - plan.coinsCost);
      toast.success(`Promotion activated for ${plan.durationDays} days!`);
      setChannelName('');
      setChannelLink('');
      setBannerImage('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to buy promotion');
    } finally {
      setBuying(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Megaphone className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">Promote Your Channel</h1>
            </div>

            {/* Coin Balance */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-3xl font-bold text-primary flex items-center gap-2">
                  <Coins className="h-7 w-7" />
                  {coins} Coins
                </p>
              </div>
              <Crown className="h-10 w-10 text-primary/30" />
            </div>

            {/* Channel Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Channel Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>Channel Name</Label>
                  <Input value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="Your channel name" />
                </div>
                <div className="space-y-1">
                  <Label>Channel Link</Label>
                  <Input value={channelLink} onChange={(e) => setChannelLink(e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-1">
                  <Label>Banner Image URL (optional)</Label>
                  <Input value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} placeholder="https://..." />
                  <p className="text-xs text-muted-foreground">Leave empty for auto-generated banner</p>
                </div>
              </CardContent>
            </Card>

            {/* Plans */}
            <h2 className="text-lg font-semibold mb-4">Promotion Plans</h2>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : plans.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No promotion plans available yet</p>
            ) : (
              <div className="space-y-4">
                {plans.map(plan => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-2xl p-5 bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <Coins className="h-4 w-4" />
                        {plan.coinsCost} Coins
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                    <p className="text-xs text-muted-foreground mb-3">Duration: {plan.durationDays} days in slider</p>
                    <Button
                      onClick={() => handleBuyPromotion(plan)}
                      disabled={buying === plan.id || coins < plan.coinsCost}
                      className="w-full"
                      variant={coins >= plan.coinsCost ? 'default' : 'secondary'}
                    >
                      {buying === plan.id ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                      ) : coins < plan.coinsCost ? (
                        'Not enough coins'
                      ) : (
                        <><Megaphone className="h-4 w-4 mr-2" />Buy Promotion</>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    </PageTransition>
  );
}
