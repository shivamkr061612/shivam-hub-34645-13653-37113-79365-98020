import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdSlotProps {
  position: string;
  className?: string;
}

export function AdSlot({ position, className = '' }: AdSlotProps) {
  const [adScript, setAdScript] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const docRef = doc(db, 'settings', 'ads');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const ads = docSnap.data();
          // Check for position-specific ad or global ad
          const script = ads[position] || ads['global'] || '';
          setAdScript(script);
        }
      } catch (error) {
        // Silently fail for ads
      }
    };
    fetchAd();
  }, [position]);

  useEffect(() => {
    if (adScript && containerRef.current) {
      containerRef.current.innerHTML = adScript;
      // Execute scripts
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = script.textContent;
        script.parentNode?.replaceChild(newScript, script);
      });
    }
  }, [adScript]);

  if (!adScript) return null;

  return (
    <div ref={containerRef} className={`ad-slot w-full ${className}`} data-ad-position={position} />
  );
}