import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import AliasesPage from "./pages/AliasesPage";
import ComparisonPage from "./pages/ComparisonPage";

const SecurePage = ({ children }) => (
  <ProtectedRoute>
    <AppShell>{children}</AppShell>
  </ProtectedRoute>
);

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route
      path="/dashboard"
      element={
        <SecurePage>
          <DashboardPage />
        </SecurePage>
      }
    />
    <Route
      path="/upload"
      element={
        <SecurePage>
          <UploadPage />
        </SecurePage>
      }
    />
    <Route
      path="/aliases"
      element={
        <SecurePage>
          <AliasesPage />
        </SecurePage>
      }
    />
    <Route
      path="/comparison"
      element={
        <SecurePage>
          <ComparisonPage />
        </SecurePage>
      }
    />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;

