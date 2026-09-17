import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Flex } from "../../components/ui";
import AdminLayout from "../../components/AdminLayout";

const TableWrapper = styled.div`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-top: 1.5rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    padding: 1.25rem 1.5rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #86868b;
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  td {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    font-size: 0.9rem;
    color: #1d1d1f;
    vertical-align: middle;
  }

  tbody tr {
    background: transparent;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  tbody tr:hover {
    background: rgba(0, 0, 0, 0.02);
    transform: translateY(-2px);
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 0.35rem 0.8rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${(props) =>
    props.$status === "approved"
      ? `background: rgba(16, 185, 129, 0.1); color: #10b981;`
      : props.$status === "pending"
        ? `background: rgba(245, 158, 11, 0.1); color: #f59e0b;`
        : `background: rgba(239, 68, 68, 0.1); color: #ef4444;`}
`;

const SearchBar = styled.div`
  position: relative;
  flex: 1;

  svg {
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: #86868b;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 0.85rem 1rem 0.85rem 3rem;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.04);
    border-radius: 99px;
    color: #191919;
    font-size: 0.9rem;
    font-weight: 500;
    outline: none;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.01);

    &::placeholder {
      color: #86868b;
    }
    &:focus {
      background: #ffffff;
      border-color: #191919;
      box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.03);
    }
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  background: #ffffff;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  ${(props) =>
    props.$variant === "approve"
      ? `color: #10b981; border-color: rgba(16,185,129,0.3); &:hover { background: rgba(16,185,129,0.1); }`
      : props.$variant === "reject"
        ? `color: #ef4444; border-color: rgba(239,68,68,0.3); &:hover { background: rgba(239,68,68,0.1); }`
        : props.$variant === "delete"
          ? `color: #ef4444; border-color: rgba(239,68,68,0.3); &:hover { background: rgba(239,68,68,0.1); }`
          : `color: #191919; border-color: rgba(0,0,0,0.15); &:hover { background: rgba(0,0,0,0.05); }`}
`;

const EmptyState = styled.div`
  padding: 5rem 2rem;
  text-align: center;
  color: #86868b;

  svg {
    margin: 0 auto 1rem;
    display: block;
    opacity: 0.4;
  }
  p {
    font-size: 0.95rem;
    font-weight: 500;
  }
`;

const SegmentedControl = styled.div`
  display: inline-flex;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 99px;
  margin-bottom: 1.5rem;
`;

const SegmentButton = styled.button`
  padding: 0.5rem 1.5rem;
  border-radius: 99px;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  background: ${(p) => (p.$active ? "#ffffff" : "transparent")};
  color: ${(p) => (p.$active ? "#191919" : "#6e6e73")};
  box-shadow: ${(p) => (p.$active ? "0px 2px 8px rgba(0, 0, 0, 0.08)" : "none")};
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    color: #191919;
  }
