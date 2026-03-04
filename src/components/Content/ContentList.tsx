import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContentCard } from './ContentCard';
import { ContentCardSkeletonGrid } from './ContentCardSkeleton';
import { Search, Grid, List, SlidersHorizontal, Package, Gamepad2, GraduationCap, Layers, FolderArchive, Film } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { AdSlot } from '@/components/Ads/AdSlot';

interface ContentListProps {
  title: string;
  items: any[];
  loading: boolean;
  type: 'mods' | 'movies' | 'courses' | 'games' | 'assets' | 'bundles';
}

const typeConfig: Record<string, { gradient: string; icon: any; emoji: string }> = {
  mods: { gradient: 'from-[hsl(270,75%,58%)] to-[hsl(290,70%,50%)]', icon: Package, emoji: '⚡' },
  games: { gradient: 'from-[hsl(355,90%,58%)] to-[hsl(330,85%,55%)]', icon: Gamepad2, emoji: '🎮' },
  courses: { gradient: 'from-[hsl(25,95%,55%)] to-[hsl(15,90%,50%)]', icon: GraduationCap, emoji: '📚' },
  assets: { gradient: 'from-[hsl(42,95%,55%)] to-[hsl(25,95%,55%)]', icon: Layers, emoji: '🎨' },
  bundles: { gradient: 'from-[hsl(160,70%,42%)] to-[hsl(180,65%,40%)]', icon: FolderArchive, emoji: '📦' },
  movies: { gradient: 'from-[hsl(220,85%,52%)] to-[hsl(250,80%,58%)]', icon: Film, emoji: '🎬' },
};

export function ContentList({ title, items, loading, type }: ContentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('newest');

  const config = typeConfig[type] || typeConfig.mods;

  const filteredItems = items
    .filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

  return (
    <div className="container px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-md`}>
            <span className="text-lg">{config.emoji}</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{filteredItems.length} items available</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 sm:mb-6"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border bg-card h-10 text-sm"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[100px] sm:w-[120px] rounded-xl h-10 text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">A-Z</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="icon" 
              onClick={() => setViewMode('list')} 
              className="rounded-xl h-10 w-10"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="icon" 
              onClick={() => setViewMode('grid')} 
              className="rounded-xl h-10 w-10"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <AdSlot position={`${type}_top`} className="mb-3" />

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'space-y-2'}>
          <ContentCardSkeletonGrid count={6} viewMode={viewMode} />
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No items found</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Try a different search</p>
        </motion.div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'space-y-2'}>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.2) }}
            >
              <ContentCard item={item} type={type} viewMode={viewMode} />
              {viewMode === 'list' && (index + 1) % 5 === 0 && (
                <AdSlot position={`${type}_feed_${index}`} className="mt-2" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AdSlot position={`${type}_bottom`} className="mt-4" />
    </div>
  );
}
