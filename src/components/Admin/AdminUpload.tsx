import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { toast } from 'sonner';
import { Upload, Link, Crown, Sparkles, Loader2, Plus, X } from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import { supabase } from '@/integrations/supabase/client';

// Sections that use simplified form (name, image, link, drive link only)
const SIMPLIFIED_SECTIONS = ['assets', 'bundles', 'courses'];

export function AdminUpload() {
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [section, setSection] = useState('mods');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '',
    size: '',
    isPremium: false,
    // New fields for ItemDetails
    appName: '',
    publisher: '',
    category: '',
    requirements: '',
    platform: 'Android',
    modFeatures: '',
    rating: '',
    votes: ''
  });

  const isSimplified = SIMPLIFIED_SECTIONS.includes(section);

  const generateDescription = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setGeneratingDescription(true);
    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: `Generate a description for: ${formData.title}` }],
          type: 'description'
        }
      });

      if (response.error) throw response.error;

      const text = await new Response(response.data).text();
      const lines = text.split('\n');
      let description = '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) description += content;
          } catch (e) {}
        }
      }

      if (description) {
        setFormData(prev => ({ ...prev, description: description.trim() }));
        toast.success('Description generated!');
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadToImgBB(file);
      setThumbnailUrl(url);
      toast.success('Image uploaded to ImgBB!');
    } catch (error) {
      console.error('ImgBB error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
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
    } catch (error) {
      console.error('ImgBB error:', error);
      toast.error('Failed to upload screenshot');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let downloadUrl = '';
      let thumbUrl = '';

      if (uploadMethod === 'file') {
        if (file) {
          const fileRef = ref(storage, `${section}/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          downloadUrl = await getDownloadURL(fileRef);
        }

        if (thumbnail) {
          thumbUrl = await uploadToImgBB(thumbnail);
        }
      } else {
        downloadUrl = fileUrl;
        thumbUrl = thumbnailUrl;
      }

      const docData: Record<string, any> = {
        title: formData.title,
        downloadUrl,
        thumbnail: thumbUrl,
        downloadCount: 0,
        createdAt: new Date().toISOString()
      };

      if (!isSimplified) {
        docData.description = formData.description;
        docData.version = formData.version;
        docData.size = formData.size;
        docData.isPremium = formData.isPremium;
        // New fields
        docData.appName = formData.appName || formData.title.split(' ')[0];
        docData.publisher = formData.publisher || formData.title.split(' ')[0];
        docData.category = formData.category || 'App';
        docData.requirements = formData.requirements || 'Android 5.0+';
        docData.platform = formData.platform || 'Android';
        docData.modFeatures = formData.modFeatures;
        docData.rating = formData.rating ? parseFloat(formData.rating) : 4.9;
        docData.votes = formData.votes ? parseInt(formData.votes) : Math.floor(Math.random() * 50000) + 10000;
        docData.screenshots = screenshots;
      }

      if (isSimplified && driveLink) {
        docData.driveLink = driveLink;
      }

      await addDoc(collection(db, section), docData);

      toast.success('Item uploaded successfully!');
      setFormData({ 
        title: '', description: '', version: '', size: '', isPremium: false,
        appName: '', publisher: '', category: '', requirements: '', platform: 'Android',
        modFeatures: '', rating: '', votes: ''
      });
      setFile(null);
      setThumbnail(null);
      setFileUrl('');
      setThumbnailUrl('');
      setDriveLink('');
      setScreenshots([]);
    } catch (error) {
      toast.error('Upload failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Content</CardTitle>
        <CardDescription>Add new items to Mods, Games, Assets, Bundles, Movies, or Courses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label>Section</Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mods">Mods</SelectItem>
                <SelectItem value="games">Games</SelectItem>
                <SelectItem value="assets">Assets</SelectItem>
                <SelectItem value="bundles">Bundles</SelectItem>
                <SelectItem value="movies">Movies</SelectItem>
                <SelectItem value="courses">Courses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Name *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {!isSimplified && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDescription}
                    disabled={generatingDescription || !formData.title.trim()}
                    className="gap-2"
                  >
                    {generatingDescription ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., 1.0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., 150 MB"
                  />
                </div>
              </div>

              {/* New fields for ItemDetails */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name</Label>
                  <Input
                    id="appName"
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                    placeholder="App display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Publisher name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Games">Games</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Communication">Communication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Android">Android</SelectItem>
                      <SelectItem value="iOS">iOS</SelectItem>
                      <SelectItem value="Windows">Windows</SelectItem>
                      <SelectItem value="Mac">Mac</SelectItem>
                      <SelectItem value="Cross-platform">Cross-platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Input
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="e.g., Android 5.0+"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="4.9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="votes">Votes</Label>
                    <Input
                      id="votes"
                      type="number"
                      value={formData.votes}
                      onChange={(e) => setFormData({ ...formData, votes: e.target.value })}
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modFeatures">MOD Features (separate with |)</Label>
                <Textarea
                  id="modFeatures"
                  value={formData.modFeatures}
                  onChange={(e) => setFormData({ ...formData, modFeatures: e.target.value })}
                  placeholder="VIP Unlocked|Ads Removed|Premium Features|No Login Required"
                  className="min-h-[80px]"
                />
              </div>

              {/* Screenshots */}
              <div className="space-y-2">
                <Label>Screenshots</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {screenshots.map((url, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 h-5 w-5 rounded-full"
                        onClick={() => removeScreenshot(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    disabled={uploadingScreenshot}
                    className="flex-1"
                  />
                  {uploadingScreenshot && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <p className="text-xs text-muted-foreground">Upload screenshots that will be shown in a carousel</p>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <Checkbox
                  id="isPremium"
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked as boolean })}
                />
                <Label htmlFor="isPremium" className="flex items-center gap-2 cursor-pointer">
                  <Crown className="h-4 w-4 text-primary" />
                  <span>Mark as Premium (King Badge Required)</span>
                </Label>
              </div>
            </>
          )}

          <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'url')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">
                <Link className="h-4 w-4 mr-2" />
                Use URL
              </TabsTrigger>
              <TabsTrigger value="file">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="thumbnailUrl">Image URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-auto text-xs"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
                <Input
                  id="thumbnailUrl"
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg or upload above"
                />
                {thumbnailUrl && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl">Download Link *</Label>
                <Input
                  id="fileUrl"
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/file.zip"
                  required
                />
              </div>

              {isSimplified && (
                <div className="space-y-2">
                  <Label htmlFor="driveLink">Drive Link (Optional)</Label>
                  <Input
                    id="driveLink"
                    type="url"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Image (uploads to ImgBB)</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              {isSimplified && (
                <div className="space-y-2">
                  <Label htmlFor="driveLinkFile">Drive Link (Optional)</Label>
                  <Input
                    id="driveLinkFile"
                    type="url"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Button type="submit" disabled={loading} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
