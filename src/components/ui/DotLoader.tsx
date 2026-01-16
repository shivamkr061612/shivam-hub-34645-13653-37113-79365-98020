import { motion } from 'framer-motion';

interface DotLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DotLoader({ size = 'md', className = '' }: DotLoaderProps) {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const containerSizes = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  return (
    <div className={`flex items-center justify-center ${containerSizes[size]} ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${dotSizes[size]} rounded-full bg-primary`}
          animate={{
            y: [-4, 4, -4],
            opacity: [1, 0.5, 1],
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
