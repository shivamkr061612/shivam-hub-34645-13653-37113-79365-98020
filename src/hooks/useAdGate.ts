import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useVerification } from './useVerification';

const MAX_CLICKS_WITH_AD = 2;

/**
 * useAdGate - call `triggerAd(action)` from any button to show a popunder/redirect ad
 * the first 2 clicks. After 2 ads on the same button, the action runs without the ad.
 *
 * Stored per-buttonKey in localStorage.
 */
export function useAdGate(buttonKey: string) {
  const { isVerified } = useVerification();
  const [popunderUrl, setPopunderUrl] = useState<string>('');
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'ads'));
        if (snap.exists()) {
          const ads = snap.data() as Record<string, any>;
          if (ads._adsEnabled === false) setAdsEnabled(false);
          // optional dedicated popunder URL admins can configure
          if (typeof ads.popunderUrl === 'string') setPopunderUrl(ads.popunderUrl);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const getCount = () =>
    parseInt(localStorage.getItem(`adGate:${buttonKey}`) || '0', 10) || 0;

  const triggerAd = useCallback(
    (action: () => void) => {
      // King Badge users / ads disabled / no popunder => skip ad entirely
      if (isVerified || !adsEnabled || !popunderUrl) {
        action();
        return;
      }

      const count = getCount();
      if (count >= MAX_CLICKS_WITH_AD) {
        action();
        return;
      }

      // Open popunder ad in new tab and proceed with action
      try {
        window.open(popunderUrl, '_blank', 'noopener,noreferrer');
      } catch {
        /* ignore */
      }
      localStorage.setItem(`adGate:${buttonKey}`, String(count + 1));
      action();
    },
    [buttonKey, isVerified, adsEnabled, popunderUrl]
  );

  return { triggerAd, remainingAds: Math.max(0, MAX_CLICKS_WITH_AD - getCount()) };
}
