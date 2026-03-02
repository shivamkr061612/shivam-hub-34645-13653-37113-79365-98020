import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Sparkles, RefreshCw, Crown, Lock, Share2, Heart } from 'lucide-react';
import { DownloadDialog } from './DownloadDialog';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
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
  const [showDownload, setShowDownload] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes || 0);

  useState(() => {
    if (user && item.id) {
      const likeRef = doc(db, 'content_likes', `${user.uid}_${item.id}`);
      getDoc(likeRef).then((snap) => {
        if (snap.exists()) setLiked(true);
      });
    }
  });

  const isNew = item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isUpdated = item.updatedAt && (Date.now() - new Date(item.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isPremium = item.isPremium === true;
  const canAccess = !isPremium || (user && isVerified);

  const handleCardClick = () => navigate(`/item/${type}/${item.id || 'item'}`, { state: { item } });
  const handleDownloadClick = (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/item/${type}/${item.id || 'item'}`, { state: { item } }); };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#/item/${type}/${item.id || 'item'}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title || 'Check this out!', text: item.description || '', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied!');
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error('Please login to like'); return; }
    try {
      const likeRef = doc(db, 'content_likes', `${user.uid}_${item.id}`);
      if (liked) {
        await deleteDoc(likeRef);
        setLiked(false);
        setLikeCount((prev: number) => Math.max(0, prev - 1));
      } else {
        await setDoc(likeRef, { userId: user.uid, itemId: item.id, itemType: type, createdAt: new Date().toISOString() });
        setLiked(true);
        setLikeCount((prev: number) => prev + 1);
        toast.success('Liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={`group relative overflow-hidden border border-border bg-card hover:border-primary/30 hover:shadow-[0_8px_30px_hsl(355,90%,58%,0.1)] transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'flex flex-row' : ''}`}
          onClick={handleCardClick}
        >
          {item.thumbnail && (
            <div className={`relative ${viewMode === 'list' ? 'w-36 md:w-48 flex-shrink-0' : 'w-full'} overflow-hidden`}>
              <img
                src={item.thumbnail}
                alt={item.title}
                className={`w-full object-contain transition-transform duration-500 group-hover:scale-105 ${viewMode === 'list' ? 'h-full rounded-l-lg' : 'h-52 md:h-64 rounded-t-lg bg-muted/30'}`}
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-[hsl(42,95%,55%)] to-[hsl(25,95%,55%)] text-white shadow-md border-0 text-[10px]">
                    <Crown className="h-3 w-3 mr-0.5" />
                    PREMIUM
                  </Badge>
                )}
                {isNew && (
                  <Badge className="bg-gradient-to-r from-[hsl(160,70%,42%)] to-[hsl(180,65%,40%)] text-white shadow-md border-0 text-[10px] animate-pulse">
                    <Sparkles className="h-3 w-3 mr-0.5" />
                    NEW
                  </Badge>
                )}
                {isUpdated && !isNew && (
                  <Badge className="bg-gradient-to-r from-[hsl(220,85%,52%)] to-[hsl(250,80%,58%)] text-white shadow-md border-0 text-[10px]">
                    <RefreshCw className="h-3 w-3 mr-0.5" />
                    UPDATED
                  </Badge>
                )}
              </div>

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="h-7 w-7 p-0 bg-background/90 backdrop-blur-sm rounded-full" onClick={handleShare}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="secondary" className={`h-7 w-7 p-0 bg-background/90 backdrop-blur-sm rounded-full ${liked ? 'text-[hsl(355,90%,58%)]' : ''}`} onClick={handleLike}>
                  <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="line-clamp-1 text-base group-hover:text-primary transition-colors">
                  {item.title || 'Untitled'}
                </CardTitle>
                {likeCount > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Heart className="h-3 w-3 text-[hsl(355,90%,58%)]" /> {likeCount}
                  </span>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-xs">
                {item.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(item.size || item.version) && (
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {item.size && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        {item.size}
                      </span>
                    )}
                    {item.version && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        v{item.version}
                      </span>
                    )}
                  </div>
                )}
                <Button 
                  onClick={handleDownloadClick} 
                  className={`w-full relative z-10 font-semibold text-sm py-4 rounded-xl ${
                    isPremium && !canAccess 
                      ? 'bg-muted text-muted-foreground border border-border hover:bg-muted/80' 
                      : 'bg-gradient-to-r from-primary to-[hsl(330,85%,55%)] text-white hover:opacity-90 border-0'
                  }`}
                  variant={isPremium && !canAccess ? 'outline' : 'default'}
                >
                  {isPremium && !canAccess ? (
                    <><Lock className="h-4 w-4 mr-2" />Premium</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" />Download</>
                  )}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      <DownloadDialog open={showDownload} onOpenChange={setShowDownload} item={item} type={type} />
    </>
  );
}
