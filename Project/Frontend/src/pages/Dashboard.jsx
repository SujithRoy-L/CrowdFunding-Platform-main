import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  LayoutDashboard,
  Briefcase,
  Settings,
  TrendingUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Edit,
  Building2,
  Users,
  Target,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Flex } from "../components/ui";
import DocumentUpload from "../components/ui/DocumentUpload";
import useAuthStore from "../store/authStore";
import { projectAPI, investmentAPI } from "../services/api";

/* ─── Global Styled Components ─────────────────────────────────────── */

const DashboardWrapper = styled.div`
  padding: 4rem 0;
  background-color: ${(props) => props.theme.colors.background};
  min-height: calc(100vh - 80px);
  font-family: inherit;
`;

const DashboardLayout = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Sidebar = styled.aside`
  background: #ffffff;
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid #e3e0d8;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.01);
  position: sticky;
  top: 100px;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.8rem 1.25rem;
  border-radius: 99px;
  color: ${(p) => (p.$active ? "#191919" : "#6e6e73")};
  background: ${(p) => (p.$active ? "rgba(25, 25, 25, 0.05)" : "transparent")};
  font-weight: ${(p) => (p.$active ? "700" : "500")};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 0.4rem;

  &:hover {
    background: ${(p) => (p.$active ? "rgba(25, 25, 25, 0.05)" : "rgba(0, 0, 0, 0.02)")};
    color: #191919;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled(motion.div)`
  background: #ffffff;
  border-radius: 24px;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid #e3e0d8;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.01);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.03);
    border-color: #191919;
  }

  .icon-box {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fbf9f6;
    color: #191919;
    border: 1px solid #e3e0d8;
  }

  .stat-info {
    h3 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #191919;
      margin-bottom: 0.15rem;
      font-family: var(--font-mono);
      letter-spacing: -0.02em;
    }
    p {
      color: #86868b;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  }
`;

const ContentCard = styled(motion.div)`
  background: #ffffff;
  border-radius: 24px;
  padding: 2.25rem;
  border: 1px solid #e3e0d8;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.01);
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th {
    text-align: left;
    padding: 1.25rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #86868b;
    border-bottom: 1px solid #e3e0d8;
  }

  td {
    padding: 1.25rem 1rem;
    border-bottom: 1px solid #e3e0d8;
    font-size: 0.95rem;
    color: #191919;
    vertical-align: middle;
  }

  tbody tr {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    background: #ffffff;
  }
  
  tbody tr:hover {
    background: #fbf9f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.015);
  }
  
  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 0.35rem 0.8rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props) => {
    switch (props.status) {
      case "active":
      case "approved":
      case "completed":
        return "rgba(16, 185, 129, 0.08)";
      case "pending":
        return "rgba(245, 158, 11, 0.08)";
      case "rejected":
        return "rgba(239, 68, 68, 0.08)";
      default:
        return "rgba(110, 110, 115, 0.08)";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "active":
      case "approved":
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "rejected":
        return "#ef4444";
      default:
        return "#6e6e73";
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.status) {
      case "active":
      case "approved":
      case "completed":
        return "rgba(16, 185, 129, 0.15)";
      case "pending":
        return "rgba(245, 158, 11, 0.15)";
      case "rejected":
        return "rgba(239, 68, 68, 0.15)";
      default:
        return "rgba(110, 110, 115, 0.15)";
    }
  }};
`;

const PremiumBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  background: ${(p) => (p.$primary ? "#191919" : "#ffffff")};
  color: ${(p) => (p.$primary ? "#ffffff" : "#191919")};
  border: ${(p) => (p.$primary ? "1px solid #191919" : "1px solid #e3e0d8")};
  box-shadow: ${(p) => (p.$primary ? "0 4px 12px rgba(25, 25, 25, 0.08)" : "none")};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(p) => (p.$primary ? "0 8px 24px rgba(25, 25, 25, 0.12)" : "0 4px 12px rgba(0, 0, 0, 0.05)")};
    background: ${(p) => (p.$primary ? "#2d2d2d" : "#fbf9f6")};
    border-color: #191919;
  }

  &:active {
    transform: scale(0.97);
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.15s;
  background: #ffffff;

  ${(props) =>
    props.$variant === "danger"
      ? `color: #ef4444; border-color: rgba(239,68,68,0.25); &:hover { background: rgba(239,68,68,0.05); }`
      : `color: #191919; border-color: #e3e0d8; &:hover { background: #fbf9f6; border-color: #191919; }`}
