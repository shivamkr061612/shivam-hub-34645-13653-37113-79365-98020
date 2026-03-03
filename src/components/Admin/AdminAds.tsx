import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Code } from 'lucide-react';

const defaultPositions = [
  { key: 'global', label: 'Global Ad (shows everywhere if no specific ad)', desc: 'Fallback for all positions' },
  { key: 'home_after_banner', label: 'Home - After Banner', desc: 'Shows after the promotional banner on homepage' },
  { key: 'home_middle', label: 'Home - Middle', desc: 'Shows in the middle of homepage' },
  { key: 'home_bottom', label: 'Home - Bottom', desc: 'Shows at the bottom of homepage' },
  { key: 'mods_top', label: 'Mods - Top', desc: 'Top of Mods page' },
  { key: 'mods_bottom', label: 'Mods - Bottom', desc: 'Bottom of Mods page' },
  { key: 'games_top', label: 'Games - Top', desc: 'Top of Games page' },
  { key: 'games_bottom', label: 'Games - Bottom', desc: 'Bottom of Games page' },
  { key: 'courses_top', label: 'Courses - Top', desc: 'Top of Courses page' },
  { key: 'assets_top', label: 'Assets - Top', desc: 'Top of Assets page' },
  { key: 'bundles_top', label: 'Bundles - Top', desc: 'Top of Bundles page' },
  { key: 'download_page', label: 'Download Page', desc: 'Shows on the download page' },
  { key: 'item_details', label: 'Item Details Page', desc: 'Shows on item detail page' },
];

export function AdminAds() {
  const [ads, setAds] = useState<Record<string, string>>({});
  const [customPositions, setCustomPositions] = useState<{ key: string; label: string }[]>([]);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'ads'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAds(data as Record<string, string>);
        // Extract custom positions
        const knownKeys = defaultPositions.map(p => p.key);
        const custom = Object.keys(data)
          .filter(k => !knownKeys.includes(k) && k !== '_customPositions')
          .map(k => ({ key: k, label: k }));
        setCustomPositions(custom);
      }
    } catch (error) {
      console.error('Failed to load ads', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'ads'), ads, { merge: true });
      toast.success('Ad settings saved!');
    } catch (error) {
      toast.error('Failed to save ads');
    } finally {
      setLoading(false);
    }
  };

  const addCustomPosition = () => {
    if (newKey && !ads[newKey]) {
      setCustomPositions([...customPositions, { key: newKey, label: newKey }]);
      setAds({ ...ads, [newKey]: '' });
      setNewKey('');
    }
  };

  const removePosition = (key: string) => {
    const newAds = { ...ads };
    delete newAds[key];
    setAds(newAds);
    setCustomPositions(customPositions.filter(p => p.key !== key));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          Ad Management
        </CardTitle>
        <CardDescription>Paste your ad scripts (Google AdSense, etc.) for each position. Supports HTML/JS.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default positions */}
        {defaultPositions.map((pos) => (
          <div key={pos.key} className="space-y-2 p-4 bg-muted/30 rounded-xl border">
            <Label className="font-semibold text-sm">{pos.label}</Label>
            <p className="text-xs text-muted-foreground">{pos.desc}</p>
            <Textarea
              value={ads[pos.key] || ''}
              onChange={(e) => setAds({ ...ads, [pos.key]: e.target.value })}
              placeholder={`<script>...</script> or HTML ad code`}
              rows={3}
              className="font-mono text-xs"
            />
          </div>
        ))}

        {/* Custom positions */}
        {customPositions.map((pos) => (
          <div key={pos.key} className="space-y-2 p-4 bg-muted/30 rounded-xl border">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">{pos.label} (Custom)</Label>
              <Button variant="ghost" size="sm" onClick={() => removePosition(pos.key)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Textarea
              value={ads[pos.key] || ''}
              onChange={(e) => setAds({ ...ads, [pos.key]: e.target.value })}
              placeholder="Ad script code"
              rows={3}
              className="font-mono text-xs"
            />
          </div>
        ))}

        {/* Add custom position */}
        <div className="flex gap-2 p-4 border border-dashed rounded-xl">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Custom position name (e.g. sidebar_right)"
            className="flex-1"
          />
          <Button variant="outline" onClick={addCustomPosition}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save All Ad Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}