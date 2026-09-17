import { create } from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const useInvestmentStore = create((set, get) => ({
  investments: [],
  loading: false,
  error: null,

  createInvestment: async (projectId, amount, paymentMethod = "upi") => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/investments", {
        projectId,
        amount,
        paymentMethod,
        status: "completed",
      });

      if (response.data.success) {
        set((state) => ({
          investments: [response.data.investment, ...state.investments],
          loading: false,
        }));
        return { success: true, data: response.data.investment };
      } else {
        throw new Error(response.data.message || "Failed to create investment");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  fetchUserInvestments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/investments/user");

      if (response.data.success) {
        set({
          investments: response.data.investments,
          loading: false,
          error: null,
        });
        return { success: true, data: response.data.investments };
      } else {
        throw new Error(response.data.message || "Failed to fetch investments");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  fetchProjectInvestments: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/investments/project/${projectId}`);

      if (response.data.success) {
        return { success: true, data: response.data.investments };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch project investments",
        );
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  clearError: () => set({ error: null }),
  clearInvestments: () => set({ investments: [], error: null }),
}));

export default useInvestmentStore;
