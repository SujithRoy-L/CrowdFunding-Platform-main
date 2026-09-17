import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, projectsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("http://localhost:5000/api/admin/projects", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      setUsers(usersRes.data);
      setProjects(projectsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "status-active";
      case "pending":
        return "status-pending";
      case "rejected":
        return "status-inactive";
      default:
        return "";
    }
  };

  const handleProjectAction = async (projectId, action) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/projects/${projectId}/review`,
        { status: action },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchData(); // Refresh data after action
    } catch (err) {
      console.error("Error updating project status:", err);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="admin-dashboard">
          <div className="loading">Loading dashboard data...</div>
        </div>
      </AdminLayout>
    );

  if (error)
    return (
      <AdminLayout>
        <div className="admin-dashboard">
          <div className="error">Error: {error}</div>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h2>Admin Dashboard</h2>

        <div className="dashboard-section">
          <h3>Users ({users.length})</h3>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-section">
          <h3>Projects ({projects.length})</h3>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>{project.title}</td>
                  <td>{project.creator?.name || "Unknown"}</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(project.status)}`}
                    >
                      {project.status || "N/A"}
                    </span>
                  </td>
                  <td>
                    {project.status === "pending" && (
                      <>
                        <button
                          className="action-button approve"
                          onClick={() =>
                            handleProjectAction(project._id, "approved")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="action-button reject"
                          onClick={() =>
                            handleProjectAction(project._id, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
