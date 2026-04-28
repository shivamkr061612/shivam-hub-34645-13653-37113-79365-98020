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
  const isBuyBadgeRoute = location.pathname.startsWith('/buy-king-badge') || location.pathname.startsWith('/buy-bluetick');
  const [insidePopup, setInsidePopup] = useState(false);

  // Detect if rendered inside a Dialog / popup
  useEffect(() => {
    if (containerRef.current) {
      const inDialog = !!containerRef.current.closest('[role="dialog"], [data-radix-dialog-content], [data-no-ads]');
      setInsidePopup(inDialog);
    }
  }, []);

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
          // Only render ads in explicitly configured positions (no global fallback)
          const script = ads[position] || '';
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

  // Hide ads on admin routes
  if (isAdminRoute) return null;
  // Hide ads on King Badge purchase pages
  if (isBuyBadgeRoute) return null;
  // Hide ads inside any popup / dialog
  if (insidePopup) return null;
  // Hide ads for King Badge holders
  if (isVerified) return null;
  if (!adScript) return null;

  return (
    <div ref={containerRef} className={`ad-slot w-full ${className}`} data-ad-position={position} />
  );
}
