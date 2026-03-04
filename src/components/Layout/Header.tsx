import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, User, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import { ProfileDrawer } from '@/components/Profile/ProfileDrawer';
import { NavigationDrawer } from '@/components/Layout/NavigationDrawer';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { useVerification } from '@/hooks/useVerification';
import { KingBadge } from '@/components/ui/KingBadge';

export function Header() {
  const { user } = useAuth();
  const { settings } = useWebsiteSettings();
  const { isVerified } = useVerification();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
                {user && isVerified && <KingBadge size="lg" />}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl hover:bg-muted"
            >
              {isDark ? <Sun className="h-4 w-4 text-[hsl(42,95%,55%)]" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user ? (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowProfile(true)}
                className="h-9 w-9 rounded-xl hover:bg-primary/10"
              >
                <User className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => setShowAuthDialog(true)} 
                size="sm"
                className="h-8 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <ProfileDrawer open={showProfile} onOpenChange={setShowProfile} />
      <NavigationDrawer open={showNav} onOpenChange={setShowNav} />
    </>
  );
}
