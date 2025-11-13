import { useState, useEffect } from 'react';
import { usePopupSettings } from '@/hooks/usePopupSettings';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const getTextColorClass = (color: string) => {
  switch (color) {
    case 'primary':
      return 'text-primary';
    case 'red':
      return 'text-red-500';
    case 'blue':
      return 'text-blue-500';
    case 'green':
      return 'text-green-500';
    default:
      return 'text-foreground';
  }
};

const getFontFamilyClass = (font: string) => {
  switch (font) {
    case 'serif':
      return 'font-serif';
    case 'mono':
      return 'font-mono';
    case 'sans':
      return 'font-sans';
    case 'cursive':
      return 'font-[cursive]';
    default:
      return '';
  }
};

export function HomePopup() {
  const { settings, loading } = usePopupSettings();
  const { settings: websiteSettings } = useWebsiteSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!loading && settings.enabled && settings.text) {
      setIsVisible(true);
    }
  }, [loading, settings]);

  if (!isVisible || loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <img 
            src={websiteSettings.logoUrl} 
            alt={websiteSettings.siteName}
            className="h-10 w-10 object-contain rounded"
          />
          <h3 className="font-bold text-lg gradient-text">{websiteSettings.siteName}</h3>
        </div>

        <p
          className={`text-base leading-relaxed ${getTextColorClass(settings.textColor)} ${getFontFamilyClass(settings.fontFamily)}`}
        >
          {settings.text}
        </p>

        {settings.linkUrl && settings.linkName && (
          <div className="flex items-center justify-between pt-2 border-t">
            <a
              href={settings.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              {settings.linkName}
            </a>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              Close
            </Button>
          </div>
        )}

        {(!settings.linkUrl || !settings.linkName) && (
          <div className="flex justify-end pt-2 border-t">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
