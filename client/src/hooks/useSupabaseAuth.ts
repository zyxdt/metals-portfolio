import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

export interface User {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  weight_unit: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });
  const [, setLocation] = useLocation();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        loading: false,
        error: "Failed to check authentication",
        isAuthenticated: false,
      });
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Signup failed");
        }

        const data = await response.json();
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        setLocation("/dashboard");
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Signup failed";
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [setLocation]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Login failed");
        }

        const data = await response.json();
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        setLocation("/dashboard");
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [setLocation]
  );

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: "Logout failed",
      }));
    }
  }, [setLocation]);

  return {
    ...authState,
    signup,
    login,
    logout,
    checkAuth,
  };
}
