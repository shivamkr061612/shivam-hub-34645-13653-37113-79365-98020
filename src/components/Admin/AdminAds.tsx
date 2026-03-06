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
  { key: 'global', label: 'Global Ad (fallback)', desc: 'Shows everywhere if no specific ad set' },
  { key: 'home_after_banner', label: 'Home - After Banner', desc: 'After promo banner on homepage' },
  { key: 'home_middle', label: 'Home - Middle', desc: 'Between trending and categories' },
  { key: 'home_after_categories', label: 'Home - After Categories', desc: 'After category cards' },
  { key: 'home_bottom', label: 'Home - Bottom', desc: 'Bottom of homepage' },
  { key: 'mods_top', label: 'Mods - Top', desc: 'Top of Mods page' },
  { key: 'mods_bottom', label: 'Mods - Bottom', desc: 'Bottom of Mods page' },
  { key: 'games_top', label: 'Games - Top', desc: 'Top of Games page' },
  { key: 'games_bottom', label: 'Games - Bottom', desc: 'Bottom of Games page' },
  { key: 'courses_top', label: 'Courses - Top', desc: 'Top of Courses page' },
  { key: 'courses_bottom', label: 'Courses - Bottom', desc: 'Bottom of Courses page' },
  { key: 'assets_top', label: 'Assets - Top', desc: 'Top of Assets page' },
  { key: 'assets_bottom', label: 'Assets - Bottom', desc: 'Bottom of Assets page' },
  { key: 'bundles_top', label: 'Bundles - Top', desc: 'Top of Bundles page' },
  { key: 'bundles_bottom', label: 'Bundles - Bottom', desc: 'Bottom of Bundles page' },
  { key: 'download_page', label: 'Download Page', desc: 'On the download page' },
  { key: 'download_page_bottom', label: 'Download Page - Bottom', desc: 'Bottom of download page' },
  { key: 'download_loading', label: 'Download Loading Page', desc: 'On download loading screen' },
  { key: 'download_link_top', label: 'Download Link - Top', desc: 'Top of final download link page' },
  { key: 'download_link_middle', label: 'Download Link - Middle', desc: 'Middle of download link page' },
  { key: 'download_link_bottom', label: 'Download Link - Bottom', desc: 'Bottom of download link page' },
  { key: 'privacy_policy', label: 'Privacy Policy Page', desc: 'On privacy policy page' },
  { key: 'about_us', label: 'About Us Page', desc: 'On about us page' },
  { key: 'contact_us', label: 'Contact Us Page', desc: 'On contact page' },
  { key: 'terms_page', label: 'Terms & Conditions Page', desc: 'On terms page' },
  { key: 'promotions_page', label: 'Promotions Page', desc: 'On promotions page' },
  { key: 'user_upload_page', label: 'User Upload Page', desc: 'On user upload page' },
  { key: 'request_mod_page', label: 'Request Mod Page', desc: 'On request mod page' },
  { key: 'king_badge_page', label: 'King Badge Page', desc: 'On king badge purchase page' },
  { key: 'item_details', label: 'Item Details Page', desc: 'On item detail page' },
  { key: 'item_details_bottom', label: 'Item Details - Bottom', desc: 'Bottom of item details' },
  { key: 'leaderboard_top', label: 'Leaderboard - Top', desc: 'Top of leaderboard page' },
  { key: 'leaderboard_bottom', label: 'Leaderboard - Bottom', desc: 'Bottom of leaderboard' },
  { key: 'live_chat_top', label: 'Live Chat - Top', desc: 'Top of live chat page' },
  { key: 'social_top', label: 'Social - Top', desc: 'Top of social page' },
  { key: 'social_bottom', label: 'Social - Bottom', desc: 'Bottom of social page' },
  { key: 'tech_ai_top', label: 'Tech AI - Top', desc: 'Top of AI page' },
  { key: 'sidebar_left', label: 'Sidebar - Left', desc: 'Left sidebar (desktop)' },
  { key: 'sidebar_right', label: 'Sidebar - Right', desc: 'Right sidebar (desktop)' },
  { key: 'footer_above', label: 'Footer - Above', desc: 'Above the footer' },
  { key: 'popup_ad', label: 'Popup Ad', desc: 'Popup overlay ad' },
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
        <CardDescription>Paste ad scripts for each position. King Badge users won't see ads. Supports HTML/JS.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {defaultPositions.map((pos) => (
          <div key={pos.key} className="space-y-1.5 p-3 bg-muted/30 rounded-xl border">
            <Label className="font-semibold text-xs">{pos.label}</Label>
            <p className="text-[10px] text-muted-foreground">{pos.desc}</p>
            <Textarea
              value={ads[pos.key] || ''}
              onChange={(e) => setAds({ ...ads, [pos.key]: e.target.value })}
              placeholder={`<script>...</script> or HTML ad code`}
              rows={2}
              className="font-mono text-xs"
            />
          </div>
        ))}

        {customPositions.map((pos) => (
          <div key={pos.key} className="space-y-1.5 p-3 bg-muted/30 rounded-xl border">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-xs">{pos.label} (Custom)</Label>
              <Button variant="ghost" size="sm" onClick={() => removePosition(pos.key)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Textarea
              value={ads[pos.key] || ''}
              onChange={(e) => setAds({ ...ads, [pos.key]: e.target.value })}
              placeholder="Ad script code"
              rows={2}
              className="font-mono text-xs"
            />
          </div>
        ))}

        <div className="flex gap-2 p-3 border border-dashed rounded-xl">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Custom position name"
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
