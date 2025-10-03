import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Youtube, Send } from 'lucide-react';

interface ChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChannelDialog({ open, onOpenChange }: ChannelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to Our Channels</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Youtube className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Tech Shivam</h3>
              <p className="text-sm text-muted-foreground">YouTube Channel</p>
            </div>
            <Button
              size="sm"
              onClick={() => window.open('https://youtube.com/@techshivam06?si=yZyw2Tpt60ZA6lR5', '_blank')}
            >
              Subscribe
            </Button>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Send className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Tech Shivam Main</h3>
              <p className="text-sm text-muted-foreground">Telegram Channel</p>
            </div>
            <Button
              size="sm"
              onClick={() => window.open('https://t.me/+FSWElNbfXwdjYWNl', '_blank')}
            >
              Join
            </Button>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Send className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Tech Shivam 2</h3>
              <p className="text-sm text-muted-foreground">Telegram Channel</p>
            </div>
            <Button
              size="sm"
              onClick={() => window.open('https://t.me/techshivam2', '_blank')}
            >
              Join
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