`;

/* ─── Investor Editorial Layout Components ─────────────────────────── */

const InvestorLayout = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const SegmentedControl = styled.div`
  display: inline-flex;
  background: rgba(0, 0, 0, 0.03);
  padding: 4px;
  border-radius: 99px;
  border: 1px solid #e3e0d8;
  width: fit-content;
  margin-bottom: 0.5rem;
`;

const TabButton = styled.button`
  background: ${(props) => (props.$active ? "#ffffff" : "transparent")};
  color: ${(props) => (props.$active ? "#191919" : "#6e6e73")};
  border: none;
  padding: 0.6rem 1.6rem;
  border-radius: 99px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${(props) => (props.$active ? "0px 2px 8px rgba(0, 0, 0, 0.05)" : "none")};
  outline: none;

  &:hover {
    color: #191919;
  }
`;

const AssetCard = styled.div`
  background: linear-gradient(135deg, #191919 0%, #2a2a2a 100%);
  color: #fbf9f6;
  border-radius: 28px;
  padding: 2.5rem;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 113, 227, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #86868b;
    margin-bottom: 0.5rem;
  }
  
  .amount {
    font-size: 3rem;
    font-weight: 800;
    font-family: var(--font-mono);
    letter-spacing: -0.03em;
    margin-bottom: 1.5rem;
    color: #ffffff;
  }
`;

const AssetDetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
`;

const AssetDetailItem = styled.div`
  h4 {
    font-size: 0.72rem;
    font-weight: 700;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }
  p {
    font-size: 1.25rem;
    font-weight: 800;
    color: #ffffff;
    font-family: var(--font-mono);
  }
`;

const ProjectCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const MiniProjectCard = styled(motion.div)`
  background: #ffffff;
  border-radius: 24px;
  padding: 1.75rem;
  border: 1px solid #e3e0d8;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.015);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px);
    border-color: #191919;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.035);
  }

  h4 {
    font-size: 1.15rem;
    font-weight: 800;
    color: #191919;
    font-family: var(--font-serif);
    margin: 0;
  }
  .category {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #0071e3;
    letter-spacing: 0.5px;
  }
  .desc {
    font-size: 0.85rem;
    color: #6e6e73;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e3e0d8;
  border-radius: 99px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #0071e3;
  width: ${(props) => Math.min(100, props.$percent)}%;
  border-radius: 99px;
`;

const DisclaimerContainer = styled.div`
  max-width: 520px;
  margin: 8rem auto;
  padding: 3rem;
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid #e3e0d8;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.015);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const IconWrapper = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 158, 11, 0.08);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.15);
  margin-bottom: 0.5rem;
`;

const DisclaimerTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #191919;
  letter-spacing: -0.03em;
  font-family: ${(props) => props.theme.fonts.serif};
  margin: 0;
`;

const DisclaimerText = styled.p`
  color: #6e6e73;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
