import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContentCard } from './ContentCard';
import { ContentCardSkeletonGrid } from './ContentCardSkeleton';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { AdSlot } from '@/components/Ads/AdSlot';

interface ContentListProps {
  title: string;
  items: any[];
  loading: boolean;
  type: 'mods' | 'movies' | 'courses' | 'games' | 'assets' | 'bundles';
}

export function ContentList({ title, items, loading, type }: ContentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('newest');

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

  const typeColors: Record<string, string> = {
    mods: 'from-purple-500 to-indigo-600',
    games: 'from-red-500 to-pink-600',
    courses: 'from-orange-500 to-amber-600',
    assets: 'from-yellow-500 to-orange-500',
    bundles: 'from-green-500 to-emerald-600',
    movies: 'from-blue-500 to-cyan-600',
  };

  return (
    <div className="container px-4 py-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r ${typeColors[type] || typeColors.mods} text-white text-sm font-bold mb-3 shadow-lg`}>
          <SlidersHorizontal className="h-4 w-4" />
          {title}
        </div>
        <p className="text-muted-foreground text-sm">
          {filteredItems.length} items available
        </p>
      </motion.div>

      {/* Search & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 mb-6"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-border bg-card h-11"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] rounded-xl h-11">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} className="rounded-xl h-11 w-11">
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} className="rounded-xl h-11 w-11">
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Ad slot top */}
      <AdSlot position={`${type}_top`} className="mb-4" />

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}>
          <ContentCardSkeletonGrid count={6} viewMode={viewMode} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No items found</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Try a different search</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
            >
              <ContentCard item={item} type={type} viewMode={viewMode} />
              {/* Ad after every 5 items in list mode */}
              {viewMode === 'list' && (index + 1) % 5 === 0 && (
                <AdSlot position={`${type}_feed_${index}`} className="mt-3" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Ad slot bottom */}
      <AdSlot position={`${type}_bottom`} className="mt-6" />
    </div>
  );
}