import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const RequestMod = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    modName: '',
    description: '',
    gameTitle: '',
    additionalInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to request a mod');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'mod_requests'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      toast.success('Mod request submitted successfully!');
      setFormData({ modName: '', description: '', gameTitle: '', additionalInfo: '' });
    } catch (error) {
      toast.error('Failed to submit request');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Request a Mod</CardTitle>
            <CardDescription>
              Can't find the mod you're looking for? Request it here!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modName">Mod Name *</Label>
                <Input
                  id="modName"
                  value={formData.modName}
                  onChange={(e) => setFormData({ ...formData, modName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameTitle">Game Title *</Label>
                <Input
                  id="gameTitle"
                  value={formData.gameTitle}
                  onChange={(e) => setFormData({ ...formData, gameTitle: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestMod;
