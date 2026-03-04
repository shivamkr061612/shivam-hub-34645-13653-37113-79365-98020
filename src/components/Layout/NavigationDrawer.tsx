import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Package, Film, GraduationCap, Youtube, Send, MessageCircle, Shield, Gamepad2, Layers, FolderArchive, Crown, Trophy, Sparkles, FileText, Users, Phone, ScrollText, Home, Moon, Sun, Upload, Megaphone, ChevronRight, Zap, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChannelDialog } from '@/components/Channels/ChannelDialog';
import { useVerification } from '@/hooks/useVerification';
import { useTheme } from 'next-themes';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mainGridItems = [
  { icon: Home, label: 'Home', path: '/', color: 'from-[hsl(220,85%,52%)] to-[hsl(250,80%,58%)]', emoji: '🏠' },
  { icon: Gamepad2, label: 'Games', path: '/games', color: 'from-[hsl(355,90%,58%)] to-[hsl(330,85%,55%)]', emoji: '🎮' },
  { icon: Package, label: 'Mods', path: '/mods', color: 'from-[hsl(270,75%,58%)] to-[hsl(290,70%,50%)]', emoji: '⚡' },
  { icon: Layers, label: 'Assets', path: '/assets', color: 'from-[hsl(42,95%,55%)] to-[hsl(25,95%,55%)]', emoji: '🎨' },
  { icon: FolderArchive, label: 'Bundles', path: '/bundles', color: 'from-[hsl(160,70%,42%)] to-[hsl(180,65%,40%)]', emoji: '📦' },
  { icon: GraduationCap, label: 'Courses', path: '/courses', color: 'from-[hsl(25,95%,55%)] to-[hsl(15,90%,50%)]', emoji: '📚' },
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

  const menuItems = [
    { icon: Upload, label: 'Upload Content', path: '/user-upload', color: 'text-[hsl(220,85%,52%)]' },
    { icon: Megaphone, label: 'Promote Channel', path: '/promotions', color: 'text-[hsl(25,95%,55%)]' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', color: 'text-[hsl(42,95%,55%)]' },
    { icon: MessageCircle, label: 'Live Chat', path: '/live-chat', color: 'text-[hsl(160,70%,42%)]' },
    { icon: Youtube, label: 'Subscribe Channels', action: 'channels', color: 'text-[hsl(355,90%,58%)]' },
    { icon: Send, label: 'Request Mod', path: '/request-mod', color: 'text-[hsl(220,85%,52%)]' },
    { icon: Sparkles, label: 'Tech AI', path: '/tech-ai', color: 'text-[hsl(270,75%,58%)]' },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 overflow-hidden border-r border-border/50 bg-background">
          {/* Header with gradient */}
          <div className="relative px-5 pt-5 pb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary/5 to-transparent" />
            <SheetHeader className="relative">
              <SheetTitle className="text-left flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-lg">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-lg font-extrabold gradient-text block leading-tight">{settings.siteName}</span>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">The Ultimate Hub</span>
                </div>
              </SheetTitle>
            </SheetHeader>
          </div>

          <ScrollArea className="h-[calc(100vh-90px)]">
            <div className="px-4 pb-6 space-y-5">
              {/* Category Grid */}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2.5 px-1">Categories</p>
                <div className="grid grid-cols-3 gap-2">
                  {mainGridItems.map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`relative bg-gradient-to-br ${item.color} rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 text-white shadow-md hover:shadow-xl hover:scale-[1.04] active:scale-95 transition-all duration-200`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[11px] font-bold tracking-wide">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 text-[hsl(42,95%,55%)]" />
                      <span className="text-xs font-semibold">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-[hsl(270,75%,58%)]" />
                      <span className="text-xs font-semibold">Dark Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Menu Items */}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2 px-1">Quick Access</p>
                <div className="space-y-0.5">
                  {menuItems.map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.03 }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 active:bg-muted transition-colors group"
                      onClick={() => handleNavigation(item.path, item.action)}
                    >
                      <item.icon className={`h-[18px] w-[18px] ${item.color}`} />
                      <span className="text-sm font-medium text-foreground flex-1 text-left">{item.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* King Badge CTA */}
              {showBuyBlueTickOption && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => handleNavigation('/buy-king-badge')}
                  className="w-full relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-[hsl(42,95%,55%)] to-[hsl(25,95%,55%)] text-white shadow-lg"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:200%_200%] animate-[shimmer_2s_infinite]" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">Get King Badge 👑</p>
                      <p className="text-[10px] opacity-80">Premium benefits & blue tick</p>
                    </div>
                    <ChevronRight className="h-5 w-5 ml-auto opacity-70" />
                  </div>
                </motion.button>
              )}

              {/* Social Buttons */}
              <div className="flex gap-3 justify-center pt-1">
                <button
                  onClick={() => window.open(settings.telegramLink || 'https://t.me/techshivam', '_blank')}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(220,85%,52%)] to-[hsl(210,85%,42%)] flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { navigate('/contact'); onOpenChange(false); }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(160,70%,42%)] to-[hsl(145,65%,35%)] flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Legal Links */}
              <div className="border-t border-border/50 pt-3">
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { icon: FileText, label: 'Privacy', path: '/privacy-policy' },
                    { icon: Users, label: 'About', path: '/about-us' },
                    { icon: Phone, label: 'Contact', path: '/contact-us' },
                    { icon: ScrollText, label: 'Terms', path: '/terms-conditions' },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => handleNavigation(item.path)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <item.icon className="h-3 w-3" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin */}
              {isAdmin && (
                <div className="pt-1">
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors"
                  >
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-bold text-primary">Admin Panel</span>
                    <ChevronRight className="h-4 w-4 text-primary/50 ml-auto" />
                  </button>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ChannelDialog open={showChannels} onOpenChange={setShowChannels} />
    </>
  );
}
