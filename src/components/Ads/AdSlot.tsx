import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useVerification } from '@/hooks/useVerification';
import { useLocation } from 'react-router-dom';

interface AdSlotProps {
  position: string;
  className?: string;
}

export function AdSlot({ position, className = '' }: AdSlotProps) {
  const [adScript, setAdScript] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { isVerified } = useVerification();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const docRef = doc(db, 'settings', 'ads');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const ads = docSnap.data();
          // Check global ads toggle
          if (ads._adsEnabled === false) {
            setAdScript('');
            return;
          }
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
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = script.textContent;
        script.parentNode?.replaceChild(newScript, script);
      });
    }
  }, [adScript]);

  // Hide ads for King Badge holders
  if (isVerified) return null;
  if (!adScript) return null;

  return (
    <div ref={containerRef} className={`ad-slot w-full ${className}`} data-ad-position={position} />
  );
}
