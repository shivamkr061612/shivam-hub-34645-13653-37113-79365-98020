import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Bot, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TechAICard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate('/tech-ai')}
      className="cursor-pointer group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 group-hover:border-[hsl(270,75%,58%,0.4)] group-hover:shadow-[0_8px_40px_hsl(270,75%,58%,0.15)]">
        {/* Gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[hsl(270,75%,58%)] via-[hsl(355,90%,58%)] to-[hsl(42,95%,55%)]" />
        
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Animated icon */}
              <motion.div 
                className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(270,75%,58%)] via-[hsl(355,90%,58%)] to-[hsl(42,95%,55%)] flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bot className="h-7 w-7 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(270,75%,58%)] to-[hsl(355,90%,58%)] blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              </motion.div>
              
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-gradient-to-r from-[hsl(270,75%,58%)] via-[hsl(355,90%,58%)] to-[hsl(42,95%,55%)] bg-clip-text text-transparent">
                    Tech AI
                  </span>
                  <Sparkles className="h-4 w-4 text-[hsl(42,95%,55%)]" />
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Image Gen', 'Code Gen', 'Research', 'Chat'].map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            >
              <ArrowRight className="h-6 w-6" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
