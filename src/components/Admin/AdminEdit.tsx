import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Pencil, Trash2, Link, Upload } from 'lucide-react';
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

interface ContentItem {
  id: string;
  title: string;
  description: string;
  version?: string;
  size?: string;
  downloadUrl: string;
  thumbnail?: string;
  downloadCount?: number;
}

export function AdminEdit() {
  const [section, setSection] = useState('mods');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ContentItem | null>(null);
  const [editMethod, setEditMethod] = useState<'url' | 'keep'>('keep');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '',
    size: '',
    downloadUrl: '',
    thumbnail: ''
  });

  useEffect(() => {
    loadItems();
  }, [section]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, section));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[];
      setItems(data);
    } catch (error) {
      toast.error('Failed to load items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      version: item.version || '',
      size: item.size || '',
      downloadUrl: item.downloadUrl,
      thumbnail: item.thumbnail || ''
    });
    setEditMethod('keep');
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    
    setLoading(true);
    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        version: formData.version,
        size: formData.size,
      };

      if (editMethod === 'url') {
        updateData.downloadUrl = formData.downloadUrl;
        updateData.thumbnail = formData.thumbnail;
        updateData.updatedAt = new Date().toISOString();
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
      console.error(error);
    } finally {
      setLoading(false);
    }
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
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                    {item.downloadCount !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Downloads: {item.downloadCount}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteItem(item)}
                    >
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update the item details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-version">Version</Label>
                <Input
                  id="edit-version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-size">Size</Label>
                <Input
                  id="edit-size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g., 150 MB"
                />
              </div>
            </div>

            <Tabs value={editMethod} onValueChange={(v) => setEditMethod(v as 'url' | 'keep')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="keep">
                  <Upload className="h-4 w-4 mr-2" />
                  Keep Current Files
                </TabsTrigger>
                <TabsTrigger value="url">
                  <Link className="h-4 w-4 mr-2" />
                  Update URLs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="keep" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Current files will remain unchanged
                </p>
              </TabsContent>

              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-thumbnail">Thumbnail Image URL</Label>
                  <Input
                    id="edit-thumbnail"
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-downloadUrl">Download File URL *</Label>
                  <Input
                    id="edit-downloadUrl"
                    type="url"
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                    placeholder="https://example.com/file.zip"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Update Item'}
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
