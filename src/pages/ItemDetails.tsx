import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, ArrowLeft, Crown, Lock, Sparkles, RefreshCw, 
  Share2, Heart, Star, Calendar, Package, Code, 
  Building2, Puzzle, Link, DollarSign, Shield, 
  AlertTriangle, ChevronDown, ChevronUp, HardDrive
} from 'lucide-react';
import { DownloadDialog } from '@/components/Content/DownloadDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ItemDetails() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isVerified } = useVerification();
  const [showDownload, setShowDownload] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [item, setItem] = useState<any>(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [modInfoOpen, setModInfoOpen] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (location.state?.item) {
        setItem(location.state.item);
        setLikeCount(location.state.item.likes || 0);
        setLoading(false);
        return;
      }

      if (type && id) {
        try {
          const itemDoc = await getDoc(doc(db, type, id));
          if (itemDoc.exists()) {
            const data = itemDoc.data();
            const fetchedItem = { id: itemDoc.id, ...data };
            setItem(fetchedItem);
            setLikeCount(data.likes || 0);
          } else {
            toast.error('Item not found');
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching item:', error);
          toast.error('Failed to load item');
          navigate('/');
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/');
      }
    };

    fetchItem();
  }, [type, id, location.state, navigate]);

  useEffect(() => {
    if (user && item?.id) {
      const likeRef = doc(db, 'content_likes', `${user.uid}_${item.id}`);
      getDoc(likeRef).then((snap) => {
        if (snap.exists()) setLiked(true);
      });
    }
  }, [user, item]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  const isPremium = item.isPremium === true;
  const canAccess = !isPremium || (user && isVerified);
  const isNew = item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isUpdated = item.updatedAt && (Date.now() - new Date(item.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const handleDownloadClick = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (isPremium && !isVerified) {
      navigate('/buy-king-badge');
      return;
    }
    setShowDownload(true);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/item/${type}/${item.id || 'item'}`;
    const shareData = {
      title: item.title || 'Check this out!',
      text: item.description || 'Amazing content from our site',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like');
      return;
    }
    
    try {
      const likeRef = doc(db, 'content_likes', `${user.uid}_${item.id}`);
      if (liked) {
        await deleteDoc(likeRef);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        toast.success('Like removed');
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          itemId: item.id,
          itemType: type,
          createdAt: new Date().toISOString()
        });
        setLiked(true);
        setLikeCount(prev => prev + 1);
        toast.success('Liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const rating = item.rating || 4.9;
  const votes = item.votes || Math.floor(Math.random() * 50000) + 10000;
  const modFeatures = item.modFeatures?.split('|') || [
    'Premium Features Unlocked',
    'All Content Available',
    'Ads Removed',
    'No Login Required'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-0 h-auto text-muted-foreground hover:text-primary">
            Home
          </Button>
          <span className="text-muted-foreground">&gt;</span>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/${type}`)} className="p-0 h-auto text-secondary hover:text-secondary/80 capitalize">
            {type}
          </Button>
          <span className="text-muted-foreground">&gt;</span>
          <span className="text-primary font-medium truncate max-w-[200px]">{item.title}</span>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-2xl border shadow-card overflow-hidden"
        >
          {/* App Header Section */}
          <div className="p-6 pb-4 flex flex-col items-center text-center">
            {/* App Icon */}
            {item.thumbnail && (
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg mb-4 border-2 border-border">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {item.title || 'Untitled'}
            </h1>

            {/* Version & Date */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              {item.version && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  v{item.version}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= Math.floor(rating) ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} 
                  />
                ))}
              </div>
              <span className="text-foreground font-semibold">{rating}</span>
              <span className="text-muted-foreground">({votes.toLocaleString()} votes)</span>
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap justify-center mb-4">
              {isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  PREMIUM
                </Badge>
              )}
              {isNew && (
                <Badge className="bg-accent text-accent-foreground border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  NEW
                </Badge>
              )}
              {isUpdated && !isNew && (
                <Badge className="bg-secondary text-secondary-foreground border-0">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  UPDATED
                </Badge>
              )}
            </div>

            {/* Download Button */}
            <Button 
              onClick={handleDownloadClick} 
              className="w-full max-w-md py-6 text-lg rounded-xl bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isPremium && !canAccess ? (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Unlock Premium
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </>
              )}
            </Button>

            {/* Description */}
            <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">
              {item.description || 'No description available'}
            </p>
          </div>
        </motion.div>

        {/* Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mt-6"
        >
          {/* App Name */}
          <div className="info-card">
            <div className="info-card-icon red">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">App Name</p>
            <p className="font-semibold text-foreground truncate">{item.appName || item.title?.split(' ')[0] || 'App'}</p>
          </div>

          {/* Version */}
          <div className="info-card">
            <div className="info-card-icon red">
              <Code className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Version</p>
            <p className="font-semibold text-foreground">{item.version || 'v1.0.0'}</p>
          </div>

          {/* Last Updated */}
          <div className="info-card">
            <div className="info-card-icon red">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="font-semibold text-foreground">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Recently'}</p>
          </div>

          {/* Publisher */}
          <div className="info-card">
            <div className="info-card-icon red">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Publisher</p>
            <p className="font-semibold text-foreground">{item.publisher || item.title?.split(' ')[0] || 'Publisher'}</p>
          </div>

          {/* Requirements */}
          <div className="info-card">
            <div className="info-card-icon red">
              <Puzzle className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Requirements</p>
            <p className="font-semibold text-foreground">{item.requirements || 'Android 5.0+'}</p>
          </div>

          {/* Category */}
          <div className="info-card">
            <div className="info-card-icon red">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="font-semibold text-primary">{item.category || 'App'}</p>
          </div>

          {/* Size */}
          <div className="info-card">
            <div className="info-card-icon red">
              <HardDrive className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Size</p>
            <p className="font-semibold text-foreground">{item.size || 'Varies'}</p>
          </div>

          {/* Platform */}
          <div className="info-card">
            <div className="info-card-icon red">
              <Link className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Platform</p>
            <p className="font-semibold text-primary">{item.platform || 'Android'}</p>
          </div>

          {/* Price */}
          <div className="info-card">
            <div className="info-card-icon green">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-semibold text-accent">{item.price || 'Free'}</p>
          </div>

          {/* Safe & Secure */}
          <div className="info-card">
            <div className="info-card-icon green">
              <Shield className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">Safe & Secure</p>
            <p className="font-semibold text-foreground">100% Safe</p>
          </div>
        </motion.div>

        {/* Screenshots Carousel */}
        {item.screenshots && item.screenshots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-8 bg-muted/30 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Screenshots</h2>
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {item.screenshots.map((screenshot: string, index: number) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-2/3 md:basis-1/3">
                    <div className="rounded-xl overflow-hidden border-2 border-border shadow-md">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </motion.div>
        )}

        {/* MOD Info Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-6"
        >
          <Collapsible open={modInfoOpen} onOpenChange={setModInfoOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between bg-card rounded-2xl border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-bold text-primary">MOD Info?</span>
                </div>
                {modInfoOpen ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-primary" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-card rounded-2xl border border-t-0 rounded-t-none p-4 pt-2">
                <ul className="space-y-3">
                  {modFeatures.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      {feature.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex gap-4 mt-6"
        >
          <Button
            variant="outline"
            className="flex-1 py-6 rounded-xl"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            className={`flex-1 py-6 rounded-xl ${liked ? 'text-primary border-primary' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 mr-2 ${liked ? 'fill-current' : ''}`} />
            {likeCount} Likes
          </Button>
        </motion.div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </main>

      <DownloadDialog
        open={showDownload}
        onOpenChange={setShowDownload}
        item={item}
        type={type || 'item'}
      />

      <AuthDialog 
        open={showAuth} 
        onOpenChange={(isOpen) => {
          setShowAuth(isOpen);
          if (!isOpen && user) {
            setTimeout(() => setShowDownload(true), 300);
          }
        }} 
      />
    </div>
  );
}
