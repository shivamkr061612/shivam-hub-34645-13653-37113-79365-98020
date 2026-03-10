import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useVerification() {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkVerification = async () => {
      // For anonymous users, check by uid in verified_users
      if (!user) {
        setIsVerified(false);
        setLoading(false);
        return;
      }

      try {
        // Check by email if available, otherwise by uid
        const lookupId = user.email || user.uid;
        const verificationDoc = await getDoc(doc(db, 'verified_users', lookupId));
        
        if (verificationDoc.exists()) {
          const data = verificationDoc.data();
          if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
            setIsVerified(false);
          } else {
            setIsVerified(data?.verified === true);
          }
        } else {
          setIsVerified(false);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, [user?.uid, user?.email]);

  return { isVerified, loading };
}
