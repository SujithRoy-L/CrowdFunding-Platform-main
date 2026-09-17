import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const token = localStorage.getItem("token");

    // Do not override if already set explicitly
    if (!config.headers.Authorization) {
      if (config.url?.startsWith("/admin") && adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (adminToken) {
        // Fallback for general routes called while only admin is logged in
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authHeader = error.config?.headers?.Authorization || "";
      const adminToken = localStorage.getItem("adminToken");
      const userToken = localStorage.getItem("token");

      if (adminToken && authHeader.includes(adminToken)) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
      } else if (userToken && authHeader.includes(userToken)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const isAuthPage =
          window.location.pathname === "/login" ||
          window.location.pathname === "/admin/login" ||
          window.location.pathname === "/register";
        if (!isAuthPage && !window.location.pathname.startsWith("/admin")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export const projectAPI = {
  createProject: (data) =>
    api.post("/projects", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getProjects: () => api.get("/projects"),
  getProject: (id) => api.get(`/projects/${id}`),
  getUserProjects: () => api.get("/projects/user/projects"),
  updateProject: (id, data) =>
    api.put(`/projects/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  lockProject: (id) => api.post(`/projects/${id}/lock`),
  uploadCampaignImages: (id, data) =>
    api.post(`/projects/${id}/campaign-images`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteCampaignImage: (id, imageUrl) =>
    api.delete(`/projects/${id}/campaign-images`, { data: { imageUrl } }),
};

export const b2bAPI = {
  getCompanies: () => api.get("/companies"),
  getCompany: (id) => api.get(`/companies/${id}`),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
  getReviews: (companyId) => api.get(`/reviews/company/${companyId}`),
  postReview: (data) => api.post("/reviews", data),
  postComplaint: (data) => api.post("/complaints", data),
};

export const adminAPI = {
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getComplaints: () => api.get("/admin/complaints"),
  resolveComplaint: (id) => api.put(`/admin/complaints/${id}/resolve`),
  getInvestments: () => api.get("/admin/investments"),
};

export const chatAPI = {
  getMessages: (receiverId) => api.get(`/messages/${receiverId}`),
  sendMessage: (data) => api.post("/messages", data),
};

export const documentAPI = {
  uploadDocument: (data) => api.post("/documents/upload", data),
  getDocuments: (ownerId) => api.get(`/documents/owner/${ownerId}`),
};

export const userAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const investmentAPI = {
  createInvestment: (data) => api.post("/investments", data),
  getUserInvestments: () => api.get("/investments/user"),
  getProjectInvestments: (projectId) =>
    api.get(`/investments/project/${projectId}`),
  getReceivedInvestments: () => api.get("/investments/received"),
};

export default api;
