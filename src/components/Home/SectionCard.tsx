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

// Each section gets its own color identity
const sectionColors: Record<string, { gradient: string; iconBg: string; shadow: string; border: string }> = {
  Mods: {
    gradient: 'from-[hsl(355,90%,58%)] to-[hsl(330,85%,55%)]',
    iconBg: 'bg-[hsl(355,90%,58%,0.12)]',
    shadow: 'hover:shadow-[0_8px_30px_hsl(355,90%,58%,0.2)]',
    border: 'hover:border-[hsl(355,90%,58%,0.4)]',
  },
  Games: {
    gradient: 'from-[hsl(220,85%,52%)] to-[hsl(250,80%,58%)]',
    iconBg: 'bg-[hsl(220,85%,52%,0.12)]',
    shadow: 'hover:shadow-[0_8px_30px_hsl(220,85%,52%,0.2)]',
    border: 'hover:border-[hsl(220,85%,52%,0.4)]',
  },
  Assets: {
    gradient: 'from-[hsl(160,70%,42%)] to-[hsl(180,65%,40%)]',
    iconBg: 'bg-[hsl(160,70%,42%,0.12)]',
    shadow: 'hover:shadow-[0_8px_30px_hsl(160,70%,42%,0.2)]',
    border: 'hover:border-[hsl(160,70%,42%,0.4)]',
  },
  Bundles: {
    gradient: 'from-[hsl(270,75%,58%)] to-[hsl(290,70%,55%)]',
    iconBg: 'bg-[hsl(270,75%,58%,0.12)]',
    shadow: 'hover:shadow-[0_8px_30px_hsl(270,75%,58%,0.2)]',
    border: 'hover:border-[hsl(270,75%,58%,0.4)]',
  },
  Movies: {
    gradient: 'from-[hsl(42,95%,55%)] to-[hsl(25,95%,55%)]',
    iconBg: 'bg-[hsl(42,95%,55%,0.12)]',
    shadow: 'hover:shadow-[0_8px_30px_hsl(42,95%,55%,0.2)]',
    border: 'hover:border-[hsl(42,95%,55%,0.4)]',
  },
  Courses: {
    gradient: 'from-[hsl(355,90%,58%)] to-[hsl(42,95%,55%)]',
    iconBg: 'bg-[hsl(25,95%,55%,0.12)]',
    shadow: 'hover:shadow-[0_8px_30px_hsl(25,95%,55%,0.2)]',
    border: 'hover:border-[hsl(25,95%,55%,0.4)]',
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.08,
          type: "spring",
          stiffness: 120
        }}
        whileHover={{ y: -6 }}
        className="h-full"
      >
        <Card className={`h-full group relative overflow-hidden border border-border bg-card transition-all duration-300 ${colors.shadow} ${colors.border}`}>
          {/* Colored top accent bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${colors.gradient}`} />
          
          <CardHeader className="relative z-10 pb-3 pt-5">
            <motion.div 
              className={`${colors.iconBg} h-14 w-14 rounded-2xl flex items-center justify-center mb-4`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className={`h-7 w-7 bg-gradient-to-br ${colors.gradient} bg-clip-text`} style={{ color: 'inherit' }} strokeWidth={1.8} />
            </motion.div>
            
            <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 pt-1 pb-5">
            <Button 
              onClick={handleGetStarted} 
              className={`w-full bg-gradient-to-r ${colors.gradient} text-white font-semibold py-5 text-sm rounded-xl group/btn border-0 hover:opacity-90 transition-opacity`}
            >
              <span className="flex items-center gap-2">
                Explore
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
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
