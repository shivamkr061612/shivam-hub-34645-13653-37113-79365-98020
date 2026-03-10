import { useState, useEffect } from 'react';

export function useKeyCountdown() {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const check = () => {
      const expiry = localStorage.getItem('downloadKeyExpiry');
      if (expiry) {
        const expiryTime = parseInt(expiry);
        const diff = expiryTime - Date.now();
        if (diff > 0) {
          setHasKey(true);
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setHasKey(false);
          setTimeRemaining('');
          localStorage.removeItem('downloadKeyExpiry');
        }
      } else {
        setHasKey(false);
        setTimeRemaining('');
      }
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  return { timeRemaining, hasKey };
}
