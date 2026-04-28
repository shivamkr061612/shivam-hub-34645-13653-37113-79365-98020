import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, Star, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useAdGate } from '@/hooks/useAdGate';

interface TrendingItem {
  id: string;
  title: string;
  thumbnail: string;
  category?: string;
  rating?: number;
  version?: string;
  size?: string;
  type: string;
  modFeatures?: string;
  [key: string]: any;
}

export function TrendingSection() {
  const [featured, setFeatured] = useState<TrendingItem[]>([]);
  const [updatedApps, setUpdatedApps] = useState<TrendingItem[]>([]);
  const [updatedGames, setUpdatedGames] = useState<TrendingItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      // Fetch admin selected trending items
      const trendingDoc = await getDoc(doc(db, 'settings', 'trending'));
      const trendingIds = trendingDoc.exists() ? trendingDoc.data() : { featured: [], updatedApps: [], updatedGames: [] };

      // Fetch all mods and games
      const [modsSnap, gamesSnap] = await Promise.all([
        getDocs(collection(db, 'mods')),
        getDocs(collection(db, 'games')),
      ]);

      const allMods = modsSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'mods' })) as TrendingItem[];
      const allGames = gamesSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'games' })) as TrendingItem[];
      const allItems = [...allMods, ...allGames];

      // Featured - admin selected or recently added
      if (trendingIds.featured?.length) {
        setFeatured(allItems.filter(i => trendingIds.featured.includes(i.id)).slice(0, 10));
      } else {
        setFeatured(allItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 10));
      }

      // Updated Apps (mods)
      if (trendingIds.updatedApps?.length) {
        setUpdatedApps(allMods.filter(i => trendingIds.updatedApps.includes(i.id)).slice(0, 10));
      } else {
        setUpdatedApps(allMods.filter(i => i.updatedAt).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()).slice(0, 10));
      }

      // Updated Games
      if (trendingIds.updatedGames?.length) {
        setUpdatedGames(allGames.filter(i => trendingIds.updatedGames.includes(i.id)).slice(0, 10));
      } else {
        setUpdatedGames(allGames.filter(i => i.updatedAt).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()).slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const handleItemClick = (item: TrendingItem) => {
    navigate(`/item/${item.type}/${item.id}`, { state: { item } });
  };

  return (
    <div className="space-y-8">
      {/* Featured Section - horizontal scroll cards */}
      {featured.length > 0 && (
        <Section
          title="Featured"
          icon={<Flame className="h-5 w-5" />}
          iconBg="bg-orange-500"
          items={featured}
          onItemClick={handleItemClick}
          viewAllPath="/mods"
          cardStyle="featured"
        />
      )}

      {/* Updated Apps */}
      {updatedApps.length > 0 && (
        <Section
          title="Updated Apps"
          icon={<RefreshCw className="h-5 w-5" />}
          iconBg="bg-blue-500"
          items={updatedApps}
          onItemClick={handleItemClick}
          viewAllPath="/mods"
          cardStyle="compact"
        />
      )}

      {/* Updated Games */}
      {updatedGames.length > 0 && (
        <Section
          title="Updated Games"
          icon={<RefreshCw className="h-5 w-5" />}
          iconBg="bg-red-500"
          items={updatedGames}
          onItemClick={handleItemClick}
          viewAllPath="/games"
          cardStyle="compact"
        />
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  items: TrendingItem[];
  onItemClick: (item: TrendingItem) => void;
  viewAllPath: string;
  cardStyle: 'featured' | 'compact';
}

function Section({ title, icon, iconBg, items, onItemClick, viewAllPath, cardStyle }: SectionProps) {
  const navigate = useNavigate();

  if (cardStyle === 'featured') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`${iconBg} p-2 rounded-xl text-white`}>{icon}</div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex-shrink-0 w-[240px] sm:w-[280px] glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-xl transition-all"
                onClick={() => onItemClick(item)}
              >
                {item.thumbnail && (
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-2 left-3 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-white text-xs font-medium drop-shadow">{item.category || item.type}</span>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-bold text-foreground line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3.5 w-3.5 text-gold fill-gold" />
                    <span className="text-xs text-muted-foreground">{item.rating || '4.8'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description || ''}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                    {item.version && <span>v{item.version}</span>}
                    {item.size && <span>{item.size}</span>}
                  </div>
                  <Button size="sm" className="w-full mt-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs h-8 font-semibold hover:shadow-lg transition-all">
                    Download
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  // Compact list style (like Updated Apps/Games in reference)
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`${iconBg} p-2 rounded-xl text-white`}>{icon}</div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => navigate(viewAllPath)}
        >
          View All <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex items-center gap-3 p-3 glass-card rounded-2xl hover:border-primary/30 cursor-pointer transition-all"
            onClick={() => onItemClick(item)}
          >
            <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              {(item.type === 'mods' || item.type === 'games') && (
                <span className="absolute bottom-0.5 left-0.5 text-[8px] font-bold px-1 py-0 rounded bg-destructive text-white uppercase">
                  {item.type === 'mods' ? 'MOD' : 'GAME'}
                </span>
              )}
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                <Shield className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">{item.title}</h3>
                <Badge className="text-[9px] px-1.5 py-0 bg-accent/15 text-accent border-0 flex-shrink-0">UPDATED</Badge>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                {item.category && <span>{item.category}</span>}
                {item.size && <span>Size:{item.size}</span>}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                {item.version && <span>v{item.version}</span>}
                {item.modFeatures && (
                  <span className="text-accent flex items-center gap-0.5">
                    <Shield className="h-2.5 w-2.5" />
                    {item.modFeatures.split('|')[0]}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}