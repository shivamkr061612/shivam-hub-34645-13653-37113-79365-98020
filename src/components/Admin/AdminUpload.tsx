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
import { Upload, Link, Crown } from 'lucide-react';

// Sections that use simplified form (name, image, link, drive link only)
const SIMPLIFIED_SECTIONS = ['assets', 'bundles', 'courses'];

export function AdminUpload() {
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState('mods');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '',
    size: '',
    isPremium: false
  });

  const isSimplified = SIMPLIFIED_SECTIONS.includes(section);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let downloadUrl = '';
      let thumbUrl = '';

      if (uploadMethod === 'file') {
        // Upload main file
        if (file) {
          const fileRef = ref(storage, `${section}/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          downloadUrl = await getDownloadURL(fileRef);
        }

        // Upload thumbnail
        if (thumbnail) {
          const thumbRef = ref(storage, `thumbnails/${Date.now()}_${thumbnail.name}`);
          await uploadBytes(thumbRef, thumbnail);
          thumbUrl = await getDownloadURL(thumbRef);
        }
      } else {
        // Use URLs directly
        downloadUrl = fileUrl;
        thumbUrl = thumbnailUrl;
      }

      // Prepare document data
      const docData: Record<string, any> = {
        title: formData.title,
        downloadUrl,
        thumbnail: thumbUrl,
        downloadCount: 0,
        createdAt: new Date().toISOString()
      };

      // Add extra fields for non-simplified sections
      if (!isSimplified) {
        docData.description = formData.description;
        docData.version = formData.version;
        docData.size = formData.size;
        docData.isPremium = formData.isPremium;
      }

      // Add drive link for simplified sections
      if (isSimplified && driveLink) {
        docData.driveLink = driveLink;
      }

      // Add to Firestore
      await addDoc(collection(db, section), docData);

      toast.success('Item uploaded successfully!');
      setFormData({ title: '', description: '', version: '', size: '', isPremium: false });
      setFile(null);
      setThumbnail(null);
      setFileUrl('');
      setThumbnailUrl('');
      setDriveLink('');
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

          {/* Show description, version, size only for non-simplified sections */}
          {!isSimplified && (
            <>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
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

              <div className="flex items-center space-x-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Checkbox
                  id="isPremium"
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked as boolean })}
                />
                <Label htmlFor="isPremium" className="flex items-center gap-2 cursor-pointer">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span>Mark as Premium (Blue Tick Required)</span>
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
                <Label htmlFor="thumbnailUrl">Image URL</Label>
                <Input
                  id="thumbnailUrl"
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                />
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

              {/* Drive link for simplified sections */}
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
                <Label htmlFor="thumbnail">Image</Label>
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

              {/* Drive link for simplified sections */}
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
