import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, CreditCard, Clock } from 'lucide-react';
import blueTick from '@/assets/blue-tick.png';

const BlueTickPurchase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [plan, setPlan] = useState('monthly');
  const [transactionId, setTransactionId] = useState('');
  const [step, setStep] = useState<'plan' | 'payment' | 'confirm'>('plan');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchSettings();
    checkPendingRequest();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'bluetick');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        toast.error('Blue tick purchase is not available');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setFetching(false);
    }
  };

  const checkPendingRequest = async () => {
    if (!user?.email) return;
    
    try {
      const q = query(
        collection(db, 'bluetick_requests'),
        where('userEmail', '==', user.email),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      setHasPendingRequest(!snapshot.empty);
    } catch (error) {
      console.error('Error checking pending request:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'bluetick_requests'), {
        userEmail: user?.email,
        userId: user?.uid,
        plan,
        transactionId,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      toast.success('Request submitted! Wait for admin approval.');
      navigate('/');
    } catch (error) {
      toast.error('Failed to submit request');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-12">
          <Card className="max-w-md mx-auto border-2 border-yellow-500">
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <CardTitle>Request Pending</CardTitle>
              <CardDescription>
                Your blue tick purchase request is awaiting admin approval. You'll be notified once it's processed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <img src={blueTick} alt="Blue Tick" className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Get Verified</h1>
            <p className="text-muted-foreground">
              Join our verified members and enjoy premium benefits
            </p>
          </div>

          {step === 'plan' && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>Select a verification plan that suits you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={plan} onValueChange={setPlan}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Monthly Plan</div>
                      <div className="text-2xl font-bold text-primary">₹{settings?.monthlyPrice || '99'}</div>
                      <div className="text-sm text-muted-foreground">Billed monthly</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Yearly Plan</div>
                      <div className="text-2xl font-bold text-primary">₹{settings?.yearlyPrice || '999'}</div>
                      <div className="text-sm text-muted-foreground">Billed annually • Save more!</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Benefits of Verification
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Blue tick badge on your profile</li>
                    <li>✓ No key generation required for downloads</li>
                    <li>✓ Access to premium content</li>
                    <li>✓ Priority support</li>
                  </ul>
                </div>

                <Button onClick={() => setStep('payment')} className="w-full">
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete the payment using UPI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-card/50 border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Scan QR Code to Pay</p>
                  <img 
                    src={settings?.qrCodeUrl} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto mb-4 border rounded-lg"
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-muted-foreground">Or pay to UPI ID:</p>
                    <p className="text-lg font-bold text-primary">{settings?.upiId}</p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    <strong>Amount to Pay:</strong> ₹{plan === 'monthly' ? settings?.monthlyPrice : settings?.yearlyPrice}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('plan')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep('confirm')} className="flex-1">
                    I've Completed Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'confirm' && (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Payment</CardTitle>
                <CardDescription>Enter your transaction ID to complete</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="transactionId">Transaction ID / UPI Reference ID *</Label>
                    <Input
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter your transaction ID"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      You can find this in your UPI app's transaction history
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      ℹ️ Your request will be reviewed by admin. You'll receive verification once approved.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep('payment')} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlueTickPurchase;
