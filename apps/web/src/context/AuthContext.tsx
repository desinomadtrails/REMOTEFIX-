import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  role: "customer" | "engineer" | "admin" | "super_admin" | "org_admin" | string;
  status?: string;
  emailVerified?: boolean;
  customerDetails?: any;
  engineerDetails?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<AuthUser>;
  register: (data: any) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getRedirectPath: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem("rf_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("rf_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getRedirectPath = useCallback((targetRole?: string): string => {
    const role = targetRole || user?.role;
    switch (role) {
      case "customer":
        return "/customer";
      case "engineer":
      case "technician":
        return "/engineer";
      case "admin":
      case "super_admin":
      case "org_admin":
      case "manager":
        return "/dashboard";
      default:
        return "/customer";
    }
  }, [user?.role]);

  // Sync profile on mount if token exists
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem("rf_token");
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem("rf_user", JSON.stringify(res.user));
      } else {
        localStorage.removeItem("rf_token");
        localStorage.removeItem("rf_refresh_token");
        localStorage.removeItem("rf_user");
        setUser(null);
        setToken(null);
      }
    } catch {
      localStorage.removeItem("rf_token");
      localStorage.removeItem("rf_refresh_token");
      localStorage.removeItem("rf_user");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleGlobalLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth:logout", handleGlobalLogout);
    return () => window.removeEventListener("auth:logout", handleGlobalLogout);
  }, [refreshUser]);

  const login = async (credentials: any): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      if (res.success && res.token && res.user) {
        localStorage.setItem("rf_token", res.token);
        if (res.refreshToken) {
          localStorage.setItem("rf_refresh_token", res.refreshToken);
        }
        localStorage.setItem("rf_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
      throw new Error(res.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.token && res.user) {
        localStorage.setItem("rf_token", res.token);
        if (res.refreshToken) {
          localStorage.setItem("rf_refresh_token", res.refreshToken);
        }
        localStorage.setItem("rf_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
      throw new Error(res.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout call failures
    } finally {
      localStorage.removeItem("rf_token");
      localStorage.removeItem("rf_refresh_token");
      localStorage.removeItem("rf_user");
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        getRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
