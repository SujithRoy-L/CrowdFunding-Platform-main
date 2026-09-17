import {
  DollarSign,
  TrendingUp,
  Search,
  Building2,
  Download,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminAPI } from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import { Button, Input, Flex } from "../../components/ui";
import { exportToCSV } from "../../utils/export";
import styled from "styled-components";
import { motion } from "framer-motion";

const PageHeader = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  color: #191919;
  font-family: ${(props) => props.theme.fonts.serif};
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: #6e6e73;
  font-size: 0.95rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px) scale(1.015);
    box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 113, 227, 0.1);
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => p.$bg || "rgba(0, 113, 227, 0.08)"};
    color: ${(p) => p.$color || "#0071e3"};
  }

  .stat-info {
    h3 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #191919;
      margin-bottom: 0.25rem;
      font-family: ${(props) => props.theme.fonts.mono};
      letter-spacing: -0.02em;
    }
    p {
      color: #86868b;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: var(--font-sans);
    }
  }
`;

const TableCard = styled.div`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.02);
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    padding: 1rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #86868b;
    background: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    font-size: 0.9rem;
    color: #1d1d1f;
    vertical-align: middle;
  }

  tbody tr {
    transition: background 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  tbody tr:hover {
    background: rgba(0, 0, 0, 0.02);
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props) =>
    props.status === "completed"
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(245, 158, 11, 0.1)"};
  color: ${(props) =>
    props.status === "completed" ? "#10b981" : "#f59e0b"};
`;

const SearchInput = styled(Input)`
  border-radius: 99px;
  padding-left: 2.5rem;
  border: 1px solid rgba(0,0,0,0.1);
  background: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  height: 2.5rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: #191919;
    background: #ffffff;
  }
`;

const CapsuleSelect = styled.select`
  padding: 0.35rem 1.75rem 0.35rem 1rem;
  border-radius: 99px;
  font-size: 0.82rem;
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
  background-position: calc(100% - 10px) center;
  height: 2.5rem;

  &:focus {
    border-color: #191919;
    background-color: #ffffff;
  }
`;

const AdminFinancials = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getInvestments();
      if (res.data.success) {
        setInvestments(res.data.investments || []);
      }
    } catch (err) {
      toast.error("Failed to load financial data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments = investments.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const investorName = inv.investor?.name?.toLowerCase() || "";
    const projectName = inv.project?.title?.toLowerCase() || "";
    const creatorName = inv.project?.creator?.name?.toLowerCase() || "";
    
    const matchesSearch = 
      investorName.includes(q) ||
      projectName.includes(q) ||
      creatorName.includes(q);
      
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (filteredInvestments.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const exportData = filteredInvestments.map(inv => ({
      "Transaction ID": inv._id,
      "Date": new Date(inv.createdAt).toLocaleDateString("en-IN"),
      "Investor Name": inv.investor?.name || "Unknown",
      "Investor Role": inv.investor?.role || "Unknown",
      "Amount (INR)": inv.amount,
      "Project Title": inv.project?.title || "Unknown",
      "Creator Name": inv.project?.creator?.name || "Unknown",
      "Status": inv.status
    }));

    exportToCSV(exportData, `financial_ledger_${new Date().getTime()}.csv`);
    toast.success("Ledger exported successfully");
  };

  const totalVolume = investments
    .filter((i) => i.status === "completed" || i.status === "approved")
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const platformRevenue = totalVolume * 0.05; // 5% flat fee
    
  const activeFundraisers = new Set(
    investments.map((i) => i.project?.creator?._id)
  ).size;

  return (
    <AdminLayout title="Financial Activity">
      <PageHeader>
        <div>
          <Title>Financial Overview</Title>
          <Subtitle>Monitor platform-wide fundraising and platform revenue</Subtitle>
        </div>
        <Button
          onClick={handleExport}
          style={{
            borderRadius: "99px",
            background: "#191919",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}
        >
          <Download size={16} style={{ marginRight: 8 }} />
          Export CSV Ledger
        </Button>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <div className="icon-box" $bg="rgba(16, 185, 129, 0.08)" $color="#10b981">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalVolume)}</h3>
            <p>Total Capital Raised</p>
          </div>
        </StatCard>
        
        <StatCard>
          <div className="icon-box" $bg="rgba(16, 185, 129, 0.08)" $color="#10b981">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(platformRevenue)}</h3>
            <p>Platform Revenue (5%)</p>
          </div>
        </StatCard>
        
        <StatCard>
          <div className="icon-box" $bg="rgba(0, 113, 227, 0.08)" $color="#0071e3">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{investments.filter((i) => i.status === "completed" || i.status === "approved").length}</h3>
            <p>Completed Transactions</p>
          </div>
        </StatCard>

        <StatCard>
          <div className="icon-box" $bg="rgba(139, 92, 246, 0.08)" $color="#8b5cf6">
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{activeFundraisers}</h3>
            <p>Active Fundraisers</p>
          </div>
        </StatCard>
      </StatsGrid>

      <TableCard>
        <TableHeader>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 850, color: "#191919", fontFamily: "var(--font-sans)" }}>
            Recent Transactions
          </h3>
          <Flex gap="1rem">
            <div style={{ position: "relative", width: "250px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#86868b",
                  zIndex: 2,
                }}
              />
              <SearchInput
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <CapsuleSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </CapsuleSelect>
          </Flex>
        </TableHeader>
        
        <TableWrapper>
          <table>
            <thead>
              <tr>
                <th>Investor (Contributor)</th>
                <th>Amount</th>
                <th>Project Backed</th>
                <th>Creator (Fundraiser)</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem" }}>
                    Loading financial data...
                  </td>
                </tr>
              ) : filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "#86868b" }}>
                    No investments found.
                  </td>
                </tr>
              ) : (
                filteredInvestments.map((inv) => (
                  <tr key={inv._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#191919" }}>
                        {inv.investor?.name || "Unknown"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#86868b" }}>
                        {inv.investor?.role || "Investor"}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(inv.amount)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {inv.project?.title || "Unknown Project"}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1d1d1f" }}>
                        {inv.project?.creator?.name || "Unknown"}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={inv.status}>
                        {inv.status}
                      </StatusBadge>
                    </td>
                    <td style={{ color: "#86868b", fontFamily: "var(--font-mono)" }}>
                      {new Intl.DateTimeFormat("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(inv.createdAt))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
      </TableCard>
    </AdminLayout>
  );
};

export default AdminFinancials;
