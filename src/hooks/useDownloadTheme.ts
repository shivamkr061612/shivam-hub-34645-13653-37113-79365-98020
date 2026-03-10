import { useMemo } from 'react';

const themes = [
  { 
    name: 'Sunset', 
    bg: 'from-orange-500/10 via-rose-500/5 to-purple-500/10',
    accent: 'from-orange-500 to-rose-500',
    border: 'border-orange-300 dark:border-orange-800',
    card: 'bg-orange-50/50 dark:bg-orange-950/20'
  },
  { 
    name: 'Ocean', 
    bg: 'from-cyan-500/10 via-blue-500/5 to-indigo-500/10',
    accent: 'from-cyan-500 to-blue-500',
    border: 'border-cyan-300 dark:border-cyan-800',
    card: 'bg-cyan-50/50 dark:bg-cyan-950/20'
  },
  { 
    name: 'Forest', 
    bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
    accent: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-300 dark:border-emerald-800',
    card: 'bg-emerald-50/50 dark:bg-emerald-950/20'
  },
  { 
    name: 'Lavender', 
    bg: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10',
    accent: 'from-violet-500 to-fuchsia-500',
    border: 'border-violet-300 dark:border-violet-800',
    card: 'bg-violet-50/50 dark:bg-violet-950/20'
  },
  { 
    name: 'Cherry', 
    bg: 'from-pink-500/10 via-rose-500/5 to-red-500/10',
    accent: 'from-pink-500 to-red-500',
    border: 'border-pink-300 dark:border-pink-800',
    card: 'bg-pink-50/50 dark:bg-pink-950/20'
  },
  { 
    name: 'Gold', 
    bg: 'from-amber-500/10 via-yellow-500/5 to-orange-500/10',
    accent: 'from-amber-500 to-yellow-500',
    border: 'border-amber-300 dark:border-amber-800',
    card: 'bg-amber-50/50 dark:bg-amber-950/20'
  },
  { 
    name: 'Midnight', 
    bg: 'from-slate-500/10 via-gray-500/5 to-zinc-500/10',
    accent: 'from-slate-600 to-zinc-600',
    border: 'border-slate-300 dark:border-slate-700',
    card: 'bg-slate-50/50 dark:bg-slate-950/20'
  },
  { 
    name: 'Neon', 
    bg: 'from-lime-500/10 via-green-500/5 to-cyan-500/10',
    accent: 'from-lime-500 to-cyan-500',
    border: 'border-lime-300 dark:border-lime-800',
    card: 'bg-lime-50/50 dark:bg-lime-950/20'
  },
];

export function useDownloadTheme() {
  const theme = useMemo(() => {
    const index = Math.floor(Math.random() * themes.length);
    return themes[index];
  }, []);

  return theme;
}
