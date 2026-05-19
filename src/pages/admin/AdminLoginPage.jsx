import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { KeyRound, Loader2, Shield } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAdminAuth } from "@/lib/AdminAuthContext";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAdmin, checked, login, loading } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  if (checked && isAdmin) {
    return <Navigate to="/mojourney" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username.trim(), password);
      navigate("/mojourney", { replace: true });
    } catch (err) {
      if (err.data?.error === "admin_not_configured") {
        setError("Admin login is not configured on the server. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env.");
      } else if (err.status === 404) {
        setError("Admin API is unavailable — restart the server (npm run dev:all) or redeploy the latest build.");
      } else if (err.data?.error === "invalid_credentials") {
        setError("Invalid username or password.");
      } else {
        setError("Could not sign in. Check that the API is running and admin env vars are set.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <BrandLogo size="auth" className="mx-auto" />
          <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
            <Shield className="w-4 h-4" /> Mojourney Admin
          </div>
          <h1 className="text-2xl font-black text-white">Sign in</h1>
          <p className="text-gray-400 text-sm">Overview, analytics, live events, and campaign links.</p>
        </div>

        <form onSubmit={onSubmit} className="dark-card rounded-2xl p-6 space-y-5 border border-white/5">
          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 block">Username</span>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white"
            />
          </label>
          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white"
            />
          </label>
          {error && (
            <p className="text-destructive text-sm font-medium" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full cta-button py-3 rounded-xl font-black flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enter dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
