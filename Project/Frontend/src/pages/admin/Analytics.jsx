import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Activity,
  PieChart,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Flex } from "../../components/ui";
import AdminLayout from "../../components/AdminLayout";

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  padding: 1.5rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
`;

const StatValue = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${(p) => p.$color || "#191919"};
  margin-bottom: 0.25rem;
  font-family: ${(props) => props.theme.fonts.mono};
`;

const StatSub = styled.p`
  font-size: 0.8rem;
  color: #86868b;
  font-weight: 600;
`;

const SectionTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 800;
  color: #191919;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ${(props) => props.theme.fonts.serif};
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);
`;

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #86868b;
  min-width: 100px;
  text-align: right;
  font-family: var(--font-sans);
`;

const BarTrack = styled.div`
  flex: 1;
  height: 28px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled(motion.div)`
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, ${(p) => p.$color}88, ${(p) => p.$color});
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.75rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: white;
  font-family: var(--font-mono);
`;

const DonutContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const DonutSVG = styled.svg`
  width: 180px;
  height: 180px;
  transform: rotate(-90deg);
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  min-width: 140px;
`;

const LegendDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: ${(p) => p.$color};
`;

const LegendLabel = styled.span`
  font-size: 0.85rem;
  color: #86868b;
  font-weight: 600;
`;

const LegendValue = styled.span`
  font-size: 0.85rem;
  font-weight: 800;
  color: #191919;
  margin-left: auto;
  font-family: var(--font-mono);
`;

const TableCard = styled.div`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  overflow: hidden;
  margin-top: 1rem;
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
  }
  tbody tr {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  tbody tr:hover {
    background: rgba(0, 0, 0, 0.02);
    transform: translateY(-2px);
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const StatusDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(p) =>
    p.$s === "approved"
      ? "rgba(16, 185, 129, 0.1)"
      : p.$s === "pending"
        ? "rgba(245, 158, 11, 0.1)"
        : "rgba(239, 68, 68, 0.1)"};
  color: ${(p) =>
    p.$s === "approved"
      ? "#10b981"
      : p.$s === "pending"
        ? "#f59e0b"
        : "#ef4444"};
`;