`;

/* ─── Dashboard Component Implementation ─────────────────────────── */

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, adminAuthenticated, logout } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [receivedInvestments, setReceivedInvestments] = useState([]);
  const [marketplaceProjects, setMarketplaceProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });

  const isAdmin = adminAuthenticated || user?.role === "admin";

  useEffect(() => {
    if (isAdmin) return;
    if (user?.role === "startup") {
      fetchProjects();
    } else {
      fetchInvestments();
      if (user?.role === "investor") {
        fetchMarketplaceProjects();
      }
    }
  }, [user, isAdmin]);

  if (isAdmin) {
    return (
      <DashboardWrapper>
        <DisclaimerContainer>
          <IconWrapper>
            <ShieldAlert size={36} />
          </IconWrapper>
          <DisclaimerTitle>Access Intercepted</DisclaimerTitle>
          <DisclaimerText>
            Standard member spaces (such as investment dashboards and campaign builders) are reserved for startup and investor roles. You are logged in with admin privileges.
          </DisclaimerText>
          <Flex gap="1rem" style={{ marginTop: "1rem", width: "100%" }}>
            <PremiumBtn
              $primary
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => navigate("/admin/dashboard")}
            >
              Go to Admin Portal
            </PremiumBtn>
            <PremiumBtn
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sign Out
            </PremiumBtn>
          </Flex>
        </DisclaimerContainer>
      </DashboardWrapper>
    );
  }

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getUserProjects();
      setProjects(response.data);
      const total = response.data.length;
      const active = response.data.filter(
        (p) => p.status === "approved" || p.status === "active",
      ).length;
      const pending = response.data.filter(
        (p) => p.status === "pending",
      ).length;
      setStats({ total, active, pending });

      const receivedRes = await investmentAPI.getReceivedInvestments();
      setReceivedInvestments(receivedRes.data.investments || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchInvestments = async () => {
    try {
      const response = await investmentAPI.getUserInvestments();
      const invs = Array.isArray(response.data.investments)
        ? response.data.investments
        : [];
      setInvestments(invs);

      const total = invs.length;
      const totalAmt = invs.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      setStats({ total, active: totalAmt, pending: 0 });
    } catch (error) {
      console.error("Error fetching investments:", error);
    }
  };

  const fetchMarketplaceProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      // Filter out approved / active campaigns that the user hasn't backed yet
      const approved = response.data.filter(
        (p) => p.status === "approved" || p.status === "active",
      );
      setMarketplaceProjects(approved.slice(0, 3));
    } catch (error) {
      console.error("Error fetching marketplace projects:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await projectAPI.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  /* ─── Render Sub-Components ────────────────────────────────────────── */

  const renderStats = () => {
    if (user?.role === "startup") {
      return (
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="icon-box">
              <TrendingUp size={20} />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Campaigns</p>
            </div>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="icon-box" style={{ color: "#10b981" }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-info">
              <h3>{stats.active}</h3>
              <p>Active Campaigns</p>
            </div>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="icon-box" style={{ color: "#f59e0b" }}>
              <Clock size={20} />
            </div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending Moderation</p>
            </div>
          </StatCard>
        </StatsGrid>
      );
    } else if (user?.role === "mnc") {
      return (
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="icon-box">
              <Building2 size={20} />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Enterprise Partnerships</p>
            </div>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="icon-box" style={{ color: "#10b981" }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-info">
              <h3>₹{stats.active.toLocaleString("en-IN")}</h3>
              <p>Strategic Capital Deployed</p>
            </div>
          </StatCard>
        </StatsGrid>
      );
    } else if (user?.role === "employee") {
      return (
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="icon-box">
              <Users size={20} />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Co-Investments Joined</p>
            </div>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="icon-box" style={{ color: "#10b981" }}>
              <Target size={20} />
            </div>
            <div className="stat-info">
              <h3>₹{stats.active.toLocaleString("en-IN")}</h3>
              <p>Fractional Capital Deployed</p>
            </div>
          </StatCard>
        </StatsGrid>
      );
    } else {
      // Investor (Fallback stats grid - used inside tabs)
      return (
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="icon-box">
              <TrendingUp size={20} />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Campaigns Backed</p>
            </div>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="icon-box" style={{ color: "#10b981" }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-info">
              <h3>₹{stats.active.toLocaleString("en-IN")}</h3>
              <p>Total Capital Invested</p>
            </div>
          </StatCard>
        </StatsGrid>
      );
    }
  };

  const renderTableData = () => {
    if (user?.role === "startup") {
      return (
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Flex justify="space-between" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#191919", fontFamily: "var(--font-serif)" }}>
              Recent Campaigns
            </h2>
            <PremiumBtn onClick={() => setActiveTab("campaigns")}>
              View All
            </PremiumBtn>
          </Flex>
          <TableWrapper>
            <table>
              <thead>
                <tr>
                  <th>CAMPAIGN NAME</th>
                  <th>CATEGORY</th>
                  <th>TARGET</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((project) => (
                  <tr key={project._id}>
                    <td style={{ fontWeight: 800, color: "#191919" }}>
                      {project.title}
                    </td>
                    <td style={{ fontWeight: 600, color: "#6e6e73" }}>{project.category}</td>
                    <td style={{ fontWeight: 800, color: "#191919", fontFamily: "var(--font-mono)" }}>
                      ₹{project.targetAmount?.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <StatusBadge status={project.status}>
                        {project.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <Flex gap="0.5rem">
                        <ActionBtn
                          onClick={() => navigate(`/projects/${project._id}`)}
                          title="View Details"
                        >
                          <ExternalLink size={14} />
                        </ActionBtn>
                        <ActionBtn
                          onClick={() =>
                            navigate(`/projects/${project._id}/edit`)
                          }
                          title="Edit Campaign"
                        >
                          <Edit size={14} />
                        </ActionBtn>
                        <ActionBtn
                          $variant="danger"
                          onClick={() => handleDelete(project._id)}
                          title="Delete Campaign"
                        >
                          <Trash2 size={14} />
                        </ActionBtn>
                      </Flex>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#86868b",
                        fontWeight: 600,
                      }}
                    >
                      No campaigns found. Start by creating one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrapper>
        </ContentCard>
      );
    } else {
      // Investor, MNC, Employee tables
      let title = "Recent Backings";
      let emptyMsg =
        "You have not backed any campaigns yet. Explore the marketplace!";
      if (user?.role === "mnc") {
        title = "Strategic Partnerships";
        emptyMsg =
          "No strategic partnerships yet. Discover enterprise opportunities!";
      } else if (user?.role === "employee") {
        title = "Internal Co-Investments";
        emptyMsg = "You haven't participated in any internal rounds yet.";
      }

      const activeTabTarget =
        user?.role === "mnc"
          ? "partnerships"
          : user?.role === "employee"
            ? "fractional"
            : "investments";

      return (
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Flex justify="space-between" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#191919", fontFamily: "var(--font-serif)" }}>
              {title}
            </h2>
            {user?.role !== "investor" && (
              <PremiumBtn onClick={() => setActiveTab(activeTabTarget)}>
                View All
              </PremiumBtn>
            )}
          </Flex>
          <TableWrapper>
            <table>
              <thead>
                <tr>
                  <th>CAMPAIGN NAME</th>
                  <th>AMOUNT DEPLOYED</th>
                  <th>DATE BACKED</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {investments.slice(0, 5).map((inv) => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 800, color: "#191919" }}>
                      {inv.project?.title || "—"}
                    </td>
                    <td style={{ color: "#10b981", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                      ₹{inv.amount?.toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontWeight: 600, color: "#6e6e73", fontFamily: "var(--font-mono)" }}>
                      {new Date(
                        inv.completedAt || inv.createdAt,
                      ).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <StatusBadge status={inv.status}>
                        {inv.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <ActionBtn
                        onClick={() =>
                          navigate(
                            `/projects/${inv.project?.id || inv.project?._id}`,
                          )
                        }
                        title="View Project Details"
                      >
                        <ExternalLink size={14} />
                      </ActionBtn>
                    </td>
                  </tr>
                ))}
                {investments.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#86868b",
                        fontWeight: 600,
                      }}
                    >
                      {emptyMsg}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableWrapper>
        </ContentCard>
      );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "campaigns":
      case "investments":
      case "partnerships":
      case "fractional":
        return renderTableData();
      case "backers":
        return (
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Flex justify="space-between" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#191919", fontFamily: "var(--font-serif)" }}>
                Donors & Backers
              </h2>
            </Flex>
            <TableWrapper>
              <table>
                <thead>
                  <tr>
                    <th>DONOR NAME</th>
                    <th>ROLE</th>
                    <th>AMOUNT</th>
                    <th>PROJECT BACKED</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedInvestments.map((inv) => (
                    <tr key={inv._id}>
                      <td style={{ fontWeight: 800, color: "#191919" }}>
                        {inv.investor?.name || "Anonymous"}
                      </td>
                      <td style={{ fontWeight: 600, textTransform: "capitalize", color: "#6e6e73" }}>
                        {inv.investor?.role || "—"}
                      </td>
                      <td style={{ fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
                        ₹{inv.amount?.toLocaleString("en-IN")}
                      </td>
                      <td style={{ fontWeight: 600, color: "#191919" }}>
                        {inv.project?.title || "—"}
                      </td>
                      <td style={{ color: "#86868b", fontFamily: "var(--font-mono)" }}>
                        {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                  {receivedInvestments.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "3rem",
                          color: "#86868b",
                          fontWeight: 600,
                        }}
                      >
                        No donations received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableWrapper>
          </ContentCard>
        );
      case "settings":
        return (
          <ContentCard
            style={{ padding: "4rem", textAlign: "center" }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Settings
              size={56}
              style={{ color: "#86868b", marginBottom: "1.5rem", opacity: 0.3 }}
            />
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#191919",
                fontFamily: "var(--font-serif)",
                marginBottom: "1rem",
              }}
            >
              Account Configuration
            </h3>
            <p style={{ color: "#86868b", fontWeight: 500 }}>
              Settings and credentials are configured directly in the Profile section.
            </p>
            <PremiumBtn
              $primary
              style={{ marginTop: "1.5rem" }}
              onClick={() => navigate("/profile")}
            >
              Go to Profile
            </PremiumBtn>
          </ContentCard>
        );
      default:
        return (
          <>
            {renderStats()}
            {renderTableData()}
          </>
        );
    }
  };

  /* ─── Specialized Portals ────────────────────────────────────────── */

  const renderInvestorOverview = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
      >
        {/* Total Wealth Asset Card */}
        <AssetCard>
          <p className="label">Total Wealth Deployed</p>
          <h2 className="amount">₹{stats.active.toLocaleString("en-IN")}</h2>
          <AssetDetailGrid>
            <AssetDetailItem>
              <h4>Backed Campaigns</h4>
              <p>{stats.total}</p>
            </AssetDetailItem>
            <AssetDetailItem>
              <h4>Average Ticket</h4>
              <p>₹{stats.total > 0 ? Math.round(stats.active / stats.total).toLocaleString("en-IN") : "0"}</p>
            </AssetDetailItem>
            <AssetDetailItem>
              <h4>Verification Status</h4>
              <p style={{ fontSize: "1rem", color: "#10b981", fontWeight: 800 }}>VERIFIED</p>
            </AssetDetailItem>
          </AssetDetailGrid>
        </AssetCard>

        {/* Live Marketplace Feed */}
        <div>
          <Flex justify="space-between" align="center" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "var(--font-serif)", color: "#191919" }}>
              Venture Discovery Feed
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/campaigns")}
              style={{ borderColor: "#e3e0d8", color: "#6e6e73", background: "transparent" }}
            >
              Browse All <ArrowRight size={14} style={{ marginLeft: 6 }} />
            </Button>
          </Flex>

          <ProjectCardGrid>
            {marketplaceProjects.map((p) => {
              const pProgress = Math.min(100, (p.currentAmount / p.targetAmount) * 100);
              return (
                <MiniProjectCard
                  key={p._id}
                  onClick={() => navigate(`/projects/${p._id}`)}
                  whileHover={{ y: -4 }}
                >
                  <div>
                    <span className="category">{p.category}</span>
                    <h4>{p.title}</h4>
                  </div>
                  <p className="desc">{p.description}</p>
                  <div>
                    <Flex justify="space-between" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#86868b", fontFamily: "var(--font-mono)" }}>
                      <span>₹{p.currentAmount?.toLocaleString("en-IN")} raised</span>
                      <span>{pProgress.toFixed(0)}%</span>
                    </Flex>
                    <ProgressBar>
                      <ProgressFill $percent={pProgress} />
                    </ProgressBar>
                  </div>
                </MiniProjectCard>
              );
            })}
            {marketplaceProjects.length === 0 && (
              <p style={{ color: "#86868b", fontStyle: "italic" }}>No active marketplace campaigns found.</p>
            )}
          </ProjectCardGrid>
        </div>

        {/* Recent Transactions List */}
        {renderTableData()}
      </motion.div>
    );
  };

  const renderInvestorContent = () => {
    switch (activeTab) {
      case "portfolio":
        return renderTableData();
      case "settings":
        return renderContent(); // reuse settings configuration card
      default:
        return renderInvestorOverview();
    }
  };

  // --- RETURN PORTALS BY ROLE ---

  if (user?.role === "investor") {
    return (
      <DashboardWrapper>
        <InvestorLayout>
          {/* Custom Single-Column Header */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e3e0d8", paddingBottom: "1.5rem" }}>
            <div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-serif)", color: "#191919", letterSpacing: "-1.5px" }}>
                Welcome back, {user?.name?.split(" ")[0]}!
              </h1>
              <p style={{ color: "#6e6e73", fontSize: "0.95rem" }}>
                Monitor your startup investment portfolio and allocation.
              </p>
            </div>
            <PremiumBtn $primary onClick={() => navigate("/campaigns")}>
              Explore Marketplace
            </PremiumBtn>
          </header>

          {/* Segmented top tab nav bar */}
          <SegmentedControl>
            <TabButton $active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
              Overview
            </TabButton>
            <TabButton $active={activeTab === "portfolio"} onClick={() => setActiveTab("portfolio")}>
              My Portfolio
            </TabButton>
            <TabButton $active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
              Settings
            </TabButton>
          </SegmentedControl>

          <AnimatePresence mode="wait">
            {renderInvestorContent()}
          </AnimatePresence>
        </InvestorLayout>
      </DashboardWrapper>
    );
  }

  // Fallback layout for Startups, MNCs, and Employees (Left Sidebar workspace layout)
  const renderSidebarNav = () => {
    const common = [{ id: "overview", label: "Overview", icon: LayoutDashboard }];
    const ending = [{ id: "settings", label: "Settings", icon: Settings }];

    if (user?.role === "startup") {
      return [
        ...common,
        { id: "campaigns", label: "My Campaigns", icon: Briefcase },
        { id: "backers", label: "Donors & Backers", icon: Users },
        ...ending,
      ];
    } else if (user?.role === "mnc") {
      return [
        ...common,
        { id: "partnerships", label: "Strategic Backing", icon: Building2 },
        ...ending,
      ];
    } else if (user?.role === "employee") {
      return [
        ...common,
        { id: "fractional", label: "Internal Matchings", icon: Users },
        ...ending,
      ];
    }
    return [...common, ...ending];
  };

  return (
    <DashboardWrapper>
      <DashboardLayout>
        <Sidebar>
          <div style={{ paddingBottom: "1.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #e3e0d8" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#191919", fontFamily: "var(--font-serif)", letterSpacing: "-0.5px" }}>
              Workspaces
            </h2>
          </div>
          {renderSidebarNav().map((nav) => (
            <NavItem
              key={nav.id}
              $active={activeTab === nav.id}
              onClick={() => setActiveTab(nav.id)}
            >
              <nav.icon size={18} strokeWidth={activeTab === nav.id ? 2.5 : 2} />{" "}
              {nav.label}
            </NavItem>
          ))}
        </Sidebar>

        <MainContent>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-serif)", color: "#191919", letterSpacing: "-1.5px", marginBottom: "0.25rem" }}>
                Welcome back, {user?.name?.split(" ")[0]}!
              </h1>
              <p style={{ color: "#6e6e73", fontWeight: 500, fontSize: "0.95rem" }}>
                {user?.role === "startup"
                  ? "Manage and track funding statuses of your campaigns."
                  : user?.role === "mnc"
                    ? "Monitor and sponsor corporate partnerships."
                    : "Track matching fractional contributions."}
              </p>
            </div>
            {user?.role === "startup" && (
              <PremiumBtn $primary onClick={() => navigate("/projects/new")}>
                <Plus size={18} style={{ marginRight: 6 }} /> Create Campaign
              </PremiumBtn>
            )}
          </header>

          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </MainContent>
      </DashboardLayout>
    </DashboardWrapper>
  );
};

export default Dashboard;
