import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  BarChart3,
  ShieldCheck,
  LogOut,
  AlertCircle,
  FileText,
  Settings,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../../store/authStore";
import AdminLayout from "../../components/AdminLayout";

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const PageBody = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 0;
`;

const WelcomeSection = styled.div`
  margin-bottom: 3rem;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #191919;
  font-family: ${(props) => props.theme.fonts.serif};
  margin-bottom: 0.5rem;

  span {
    color: #0071e3;
  }
`;

const WelcomeSub = styled.p`
  color: #6e6e73;
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 3.5rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  padding: 1.75rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px) scale(1.015);
    box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 113, 227, 0.1);
  }
`;

const StatLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #86868b;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #191919;
  font-family: ${(props) => props.theme.fonts.mono};
  margin-bottom: 0.25rem;
`;

const StatSub = styled.p`
  font-size: 0.8rem;
  color: #86868b;
  font-weight: 500;
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3.5rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ModuleCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  padding: 1.75rem;
  cursor: pointer;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px) scale(1.025);
    box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 113, 227, 0.1);
  }

  &:active {
    transform: scale(0.975);
  }
`;

const ModuleIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  margin-bottom: 1.25rem;
`;

const ModuleTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 800;
  color: #191919;
  margin-bottom: 0.5rem;
  font-family: var(--font-sans);
`;

const ModuleDesc = styled.p`
  font-size: 0.85rem;
  color: #6e6e73;
  line-height: 1.5;
  margin-bottom: 1.25rem;
`;

const ModuleLink = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${(p) => p.$color};
`;

const ActivityBar = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);
`;

const ActivityTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 800;
  color: #191919;
  font-family: ${(props) => props.theme.fonts.serif};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Skeleton = styled.div`
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
  height: ${(p) => p.$h || "1rem"};
  width: ${(p) => p.$w || "100%"};
`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminLogout, adminUser } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const getToken = () =>
    localStorage.getItem("adminToken") || localStorage.getItem("token");

  const getBaseURL = () =>
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${getBaseURL()}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStats(data.stats);
    } catch {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers.toLocaleString(),
          sub: "Registered accounts",
          icon: <Users size={20} />,
          from: "#1d4ed8",
          to: "#3b82f6",
        },
        {
          label: "Total Campaigns",
          value: stats.totalProjects.toLocaleString(),
          sub: `${stats.approvedProjects} approved`,
          icon: <Briefcase size={20} />,
          from: "#065f46",
          to: "#10b981",
        },
        {
          label: "Pending Review",
          value: stats.pendingProjects.toLocaleString(),
          sub: "Awaiting moderation",
          icon: <Clock size={20} />,
          from: "#92400e",
          to: "#f59e0b",
        },
        {
          label: "Total Invested",
          value: `₹${(stats.totalInvestedAmount / 100000).toFixed(1)}L`,
          sub: `${stats.totalInvestments} investments`,
          icon: <DollarSign size={20} />,
          from: "#4c1d95",
          to: "#8b5cf6",
        },
      ]
    : [];

  const modules = [
    {
      title: "Campaign Moderation",
      desc: "Approve, reject, and manage all startup campaigns awaiting verification.",
      icon: <Briefcase size={22} />,
      color: "#0071e3",
      bg: "rgba(0,113,227,0.08)",
      path: "/admin/projects",
    },
    {
      title: "User Ecosystem",
      desc: "Manage startups, investors, MNCs and platform members.",
      icon: <Users size={22} />,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      path: "/admin/users",
    },
    {
      title: "Platform Analytics",
      desc: "Deep-dive into investment trends, growth metrics and KPIs.",
      icon: <BarChart3 size={22} />,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.08)",
      path: "/admin/analytics",
    },
    {
      title: "Compliance Reports",
      desc: "Review bug reports, fraud allegations and user complaints.",
      icon: <AlertCircle size={22} />,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
      path: "/admin/complaints",
    },
    {
      title: "Admin Settings",
      desc: "Configure platform-wide policies, security and access.",
      icon: <Settings size={22} />,
      color: "#6e6e73",
      bg: "rgba(110,110,115,0.08)",
      path: "/admin/settings",
    },
    {
      title: "Financial Activity",
      desc: "Monitor platform-wide fundraising and investments.",
      icon: <DollarSign size={22} />,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      path: "/admin/financials",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <PageBody>
        <WelcomeSection>
          <WelcomeTitle>
            Welcome back,&nbsp;<span>{adminUser?.name || "Admin"}</span>
          </WelcomeTitle>
          <WelcomeSub>
            Here's what's happening on the StartupFund platform right now.
          </WelcomeSub>
        </WelcomeSection>

        <StatsGrid>
          {loadingStats
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} style={{ borderRadius: 24, overflow: "hidden" }}>
                    <Skeleton $h="128px" />
                  </div>
                ))
            : statCards.map((card, i) => (
                <StatCard
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <StatLabel>{card.label}</StatLabel>
                  <StatValue>{card.value}</StatValue>
                  <StatSub>{card.sub}</StatSub>
                </StatCard>
              ))}
        </StatsGrid>

        <h2
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#86868b",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: "1.25rem",
            fontFamily: "var(--font-sans)",
          }}
        >
          Admin Modules
        </h2>
        <ModulesGrid>
          {modules.map((m, i) => (
            <ModuleCard
              key={i}
              onClick={() => navigate(m.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <ModuleIcon $bg={m.bg} $color={m.color}>
                {m.icon}
              </ModuleIcon>
              <ModuleTitle>{m.title}</ModuleTitle>
              <ModuleDesc>{m.desc}</ModuleDesc>
              <ModuleLink $color={m.color}>
                Manage <ChevronRight size={14} />
              </ModuleLink>
            </ModuleCard>
          ))}
        </ModulesGrid>

        <ActivityBar>
          <ActivityTitle>
            <TrendingUp size={20} style={{ color: "#191919" }} />
            Platform Summary
          </ActivityTitle>
          {loadingStats ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "1.5rem",
              }}
            >
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} $h="80px" />
                ))}
            </div>
          ) : (
            stats && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "1.5rem",
                }}
              >
                {[
                  {
                    label: "Approved Ventures",
                    value: stats.approvedProjects,
                    color: "#10b981",
                  },
                  {
                    label: "Pending KYC Docs",
                    value: stats.pendingDocuments,
                    color: "#f59e0b",
                  },
                  {
                    label: "Total Investments",
                    value: stats.totalInvestments,
                    color: "#0071e3",
                  },
                  {
                    label: "Total Raised",
                    value: `₹${(stats.totalInvestedAmount / 100000).toFixed(1)}L`,
                    color: "#8b5cf6",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255, 255, 255, 0.4)",
                      borderRadius: 16,
                      padding: "1.5rem",
                      border: "1px solid rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: "#86868b",
                        marginBottom: 8,
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        color: item.color,
                        letterSpacing: "-0.02em",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </ActivityBar>
      </PageBody>
    </AdminLayout>
  );
};

export default AdminDashboard;
