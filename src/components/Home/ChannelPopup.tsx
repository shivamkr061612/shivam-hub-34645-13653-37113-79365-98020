import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Youtube } from 'lucide-react';

export function ChannelPopup() {
  const [open, setOpen] = useState(false);
  const [channelLink, setChannelLink] = useState('');

  useEffect(() => {
    // Get channel link from localStorage (set by admin)
    const link = localStorage.getItem('channelLink') || '';
    setChannelLink(link);

    // Show popup every 15 seconds
    const interval = setInterval(() => {
      if (link) {
        setOpen(true);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!channelLink) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-500" />
            Subscribe to Our Channel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            Don't miss out on our latest content! Subscribe to our YouTube channel for updates.
          </p>
          
          <Button 
            onClick={() => {
              window.open(channelLink, '_blank');
              setOpen(false);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Youtube className="h-4 w-4 mr-2" />
            Visit Channel
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
