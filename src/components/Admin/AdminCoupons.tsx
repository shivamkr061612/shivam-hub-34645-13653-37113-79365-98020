import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Ticket, Loader2, Plus, Trash2, Copy, Percent, Users } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  percentOff: number;
  maxUsers: number;
  usedCount: number;
  createdAt: string;
  active: boolean;
}

export function AdminCoupons() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    percentOff: '',
    maxUsers: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const couponsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Coupon[];
      setCoupons(couponsList);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setFetching(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon(prev => ({ ...prev, code }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCoupon.code || !newCoupon.percentOff || !newCoupon.maxUsers) {
      toast.error('Please fill all fields');
      return;
    }

    const percentOff = parseInt(newCoupon.percentOff);
    const maxUsers = parseInt(newCoupon.maxUsers);

    if (percentOff < 1 || percentOff > 100) {
      toast.error('Percent off must be between 1 and 100');
      return;
    }

    if (maxUsers < 1) {
      toast.error('Max users must be at least 1');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        code: newCoupon.code.toUpperCase(),
        percentOff,
        maxUsers,
        usedCount: 0,
        createdAt: new Date().toISOString(),
        active: true
      });

      toast.success('Coupon created successfully!');
      setNewCoupon({ code: '', percentOff: '', maxUsers: '' });
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to create coupon');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
      toast.success('Coupon deleted');
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (error) {
      toast.error('Failed to delete coupon');
      console.error(error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Coupon
          </CardTitle>
          <CardDescription>
            Generate discount coupons for blue tick purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE20"
                    className="uppercase"
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentOff">Percent Off (%)</Label>
                <Input
                  id="percentOff"
                  type="number"
                  min="1"
                  max="100"
                  value={newCoupon.percentOff}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, percentOff: e.target.value }))}
                  placeholder="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  value={newCoupon.maxUsers}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, maxUsers: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Ticket className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Coupon'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Active Coupons
          </CardTitle>
          <CardDescription>
            Manage existing discount coupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No coupons created yet</p>
          ) : (
            <div className="space-y-3">
              {coupons.map(coupon => {
                const isExpired = coupon.usedCount >= coupon.maxUsers;
                return (
                  <div
                    key={coupon.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${isExpired ? 'bg-muted/50 opacity-60' : 'bg-card/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-primary/10 px-3 py-1 rounded font-mono font-bold text-primary">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyCode(coupon.code)}
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          {coupon.percentOff}% Off
                        </Badge>
                        <Badge variant={isExpired ? 'destructive' : 'outline'} className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {coupon.usedCount}/{coupon.maxUsers} Used
                        </Badge>
                        {isExpired && <Badge variant="destructive">Expired</Badge>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(coupon.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
