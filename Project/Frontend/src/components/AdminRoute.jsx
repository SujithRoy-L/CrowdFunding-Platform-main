import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const AdminRoute = ({ children }) => {
  const { adminAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!adminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;
