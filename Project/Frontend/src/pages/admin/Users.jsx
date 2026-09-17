import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users as UsersIcon,
  Search,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Mail,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
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

const RoleBadge = styled.span`
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;

  ${(props) =>
    props.role === "startup"
      ? `background: rgba(0, 113, 227, 0.1); color: #0071e3;`
      : props.role === "investor"
        ? `background: rgba(16, 185, 129, 0.1); color: #10b981;`
        : props.role === "mnc"
          ? `background: rgba(139, 92, 246, 0.1); color: #8b5cf6;`
          : props.role === "admin"
            ? `background: rgba(245, 158, 11, 0.1); color: #f59e0b;`
            : `background: rgba(110, 110, 115, 0.1); color: #6e6e73;`}
`;

const VerifiedBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 99px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${(props) =>
    props.$verified
      ? `background: rgba(16, 185, 129, 0.1); color: #10b981;`
      : `background: rgba(239, 68, 68, 0.1); color: #ef4444;`}
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
    props.$variant === "verify"
      ? `color: #10b981; border-color: rgba(16,185,129,0.3); &:hover { background: rgba(16,185,129,0.1); }`
      : props.$variant === "ban"
        ? `color: #f59e0b; border-color: rgba(245,158,11,0.3); &:hover { background: rgba(245,158,11,0.1); }`
        : props.$variant === "delete"
          ? `color: #ef4444; border-color: rgba(239,68,68,0.3); &:hover { background: rgba(239,68,68,0.1); }`
          : `color: #191919; border-color: rgba(0,0,0,0.15); &:hover { background: rgba(0,0,0,0.05); }`}
`;

const RoleSelect = styled.select`
  padding: 0.35rem 1.5rem 0.35rem 0.75rem;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.7);
  color: #191919;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236e6e73%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 8px) center;

  &:focus {
    border-color: #191919;
    background-color: #ffffff;
  }
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

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #191919;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.05);
  }
`;

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getToken = () =>
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const getBaseURL = () =>
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getBaseURL()}/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      toast.error("Failed to load user ecosystem");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(
        `${getBaseURL()}/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Role update failed");
    }
  };

  const handleVerifyToggle = async (userId, currentStatus) => {
    try {
      const response = await fetch(
        `${getBaseURL()}/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isVerified: !currentStatus }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");
      toast.success(
        !currentStatus ? "User verified successfully" : "Verification revoked",
      );
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Verification update failed");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Permanently delete user "${userName}"? This action cannot be undone.`,
      )
    )
      return;
    try {
      const response = await fetch(`${getBaseURL()}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Delete failed");
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminLayout
      title="Ecosystem Management"
      subtitle="Moderating professional accounts"
    >
      <div>
        <Flex gap="1rem" style={{ marginBottom: "2rem" }}>
          <SearchBar>
            <Search size={18} />
            <input
              placeholder="Refine by name, email, company, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          <ActionBtn
            onClick={fetchUsers}
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

        <TableWrapper>
          {loading ? (
            <EmptyState>
              <RefreshCw size={32} className="spin" />
              <p>Loading ecosystem...</p>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState>
              <UsersIcon size={36} />
              <p>No users found in the ecosystem.</p>
            </EmptyState>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>PROFESSIONAL ENTITY</th>
                  <th>ACCOUNT TYPE</th>
                  <th>STATUS</th>
                  <th>ONBOARDED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td style={{ maxWidth: "300px" }}>
                      <Flex gap="1rem">
                        <Avatar>{user.name?.charAt(0) || "?"}</Avatar>
                        <div>
                          <h4
                            style={{
                              fontWeight: 800,
                              marginBottom: "0.15rem",
                              color: "#191919",
                            }}
                          >
                            {user.name}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#86868b",
                              fontWeight: 500,
                            }}
                          >
                            {user.companyName || user.email}
                          </p>
                        </div>
                      </Flex>
                    </td>
                    <td>
                      <Flex gap="0.75rem" align="center">
                        <RoleBadge role={user.role}>{user.role}</RoleBadge>
                        {user.role !== "admin" && (
                          <RoleSelect
                            value={user.role}
                            onChange={(e) =>
                                handleRoleChange(user._id, e.target.value)
                            }
                          >
                            <option value="startup">Startup</option>
                            <option value="investor">Investor</option>
                            <option value="mnc">MNC</option>
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                          </RoleSelect>
                        )}
                      </Flex>
                    </td>
                    <td>
                      <Flex gap="0.75rem" align="center">
                        <VerifiedBadge $verified={user.isVerified}>
                          {user.isVerified ? "Verified User" : "Unverified"}
                        </VerifiedBadge>
                      </Flex>
                    </td>
                    <td>
                      <p style={{ fontWeight: 700, color: "#191919", fontFamily: "var(--font-mono)" }}>
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td>
                      <Flex gap="0.5rem">
                        <ActionBtn title="Email User" onClick={() => window.open(`mailto:${user.email}`)}>
                          <Mail size={14} />
                        </ActionBtn>
                        {user.role !== "admin" && (
                          <ActionBtn
                            $variant={user.isVerified ? "ban" : "verify"}
                            onClick={() =>
                              handleVerifyToggle(user._id, user.isVerified)
                            }
                            title={
                              user.isVerified
                                ? "Revoke Verification"
                                : "Verify User"
                            }
                          >
                            {user.isVerified ? (
                              <ShieldAlert size={14} />
                            ) : (
                              <ShieldCheck size={14} />
                            )}
                          </ActionBtn>
                        )}
                        {user.role !== "admin" && (
                          <ActionBtn
                            $variant="delete"
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </ActionBtn>
                        )}
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

export default AdminUsers;
