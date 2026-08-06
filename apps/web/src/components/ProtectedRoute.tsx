import React from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: "customer" | "engineer" | "admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem("rf_token");
  const storedUser = localStorage.getItem("rf_user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (requiredRole === "engineer" && user.role !== "engineer" && user.role !== "admin") {
        return <Navigate to="/customer" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};
