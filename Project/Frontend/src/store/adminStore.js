import { create } from "zustand";

const useAdminStore = create((set) => ({
  pendingProjects: [],
  loading: false,
  error: null,

  fetchPendingProjects: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/pending-projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      set({ pendingProjects: data, loading: false, error: null });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  approveProject: async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/projects/${projectId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  rejectProject: async (projectId, reason) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/projects/${projectId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: reason,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
}));

export default useAdminStore;
