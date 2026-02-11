import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Package, Film, GraduationCap, Youtube, Send, MessageCircle, Shield, Gamepad2, Layers, FolderArchive, Crown, Trophy, Sparkles, FileText, Users, Phone, ScrollText, Home, Moon, Sun, Upload, Megaphone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChannelDialog } from '@/components/Channels/ChannelDialog';
import { useVerification } from '@/hooks/useVerification';
import { useTheme } from 'next-themes';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mainGridItems = [
  { icon: Home, label: 'Home', path: '/', bgClass: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { icon: Gamepad2, label: 'Games', path: '/games', bgClass: 'bg-gradient-to-br from-red-400 to-red-600' },
  { icon: Package, label: 'Mods', path: '/mods', bgClass: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  { icon: Layers, label: 'Assets', path: '/assets', bgClass: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
  { icon: FolderArchive, label: 'Bundles', path: '/bundles', bgClass: 'bg-gradient-to-br from-green-400 to-green-600' },
  { icon: GraduationCap, label: 'Courses', path: '/courses', bgClass: 'bg-gradient-to-br from-orange-400 to-orange-600' },
];

export function NavigationDrawer({ open, onOpenChange }: NavigationDrawerProps) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { isVerified } = useVerification();
  const { theme, setTheme } = useTheme();
  const { settings } = useWebsiteSettings();
  const [showChannels, setShowChannels] = useState(false);

  const handleNavigation = (path?: string, action?: string, external?: boolean) => {
    if (action === 'channels') {
      setShowChannels(true);
    } else if (external && path) {
      window.open(path, '_blank');
      onOpenChange(false);
    } else if (path) {
      navigate(path);
      onOpenChange(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const showBuyBlueTickOption = user && !isVerified;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[320px] p-0 overflow-hidden">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className="text-left text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center gap-3">
              <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              {settings.siteName}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-100px)] px-4">
            {/* Colorful Grid Menu */}
            <div className="grid grid-cols-2 gap-3 px-2 mb-6">
              {mainGridItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`${item.bgClass} h-24 flex flex-col items-center justify-center gap-2 rounded-2xl text-white hover:opacity-90 hover:scale-105 transition-all shadow-lg`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-8 w-8" />
                  <span className="font-semibold text-base">{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Tech AI + Dark Mode Toggle */}
            <div className="grid grid-cols-2 gap-3 px-2 mb-6">
              <Button
                variant="ghost"
                className="bg-gradient-to-br from-teal-400 to-cyan-600 h-20 flex flex-col items-center justify-center gap-2 rounded-2xl text-white hover:opacity-90 transition-all shadow-lg"
                onClick={() => handleNavigation('/tech-ai')}
              >
                <Sparkles className="h-7 w-7" />
                <span className="font-semibold">Tech AI</span>
              </Button>
              <Button
                variant="ghost"
                className={`${theme === 'dark' ? 'bg-gradient-to-br from-indigo-500 to-purple-700' : 'bg-gradient-to-br from-orange-400 to-yellow-500'} h-20 flex flex-col items-center justify-center gap-2 rounded-2xl text-white hover:opacity-90 transition-all shadow-lg`}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun className="h-7 w-7" /> : <Moon className="h-7 w-7" />}
                <span className="font-semibold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </Button>
            </div>

            {/* User Actions */}
            <div className="px-2 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Upload & Earn
              </p>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-primary/10 rounded-xl h-12"
                  onClick={() => handleNavigation('/user-upload')}
                >
                  <Upload className="h-5 w-5 mr-3 text-blue-500" />
                  Upload Content
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-primary/10 rounded-xl h-12"
                  onClick={() => handleNavigation('/promotions')}
                >
                  <Megaphone className="h-5 w-5 mr-3 text-orange-500" />
                  Promote Channel
                </Button>
              </div>
            </div>

            {/* Community Section */}
            <div className="px-2 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Community
              </p>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-primary/10 rounded-xl h-12"
                  onClick={() => handleNavigation('/leaderboard')}
                >
                  <Trophy className="h-5 w-5 mr-3 text-yellow-500" />
                  Leaderboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-secondary/10 rounded-xl h-12"
                  onClick={() => handleNavigation('/live-chat')}
                >
                  <MessageCircle className="h-5 w-5 mr-3 text-green-500" />
                  Live Chat
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-primary/10 rounded-xl h-12"
                  onClick={() => handleNavigation(undefined, 'channels')}
                >
                  <Youtube className="h-5 w-5 mr-3 text-red-500" />
                  Subscribe to Channels
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-accent/10 rounded-xl h-12"
                  onClick={() => handleNavigation('/request-mod')}
                >
                  <Send className="h-5 w-5 mr-3 text-blue-500" />
                  Request Mod
                </Button>
              </div>
            </div>

            {/* King Badge */}
            {showBuyBlueTickOption && (
              <div className="px-2 mb-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-500/30 rounded-xl h-14"
                  onClick={() => handleNavigation('/buy-king-badge')}
                >
                  <Crown className="h-6 w-6 mr-3 text-yellow-500" />
                  <span className="text-yellow-600 font-bold text-base">Get King Badge 👑</span>
                </Button>
              </div>
            )}

            {/* External Links - Telegram (admin-configurable) + WhatsApp (opens contact support) */}
            <div className="px-2 mb-4 flex justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 hover:opacity-90 text-white shadow-lg"
                onClick={() => window.open(settings.telegramLink || 'https://t.me/techshivam', '_blank')}
              >
                <Send className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 hover:opacity-90 text-white shadow-lg"
                onClick={() => {
                  navigate('/contact');
                  onOpenChange(false);
                }}
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
            </div>

            {/* Legal Pages */}
            <div className="px-2 mb-4 border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Legal
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleNavigation('/privacy-policy')}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Privacy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleNavigation('/about-us')}
                >
                  <Users className="h-3 w-3 mr-1" />
                  About
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleNavigation('/contact-us')}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Contact
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleNavigation('/terms-conditions')}
                >
                  <ScrollText className="h-3 w-3 mr-1" />
                  Terms
                </Button>
              </div>
            </div>

            {/* Admin */}
            {isAdmin && (
              <div className="px-2 pb-6 border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-primary/10 hover:bg-primary/20 text-primary rounded-xl h-12"
                  onClick={() => handleNavigation('/admin')}
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Admin Panel
                </Button>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ChannelDialog open={showChannels} onOpenChange={setShowChannels} />
    </>
  );
}
