import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Save, Flame, Star, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AdminTrending() {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [featured, setFeatured] = useState<string[]>([]);
  const [updatedApps, setUpdatedApps] = useState<string[]>([]);
  const [updatedGames, setUpdatedGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [modsSnap, gamesSnap, trendingSnap] = await Promise.all([
        getDocs(collection(db, 'mods')),
        getDocs(collection(db, 'games')),
        getDoc(doc(db, 'settings', 'trending')),
      ]);

      const mods = modsSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'mods' }));
      const games = gamesSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'games' }));
      setAllItems([...mods, ...games]);

      if (trendingSnap.exists()) {
        const data = trendingSnap.data();
        setFeatured(data.featured || []);
        setUpdatedApps(data.updatedApps || []);
        setUpdatedGames(data.updatedGames || []);
      }
    } catch (error) {
      console.error('Error loading trending data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'trending'), { featured, updatedApps, updatedGames });
      toast.success('Trending settings saved!');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (list: string[], setList: (val: string[]) => void, id: string) => {
    if (list.includes(id)) {
      setList(list.filter(i => i !== id));
    } else {
      setList([...list, id]);
    }
  };

  const filtered = allItems.filter(i => 
    i.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemTitle = (id: string) => allItems.find(i => i.id === id)?.title || id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Trending & Featured
        </CardTitle>
        <CardDescription>Select items to show in Featured, Updated Apps, and Updated Games on homepage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="w-full px-4 py-2 rounded-xl border bg-card text-foreground"
        />

        {/* Featured Section */}
        <div className="space-y-3">
          <Label className="font-bold text-base">⭐ Featured (Homepage Slider)</Label>
          <div className="flex flex-wrap gap-2">
            {featured.map(id => (
              <Badge key={id} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleItem(featured, setFeatured, id)}>
                {getItemTitle(id)} <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 border rounded-xl p-2">
            {filtered.map(item => (
              <div key={`f-${item.id}`} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer" onClick={() => toggleItem(featured, setFeatured, item.id)}>
                <span className="text-sm">{item.title} <span className="text-xs text-muted-foreground">({item.type})</span></span>
                {featured.includes(item.id) && <Star className="h-4 w-4 text-gold fill-gold" />}
              </div>
            ))}
          </div>
        </div>

        {/* Updated Apps */}
        <div className="space-y-3">
          <Label className="font-bold text-base">📱 Updated Apps</Label>
          <div className="flex flex-wrap gap-2">
            {updatedApps.map(id => (
              <Badge key={id} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleItem(updatedApps, setUpdatedApps, id)}>
                {getItemTitle(id)} <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 border rounded-xl p-2">
            {allItems.filter(i => i.type === 'mods' && i.title?.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
              <div key={`a-${item.id}`} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer" onClick={() => toggleItem(updatedApps, setUpdatedApps, item.id)}>
                <span className="text-sm">{item.title}</span>
                {updatedApps.includes(item.id) && <Star className="h-4 w-4 text-blue-500 fill-blue-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Updated Games */}
        <div className="space-y-3">
          <Label className="font-bold text-base">🎮 Updated Games</Label>
          <div className="flex flex-wrap gap-2">
            {updatedGames.map(id => (
              <Badge key={id} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleItem(updatedGames, setUpdatedGames, id)}>
                {getItemTitle(id)} <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 border rounded-xl p-2">
            {allItems.filter(i => i.type === 'games' && i.title?.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
              <div key={`g-${item.id}`} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer" onClick={() => toggleItem(updatedGames, setUpdatedGames, item.id)}>
                <span className="text-sm">{item.title}</span>
                {updatedGames.includes(item.id) && <Star className="h-4 w-4 text-red-500 fill-red-500" />}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Trending Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}