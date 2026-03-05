import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const allThemeClasses = [
  'cyber-pink-theme', 'spring-theme', 'summer-theme', 'autumn-theme',
  'winter-theme-colors', 'diwali-theme', 'holi-theme', 'christmas-theme',
  'newyear-theme', 'valentine-theme', 'independence-theme', 'ocean-theme',
  'sunset-theme', 'midnight-theme'
];

export function useWinterTheme() {
  const [winterThemeEnabled, setWinterThemeEnabled] = useState(false);
  const [colorTheme, setColorTheme] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'theme'));
        if (docSnap.exists()) {
          setWinterThemeEnabled(docSnap.data()?.winterThemeEnabled || false);
          setColorTheme(docSnap.data()?.colorTheme || 'default');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching theme:', error);
        setLoading(false);
      }
    };

    fetchTheme();

    const unsubscribe = onSnapshot(doc(db, 'settings', 'theme'), (doc) => {
      if (doc.exists()) {
        setWinterThemeEnabled(doc.data()?.winterThemeEnabled || false);
        setColorTheme(doc.data()?.colorTheme || 'default');
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply snow effect
  useEffect(() => {
    if (winterThemeEnabled) {
      document.documentElement.classList.add('winter-theme');
      document.body.classList.add('winter-theme');
    } else {
      document.documentElement.classList.remove('winter-theme');
      document.body.classList.remove('winter-theme');
    }
  }, [winterThemeEnabled]);

  // Apply color theme
  useEffect(() => {
    // Remove all theme classes
    allThemeClasses.forEach(cls => {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    });
    
    if (colorTheme && colorTheme !== 'default') {
      const cls = `${colorTheme}-theme`;
      if (allThemeClasses.includes(cls)) {
        document.documentElement.classList.add(cls);
        document.body.classList.add(cls);
      }
    }
  }, [colorTheme]);

  return { winterThemeEnabled, colorTheme, loading };
}
