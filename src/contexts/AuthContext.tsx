import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInAnonymously,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'techshivam0616@gmail.com';

export type SubAdminPermission = 'upload' | 'edit' | 'messages' | 'feedback';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;          // super admin
  isSubAdmin: boolean;
  isAnyAdmin: boolean;       // super admin OR sub admin
  isAnonymous: boolean;
  isLoggedIn: boolean;       // real (non-anonymous) account
  subAdminPermissions: SubAdminPermission[];
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [subAdminPermissions, setSubAdminPermissions] = useState<SubAdminPermission[]>([]);

  const evaluateAdmin = async (currentUser: User | null) => {
    if (!currentUser || currentUser.isAnonymous || !currentUser.email) {
      setIsAdmin(false);
      setIsSubAdmin(false);
      setSubAdminPermissions([]);
      return;
    }
    const email = currentUser.email.toLowerCase();
    if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(true);
      setIsSubAdmin(false);
      setSubAdminPermissions(['upload', 'edit', 'messages', 'feedback']);
      return;
    }
    // Check sub_admins collection (doc id = lowercased email)
    try {
      const subDoc = await getDoc(doc(db, 'sub_admins', email));
      if (subDoc.exists()) {
        const data = subDoc.data();
        if (data.active !== false) {
          setIsAdmin(false);
          setIsSubAdmin(true);
          const perms = (data.permissions as SubAdminPermission[]) || ['upload', 'edit', 'messages', 'feedback'];
          setSubAdminPermissions(perms);
          return;
        }
      }
    } catch (e) {
      console.error('Sub-admin check failed:', e);
    }
    setIsAdmin(false);
    setIsSubAdmin(false);
    setSubAdminPermissions([]);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await evaluateAdmin(currentUser);
        setLoading(false);
      } else {
        // Auto sign in anonymously so that browsing & data fetching work
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await fbSignOut(auth);
    // onAuthStateChanged will sign in anonymously again
  };

  const refreshAdminStatus = async () => {
    await evaluateAdmin(user);
  };

  const isAnonymous = !!user?.isAnonymous;
  const isLoggedIn = !!user && !user.isAnonymous;
  const isAnyAdmin = isAdmin || isSubAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      isSubAdmin,
      isAnyAdmin,
      isAnonymous,
      isLoggedIn,
      subAdminPermissions,
      signOut,
      refreshAdminStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
