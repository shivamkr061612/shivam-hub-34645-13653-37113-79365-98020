import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DownloadDialog } from './DownloadDialog';
import { motion } from 'framer-motion';

interface ContentCardProps {
  item: any;
  type: string;
  viewMode: 'grid' | 'list';
}

export function ContentCard({ item, type, viewMode }: ContentCardProps) {
  const [showDownload, setShowDownload] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`group relative overflow-hidden glass-effect border-2 hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
          <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          
          {item.thumbnail && (
            <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'} overflow-hidden`}>
              <img
                src={item.thumbnail}
                alt={item.title}
                className={`w-full object-contain transition-transform duration-300 group-hover:scale-105 ${viewMode === 'list' ? 'h-full rounded-l-lg' : 'h-64 rounded-t-lg bg-card/30'}`}
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
          )}
          
          <div className="flex-1">
            <CardHeader>
              <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                {item.title || 'Untitled'}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {item.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.size && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-secondary" />
                    Size: {item.size}
                  </p>
                )}
                {item.version && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                    Version: {item.version}
                  </p>
                )}
                <Button 
                  onClick={() => setShowDownload(true)} 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-white font-semibold shadow-glow mt-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      <DownloadDialog
        open={showDownload}
        onOpenChange={setShowDownload}
        item={item}
        type={type}
      />
    </>
  );
}
