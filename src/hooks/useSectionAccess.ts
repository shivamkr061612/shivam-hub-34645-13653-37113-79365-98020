import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SectionSettings {
  [key: string]: {
    locked: boolean;
    premium: boolean;
  };
}

export function useSectionAccess(sectionId: string) {
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'sections');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const settings = docSnap.data() as SectionSettings;
          if (settings[sectionId]) {
            setIsLocked(settings[sectionId].locked || false);
            setIsPremium(settings[sectionId].premium || false);
          }
        }
      } catch (error) {
        console.error('Error fetching section settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [sectionId]);

  return { loading, isLocked, isPremium };
}
