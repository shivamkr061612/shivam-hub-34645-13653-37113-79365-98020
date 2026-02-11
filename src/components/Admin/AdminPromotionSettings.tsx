import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Coins, Plus, X, Loader2, Megaphone, Save } from 'lucide-react';

interface PromotionPlan {
  id?: string;
  name: string;
  description: string;
  coinsCost: number;
  durationDays: number;
}

export function AdminPromotionSettings() {
  const [coinsPerUpload, setCoinsPerUpload] = useState(10);
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const coinDoc = await getDoc(doc(db, 'app_settings', 'coin_settings'));
      if (coinDoc.exists()) {
        setCoinsPerUpload(coinDoc.data().coinsPerUpload || 10);
      }

      const plansSnapshot = await getDocs(collection(db, 'promotion_plans'));
      const plansData = plansSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as PromotionPlan[];
      setPlans(plansData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveCoinSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'app_settings', 'coin_settings'), { coinsPerUpload });
      toast.success('Coin settings saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addPlan = async () => {
    try {
      await addDoc(collection(db, 'promotion_plans'), {
        name: 'New Plan',
        description: 'Plan description',
        coinsCost: 50,
        durationDays: 7,
      });
      toast.success('Plan added');
      fetchSettings();
    } catch {
      toast.error('Failed to add plan');
    }
  };

  const updatePlan = async (plan: PromotionPlan) => {
    if (!plan.id) return;
    try {
      await setDoc(doc(db, 'promotion_plans', plan.id), {
        name: plan.name,
        description: plan.description,
        coinsCost: plan.coinsCost,
        durationDays: plan.durationDays,
      });
      toast.success('Plan updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'promotion_plans', id));
      toast.success('Plan deleted');
      fetchSettings();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Coin Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Coin Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Coins per Approved Upload</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={coinsPerUpload}
                onChange={(e) => setCoinsPerUpload(parseInt(e.target.value) || 0)}
                className="w-32"
              />
              <Button onClick={saveCoinSettings} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Users earn this many coins when their upload is approved</p>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Plans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Promotion Plans
            </CardTitle>
            <Button size="sm" onClick={addPlan} className="gap-1">
              <Plus className="h-4 w-4" /> Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.length === 0 && <p className="text-muted-foreground text-center py-4">No promotion plans yet</p>}

          {plans.map((plan, idx) => (
            <div key={plan.id || idx} className="border rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Plan Name</Label>
                  <Input
                    value={plan.name}
                    onChange={(e) => setPlans(p => p.map((pl, i) => i === idx ? { ...pl, name: e.target.value } : pl))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Coins Cost</Label>
                    <Input
                      type="number"
                      value={plan.coinsCost}
                      onChange={(e) => setPlans(p => p.map((pl, i) => i === idx ? { ...pl, coinsCost: parseInt(e.target.value) || 0 } : pl))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration (days)</Label>
                    <Input
                      type="number"
                      value={plan.durationDays}
                      onChange={(e) => setPlans(p => p.map((pl, i) => i === idx ? { ...pl, durationDays: parseInt(e.target.value) || 0 } : pl))}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={plan.description}
                  onChange={(e) => setPlans(p => p.map((pl, i) => i === idx ? { ...pl, description: e.target.value } : pl))}
                  className="min-h-[50px]"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updatePlan(plan)} className="gap-1">
                  <Save className="h-3 w-3" /> Save
                </Button>
                <Button size="sm" variant="destructive" onClick={() => plan.id && deletePlan(plan.id)} className="gap-1">
                  <X className="h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
