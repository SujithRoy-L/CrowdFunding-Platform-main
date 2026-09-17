import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Flag,
  Clock,
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
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);
  margin-top: 2rem;

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
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover {
    background: rgba(0, 0, 0, 0.02);
    transform: translateY(-2px);
  }
`;

const TypeBadge = styled.span`
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  ${(props) =>
    props.type === "fraud"
      ? "background: rgba(239, 68, 68, 0.1); color: #ef4444;"
      : props.type === "unpaid"
        ? "background: rgba(245, 158, 11, 0.1); color: #f59e0b;"
        : props.type === "bug"
          ? "background: rgba(0, 113, 227, 0.1); color: #0071e3;"
          : "background: rgba(16, 185, 129, 0.1); color: #10b981;"}
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  ${(props) =>
    props.status === "resolved"
      ? "background: rgba(16, 185, 129, 0.1); color: #10b981;"
      : props.status === "in-progress"
        ? "background: rgba(0, 113, 227, 0.1); color: #0071e3;"
        : "background: rgba(239, 68, 68, 0.1); color: #ef4444;"}
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
  gap: 0.4rem;
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  background: #ffffff;
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);

  &:hover {
    background: rgba(16, 185, 129, 0.1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #191919;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.05);
  }
`;

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getToken = () => localStorage.getItem("adminToken");
  const getBaseURL = () =>
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${getBaseURL()}/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      } else {
        toast.error("Failed to load compliance reports");
      }
    } catch (error) {
      toast.error("Failed to load compliance reports");
    } finally {
      setLoading(false);
    }
  };

  const resolveComplaint = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(
        `${getBaseURL()}/admin/complaints/${id}/resolve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Complaint marked as resolved");
        fetchComplaints();
      } else {
        toast.error("Failed to resolve complaint");
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const filtered = complaints.filter((c) =>
    `${c.subject} ${c.author?.name} ${c.targetCompany?.name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const pending = complaints.filter((c) => c.status === "pending").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  return (
    <AdminLayout
      title="Compliance Audit"
      subtitle="Review reported bugs, fraud allegations, and irregularities"
    >
      <div>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 0, 0, 0.04)",
            borderRadius: 24,
            padding: "1.5rem",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.02)",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            gap="1rem"
            style={{ flexWrap: "wrap" }}
          >
            <Flex gap="2rem" style={{ flexWrap: "wrap" }}>
              <Flex gap="0.75rem" style={{ color: "#ef4444", fontWeight: 800, fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}>
                <ShieldAlert size={20} />
                {pending} PENDING
              </Flex>
              <div
                style={{ height: "24px", width: "1px", background: "rgba(0,0,0,0.08)" }}
              />
              <Flex gap="0.75rem" style={{ color: "#10b981", fontWeight: 800, fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}>
                <CheckCircle2 size={20} />
                {resolved} RESOLVED
              </Flex>
              <div
                style={{ height: "24px", width: "1px", background: "rgba(0,0,0,0.08)" }}
              />
              <Flex gap="0.75rem" style={{ color: "#191919", fontWeight: 800, fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}>
                <Flag size={20} />
                {complaints.length} TOTAL
              </Flex>
            </Flex>
            <div style={{ position: "relative", width: "340px" }}>
              <SearchBar>
                <Search size={16} />
                <input
                  placeholder="Search subject or entity..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </SearchBar>
            </div>
            <button
              onClick={fetchComplaints}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 99,
                padding: "0.6rem 1.5rem",
                color: "#191919",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.01)",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
            </button>
          </Flex>
        </div>

        <TableWrapper>
          <table>
            <thead>
              <tr>
                <th>Issue Summary</th>
                <th>Type</th>
                <th>Reporter</th>
                <th>Target Entity</th>
                <th>Status</th>
                <th>Reported</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "4rem",
                      color: "#86868b",
                      fontWeight: 600,
                    }}
                  >
                    Loading reports...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "4rem",
                      color: "#86868b",
                      fontWeight: 600,
                    }}
                  >
                    {search
                      ? "No reports match your search."
                      : "Ecosystem secured. No active compliance reports."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id}>
                    <td style={{ maxWidth: "280px" }}>
                      <h4
                        style={{
                          fontWeight: 800,
                          marginBottom: "0.3rem",
                          fontSize: "0.95rem",
                          color: "#191919",
                        }}
                      >
                        {item.subject}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "#86868b",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.description}
                      </p>
                    </td>

                    <td>
                      <TypeBadge type={item.type}>{item.type}</TypeBadge>
                    </td>

                    <td>
                      <Flex gap="0.75rem" align="center">
                        <Avatar>{item.author?.name?.charAt(0) || "?"}</Avatar>
                        <div>
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: "#191919",
                            }}
                          >
                            {item.author?.name || "Unknown"}
                          </p>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#86868b",
                              fontWeight: 500,
                            }}
                          >
                            {item.author?.email}
                          </p>
                        </div>
                      </Flex>
                    </td>

                    <td>
                      <p
                        style={{
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          color: "#0071e3",
                        }}
                      >
                        {item.targetCompany?.name || "N/A"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#86868b",
                          fontWeight: 500,
                        }}
                      >
                        {item.targetCompany?.email}
                      </p>
                    </td>

                    <td>
                      <StatusBadge status={item.status}>
                        {item.status}
                      </StatusBadge>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <Flex
                        gap="0.4rem"
                        align="center"
                        style={{
                          color: "#191919",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)"
                        }}
                      >
                        <Clock size={14} style={{ color: "#86868b" }} />
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Flex>
                    </td>

                    <td>
                      <Flex gap="0.5rem">
                        {item.status !== "resolved" && (
                          <ActionBtn onClick={() => resolveComplaint(item._id)}>
                            <CheckCircle2 size={13} />
                            Resolve
                          </ActionBtn>
                        )}
                        {item.status === "resolved" && (
                          <span
                            style={{
                              color: "#10b981",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                            }}
                          >
                            ✓ Resolved
                          </span>
                        )}
                      </Flex>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
      </div>
    </AdminLayout>
  );
};

export default AdminComplaints;
