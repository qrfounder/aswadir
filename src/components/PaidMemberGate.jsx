import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

/**
 * Logged-in users without a paid entitlement cannot access the member dashboard.
 */
export default function PaidMemberGate() {
  const { isAuthenticated, isLoadingAuth, authChecked, entitlements, subscription } = useAuth();

  const hasPaidAccess =
    (entitlements?.length ?? 0) > 0 || Boolean(subscription?.isActive);

  useEffect(() => {
    if (authChecked && isAuthenticated && !hasPaidAccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [authChecked, isAuthenticated, hasPaidAccess]);

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasPaidAccess) {
    return <Navigate to="/checkout" replace />;
  }

  return <Outlet />;
}