const Skeleton = styled.div`
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 12px;
  height: ${(p) => p.$h || "1rem"};
  width: ${(p) => p.$w || "100%"};
`;

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () =>
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  const getBaseURL = () =>
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const baseURL = getBaseURL();
      const [statsRes, projRes, usersRes] = await Promise.all([
        fetch(`${baseURL}/admin/dashboard`, { headers }),
        fetch(`${baseURL}/admin/projects`, { headers }),
        fetch(`${baseURL}/admin/users`, { headers }),
      ]);

      const statsData = await statsRes.json();
      const projData = await projRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) setStats(statsData.stats);
      setProjects(Array.isArray(projData.projects) ? projData.projects : []);
      setUsers(Array.isArray(usersData.users) ? usersData.users : []);
    } catch {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const categoryBreakdown = projects.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const categoryColors = {
    Technology: "#0071e3",
    Education: "#10b981",
    Healthcare: "#f59e0b",
    Environment: "#05cd99",
    Social: "#8b5cf6",
    Other: "#6e6e73",
  };
  const categoryEntries = Object.entries(categoryBreakdown).sort(
    (a, b) => b[1] - a[1],
  );

  const roleBreakdown = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  const roleColors = {
    startup: "#0071e3",
    investor: "#10b981",
    mnc: "#8b5cf6",
    employee: "#6e6e73",
    admin: "#f59e0b",
  };

  const statusBreakdown = {
    approved: projects.filter((p) => p.status === "approved").length,
    pending: projects.filter((p) => p.status === "pending").length,
    rejected: projects.filter((p) => p.status === "rejected").length,
  };

  const totalTarget = projects.reduce((s, p) => s + (p.targetAmount || 0), 0);
  const totalRaised = projects.reduce((s, p) => s + (p.currentAmount || 0), 0);
  const avgEquity = projects.length
    ? (
        projects.reduce((s, p) => s + (p.equity || 0), 0) / projects.length
      ).toFixed(1)
    : 0;

  const donutData = categoryEntries.map(([cat, count]) => ({
    label: cat,
    value: count,
    color: categoryColors[cat] || "#A3AED0",
  }));
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0) || 1;
  let donutOffset = 0;
  const circumference = 2 * Math.PI * 70;

  const topCampaigns = [...projects]
    .sort((a, b) => (b.currentAmount || 0) - (a.currentAmount || 0))
    .slice(0, 6);

  const fmt = (n) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : `₹${n.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <AdminLayout
        title="Platform Analytics"
        subtitle="Real-time insights from live platform data"
      >
        <div style={{ paddingTop: "1rem" }}>
          <StatsGrid>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} $h="128px" />
              ))}
          </StatsGrid>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
            }}
          >
            <Skeleton $h="320px" />
            <Skeleton $h="320px" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Platform Analytics"
      subtitle={`Live Platform Data — ${projects.length} campaigns, ${users.length} users`}
    >
      <div>
        <Flex justify="flex-end" style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={fetchAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 99,
              padding: "0.5rem 1.5rem",
              color: "#191919",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.01)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh Data
          </button>
        </Flex>

        <StatsGrid>
          {[
            {
              label: "Total Raised",
              icon: <DollarSign size={14} />,
              value: fmt(totalRaised),
              sub: `of ${fmt(totalTarget)} target`,
              color: "#10b981",
            },
            {
              label: "Active Campaigns",
              icon: <Briefcase size={14} />,
              value: statusBreakdown.approved,
              sub: `${statusBreakdown.pending} pending review`,
              color: "#0071e3",
            },
            {
              label: "Platform Users",
              icon: <Users size={14} />,
              value: stats?.totalUsers || users.length,
              sub: `${users.filter((u) => u.isVerified).length} verified`,
              color: "#f59e0b",
            },
            {
              label: "Avg. Equity Offered",
              icon: <Activity size={14} />,
              value: `${avgEquity}%`,
              sub: `across ${projects.length} campaigns`,
              color: "#8b5cf6",
            },
          ].map((c, i) => (
            <StatCard
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <StatLabel>
                {c.icon} {c.label}
              </StatLabel>
              <StatValue $color={c.color}>{c.value}</StatValue>
              <StatSub>{c.sub}</StatSub>
            </StatCard>
          ))}
        </StatsGrid>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          <ChartCard>
            <SectionTitle>
              <BarChart3 size={18} style={{ color: "#0071e3" }} /> Campaigns by
              Category
            </SectionTitle>
            <BarContainer>
              {categoryEntries.map(([cat, count], i) => {
                const pct = (count / donutTotal) * 100;
                return (
                  <BarRow key={cat}>
                    <BarLabel>{cat}</BarLabel>
                    <BarTrack>
                      <BarFill
                        $color={categoryColors[cat] || "#6e6e73"}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 8)}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      >
                        {count}
                      </BarFill>
                    </BarTrack>
                  </BarRow>
                );
              })}
              {categoryEntries.length === 0 && (
                <p
                  style={{
                    color: "#86868b",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  No campaigns yet
                </p>
              )}
            </BarContainer>
          </ChartCard>

          <ChartCard>
            <SectionTitle>
              <PieChart size={18} style={{ color: "#10b981" }} /> User
              Composition
            </SectionTitle>
            <DonutContainer>
              <DonutSVG viewBox="0 0 160 160">
                {Object.entries(roleBreakdown).map(([role, count]) => {
                  const pct = count / (users.length || 1);
                  const dashLength = pct * circumference;
                  const offset = donutOffset;
                  donutOffset += dashLength;
                  return (
                    <circle
                      key={role}
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke={roleColors[role] || "#6e6e73"}
                      strokeWidth="18"
                      strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                    />
                  );
                })}
                <text
                  x="80"
                  y="76"
                  textAnchor="middle"
                  fill="#191919"
                  fontSize="28"
                  fontWeight="800"
                  transform="rotate(90, 80, 80)"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {users.length}
                </text>
                <text
                  x="80"
                  y="96"
                  textAnchor="middle"
                  fill="#86868b"
                  fontSize="10"
                  fontWeight="700"
                  transform="rotate(90, 80, 80)"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  TOTAL
                </text>
              </DonutSVG>
              <div>
                {Object.entries(roleBreakdown).map(([role, count]) => (
                  <LegendItem key={role}>
                    <LegendDot $color={roleColors[role] || "#6e6e73"} />
                    <LegendLabel>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </LegendLabel>
                    <LegendValue>{count}</LegendValue>
                  </LegendItem>
                ))}
              </div>
            </DonutContainer>
          </ChartCard>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Approved",
              count: statusBreakdown.approved,
              color: "#10b981",
              icon: <CheckCircle2 size={18} />,
            },
            {
              label: "Pending",
              count: statusBreakdown.pending,
              color: "#f59e0b",
              icon: <Clock size={18} />,
            },
            {
              label: "Rejected",
              count: statusBreakdown.rejected,
              color: "#ef4444",
              icon: <XCircle size={18} />,
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                borderRadius: 24,
                padding: "1.5rem",
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: s.color,
                  marginBottom: "0.75rem",
                }}
              >
                {s.icon}
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {s.label}
                </span>
              </div>
              <p
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  color: "#191919",
                  letterSpacing: "-0.02em",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {s.count}
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#86868b",
                  fontWeight: 500,
                }}
              >
                {projects.length
                  ? `${((s.count / projects.length) * 100).toFixed(0)}% of all campaigns`
                  : "—"}
              </p>
            </motion.div>
          ))}
        </div>

        <SectionTitle style={{ marginTop: "1.5rem" }}>
          <TrendingUp size={18} style={{ color: "#f59e0b" }} /> Top Campaigns by
          Funding
        </SectionTitle>
        <TableCard>
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Creator</th>
                <th>Category</th>
                <th>Target</th>
                <th>Raised</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topCampaigns.map((p, i) => {
                const pct = p.targetAmount
                  ? Math.min(
                      100,
                      ((p.currentAmount || 0) / p.targetAmount) * 100,
                    )
                  : 0;
                return (
                  <tr key={p._id}>
                    <td>
                      <span style={{ fontWeight: 800, color: "#191919" }}>
                        {p.title}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#86868b" }}>
                      {p.creator?.name || "—"}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "0.3rem 0.8rem",
                          borderRadius: 99,
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          background:
                            (categoryColors[p.category] || "#6e6e73") + "1A",
                          color: categoryColors[p.category] || "#6e6e73",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: "#191919", fontFamily: "var(--font-mono)" }}>
                      {fmt(p.targetAmount)}
                    </td>
                    <td style={{ fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
                      {fmt(p.currentAmount || 0)}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 8,
                            background: "rgba(0, 0, 0, 0.05)",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background:
                                "linear-gradient(90deg, #0071e3, #8b5cf6)",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            color: "#86868b",
                            minWidth: "36px",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusDot $s={p.status}>{p.status}</StatusDot>
                    </td>
                  </tr>
                );
              })}
              {topCampaigns.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#86868b",
                      fontWeight: 500,
                    }}
                  >
                    No campaigns yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
