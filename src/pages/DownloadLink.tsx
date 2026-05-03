import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Send, CheckCircle, Star, Shield, HelpCircle, Wrench, FileQuestion, Package2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { useDownloadTheme } from '@/hooks/useDownloadTheme';
import { AdSlot } from '@/components/Ads/AdSlot';
import { toast } from 'sonner';
import { getItemSlug } from '@/lib/slug';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  const theme = useDownloadTheme();
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
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} bg-background`}>
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme.card} border-2 ${theme.border} rounded-2xl p-6 mb-6 text-center`}
        >
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center mx-auto mb-4`}>
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Your Download is Ready!</h2>
          <p className="text-sm text-muted-foreground mb-1">{version.name}</p>
          <p className="text-xs text-muted-foreground mb-4">Size: {version.size}</p>
          <Progress value={100} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">100% complete</p>
        </motion.div>

        <AdSlot position="download_link_top" className="mb-4" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Button
            onClick={handleDownload}
            className={`w-full bg-gradient-to-r ${theme.accent} hover:opacity-90 text-white font-bold py-6 rounded-xl text-lg shadow-lg`}
          >
            <Download className="h-6 w-6 mr-2" />
            DOWNLOAD NOW
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">Click to start downloading</p>
        </motion.div>

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

        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-1 h-6 bg-gradient-to-b ${theme.accent} rounded-full`} />
              <h3 className="text-lg font-bold text-foreground">Related Posts</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {relatedPosts.map((rItem) => (
                <div
                  key={rItem.id}
                  className={`${theme.card} border ${theme.border} rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => navigate(`/item/${rItem.type}/${getItemSlug(rItem)}`, { state: { item: rItem } })}
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

        {/* Telegram Channel Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex justify-center"
        >
          <a
            href={settings.telegramLink || 'https://t.me/techshivam'}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 hover:border-blue-500 hover:scale-105 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Join us on</p>
              <p className="text-sm font-bold text-foreground">Telegram Channel</p>
            </div>
          </a>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-1 h-6 bg-gradient-to-b ${theme.accent} rounded-full`} />
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5" /> Frequently Asked Questions
            </h3>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="how-to-install" className={`${theme.card} border-2 ${theme.border} rounded-xl px-4`}>
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Wrench className="h-4 w-4 text-primary" /> How to Install?
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Download the APK / OBB / XAPK file from the link above.</p>
                <p>2. Enable <span className="font-semibold text-foreground">"Install from Unknown Sources"</span> in your device Settings → Security.</p>
                <p>3. Open the downloaded file and tap <span className="font-semibold text-foreground">Install</span>.</p>
                <p>4. For OBB files, extract and place the folder in <span className="font-mono text-xs">Android/obb/</span>.</p>
                <p>5. For XAPK, use a XAPK installer app from Play Store.</p>
                <p>6. Launch the app and enjoy! 🎉</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="what-is-obb" className={`${theme.card} border-2 ${theme.border} rounded-xl px-4`}>
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <FileQuestion className="h-4 w-4 text-secondary" /> What is OBB?
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">OBB (Opaque Binary Blob)</span> is an extra data file used by Android apps and games to store large assets like high-quality graphics, videos, and audio that can't fit inside the APK. After installing the APK, you must place the OBB file in <span className="font-mono text-xs">Android/obb/[package-name]/</span> for the app to work properly.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="what-is-xapk" className={`${theme.card} border-2 ${theme.border} rounded-xl px-4`}>
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Package2 className="h-4 w-4 text-accent" /> What is XAPK?
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">XAPK</span> is an extended APK file format that bundles the APK along with OBB data and split APKs into a single package. To install XAPK files, you need a XAPK installer app (like APKPure or XAPK Installer) which automatically handles APK installation and OBB placement.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="safe" className={`${theme.card} border-2 ${theme.border} rounded-xl px-4`}>
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Shield className="h-4 w-4 text-green-500" /> Are these files safe?
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <p>Yes! All files on TS HUB are scanned and tested before publishing. Always download from our official site for guaranteed safety. Avoid suspicious mirror links.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </main>
    </div>
  );
}
