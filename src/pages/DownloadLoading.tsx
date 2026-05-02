import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Progress } from '@/components/ui/progress';
import { Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { addDoc, collection, increment, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useDownloadTheme } from '@/hooks/useDownloadTheme';
import { AdSlot } from '@/components/Ads/AdSlot';
import { getItemSlug } from '@/lib/slug';

export default function DownloadLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useDownloadTheme();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparing your download...');

  const { item, version, type } = location.state || {};

  useEffect(() => {
    if (!item || !version) {
      navigate('/');
      return;
    }

    const trackAndRedirect = async () => {
      setStatus('Verifying download link...');
      await delay(800);
      setProgress(20);

      setStatus('Processing request...');
      if (user) {
        try {
          await addDoc(collection(db, 'downloads'), {
            userId: user.uid,
            userEmail: user.email || 'anonymous',
            itemId: item.id,
            itemTitle: item.title,
            versionName: version.name,
            type,
            downloadedAt: new Date().toISOString()
          });
        } catch (e) { console.log('Track skipped', e); }

        try {
          const itemRef = doc(db, type, item.id);
          await updateDoc(itemRef, { downloadCount: increment(1) });
        } catch (e) { console.log('Count update skipped', e); }
      }
      setProgress(50);

      setStatus('Generating download link...');
      await delay(1000);
      setProgress(80);

      setStatus('Almost ready...');
      await delay(600);
      setProgress(100);

      await delay(400);
      navigate(`/download-link/${type}/${getItemSlug(item)}`, {
        state: { item, version, type },
        replace: true
      });
    };

    trackAndRedirect();
  }, []);

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} bg-background`}>
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-12 max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${theme.card} border-2 ${theme.border} rounded-2xl p-8 text-center`}
        >
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center mx-auto mb-6`}>
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">Preparing Download</h2>
          <p className="text-sm text-muted-foreground mb-1">{version?.name}</p>
          <p className="text-xs text-muted-foreground mb-6">{status}</p>

          <Progress value={progress} className="h-3 mb-3" />
          <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span>Secure & Safe Download</span>
          </div>
        </motion.div>

        <AdSlot position="download_loading" className="mt-6" />
      </main>
    </div>
  );
}
