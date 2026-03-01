import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  role: 'Operator' | 'Supervisor' | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true, logout: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'Operator' | 'Supervisor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // No Firebase configured — treat as demo mode (authenticated)
      setUser({ uid: 'demo', email: 'operator@sevakendra.gov.in' } as any);
      setRole('Operator');
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setRole(u.email?.includes('supervisor') ? 'Supervisor' : 'Operator');
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  return <AuthContext.Provider value={{ user, role, loading, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
