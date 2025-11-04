import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function WinterSnow() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Generate 100 snowflakes with random properties for more immersive effect
    const flakes: Snowflake[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 12,
      size: 2 + Math.random() * 6,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            top: '-10px',
            background: `radial-gradient(circle, 
              hsl(200 100% 95% / 0.9) 0%, 
              hsl(200 100% 90% / 0.7) 50%, 
              hsl(200 80% 85% / 0.5) 100%)`,
            boxShadow: `
              0 0 ${flake.size * 2}px hsl(200 100% 95% / 0.8),
              0 0 ${flake.size * 4}px hsl(200 90% 90% / 0.4),
              0 0 ${flake.size * 6}px hsl(180 80% 85% / 0.2)
            `,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.random() * 100 - 50, Math.random() * 50 - 25],
            rotate: [0, 360],
            opacity: [0, 0.9, 0.9, 0],
            scale: [0.8, 1, 1, 0.8],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
