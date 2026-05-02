import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, RefreshCw, Crown, Star, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { useNavigate } from 'react-router-dom';
import { getItemSlug } from '@/lib/slug';

interface ContentCardProps {
  item: any;
  type: string;
  viewMode: 'grid' | 'list';
}

const typeBadge: Record<string, { label: string; className: string }> = {
  mods: { label: 'MOD', className: 'bg-[hsl(270,75%,58%)] text-white' },
  games: { label: 'GAME', className: 'bg-[hsl(355,90%,58%)] text-white' },
  courses: { label: 'COURSE', className: 'bg-[hsl(25,95%,55%)] text-white' },
  assets: { label: 'ASSET', className: 'bg-[hsl(42,95%,55%)] text-white' },
  bundles: { label: 'BUNDLE', className: 'bg-[hsl(160,70%,42%)] text-white' },
  movies: { label: 'MOVIE', className: 'bg-[hsl(220,85%,52%)] text-white' },
};

export function ContentCard({ item, type, viewMode }: ContentCardProps) {
  const { user } = useAuth();
  const { isVerified } = useVerification();
  const navigate = useNavigate();

  const isNew = item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isUpdated = item.updatedAt && (Date.now() - new Date(item.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isPremium = item.isPremium === true;
  const badge = typeBadge[type] || typeBadge.mods;

  const handleCardClick = () => navigate(`/item/${type}/${getItemSlug(item)}`, { state: { item } });
  const rating = item.rating || (4 + Math.random()).toFixed(1);

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <div
        className="flex items-start gap-3 p-2.5 sm:p-3 bg-card rounded-2xl border border-border/60 hover:border-primary/20 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Download className="h-5 w-5" />
            </div>
          )}
          {/* Type badge */}
          <span className={`absolute bottom-0.5 left-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-bold text-foreground text-[13px] sm:text-sm line-clamp-1 leading-tight">{item.title || 'Untitled'}</h3>
            {(isNew || isUpdated || isPremium) && (
              <div className="flex gap-1 flex-shrink-0">
                {isPremium && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[hsl(42,95%,55%)/0.15] text-[hsl(42,95%,55%)]">
                    <Crown className="h-2.5 w-2.5 inline mr-0.5" />PRO
                  </span>
                )}
                {isNew && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[hsl(160,70%,42%)/0.15] text-[hsl(160,70%,42%)]">NEW</span>
                )}
                {isUpdated && !isNew && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[hsl(220,85%,52%)/0.15] text-[hsl(220,85%,52%)]">UPD</span>
                )}
              </div>
            )}
          </div>

          {/* Rating + meta */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <Star className="h-3 w-3 text-[hsl(42,95%,55%)] fill-[hsl(42,95%,55%)]" />
            <span className="text-[11px] text-muted-foreground">{rating}</span>
            {item.version && <span className="text-[10px] text-muted-foreground/70">v{item.version}</span>}
            {item.size && <span className="text-[10px] text-muted-foreground/70">{item.size}</span>}
          </div>

          {/* Description */}
          <p className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5">{item.description || 'No description'}</p>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-1.5">
            {item.category && (
              <span className="text-[10px] text-secondary font-medium">{item.category}</span>
            )}
            <Button 
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
              size="sm"
              className="h-6 px-3 text-[10px] rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold ml-auto"
            >
              Get <ArrowRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div
      className="bg-card rounded-2xl border border-border/60 hover:border-primary/20 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Download className="h-7 w-7" />
          </div>
        )}
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          {isPremium && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-[hsl(42,95%,55%)] text-white">
              <Crown className="h-2.5 w-2.5 inline mr-0.5" />PRO
            </span>
          )}
          {isNew && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-[hsl(160,70%,42%)] text-white animate-pulse">NEW</span>
          )}
        </div>
        <span className={`absolute bottom-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <div className="p-2.5">
        <h3 className="font-bold text-xs line-clamp-1 text-foreground">{item.title || 'Untitled'}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-3 w-3 text-[hsl(42,95%,55%)] fill-[hsl(42,95%,55%)]" />
          <span className="text-[10px] text-muted-foreground">{rating}</span>
          {item.size && <span className="text-[10px] text-muted-foreground ml-auto">{item.size}</span>}
        </div>
      </div>
    </div>
  );
}
