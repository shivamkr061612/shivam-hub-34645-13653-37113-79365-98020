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
import { Upload, Link, Crown, Sparkles, Loader2, Plus, X, Image } from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';

interface Version {
  name: string;
  size: string;
  link: string;
}

export function AdminUpload() {
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [section, setSection] = useState('mods');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [versions, setVersions] = useState<Version[]>([{ name: '', size: '', link: '' }]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '',
    size: '',
    isPremium: false,
    appName: '',
    publisher: '',
    category: '',
    requirements: '',
    platform: 'Android',
    modFeatures: '',
    rating: '',
    votes: ''
  });

  const generateDescription = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setGeneratingDescription(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Generate a description for: ${formData.title}` }],
          type: 'description'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate description');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let description = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) description += content;
          } catch { /* ignore */ }
        }
      }

      if (description) {
        setFormData(prev => ({ ...prev, description: description.trim() }));
        toast.success('Description generated!');
      } else {
        throw new Error('No description generated');
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const url = await uploadToImgBB(file);
      setThumbnailUrl(url);
      toast.success('Thumbnail uploaded!');
    } catch (error) {
      console.error('ImgBB error:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadToImgBB(file);
      setItemImageUrl(url);
      toast.success('Item image uploaded!');
    } catch (error) {
      console.error('ImgBB error:', error);
      toast.error('Failed to upload item image');
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

  const addVersion = () => {
    setVersions(prev => [...prev, { name: '', size: '', link: '' }]);
  };

  const removeVersion = (index: number) => {
    if (versions.length > 1) {
      setVersions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateVersion = (index: number, field: keyof Version, value: string) => {
    setVersions(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let downloadUrl = '';
      let thumbUrl = thumbnailUrl;

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
      }

      // Filter out empty versions
      const validVersions = versions.filter(v => v.name.trim() && v.link.trim());
      
      // If no valid versions but we have a download URL, create a default version
      const finalVersions = validVersions.length > 0 ? validVersions : 
        downloadUrl ? [{ name: `${formData.title} ${formData.version || 'v1.0'}`, size: formData.size || 'Unknown', link: downloadUrl }] : [];

      const docData: Record<string, any> = {
        title: formData.title,
        downloadUrl: downloadUrl || (finalVersions.length > 0 ? finalVersions[0].link : ''),
        thumbnail: thumbUrl,
        itemImage: itemImageUrl || thumbUrl,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        description: formData.description,
        version: formData.version,
        size: formData.size,
        isPremium: formData.isPremium,
        appName: formData.appName || formData.title.split(' ')[0],
        publisher: formData.publisher || formData.title.split(' ')[0],
        category: formData.category || 'App',
        requirements: formData.requirements || 'Android 5.0+',
        platform: formData.platform || 'Android',
        modFeatures: formData.modFeatures,
        rating: formData.rating ? parseFloat(formData.rating) : 4.9,
        votes: formData.votes ? parseInt(formData.votes) : Math.floor(Math.random() * 50000) + 10000,
        screenshots: screenshots,
        versions: finalVersions
      };

      if (driveLink) {
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
      setItemImageUrl('');
      setDriveLink('');
      setScreenshots([]);
      setVersions([{ name: '', size: '', link: '' }]);
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

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>Thumbnail (Card Image)</Label>
            <div className="flex items-center gap-4">
              {thumbnailUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingThumbnail}
                />
                {uploadingThumbnail && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
              </div>
            </div>
          </div>

          {/* Separate Item Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Item Image (Separate from Thumbnail)
            </Label>
            <div className="flex items-center gap-4">
              {itemImageUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={itemImageUrl} alt="Item" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleItemImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
                <p className="text-xs text-muted-foreground mt-1">Upload a separate image for the item details page</p>
              </div>
            </div>
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
          </div>

          {/* Versions Section */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Download Versions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVersion} className="gap-1">
                <Plus className="h-4 w-4" /> Add Version
              </Button>
            </div>
            {versions.map((version, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-background">
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs">Version Name</Label>
                  <Input
                    placeholder="e.g., v8.16.1 MOD APK"
                    value={version.name}
                    onChange={(e) => updateVersion(index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Size</Label>
                  <Input
                    placeholder="75 MB"
                    value={version.size}
                    onChange={(e) => updateVersion(index, 'size', e.target.value)}
                  />
                </div>
                <div className="col-span-5 space-y-1">
                  <Label className="text-xs">Download Link</Label>
                  <Input
                    placeholder="https://..."
                    value={version.link}
                    onChange={(e) => updateVersion(index, 'link', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVersion(index)}
                    disabled={versions.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Add multiple versions with different download links</p>
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

          <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'url')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">
                <Link className="h-4 w-4 mr-2" />
                URL
              </TabsTrigger>
              <TabsTrigger value="file">
                <Upload className="h-4 w-4 mr-2" />
                File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileUrl">Download URL</Label>
                <Input
                  id="fileUrl"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driveLink">Google Drive Link (Optional)</Label>
                <Input
                  id="driveLink"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
