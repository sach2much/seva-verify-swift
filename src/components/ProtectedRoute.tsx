import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ENV } from '@/config/env';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  // If Firebase is not configured, allow access (demo mode)
  if (!ENV.FIREBASE_API_KEY) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
