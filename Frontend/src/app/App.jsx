import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardPage from "./components/DashboardPage";
import TransferPage from "./components/TransferPage";
import TransactionsPage from "./components/TransactionsPage";
import AccountsPage from "./components/AccountsPage";
import AdminPage from "./components/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
    path="/dashboard"
    element={<ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>}
  />
          <Route
    path="/transfer"
    element={<ProtectedRoute>
                <TransferPage />
              </ProtectedRoute>}
  />
          <Route
    path="/transactions"
    element={<ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>}
  />
          <Route
    path="/accounts"
    element={<ProtectedRoute>
                <AccountsPage />
              </ProtectedRoute>}
  />
          <Route
    path="/admin"
    element={<ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>}
  />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>;
}
export {
  App as default
};
