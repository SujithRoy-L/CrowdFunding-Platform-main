import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
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
  margin-top: 2rem;
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

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: rgba(0, 0, 0, 0.02);
    transform: translateY(-2px);
  }
`;

const DocBadge = styled.span`
  padding: 0.35rem 0.8rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
        : `color: #191919; border-color: rgba(0,0,0,0.15); &:hover { background: rgba(0,0,0,0.05); }`}
`;

const AdminDocumentVerification = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "http://localhost:5000/api/admin/documents",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      toast.error("Failed to load KYC documents");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, docIndex, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(
        `http://localhost:5000/api/admin/documents/${userId}/${docIndex}/${status}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(`Document ${status}`);
      fetchVerifications();
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  return (
    <AdminLayout
      title="KYC & Verification"
      subtitle="Audit identity proofs and professional certificates in our ecosystem."
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
            <Flex gap="2.5rem" style={{ flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "#ef4444",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {verifications.length}
                </h3>
                <p
                  style={{
                    color: "#86868b",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.5px",
                  }}
                >
                  Awaiting Audit
                </p>
              </div>
              <div
                style={{ height: "40px", width: "1px", background: "rgba(0,0,0,0.08)" }}
              />
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "#191919",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  1,124
                </h3>
                <p
                  style={{
                    color: "#86868b",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.5px",
                  }}
                >
                  Verified Entities
                </p>
              </div>
            </Flex>
            <div style={{ position: "relative", width: "340px" }}>
              <SearchBar>
                <Search size={16} />
                <input placeholder="Search entity name..." />
              </SearchBar>
            </div>
            <button
              onClick={fetchVerifications}
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
                <th>ENTITY / PROFESSIONAL</th>
                <th>DOCUMENT TYPE</th>
                <th>DATE UPLOADED</th>
                <th>SECURITY STATUS</th>
                <th>INSPECTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "4rem",
                      color: "#86868b",
                      fontWeight: 600,
                    }}
                  >
                    Loading queue...
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "4rem",
                      color: "#86868b",
                      fontWeight: 600,
                    }}
                  >
                    Audit queue is empty. System secured.
                  </td>
                </tr>
              ) : (
                verifications.map((verify) => (
                  <tr key={verify._id}>
                    <td>
                      <Flex gap="1rem">
                        <Avatar>{verify.user?.name?.charAt(0) || "?"}</Avatar>
                        <div>
                          <p
                            style={{
                              fontWeight: 800,
                              fontSize: "0.95rem",
                              color: "#191919",
                            }}
                          >
                            {verify.user?.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#86868b",
                              fontWeight: 500,
                            }}
                          >
                            {verify.user?.email}
                          </p>
                        </div>
                      </Flex>
                    </td>
                    <td>
                      <Flex gap="0.5rem" style={{ flexWrap: "wrap" }}>
                        <DocBadge>IDENTITY PROOF</DocBadge>
                        <DocBadge>ADDRESS</DocBadge>
                      </Flex>
                    </td>
                    <td>
                      <Flex
                        gap="0.5rem"
                        align="center"
                        style={{
                          fontSize: "0.85rem",
                          color: "#191919",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)"
                        }}
                      >
                        <Calendar size={14} style={{ color: "#86868b" }} /> Aug
                        12, 2026
                      </Flex>
                    </td>
                    <td>
                      <Flex
                        gap="0.5rem"
                        align="center"
                        style={{
                          color: "#10b981",
                          fontWeight: 800,
                          fontSize: "0.72rem",
                          background: "rgba(16, 185, 129, 0.1)",
                          padding: "0.3rem 0.8rem",
                          borderRadius: 99,
                          display: "inline-flex",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}
                      >
                        <ShieldCheck size={16} /> SAFE
                      </Flex>
                    </td>
                    <td>
                      <Flex gap="0.5rem">
                        <ActionBtn
                          onClick={() =>
                            window.open(verify.identityProof, "_blank")
                          }
                          title="Inspect Document"
                        >
                          <Eye size={14} style={{ marginRight: 4 }} /> Inspect
                        </ActionBtn>
                        <ActionBtn
                          $variant="approve"
                          onClick={() =>
                            handleVerify(verify.user?._id, 0, "verified")
                          }
                          title="Approve Document"
                        >
                          <CheckCircle2 size={16} />
                        </ActionBtn>
                        <ActionBtn
                          $variant="reject"
                          onClick={() =>
                            handleVerify(verify.user?._id, 0, "rejected")
                          }
                          title="Reject Document"
                        >
                          <XCircle size={16} />
                        </ActionBtn>
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

export default AdminDocumentVerification;
