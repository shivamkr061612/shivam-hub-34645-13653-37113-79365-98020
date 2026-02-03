import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Package, Film, GraduationCap, Youtube, Send, MessageSquare, Shield, MessageCircle, Gamepad2, Layers, FolderArchive, Crown, Trophy, Sparkles, FileText, Users, Phone, ScrollText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChannelDialog } from '@/components/Channels/ChannelDialog';
import { useVerification } from '@/hooks/useVerification';

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NavigationDrawer({ open, onOpenChange }: NavigationDrawerProps) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { isVerified } = useVerification();
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

  const mainMenuItems: { icon: any; label: string; path?: string; color: string; external?: boolean; action?: string }[] = [
    { icon: Sparkles, label: 'Tech AI', path: '/tech-ai', color: 'text-primary' },
    { icon: Package, label: 'Mods', path: '/mods', color: 'text-primary' },
    { icon: Gamepad2, label: 'Games', path: '/games', color: 'text-secondary' },
    { icon: Layers, label: 'Assets', path: '/assets', color: 'text-accent' },
    { icon: FolderArchive, label: 'Bundles', path: '/bundles', color: 'text-primary' },
    { icon: Film, label: 'Movies', path: 'https://tech-movies.vercel.app/', external: true, color: 'text-secondary' },
    { icon: GraduationCap, label: 'Courses', path: '/courses', color: 'text-accent' },
  ];

  const communityItems: { icon: any; label: string; path?: string; color: string; external?: boolean; action?: string }[] = [
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', color: 'text-primary' },
    { icon: MessageCircle, label: 'Live Chat', path: '/live-chat', color: 'text-secondary' },
    { icon: Youtube, label: 'Subscribe to Channels', action: 'channels', color: 'text-primary' },
    { icon: Send, label: 'Request Mod', path: '/request-mod', color: 'text-accent' },
  ];

  const legalItems = [
    { icon: FileText, label: 'Privacy Policy', path: '/privacy-policy' },
    { icon: Users, label: 'About Us', path: '/about-us' },
    { icon: Phone, label: 'Contact Us', path: '/contact-us' },
    { icon: ScrollText, label: 'Terms & Conditions', path: '/terms-conditions' },
  ];

  const showBuyBlueTickOption = user && !isVerified;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle className="text-left text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Menu
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            <nav className="space-y-1 pr-4">
              {/* Main Menu */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Browse
              </p>
              {mainMenuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start hover:bg-primary/10"
                  onClick={() => handleNavigation(item.path, item.action, item.external)}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${item.color}`} />
                  {item.label}
                </Button>
              ))}

              {/* Community */}
              <div className="my-4 border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Community
                </p>
                {communityItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start hover:bg-secondary/10"
                    onClick={() => handleNavigation(item.path, item.action, item.external)}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${item.color}`} />
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* King Badge */}
              {showBuyBlueTickOption && (
                <div className="my-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-500/30"
                    onClick={() => handleNavigation('/buy-king-badge')}
                  >
                    <Crown className="h-5 w-5 mr-3 text-yellow-500" />
                    <span className="text-yellow-600 font-semibold">Get King Badge</span>
                  </Button>
                </div>
              )}

              {/* Legal Pages */}
              <div className="my-4 border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Legal
                </p>
                {legalItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                ))}
              </div>

              {/* Admin */}
              {isAdmin && (
                <div className="my-4 border-t pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary hover:bg-primary/10"
                    onClick={() => handleNavigation('/admin')}
                  >
                    <Shield className="h-5 w-5 mr-3" />
                    Admin Panel
                  </Button>
                </div>
              )}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ChannelDialog open={showChannels} onOpenChange={setShowChannels} />
    </>
  );
}