`;

const AdminProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const getToken = () =>
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const getBaseURL = () =>
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchAdminProjects();
  }, []);

  const fetchAdminProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseURL()}/admin/projects`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (error) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId, status) => {
    try {
      const res = await fetch(`${getBaseURL()}/admin/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Operation failed");
      toast.success(
        `Campaign ${status === "approved" ? "approved ✓" : "rejected ✗"}`,
      );
      fetchAdminProjects();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Permanently delete this campaign?")) return;
    try {
      const res = await fetch(`${getBaseURL()}/admin/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Campaign deleted");
      fetchAdminProjects();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <AdminLayout title="Campaigns" subtitle="Manage startup projects">
      <div>
        <Flex gap="1rem" style={{ marginBottom: "2rem", flexWrap: "wrap" }}>
          <SearchBar>
            <Search size={18} />
            <input
              placeholder="Search by title or creator…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          <ActionBtn
            onClick={fetchAdminProjects}
            style={{
              whiteSpace: "nowrap",
              padding: "0 1.5rem",
              borderRadius: 99,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.01)",
              height: "3rem",
            }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} style={{ marginRight: 6 }} /> Refresh
          </ActionBtn>
        </Flex>

        <SegmentedControl>
          {filterTabs.map((tab) => (
            <SegmentButton
              key={tab.key}
              $active={filter === tab.key}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </SegmentButton>
          ))}
        </SegmentedControl>

        <TableWrapper>
          {loading ? (
            <EmptyState>
              <RefreshCw size={32} className="spin" />
              <p>Loading campaigns…</p>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState>
              <Briefcase size={36} />
              <p>No campaigns match your filters.</p>
            </EmptyState>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Creator</th>
                  <th>Target</th>
                  <th>Equity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project, i) => (
                  <motion.tr
                    key={project._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td style={{ maxWidth: 300 }}>
                      <Flex gap="1rem" align="center">
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "12px",
                            overflow: "hidden",
                            background: "#f1f5f9",
                            flexShrink: 0,
                            border: "1px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          <img
                            src={
                              project.image?.startsWith("http")
                                ? project.image
                                : `http://localhost:5000${project.image}`
                            }
                            alt={project.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=150";
                            }}
                          />
                        </div>
                        <div>
                          <p
                            style={{
                              fontWeight: 800,
                              color: "#191919",
                              marginBottom: 4,
                            }}
                          >
                            {project.title}
                          </p>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#86868b",
                              fontWeight: 500,
                            }}
                          >
                            {project.category} ·{" "}
                            {new Date(project.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                      </Flex>
                    </td>
                    <td>
                      <p
                        style={{
                          fontWeight: 700,
                          color: "#191919",
                          marginBottom: 2,
                        }}
                      >
                        {project.creator?.name || "—"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "#86868b",
                          fontWeight: 500,
                        }}
                      >
                        {project.creator?.email}
                      </p>
                    </td>
                    <td>
                      <p style={{ fontWeight: 800, color: "#191919", fontFamily: "var(--font-mono)" }}>
                        ₹{Number(project.targetAmount).toLocaleString("en-IN")}
                      </p>
                    </td>
                    <td>
                      <p style={{ color: "#191919", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {project.equity}%
                      </p>
                    </td>
                    <td>
                      <StatusBadge $status={project.status}>
                        {project.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <Flex gap="0.5rem">
                        {project.status === "pending" && (
                          <>
                            <ActionBtn
                              $variant="approve"
                              onClick={() =>
                                handleStatusChange(project._id, "approved")
                              }
                              title="Approve Campaign"
                            >
                              <CheckCircle2 size={14} />
                            </ActionBtn>
                            <ActionBtn
                              $variant="reject"
                              onClick={() =>
                                handleStatusChange(project._id, "rejected")
                              }
                              title="Reject Campaign"
                            >
                              <XCircle size={14} />
                            </ActionBtn>
                          </>
                        )}
                        {project.status === "approved" && (
                          <ActionBtn
                            $variant="reject"
                            onClick={() =>
                              handleStatusChange(project._id, "rejected")
                            }
                            title="Reject Campaign"
                          >
                            <XCircle size={14} />
                          </ActionBtn>
                        )}
                        {project.status === "rejected" && (
                          <ActionBtn
                            $variant="approve"
                            onClick={() =>
                              handleStatusChange(project._id, "approved")
                            }
                            title="Approve Campaign"
                          >
                            <CheckCircle2 size={14} />
                          </ActionBtn>
                        )}
                        <ActionBtn
                          onClick={() => navigate(`/projects/${project._id}`)}
                          title="View Campaign"
                        >
                          <ExternalLink size={14} />
                        </ActionBtn>
                        <ActionBtn
                          $variant="delete"
                          onClick={() => handleDelete(project._id)}
                          title="Delete Campaign"
                        >
                          <Trash2 size={14} />
                        </ActionBtn>
                      </Flex>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </TableWrapper>
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
