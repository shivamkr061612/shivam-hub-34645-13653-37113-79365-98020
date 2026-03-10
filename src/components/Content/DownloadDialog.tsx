import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { KeyGenerationDialog } from './KeyGenerationDialog';
import { addDoc, collection, increment, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { useVerification } from '@/hooks/useVerification';

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  type: string;
}

export function DownloadDialog({ open, onOpenChange, item, type }: DownloadDialogProps) {
  const { user } = useAuth();
  const { settings } = useWebsiteSettings();
  const { isVerified } = useVerification();
  const [showKeyGen, setShowKeyGen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open && user) {
      if (isVerified) {
        performDownload();
        return;
      }
      if (!settings.keyGenerationEnabled) {
        performDownload();
      } else if (checkKeyValidity()) {
        performDownload();
      }
    }
  }, [open, settings.keyGenerationEnabled, isVerified]);

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

  const performDownload = async () => {
    if (!item?.downloadUrl) {
      toast.error('Download URL not available');
      onOpenChange(false);
      return;
    }

    setDownloading(true);
    try {
      if (user?.uid) {
        try {
          const userStatsRef = doc(db, 'user_stats', user.uid);
          const userStatsDoc = await getDoc(userStatsRef);
          if (userStatsDoc.exists()) {
            if (userStatsDoc.data()?.banned === true) {
              toast.error('🚫 Your account has been banned. Cannot download.');
              setDownloading(false);
              onOpenChange(false);
              return;
            }
            await updateDoc(userStatsRef, { lastActivity: new Date().toISOString() });
          }
        } catch (error) { console.log('User stats update skipped:', error); }
      }

      try {
        await addDoc(collection(db, 'downloads'), {
          userId: user?.uid,
          userEmail: user?.email || 'anonymous',
          itemId: item.id,
          itemTitle: item.title,
          type: type,
          downloadedAt: new Date().toISOString()
        });
      } catch (error) { console.log('Download tracking skipped:', error); }

      try {
        const itemRef = doc(db, type, item.id);
        await updateDoc(itemRef, { downloadCount: increment(1) });
      } catch (error) { console.log('Download count update skipped:', error); }

      window.open(item.downloadUrl, '_blank');
      toast.success('Download started! ✅');
      onOpenChange(false);
    } catch (error) {
      toast.error('Download failed ❌');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadClick = () => {
    if (isVerified) { performDownload(); return; }
    if (!settings.keyGenerationEnabled) { performDownload(); return; }
    
    const isKeyValid = checkKeyValidity();
    if (!isKeyValid) {
      onOpenChange(false);
      setTimeout(() => setShowKeyGen(true), 100);
      return;
    }
    performDownload();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">{item?.title || 'Download'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{item?.description || ''}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {item?.size && (
              <div className="flex justify-between items-center p-3 rounded-lg bg-card/30 border border-border/50">
                <span className="text-sm text-muted-foreground">Size:</span>
                <span className="text-sm font-semibold text-primary">{item.size}</span>
              </div>
            )}
            {item?.version && (
              <div className="flex justify-between items-center p-3 rounded-lg bg-card/30 border border-border/50">
                <span className="text-sm text-muted-foreground">Version:</span>
                <span className="text-sm font-semibold text-secondary">{item.version}</span>
              </div>
            )}
          </div>

          <Button 
            onClick={handleDownloadClick} 
            disabled={downloading} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6"
          >
            <Download className="h-5 w-5 mr-2" />
            {downloading ? 'Downloading...' : 'Download Now'}
          </Button>
        </DialogContent>
      </Dialog>

      <KeyGenerationDialog
        open={showKeyGen}
        onOpenChange={setShowKeyGen}
        onKeyGenerated={() => {
          setShowKeyGen(false);
          toast.success('🔑 Key activated! Starting download...');
          setTimeout(() => performDownload(), 800);
        }}
        destinationUrl={item?.downloadUrl || 'https://example.com'}
      />
    </>
  );
}
