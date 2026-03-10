import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Sun, Moon, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NavigationDrawer } from '@/components/Layout/NavigationDrawer';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { useVerification } from '@/hooks/useVerification';
import { KingBadge } from '@/components/ui/KingBadge';
import { useKeyCountdown } from '@/hooks/useKeyCountdown';

export function Header() {
  const { user } = useAuth();
  const { settings } = useWebsiteSettings();
  const { isVerified } = useVerification();
  const { timeRemaining, hasKey } = useKeyCountdown();
  const [showNav, setShowNav] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm' 
          : 'bg-background/70 backdrop-blur-md'
      }`}>
        <div className="container flex h-14 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNav(true)}
              className="h-9 w-9 rounded-xl hover:bg-primary/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl overflow-hidden ring-1 ring-primary/20">
                <img 
                  src={settings.logoUrl} 
                  alt={`${settings.siteName} Logo`} 
                  className="h-full w-full object-cover"
                />
              </div>
              <h1 className="text-base sm:text-lg font-extrabold gradient-text flex items-center gap-1.5 leading-none">
                {settings.siteName}
                {isVerified && <KingBadge size="lg" />}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Key Countdown */}
            {hasKey && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 mr-1">
                <Clock className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-bold text-accent">{timeRemaining}</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl hover:bg-muted"
            >
              {isDark ? <Sun className="h-4 w-4 text-[hsl(42,95%,55%)]" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <NavigationDrawer open={showNav} onOpenChange={setShowNav} />
    </>
  );
}
