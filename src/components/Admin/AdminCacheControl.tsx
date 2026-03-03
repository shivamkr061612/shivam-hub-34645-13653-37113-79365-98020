import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, RefreshCw, HardDrive, Database } from 'lucide-react';

export function AdminCacheControl() {
  const clearBrowserCache = () => {
    // Clear localStorage
    const keysToKeep = ['theme']; // Keep essential keys
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
      });
    }

    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    toast.success('Browser cache cleared! Page will reload.');
    setTimeout(() => window.location.reload(), 1000);
  };

  const clearImageCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('image') || name.includes('media')) {
            caches.delete(name);
          }
        });
      });
    }
    toast.success('Image cache cleared!');
  };

  const forceReload = () => {
    // Force hard reload
    window.location.href = window.location.href.split('?')[0] + '?cache_bust=' + Date.now();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          Cache & Performance
        </CardTitle>
        <CardDescription>Clear website cache to improve performance and fix stale data issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={clearBrowserCache}
            variant="outline"
            className="h-24 flex flex-col items-center gap-2 rounded-xl border-destructive/30 hover:bg-destructive/5"
          >
            <Trash2 className="h-6 w-6 text-destructive" />
            <div className="text-center">
              <p className="font-semibold">Clear All Cache</p>
              <p className="text-xs text-muted-foreground">LocalStorage, SessionStorage, Service Workers</p>
            </div>
          </Button>

          <Button
            onClick={clearImageCache}
            variant="outline"
            className="h-24 flex flex-col items-center gap-2 rounded-xl border-orange-500/30 hover:bg-orange-500/5"
          >
            <Database className="h-6 w-6 text-orange-500" />
            <div className="text-center">
              <p className="font-semibold">Clear Image Cache</p>
              <p className="text-xs text-muted-foreground">Cached images and media files</p>
            </div>
          </Button>

          <Button
            onClick={forceReload}
            variant="outline"
            className="h-24 flex flex-col items-center gap-2 rounded-xl border-blue-500/30 hover:bg-blue-500/5 md:col-span-2"
          >
            <RefreshCw className="h-6 w-6 text-blue-500" />
            <div className="text-center">
              <p className="font-semibold">Force Hard Reload</p>
              <p className="text-xs text-muted-foreground">Bypass all caches and reload fresh</p>
            </div>
          </Button>
        </div>

        <div className="p-4 bg-muted/30 rounded-xl border text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">💡 Tips:</p>
          <ul className="space-y-1 list-disc pl-4">
            <li>Clear cache when users report seeing old data</li>
            <li>Clear image cache if images aren't updating</li>
            <li>Force reload bypasses browser cache completely</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}