import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, RefreshCw, Crown, Lock, Star, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ContentCardProps {
  item: any;
  type: string;
  viewMode: 'grid' | 'list';
}

export function ContentCard({ item, type, viewMode }: ContentCardProps) {
  const { user } = useAuth();
  const { isVerified } = useVerification();
  const navigate = useNavigate();

  const isNew = item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isUpdated = item.updatedAt && (Date.now() - new Date(item.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isPremium = item.isPremium === true;

  const handleCardClick = () => navigate(`/item/${type}/${item.id || 'item'}`, { state: { item } });
  const handleDownloadClick = (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    navigate(`/item/${type}/${item.id || 'item'}`, { state: { item } }); 
  };

  const rating = item.rating || (4 + Math.random()).toFixed(1);

  // LIST VIEW - like reference images (getmodsapk style)
  if (viewMode === 'list') {
    return (
      <div
        className="flex items-start gap-3 p-3 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-border bg-muted">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Download className="h-6 w-6" />
            </div>
          )}
          {/* MOD badge */}
          {(type === 'mods' || type === 'games') && (
            <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive text-white uppercase">
              {type === 'mods' ? 'MOD' : 'GAME'}
            </span>
          )}
          {/* Verified badge */}
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
            <Shield className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-1">{item.title || 'Untitled'}</h3>
            {(isNew || isUpdated) && (
              <Badge className={`text-[10px] px-1.5 py-0 border-0 flex-shrink-0 ${
                isNew 
                  ? 'bg-accent/15 text-accent' 
                  : 'bg-accent/15 text-accent'
              }`}>
                {isNew ? 'NEW' : 'UPDATED'}
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="h-3.5 w-3.5 text-gold fill-gold" />
            <span className="text-xs text-muted-foreground">{rating}</span>
            {isPremium && (
              <Badge className="ml-1 text-[9px] px-1 py-0 bg-gold/15 text-gold border-0">
                <Crown className="h-2.5 w-2.5 mr-0.5" />
                PREMIUM
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description || 'No description'}</p>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              {item.version && <span>v{item.version}</span>}
              {item.size && <span>{item.size}</span>}
              {item.category && <span className="text-secondary">{item.category}</span>}
              {item.modFeatures && (
                <span className="text-accent flex items-center gap-0.5">
                  <Shield className="h-3 w-3" />
                  {item.modFeatures.split('|')[0]}
                </span>
              )}
            </div>
            <Button 
              onClick={handleDownloadClick}
              size="sm"
              className="h-7 px-3 text-xs rounded-full bg-accent hover:bg-accent/90 text-white border-0 font-semibold"
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div
      className="bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Download className="h-8 w-8" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {isPremium && (
            <Badge className="bg-gold text-gold-foreground border-0 text-[9px] px-1.5 py-0">
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-accent text-white border-0 text-[9px] px-1.5 py-0 animate-pulse">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
              NEW
            </Badge>
          )}
          {isUpdated && !isNew && (
            <Badge className="bg-secondary text-white border-0 text-[9px] px-1.5 py-0">
              <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
              UPD
            </Badge>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1 text-foreground">{item.title || 'Untitled'}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-3 w-3 text-gold fill-gold" />
          <span className="text-[11px] text-muted-foreground">{rating}</span>
          {item.size && <span className="text-[11px] text-muted-foreground ml-auto">{item.size}</span>}
        </div>
      </div>
    </div>
  );
}