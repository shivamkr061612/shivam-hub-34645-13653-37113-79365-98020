import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/Auth/AuthDialog';
import { Gamepad2, Puzzle, Package, Film, GraduationCap, FolderOpen, ArrowRight, LucideIcon } from 'lucide-react';

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  index: number;
  external?: boolean;
}

const sectionColors: Record<string, { gradient: string; iconBg: string; shadow: string; border: string; btnGradient: string }> = {
  Mods: {
    gradient: 'from-[hsl(355,90%,58%)] to-[hsl(330,85%,55%)]',
    iconBg: 'bg-[hsl(355,90%,58%,0.1)]',
    shadow: 'hover:shadow-[0_4px_20px_hsl(355,90%,58%,0.15)]',
    border: 'hover:border-[hsl(355,90%,58%,0.3)]',
    btnGradient: 'from-[hsl(355,90%,58%)] to-[hsl(330,85%,55%)]',
  },
  Games: {
    gradient: 'from-[hsl(220,85%,52%)] to-[hsl(250,80%,58%)]',
    iconBg: 'bg-[hsl(220,85%,52%,0.1)]',
    shadow: 'hover:shadow-[0_4px_20px_hsl(220,85%,52%,0.15)]',
    border: 'hover:border-[hsl(220,85%,52%,0.3)]',
    btnGradient: 'from-[hsl(220,85%,52%)] to-[hsl(250,80%,58%)]',
  },
  Assets: {
    gradient: 'from-[hsl(160,70%,42%)] to-[hsl(180,65%,40%)]',
    iconBg: 'bg-[hsl(160,70%,42%,0.1)]',
    shadow: 'hover:shadow-[0_4px_20px_hsl(160,70%,42%,0.15)]',
    border: 'hover:border-[hsl(160,70%,42%,0.3)]',
    btnGradient: 'from-[hsl(160,70%,42%)] to-[hsl(180,65%,40%)]',
  },
  Bundles: {
    gradient: 'from-[hsl(270,75%,58%)] to-[hsl(290,70%,55%)]',
    iconBg: 'bg-[hsl(270,75%,58%,0.1)]',
    shadow: 'hover:shadow-[0_4px_20px_hsl(270,75%,58%,0.15)]',
    border: 'hover:border-[hsl(270,75%,58%,0.3)]',
    btnGradient: 'from-[hsl(270,75%,58%)] to-[hsl(290,70%,55%)]',
  },
  Movies: {
    gradient: 'from-[hsl(42,95%,55%)] to-[hsl(25,95%,55%)]',
    iconBg: 'bg-[hsl(42,95%,55%,0.1)]',
    shadow: 'hover:shadow-[0_4px_20px_hsl(42,95%,55%,0.15)]',
    border: 'hover:border-[hsl(42,95%,55%,0.3)]',
    btnGradient: 'from-[hsl(42,95%,55%)] to-[hsl(25,95%,55%)]',
  },
  Courses: {
    gradient: 'from-[hsl(25,95%,55%)] to-[hsl(355,90%,58%)]',
    iconBg: 'bg-[hsl(25,95%,55%,0.1)]',
    shadow: 'hover:shadow-[0_4px_20px_hsl(25,95%,55%,0.15)]',
    border: 'hover:border-[hsl(25,95%,55%,0.3)]',
    btnGradient: 'from-[hsl(25,95%,55%)] to-[hsl(355,90%,58%)]',
  },
};

export function SectionCard({ icon: Icon, title, description, path, index, external }: SectionCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const colors = sectionColors[title] || sectionColors.Mods;

  const handleGetStarted = () => {
    if (external) {
      window.open(path, '_blank');
      return;
    }
    if (!user) {
      setShowAuth(true);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, type: "spring", stiffness: 150 }}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card className={`h-full group relative overflow-hidden glass-card rounded-2xl transition-all duration-300 ${colors.shadow} ${colors.border} cursor-pointer`}
          onClick={handleGetStarted}
        >
          {/* Colored top accent bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${colors.gradient}`} />

          {/* Subtle gradient glow on hover */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${colors.gradient} pointer-events-none`} style={{ mixBlendMode: 'overlay' }} />

          <CardHeader className="relative z-10 pb-2 pt-4 px-3">
            <motion.div 
              className={`${colors.iconBg} h-12 w-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-md border border-white/10 shadow-sm`}
              whileHover={{ scale: 1.12, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="h-6 w-6" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
            </motion.div>
            
            <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 pt-1 pb-4 px-3">
            <Button 
              onClick={(e) => { e.stopPropagation(); handleGetStarted(); }} 
              size="sm"
              className={`bg-gradient-to-r ${colors.btnGradient} text-white font-semibold text-xs rounded-xl border-0 hover:opacity-90 hover:shadow-lg transition-all h-8 px-3`}
            >
              <span className="flex items-center gap-1.5">
                Explore
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      
      <AuthDialog 
        open={showAuth} 
        onOpenChange={(open) => {
          setShowAuth(open);
          if (!open && user) navigate(path);
        }} 
      />
    </>
  );
}

export const sectionIcons = {
  Mods: Puzzle,
  Games: Gamepad2,
  Assets: FolderOpen,
  Bundles: Package,
  Movies: Film,
  Courses: GraduationCap
};
