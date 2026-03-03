import { Header } from '@/components/Layout/Header';
import { PromotionalBanner } from '@/components/Home/PromotionalBanner';
import { TrendingSection } from '@/components/Home/TrendingSection';
import { SectionCard, sectionIcons } from '@/components/Home/SectionCard';
import { ChannelPopup } from '@/components/Home/ChannelPopup';
import { HomePopup } from '@/components/Home/HomePopup';
import { TechAICard } from '@/components/Home/TechAICard';
import { QuoteCarousel } from '@/components/Home/QuoteCarousel';
import { AdSlot } from '@/components/Ads/AdSlot';
import { PageTransition } from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';

const Index = () => {
  const { settings } = useWebsiteSettings();

  const sections = [
    { icon: sectionIcons.Mods, title: 'Mods', description: 'Game mods & enhancements', path: '/mods' },
    { icon: sectionIcons.Games, title: 'Games', description: 'Exciting games for all platforms', path: '/games' },
    { icon: sectionIcons.Assets, title: 'Assets', description: 'Premium quality assets', path: '/assets' },
    { icon: sectionIcons.Bundles, title: 'Bundles', description: 'Exclusive bundle packs', path: '/bundles' },
    { icon: sectionIcons.Movies, title: 'Movies', description: 'Movies across all genres', path: 'https://tech-movies.vercel.app/', external: true },
    { icon: sectionIcons.Courses, title: 'Courses', description: 'Learn new skills', path: '/courses' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Header />
        <ChannelPopup />
        <HomePopup />

        <main className="container px-4 pt-4 pb-12 space-y-8 relative z-10 max-w-4xl mx-auto">
          {/* Banner Slider */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <PromotionalBanner />
          </motion.div>

          {/* Ad after banner */}
          <AdSlot position="home_after_banner" />

          {/* Trending / Featured / Updated */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <TrendingSection />
          </motion.div>

          {/* Ad mid page */}
          <AdSlot position="home_middle" />

          {/* Categories */}
          <div>
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl font-bold mb-4">
              <span className="text-foreground">Browse </span>
              <span className="gradient-text-blue">Categories</span>
            </motion.h2>
            <div className="grid grid-cols-3 gap-3">
              {sections.map((section, index) => (
                <SectionCard key={section.title} icon={section.icon} title={section.title} description={section.description} path={section.path} external={section.external} index={index} />
              ))}
            </div>
          </div>

          {/* Tech AI */}
          <TechAICard />

          {/* Quote */}
          <QuoteCarousel />

          {/* Ad bottom */}
          <AdSlot position="home_bottom" />
        </main>

        <footer className="border-t border-border py-8 bg-card/50 relative z-10">
          <div className="container px-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold mb-2 gradient-text">About Us</h3>
                <p className="text-xs text-muted-foreground">{settings.aboutUs}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2 gradient-text-blue">What We Offer</h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {settings.whatWeOffer.split('|').map((item, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2 gradient-text-green">Connect</h3>
                <a href={settings.channelLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/30">
                  Visit Our YouTube Channel
                </a>
              </div>
            </div>
            <div className="border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">Developer: <span className="font-semibold gradient-text">SHIVAM KUMAR</span></p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;