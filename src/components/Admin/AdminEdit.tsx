import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X, Crown, Loader2, Image } from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Version {
  name: string;
  size: string;
  link: string;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  version?: string;
  size?: string;
  downloadUrl: string;
  thumbnail?: string;
  itemImage?: string;
  downloadCount?: number;
  isPremium?: boolean;
  publisher?: string;
  appName?: string;
  category?: string;
  requirements?: string;
  platform?: string;
  modFeatures?: string;
  rating?: number;
  votes?: number;
  screenshots?: string[];
  versions?: Version[];
  infoLabel?: string;
  infoText?: string;
}

const SIMPLIFIED_SECTIONS = ['courses', 'bundles', 'assets'];

export function AdminEdit() {
  const [section, setSection] = useState('mods');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ContentItem | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '',
    size: '',
    downloadUrl: '',
    thumbnail: '',
    itemImage: '',
    isPremium: false,
    publisher: '',
    appName: '',
    category: '',
    requirements: '',
    platform: 'Android',
    modFeatures: '',
    rating: '',
    votes: '',
    infoText: '',
  });

  const isSimplified = SIMPLIFIED_SECTIONS.includes(section);

  useEffect(() => {
    loadItems();
  }, [section]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, section));
      const data = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ContentItem[];
      setItems(data);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      version: item.version || '',
      size: item.size || '',
      downloadUrl: item.downloadUrl || '',
      thumbnail: item.thumbnail || '',
      itemImage: item.itemImage || '',
      isPremium: item.isPremium || false,
      publisher: item.publisher || '',
      appName: item.appName || '',
      category: item.category || '',
      requirements: item.requirements || '',
      platform: item.platform || 'Android',
      modFeatures: item.modFeatures || '',
      rating: item.rating?.toString() || '',
      votes: item.votes?.toString() || '',
      infoText: item.infoText || '',
    });
    setScreenshots(item.screenshots || []);
    setVersions(item.versions && item.versions.length > 0 ? item.versions : [{ name: '', size: '', link: '' }]);
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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const url = await uploadToImgBB(file);
      setFormData(prev => ({ ...prev, thumbnail: url }));
      toast.success('Thumbnail uploaded!');
    } catch {
      toast.error('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingItemImage(true);
    try {
      const url = await uploadToImgBB(file);
      setFormData(prev => ({ ...prev, itemImage: url }));
      toast.success('Item image uploaded!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingItemImage(false);
    }
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

  const handleUpdate = async () => {
    if (!editingItem) return;
    setLoading(true);
    try {
      const validVersions = versions.filter(v => v.name.trim() && v.link.trim());
      
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        downloadUrl: formData.downloadUrl,
        thumbnail: formData.thumbnail,
        itemImage: formData.itemImage || formData.thumbnail,
        isPremium: formData.isPremium,
        publisher: formData.publisher,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        votes: formData.votes ? parseInt(formData.votes) : undefined,
        screenshots: screenshots,
        versions: validVersions.length > 0 ? validVersions : editingItem.versions || [],
        updatedAt: new Date().toISOString(),
      };

      if (isSimplified) {
        updateData.infoText = formData.infoText;
      } else {
        updateData.version = formData.version;
        updateData.size = formData.size;
        updateData.appName = formData.appName;
        updateData.category = formData.category;
        updateData.requirements = formData.requirements;
        updateData.platform = formData.platform;
        updateData.modFeatures = formData.modFeatures;
      }

      await updateDoc(doc(db, section, editingItem.id), updateData);
      toast.success('Item updated successfully!');
      setEditingItem(null);
      loadItems();
    } catch (error) {
      toast.error('Failed to update item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, section, deleteItem.id));
      toast.success('Item deleted successfully!');
      setDeleteItem(null);
      loadItems();
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const getInfoLabel = () => {
    if (section === 'courses') return 'Course Info';
    if (section === 'bundles') return 'Reel Bundle Info';
    if (section === 'assets') return 'Asset Info';
    return 'Info';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Content</CardTitle>
          <CardDescription>Edit or delete uploaded items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {loading && items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No items found</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold flex items-center gap-2">
                        {item.title}
                        {item.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                      {item.versions && item.versions.length > 0 && (
                        <p className="text-xs text-muted-foreground">{item.versions.length} version(s)</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteItem(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update all item details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
            </div>

            {/* Publisher */}
            <div className="space-y-2">
              <Label>Publisher</Label>
              <Input value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} />
            </div>

            {/* Simplified section info */}
            {isSimplified && (
              <div className="space-y-2">
                <Label>{getInfoLabel()}</Label>
                <Textarea value={formData.infoText} onChange={(e) => setFormData({ ...formData, infoText: e.target.value })} rows={3} />
              </div>
            )}

            {/* Full fields for mods/games */}
            {!isSimplified && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Input value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="e.g., 150 MB" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>App Name</Label>
                    <Input value={formData.appName} onChange={(e) => setFormData({ ...formData, appName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['Entertainment','Music','Video','Social','Tools','Games','Education','Productivity','Photography','Communication'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Requirements</Label>
                    <Input value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} placeholder="Android 5.0+" />
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Android','iOS','Windows','Mac','Cross-platform'].map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>MOD Features (separate with |)</Label>
                  <Textarea value={formData.modFeatures} onChange={(e) => setFormData({ ...formData, modFeatures: e.target.value })} placeholder="VIP Unlocked|Ads Removed" rows={2} />
                </div>
              </>
            )}

            {/* Rating & Votes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Votes</Label>
                <Input type="number" value={formData.votes} onChange={(e) => setFormData({ ...formData, votes: e.target.value })} />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-4">
                {formData.thumbnail && (
                  <img src={formData.thumbnail} alt="Thumb" className="w-16 h-16 rounded-lg object-cover border" />
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={uploadingThumbnail} />
                  {uploadingThumbnail && <Loader2 className="h-4 w-4 animate-spin mt-1" />}
                </div>
              </div>
              <Input placeholder="Or paste URL" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} />
            </div>

            {/* Item Image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Image className="h-4 w-4" />Item Image</Label>
              <div className="flex items-center gap-4">
                {formData.itemImage && (
                  <img src={formData.itemImage} alt="Item" className="w-16 h-16 rounded-lg object-cover border" />
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleItemImageUpload} disabled={uploadingItemImage} />
                  {uploadingItemImage && <Loader2 className="h-4 w-4 animate-spin mt-1" />}
                </div>
              </div>
              <Input placeholder="Or paste URL" value={formData.itemImage} onChange={(e) => setFormData({ ...formData, itemImage: e.target.value })} />
            </div>

            {/* Screenshots */}
            <div className="space-y-2">
              <Label>Screenshots</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {screenshots.map((url, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={url} alt={`SS ${index + 1}`} className="w-full h-full object-cover" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-0 right-0 h-5 w-5 rounded-full" onClick={() => setScreenshots(prev => prev.filter((_, i) => i !== index))}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={handleScreenshotUpload} disabled={uploadingScreenshot} className="flex-1" />
                {uploadingScreenshot && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>

            {/* Versions */}
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
                    <Input placeholder="e.g., v8.16.1" value={version.name} onChange={(e) => updateVersion(index, 'name', e.target.value)} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Size</Label>
                    <Input placeholder="75 MB" value={version.size} onChange={(e) => updateVersion(index, 'size', e.target.value)} />
                  </div>
                  <div className="col-span-5 space-y-1">
                    <Label className="text-xs">Download Link</Label>
                    <Input placeholder="https://..." value={version.link} onChange={(e) => updateVersion(index, 'link', e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVersion(index)} disabled={versions.length === 1} className="text-destructive hover:text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Download URL */}
            <div className="space-y-2">
              <Label>Main Download URL</Label>
              <Input value={formData.downloadUrl} onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })} placeholder="https://..." />
            </div>

            {/* Premium */}
            <div className="flex items-center space-x-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <Checkbox
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked as boolean })}
              />
              <Label className="flex items-center gap-2 cursor-pointer">
                <Crown className="h-4 w-4 text-primary" />
                Mark as Premium
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : 'Update Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteItem?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
