import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Upload, Loader2, Sparkles, X, Coins } from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import { PageTransition } from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';

export default function UserUpload() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [section, setSection] = useState('courses');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    publisher: '',
    info: '',
    link: '',
    rating: '',
    votes: '',
  });

  const getInfoLabel = () => {
    if (section === 'courses') return 'Course Info';
    if (section === 'bundles') return 'Reel Bundle Info';
    if (section === 'assets') return 'Asset Info';
    return 'Info';
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const url = await uploadToImgBB(file);
      setThumbnailUrl(url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingScreenshot(true);
    try {
      const url = await uploadToImgBB(file);
      setScreenshots(prev => [...prev, url]);
      toast.success('Screenshot uploaded!');
    } catch {
      toast.error('Failed to upload screenshot');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'user_uploads'), {
        title: formData.title,
        description: formData.description,
        publisher: formData.publisher || user.displayName || 'Unknown',
        info: formData.info,
        link: formData.link,
        thumbnail: thumbnailUrl,
        screenshots,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        votes: formData.votes ? parseInt(formData.votes) : 0,
        section,
        status: 'pending', // pending, approved, rejected
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'User',
        createdAt: new Date().toISOString(),
      });

      toast.success('Upload submitted for review! You will earn coins once approved.');
      setFormData({ title: '', description: '', publisher: '', info: '', link: '', rating: '', votes: '' });
      setThumbnailUrl('');
      setScreenshots([]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">Upload Content</h1>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Coins className="h-5 w-5 text-primary" />
              <p className="text-sm text-foreground">
                Earn coins for every approved upload! Use coins to promote your channel in our slider banner.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submit for Review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={section} onValueChange={setSection}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="courses">Courses</SelectItem>
                        <SelectItem value="bundles">Reel Bundles</SelectItem>
                        <SelectItem value="assets">Assets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label>Publisher</Label>
                    <Input value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} placeholder={user?.displayName || 'Your name'} />
                  </div>

                  <div className="space-y-2">
                    <Label>{getInfoLabel()}</Label>
                    <Textarea value={formData.info} onChange={(e) => setFormData({ ...formData, info: e.target.value })} placeholder={`Enter ${getInfoLabel().toLowerCase()} details...`} className="min-h-[60px]" />
                  </div>

                  <div className="space-y-2">
                    <Label>Download Link *</Label>
                    <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} placeholder="4.5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Votes</Label>
                      <Input type="number" value={formData.votes} onChange={(e) => setFormData({ ...formData, votes: e.target.value })} placeholder="1000" />
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="space-y-2">
                    <Label>Thumbnail Image</Label>
                    <div className="flex items-center gap-4">
                      {thumbnailUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border">
                          <img src={thumbnailUrl} alt="Thumb" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <Input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={uploadingThumbnail} />
                      {uploadingThumbnail && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </div>

                  {/* Screenshots */}
                  <div className="space-y-2">
                    <Label>Screenshots</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {screenshots.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setScreenshots(p => p.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleScreenshotUpload} disabled={uploadingScreenshot} />
                    {uploadingScreenshot && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Upload className="h-4 w-4 mr-2" />Submit for Review</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    </PageTransition>
  );
}
