import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import { LocaleProvider } from "@/lib/LocaleContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PaidMemberGate from "@/components/PaidMemberGate";
import PageNotFound from "@/lib/PageNotFound";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import ThankYouPage from "./pages/ThankYouPage";
import SetupAccountPage from "./pages/SetupAccountPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { AdminAuthProvider } from "@/lib/AdminAuthContext";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import MojourneyDashboard from "./pages/admin/MojourneyDashboard";

function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AnalyticsProvider>
              <AdminAuthProvider>
              <Routes>
                <Route path="/" element={<ProductPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/setup-account" element={<SetupAccountPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute
                    unauthenticatedElement={<Navigate to="/login" replace />}
                  />
                }
              >
                <Route element={<PaidMemberGate />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Route>
              </Route>
              <Route path="/mojourney/login" element={<AdminLoginPage />} />
              <Route element={<ProtectedAdminRoute />}>
                <Route path="/mojourney" element={<MojourneyDashboard />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
              </AdminAuthProvider>
              </AnalyticsProvider>
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}

export default App;
