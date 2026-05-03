import { Header } from '@/components/Layout/Header';
import { PromotionalBanner } from '@/components/Home/PromotionalBanner';
import { TrendingSection } from '@/components/Home/TrendingSection';
import { SectionCard, sectionIcons } from '@/components/Home/SectionCard';
import { ChannelPopup } from '@/components/Home/ChannelPopup';
import { HomePopup } from '@/components/Home/HomePopup';
import { TechAICard } from '@/components/Home/TechAICard';
import { QuoteCarousel } from '@/components/Home/QuoteCarousel';
import { AdSlot } from '@/components/Ads/AdSlot';
import { KingBadgePrompt } from '@/components/Ads/KingBadgePrompt';
import { PageTransition } from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  const { settings } = useWebsiteSettings();

  const sections = [
    { icon: sectionIcons.Mods, title: 'Mods', description: 'Premium mods', path: '/mods' },
    { icon: sectionIcons.Games, title: 'Games', description: 'Top games', path: '/games' },
    { icon: sectionIcons.Assets, title: 'Assets', description: 'Quality assets', path: '/assets' },
    { icon: sectionIcons.Bundles, title: 'Bundles', description: 'Bundle packs', path: '/bundles' },
    { icon: sectionIcons.Movies, title: 'Movies', description: 'All genres', path: 'https://tech-movies.vercel.app/', external: true },
    { icon: sectionIcons.Courses, title: 'Courses', description: 'Learn skills', path: '/courses' },
  ];

  return (
    <div className="min-h-screen relative">
      <Header />
      <ChannelPopup />
      <HomePopup />
      <KingBadgePrompt />

      <main className="container px-3 sm:px-4 pt-3 pb-10 space-y-6 relative z-10 max-w-4xl mx-auto animate-fade-in">
        {/* Banner */}
        <PromotionalBanner />

        <AdSlot position="home_after_banner" />

        {/* Trending */}
        <TrendingSection />

        <AdSlot position="home_middle" />

        {/* Categories */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary via-secondary to-accent" />
            <h2 className="text-lg font-extrabold gradient-text">Categories</h2>
          </div>
            <div className="grid grid-cols-3 gap-3">
              {sections.map((section, index) => (
                <SectionCard key={section.title} icon={section.icon} title={section.title} description={section.description} path={section.path} external={section.external} index={index} />
              ))}
            </div>
          </div>

          <AdSlot position="home_after_categories" />

          {/* Tech AI */}
          <TechAICard />

          {/* Quote */}
          <QuoteCarousel />

          <AdSlot position="home_bottom" />
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-6 bg-card/30 relative z-10">
          <div className="container px-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
              <div>
                <h3 className="text-xs font-bold mb-1.5 gradient-text uppercase tracking-wider">About</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{settings.aboutUs}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold mb-1.5 gradient-text-blue uppercase tracking-wider">What We Offer</h3>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  {settings.whatWeOffer.split('|').map((item, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold mb-1.5 gradient-text-green uppercase tracking-wider">Connect</h3>
                <a href={settings.channelLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/30">
                  <ExternalLink className="h-3 w-3" /> YouTube Channel
                </a>
              </div>
            </div>
            <div className="border-t border-border/50 pt-3 text-center">
              <p className="text-[10px] text-muted-foreground">Made with ❤️ by <span className="font-bold gradient-text">SHIVAM KUMAR</span></p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
