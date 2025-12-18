import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useWinterTheme() {
  const [winterThemeEnabled, setWinterThemeEnabled] = useState(false);
  const [colorTheme, setColorTheme] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docRef = doc(db, 'settings', 'theme');
        const docSnap = await getDoc(docRef);
        
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

    // Listen for real-time updates
    const unsubscribe = onSnapshot(doc(db, 'settings', 'theme'), (doc) => {
      if (doc.exists()) {
        setWinterThemeEnabled(doc.data()?.winterThemeEnabled || false);
        setColorTheme(doc.data()?.colorTheme || 'default');
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply winter theme class to document root
  useEffect(() => {
    if (winterThemeEnabled) {
      document.documentElement.classList.add('winter-theme');
      document.body.classList.add('winter-theme');
    } else {
      document.documentElement.classList.remove('winter-theme');
      document.body.classList.remove('winter-theme');
    }
  }, [winterThemeEnabled]);

  // Apply color theme class
  useEffect(() => {
    // Remove all color theme classes
    document.documentElement.classList.remove('cyber-pink-theme', 'cartoon-theme');
    document.body.classList.remove('cyber-pink-theme', 'cartoon-theme');
    
    if (colorTheme === 'cyber-pink') {
      document.documentElement.classList.add('cyber-pink-theme');
      document.body.classList.add('cyber-pink-theme');
    } else if (colorTheme === 'cartoon') {
      document.documentElement.classList.add('cartoon-theme');
      document.body.classList.add('cartoon-theme');
    }
  }, [colorTheme]);

  return { winterThemeEnabled, colorTheme, loading };
}
