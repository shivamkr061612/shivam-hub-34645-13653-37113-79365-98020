import { ReactNode, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface MaintenanceBlockerProps {
  children: ReactNode;
}

export function MaintenanceBlocker({ children }: MaintenanceBlockerProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'maintenance'),
      (doc) => {
        if (doc.exists()) {
          const enabled = doc.data()?.enabled || false;
          setMaintenanceMode(enabled);
          
          // Redirect non-admin users to home when maintenance is on
          if (enabled && !isAdmin && location.pathname !== '/admin' && location.pathname !== '/') {
            navigate('/');
          }
        }
      }
    );

    return () => unsubscribe();
  }, [isAdmin, location.pathname, navigate]);

  // Show overlay for non-admin users when maintenance is on, but keep children mounted so popups can render
  const shouldBlock = maintenanceMode && !isAdmin && location.pathname !== '/admin';

  return (
    <>
      {shouldBlock && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[60]" aria-hidden="true" />
      )}
      {children}
    </>
  );
}
