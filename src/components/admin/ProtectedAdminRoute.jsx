import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/lib/AdminAuthContext";

export default function ProtectedAdminRoute() {
  const { isAdmin, checked } = useAdminAuth();

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center" aria-busy="true">
        <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/mojourney/login" replace />;
  }

  return <Outlet />;
}
