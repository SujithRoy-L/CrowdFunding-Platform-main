import { create } from "zustand";
import api from "../services/api";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isAdmin: JSON.parse(localStorage.getItem("user"))?.role === "admin" || false,
  isLoading: false,
  error: null,

  // Check if admin session exists
  adminUser: JSON.parse(localStorage.getItem("adminUser")) || null,
  adminAuthenticated: !!localStorage.getItem("adminToken"),
  isAdminMode: false,

  updateUser: (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    set({
      user: userData,
      isAdmin: userData.role === "admin",
    });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null, errorField: null });
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { success, token, user } = response.data;

      if (!success) {
        throw new Error("Login failed");
      }

      // Prevent admins from logging in through the regular user portal
      if (user.role === "admin") {
        throw new Error("Access Denied. Please sign in through the Admin Portal.");
      }

      // Store token and user data for regular users
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
        error: null,
        errorField: null,
      });
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Login failed";
      const field = error.response?.data?.field || null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        error: message,
        errorField: field,
      });
      return false;
    }
  },

  adminLogin: async (email, password) => {
    set({ isLoading: true, error: null, errorField: null });
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { success, token, user } = response.data;

      if (!success) {
        throw new Error("Admin login failed");
      }

      if (user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      // Store admin session separately
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      set({
        adminUser: user,
        adminAuthenticated: true,
        isAdminMode: true,
        isLoading: false,
        error: null,
        errorField: null,
      });
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Admin login failed";
      const field = error.response?.data?.field || null;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      set({
        adminUser: null,
        adminAuthenticated: false,
        isAdminMode: false,
        isLoading: false,
        error: message,
        errorField: field,
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", userData);

      const { success, token, user } = response.data;

      if (!success) {
        throw new Error("Registration failed");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isAdmin: user.role === "admin",
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Registration failed",
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null,
    });
  },

  adminLogout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    set({
      adminUser: null,
      adminAuthenticated: false,
      isAdminMode: false,
      error: null,
    });
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");

      if (!token && !adminToken) {
        set({
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          adminAuthenticated: false,
          isAdminMode: false,
        });
        return;
      }

      // Check Admin Token
      if (adminToken) {
        try {
          const response = await api.get("/auth/profile", {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          const { success, user: userData } = response.data;
          
          if (success && userData.role === "admin") {
            localStorage.setItem("adminUser", JSON.stringify(userData));
            set({
              adminUser: userData,
              adminAuthenticated: true,
              isAdminMode: true,
            });
          }
        } catch (error) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
        }
      }

      // Check User Token
      if (token) {
        try {
          const response = await api.get("/auth/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const { success, user: userData } = response.data;
          
          if (success) {
            localStorage.setItem("user", JSON.stringify(userData));
            set({
              user: userData,
              isAuthenticated: true,
              isAdmin: userData.role === "admin",
            });
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
}));

export default useAuthStore;
