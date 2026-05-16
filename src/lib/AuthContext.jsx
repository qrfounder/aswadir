import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { client } from "@/api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const applySession = (data) => {
    setUser(data.user);
    setEntitlements(data.entitlements || []);
    setPurchases(data.purchases || []);
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      const data = await client.auth.me();
      applySession(data);
    } catch (error) {
      setUser(null);
      setEntitlements([]);
      setPurchases([]);
      setIsAuthenticated(false);
      if (error.status === 401) {
        setAuthError(null);
      } else {
        setAuthError({ type: "network", message: error.message });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const login = async (email, password) => {
    const data = await client.auth.login(email, password);
    applySession(data);
    return data;
  };

  const register = async (payload) => {
    const data = await client.auth.register(payload);
    applySession(data);
    return data;
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await client.auth.logout();
    } catch {
      /* ignore */
    }
    setUser(null);
    setEntitlements([]);
    setPurchases([]);
    setIsAuthenticated(false);
    if (shouldRedirect && typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const claimPurchase = async (paymentIntentId) => {
    const data = await client.auth.claimPurchase(paymentIntentId);
    setEntitlements(data.entitlements || []);
    setPurchases(data.purchases || []);
    return data;
  };

  const hasEntitlement = (key) => entitlements.some((e) => e.product_key === key);

  return (
    <AuthContext.Provider
      value={{
        user,
        entitlements,
        purchases,
        isAuthenticated,
        isLoadingAuth,
        authError,
        authChecked,
        login,
        register,
        logout,
        claimPurchase,
        hasEntitlement,
        checkUserAuth,
        checkAppState: checkUserAuth,
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
