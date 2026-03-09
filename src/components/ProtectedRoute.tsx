import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: any;
  userData: User | null;
  loading: boolean;
  requiredRole?: 'ADMIN' | 'RESELLER';
}

export function ProtectedRoute({ children, user, userData, loading, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-void flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login page
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (!userData) {
    // Profile not found, App.tsx handles this but as a fallback:
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userData.role !== requiredRole) {
    // Role mismatch
    if (userData.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/reseller" replace />;
  }

  // If reseller is not approved, they should see the waiting room
  // This is handled in App.tsx but we can add a check here if needed.
  if (userData.role === 'RESELLER' && userData.status !== 'approved' && !location.pathname.includes('waiting')) {
    // Note: WaitingRoom is not a separate route yet in my plan, but I'll handle it in App.tsx
  }

  return <>{children}</>;
}
