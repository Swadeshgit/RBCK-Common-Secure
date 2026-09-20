import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import "./i18n/i18n.js";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { PermissionProvider } from "./context/PermissionContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";
import SetPassword from "./pages/SetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import OrganizationSetup from "./pages/OrganizationSetup.jsx";
import ScopeManagement from "./pages/ScopeManagement.jsx";
import RoleManagement from "./pages/RoleManagement.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";
import AssignPermission from "./pages/AssignPermission.jsx";
import ProtectedRoute from "./components/guards/ProtectedRoute.jsx";
import ForgotPasswordOtp from "./pages/ForgotPasswordOtp.jsx";

function AppRoutes() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-white/10 dark:border-t-brand-400" />
          <p className="text-sm text-ink-soft">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
      <Route path="/reset-password/:token" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />
      <Route path="/forgot-password-otp" element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordOtp />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />

      {/* Set Password — sirf tab tak accessible jab tak password nahi hai.
          Set ho chuka ho to seedha Update Password pe bhej do. */}
      <Route
        path="/set-password"
        element={
          !user ? (
            <Navigate to="/login" />
          ) : user.hasPassword ? (
            <Navigate to="/update-password" />
          ) : (
            <SetPassword />
          )
        }
      />

      {/* Update Password — sirf tab accessible jab password already ho.
          Na ho to Set Password pe bhej do. */}
      <Route
        path="/update-password"
        element={
          !user ? (
            <Navigate to="/login" />
          ) : !user.hasPassword ? (
            <Navigate to="/set-password" />
          ) : (
            <UpdatePassword />
          )
        }
      />

      <Route
        path="/organizations"
        element={
          <ProtectedRoute superAdminOnly>
            <OrganizationSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scopes"
        element={
          <ProtectedRoute superAdminOnly>
            <ScopeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute superAdminOnly>
            <RoleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute module="Staff" action="view">
            <StaffManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/:staffId/permissions"
        element={
          <ProtectedRoute module="Staff" action="edit">
            <AssignPermission />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <PermissionProvider>
              <AppRoutes />
            </PermissionProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
