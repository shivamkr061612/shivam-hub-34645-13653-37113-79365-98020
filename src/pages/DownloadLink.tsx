import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Download, Send, CheckCircle, ArrowRight, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { AdSlot } from '@/components/Ads/AdSlot';
import { toast } from 'sonner';

interface RelatedItem {
  id: string;
  title: string;
  thumbnail: string;
  type: string;
  category?: string;
  size?: string;
  version?: string;
  [key: string]: any;
}

export default function DownloadLink() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useWebsiteSettings();
  const [relatedPosts, setRelatedPosts] = useState<RelatedItem[]>([]);
  
  const { item, version, type } = location.state || {};

  useEffect(() => {
    if (!item || !version) {
      navigate('/');
      return;
    }
    fetchRelatedPosts();
  }, []);

  const fetchRelatedPosts = async () => {
    try {
      const collections = ['mods', 'games', 'courses', 'assets'];
      const allItems: RelatedItem[] = [];
      
      const snaps = await Promise.all(
        collections.map(c => getDocs(collection(db, c)))
      );
      
      snaps.forEach((snap, i) => {
        snap.docs.forEach(d => {
          if (d.id !== item?.id) {
            allItems.push({ id: d.id, ...d.data(), type: collections[i] } as RelatedItem);
          }
        });
      });

      // Shuffle and pick 6
      const shuffled = allItems.sort(() => 0.5 - Math.random());
      setRelatedPosts(shuffled.slice(0, 6));
    } catch (error) {
      console.error('Error fetching related:', error);
    }
  };

  const handleDownload = () => {
    if (version?.link) {
      window.open(version.link, '_blank');
      toast.success('Download started! ✅');
    } else {
      toast.error('Download URL not available');
    }
  };

  if (!item || !version) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-6 max-w-2xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-accent/30 rounded-2xl p-6 mb-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Your Download is Ready!</h2>
          <p className="text-sm text-muted-foreground mb-1">{version.name}</p>
          <p className="text-xs text-muted-foreground">Size: {version.size}</p>
        </motion.div>

        <AdSlot position="download_link_top" className="mb-4" />

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 rounded-xl text-lg shadow-lg"
          >
            <Download className="h-6 w-6 mr-2" />
            DOWNLOAD NOW
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">Click to start downloading</p>
        </motion.div>

        {/* Telegram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Button
            onClick={() => window.open(settings.telegramLink || 'https://t.me/techshivam', '_blank')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-5 rounded-xl"
          >
            <Send className="h-5 w-5 mr-2" />
            Join Our Telegram channel
          </Button>
        </motion.div>

        <AdSlot position="download_link_middle" className="mb-6" />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h3 className="text-lg font-bold text-foreground">Related Posts</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {relatedPosts.map((rItem) => (
                <div
                  key={rItem.id}
                  className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                  onClick={() => navigate(`/item/${rItem.type}/${rItem.id}`, { state: { item: rItem } })}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {rItem.thumbnail ? (
                      <img src={rItem.thumbnail} alt={rItem.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-semibold text-xs text-foreground line-clamp-2 leading-tight">{rItem.title}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] text-muted-foreground">4.8</span>
                      {rItem.size && <span className="text-[10px] text-muted-foreground ml-1">{rItem.size}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <AdSlot position="download_link_bottom" className="mt-6" />
      </main>
    </div>
  );
}
