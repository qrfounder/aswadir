import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { client } from "@/api/client";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await client.admin.me();
      setAdmin(data);
    } catch {
      setAdmin(null);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      await client.admin.login(username, password);
      await refresh();
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    await client.admin.logout();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAdmin: Boolean(admin?.ok),
      checked,
      loading,
      login,
      logout,
      refresh,
    }),
    [admin, checked, loading, login, logout, refresh],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
