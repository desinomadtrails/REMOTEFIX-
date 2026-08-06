import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.js";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: "customer" | "engineer" | "admin" | "super_admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user, getRedirectPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    if (requiredRole === "admin" && user.role !== "admin" && user.role !== "super_admin" && user.role !== "org_admin") {
      return <Navigate to={getRedirectPath(user.role)} replace />;
    }
    if (requiredRole === "engineer" && user.role !== "engineer" && user.role !== "admin" && user.role !== "super_admin") {
      return <Navigate to={getRedirectPath(user.role)} replace />;
    }
  }

  return children;
};
