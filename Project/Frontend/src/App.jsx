import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { theme, GlobalStyle } from "./theme/theme";
import Navbar from "./components/ui/Navbar";
import Footer from "./components/ui/Footer";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Projects from "./pages/admin/Projects";
import Users from "./pages/admin/Users";
import Analytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import AdminDocumentVerification from "./pages/admin/DocumentVerification";
import ProjectDetails from "./pages/ProjectDetails";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Campaigns from "./pages/Campaigns";
import CompanyProfile from "./pages/CompanyProfile";
import AdminComplaints from "./pages/admin/Complaints";
import AdminFinancials from "./pages/admin/AdminFinancials";

import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Register from "./components/Register";
import CreateProject from "./components/CreateProject";
import EditProject from "./components/EditProject";
import Portfolio from "./components/Portfolio";

import useAuthStore from "./store/authStore";

const AppContent = () => {
  const location = useLocation();
  const { checkAuth, isAuthenticated } = useAuthStore();
  const isAdminPage = location.pathname.startsWith("/admin/");
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  useEffect(() => {
    checkAuth().finally(() => setIsCheckingAuth(false));
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          fontWeight: 600,
        }}
      >
        Loading StartupFund...
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Show navbar on all pages except admin pages */}
      {!isAdminPage && <Navbar />}

      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/company/:id" element={<CompanyProfile />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <PrivateRoute>
                <Portfolio />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <PrivateRoute>
                <CreateProject />
              </PrivateRoute>
            }
          />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route
            path="/projects/:id/edit"
            element={
              <PrivateRoute>
                <EditProject />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <AdminRoute>
                <Projects />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/document-verification"
            element={
              <AdminRoute>
                <AdminDocumentVerification />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <Analytics />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <AdminRoute>
                <AdminComplaints />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/financials"
            element={
              <AdminRoute>
                <AdminFinancials />
              </AdminRoute>
            }
          />

          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Show footer everywhere except admin pages */}
      {!isAdminPage && <Footer />}
      <ToastContainer position="bottom-right" theme="light" />
      <HotToaster
        position="top-center"
        toastOptions={{
          className: "hot-toast-card",
          style: {
            background: "rgba(255, 255, 255, 0.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(227, 224, 216, 0.7)",
            borderRadius: "20px",
            color: "#191919",
            boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            fontWeight: "600",
            padding: "0.85rem 1.25rem",
            maxWidth: "380px",
          },
        }}
      />
      <SonnerToaster position="bottom-left" theme="light" />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
