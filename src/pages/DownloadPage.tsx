import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { 
  Download, Send, Info, AlertCircle, Loader2, FileDown, Package
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { findItemBySlug } from '@/lib/slug';
import { KeyGenerationDialog } from '@/components/Content/KeyGenerationDialog';
import { useVerification } from '@/hooks/useVerification';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { useDownloadTheme } from '@/hooks/useDownloadTheme';
import { AdSlot } from '@/components/Ads/AdSlot';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Version {
  name: string;
  size: string;
  link: string;
}

export default function DownloadPage() {
  const { type, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isVerified } = useVerification();
  const { settings } = useWebsiteSettings();
  const theme = useDownloadTheme();
  const [item, setItem] = useState<any>(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [showKeyGen, setShowKeyGen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (location.state?.item) {
        setItem(location.state.item);
        setLoading(false);
        return;
      }
      if (type && slug) {
        try {
          // Try direct doc id first
          const itemDoc = await getDoc(doc(db, type, slug));
          if (itemDoc.exists()) {
            setItem({ id: itemDoc.id, ...itemDoc.data() });
            setLoading(false);
            return;
          }
          // Slug fallback
          const snap = await getDocs(collection(db, type));
          const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
          const found = findItemBySlug(all, slug);
          if (found) {
            setItem(found);
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
  }, [type, slug, location.state, navigate]);

  const checkKeyValidity = () => {
    const expiry = localStorage.getItem('downloadKeyExpiry');
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const isValid = Date.now() < expiryTime;
      if (!isValid) localStorage.removeItem('downloadKeyExpiry');
      return isValid;
    }
    return false;
  };

  const handleVersionClick = (version: Version) => {
    if (isVerified || !settings.keyGenerationEnabled || checkKeyValidity()) {
      navigate(`/download-loading/${type}/${slug}`, {
        state: { item, version, type }
      });
      return;
    }
    setShowKeyGen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!item) return null;

  const versions: Version[] = item.versions || [
    { name: `${item.title} ${item.version || 'v1.0'}`, size: item.size || 'Unknown', link: item.downloadUrl }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} bg-background`}>
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 text-muted-foreground"
        >
          <p>
            Thank you for downloading <span className="text-primary font-semibold">{item.title}</span> from our site.
          </p>
          <p className="text-sm mt-1">Select the version you want to download.</p>
        </motion.div>

        <AdSlot position="download_page" className="mb-4" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${theme.card} border-2 ${theme.border} rounded-2xl p-6 mb-6 flex flex-col items-center`}
        >
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.accent} flex items-center justify-center mb-4`}>
            <Package className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Choose Version</h2>
          <p className="text-sm text-muted-foreground mb-2">Select the version you want to download</p>
          <div className="flex justify-between w-full mt-2 text-xs text-muted-foreground">
            <span>TSHUB.IN</span>
            <span className="text-primary flex items-center gap-1">
              <FileDown className="h-3 w-3" /> {versions.length} version{versions.length > 1 ? 's' : ''} available
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {versions.map((version, index) => (
              <AccordionItem 
                key={index} 
                value={`version-${index}`}
                className={`${theme.card} border-2 ${theme.border} rounded-2xl overflow-hidden`}
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex items-center gap-3 text-left">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.accent} flex items-center justify-center flex-shrink-0`}>
                        <FileDown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block text-sm">{version.name}</span>
                        <span className="text-xs text-muted-foreground">{version.size}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Button
                    onClick={() => handleVersionClick(version)}
                    className={`w-full bg-gradient-to-r ${theme.accent} hover:opacity-90 text-white font-bold py-5 rounded-xl`}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download ({version.size})
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Button
            onClick={() => window.open(settings.telegramLink || 'https://t.me/techshivam', '_blank')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-5 rounded-xl"
          >
            <Send className="h-5 w-5 mr-2" />
            Join Our Telegram channel
          </Button>
        </motion.div>

        <AdSlot position="download_page_bottom" className="mt-4" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-rose-500" />
            <h3 className="font-bold text-foreground">Important Notes</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Some GAMES or APK are specially Optimized and Built for specific Processor Architecture.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span>If you face any issues, please contact us through Telegram.</span>
            </li>
          </ul>
        </motion.div>
      </main>

      <KeyGenerationDialog
        open={showKeyGen}
        onOpenChange={setShowKeyGen}
        onKeyGenerated={() => {
          setShowKeyGen(false);
          toast.success('🔑 Key activated! You can now download.');
        }}
        destinationUrl={versions[0]?.link || ''}
      />
    </div>
  );
}
