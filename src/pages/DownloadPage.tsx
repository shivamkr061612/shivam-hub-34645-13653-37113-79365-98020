import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, ChevronDown, Send, Info, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { doc, getDoc, increment, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import { KeyGenerationDialog } from '@/components/Content/KeyGenerationDialog';
import { useVerification } from '@/hooks/useVerification';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';

interface Version {
  name: string;
  size: string;
  link: string;
}

export default function DownloadPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isVerified } = useVerification();
  const { settings } = useWebsiteSettings();
  const [item, setItem] = useState<any>(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [showAuth, setShowAuth] = useState(false);
  const [showKeyGen, setShowKeyGen] = useState(false);
  const [downloadingVersion, setDownloadingVersion] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      if (location.state?.item) {
        setItem(location.state.item);
        setLoading(false);
        return;
      }

      if (type && id) {
        try {
          const itemDoc = await getDoc(doc(db, type, id));
          if (itemDoc.exists()) {
            setItem({ id: itemDoc.id, ...itemDoc.data() });
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

  const checkKeyValidity = () => {
    const expiry = localStorage.getItem('downloadKeyExpiry');
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const isValid = Date.now() < expiryTime;
      if (!isValid) {
        localStorage.removeItem('downloadKeyExpiry');
      }
      return isValid;
    }
    return false;
  };

  const performDownload = async (downloadUrl: string, versionName: string) => {
    if (!downloadUrl) {
      toast.error('Download URL not available');
      return;
    }

    setDownloadingVersion(versionName);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      // Track download
      if (user) {
        try {
          await addDoc(collection(db, 'downloads'), {
            userId: user.uid,
            userEmail: user.email,
            itemId: item.id,
            itemTitle: item.title,
            versionName,
            type: type,
            downloadedAt: new Date().toISOString()
          });
        } catch (error) {
          console.log('Download tracking skipped:', error);
        }

        // Update download count
        try {
          const itemRef = doc(db, type!, item.id);
          await updateDoc(itemRef, {
            downloadCount: increment(1)
          });
        } catch (error) {
          console.log('Download count update skipped:', error);
        }
      }

      setProgress(100);
      
      setTimeout(() => {
        window.open(downloadUrl, '_blank');
        toast.success('Download started! ✅');
        setDownloadingVersion(null);
        setProgress(0);
      }, 500);

    } catch (error) {
      toast.error('Download failed ❌');
      console.error('Download error:', error);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleDownloadClick = (downloadUrl: string, versionName: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    // If user is verified, download directly
    if (isVerified) {
      performDownload(downloadUrl, versionName);
      return;
    }

    // If key generation is disabled, download directly
    if (!settings.keyGenerationEnabled) {
      performDownload(downloadUrl, versionName);
      return;
    }

    // Check if key is valid
    if (!checkKeyValidity()) {
      setShowKeyGen(true);
      return;
    }

    performDownload(downloadUrl, versionName);
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

  // Parse versions from item
  const versions: Version[] = item.versions || [
    { name: `${item.title} ${item.version || 'v1.0'}`, size: item.size || 'Unknown', link: item.downloadUrl }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Thank you message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 text-muted-foreground"
        >
          <p>
            Thank you for downloading <span className="text-primary font-semibold">{item.title}</span> from our site.
          </p>
          <p>The following are available links. Just press the button and the file will be automatically downloaded.</p>
        </motion.div>

        {/* Ad placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border-2 border-border rounded-2xl p-6 mb-6 flex flex-col items-center"
        >
          <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg mb-4">
            <Download className="h-5 w-5 mr-2" />
            DOWNLOAD NOW
          </Button>
          <p className="text-sm text-muted-foreground">Begin Download</p>
          <div className="flex justify-between w-full mt-4 text-xs text-muted-foreground">
            <span>TSHUB.IN</span>
            <span className="text-primary">Download &gt;</span>
          </div>
        </motion.div>

        {/* Versions Accordion */}
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
                className="bg-card border-2 border-border rounded-2xl overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span className="font-semibold text-foreground text-left">{version.name}</span>
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {downloadingVersion === version.name && progress > 0 && (
                    <div className="mb-4">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Preparing download... {Math.round(progress)}%</p>
                    </div>
                  )}
                  <Button
                    onClick={() => handleDownloadClick(version.link, version.name)}
                    disabled={downloadingVersion === version.name}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-5 rounded-xl"
                  >
                    {downloadingVersion === version.name ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 mr-2" />
                    )}
                    Download ({version.size})
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Join Telegram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Button
            onClick={() => window.open('https://t.me/techshivam', '_blank')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-5 rounded-xl"
          >
            <Send className="h-5 w-5 mr-2" />
            Join Our Telegram channel
          </Button>
        </motion.div>

        {/* Important Notes */}
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
              <span>Some GAMES or APK are specially Optimized and Built for specific Processor Architecture. If you want to know about your CPU and GPU, please use <span className="text-blue-500 font-medium">CPU-Z</span>.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Please use our installation note to know how to install APK files.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <span>If you face any issues, please contact us through Telegram.</span>
            </li>
          </ul>
        </motion.div>
      </main>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuth} 
        onOpenChange={setShowAuth}
      />
      
      {/* Key Generation Dialog */}
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
