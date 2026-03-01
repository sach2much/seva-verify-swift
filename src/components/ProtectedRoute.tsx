import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ENV } from '@/config/env';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setTimedOut(true), 5000);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (!ENV.FIREBASE_API_KEY) return <>{children}</>;

  if (loading && !timedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
