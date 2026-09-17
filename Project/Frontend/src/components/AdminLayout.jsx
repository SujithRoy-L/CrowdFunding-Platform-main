import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart2,
  Settings,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { Flex } from "./ui";

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: radial-gradient(circle at 10% 20%, rgba(0, 119, 182, 0.04) 0%, rgba(244, 247, 254, 0.4) 90%);
  font-family: inherit;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.02);
  position: sticky;
  top: 1.5rem;
  height: calc(100vh - 3rem);
  margin: 1.5rem 0 1.5rem 1.5rem;
  z-index: 50;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  h2 {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #191919;
    font-family: var(--font-sans);
    margin: 0;
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.8rem 1.25rem;
  border-radius: 99px;
  text-decoration: none;
  font-weight: ${(p) => (p.$active ? 700 : 500)};
  color: ${(p) => (p.$active ? "#191919" : "#6e6e73")};
  background: ${(p) => (p.$active ? "rgba(0, 0, 0, 0.05)" : "transparent")};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  outline: none;
  cursor: pointer;
  text-align: left;
  width: 100%;

  &:hover {
    background: ${(p) => (p.$active ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.03)")};
    color: #191919;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const TopHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2.5rem 2.5rem 1.5rem 2.5rem;
  background: transparent;
`;

const HeaderGreeting = styled.div`
  h1 {
    font-size: 2.1rem;
    font-weight: 800;
    color: #191919;
    letter-spacing: -0.03em;
    margin-bottom: 0.25rem;
    font-family: ${(props) => props.theme.fonts.serif};
  }
  p {
    color: #86868b;
    font-weight: 500;
    font-size: 0.95rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  padding: 0.5rem 0.5rem 0.5rem 1.5rem;
  border-radius: 99px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.015);
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.03);
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus-within {
    background: #ffffff;
    border-color: #191919;
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    color: #191919;
    font-weight: 500;
    font-size: 0.85rem;
    width: 150px;
    &::placeholder {
      color: #86868b;
    }
  }
`;

const ActionBtn = styled.button`
  background: transparent;
  border: none;
  color: #86868b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    color: #191919;
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #191919;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.05);
  }
`;

const PageContainer = styled.div`
  padding: 0 2.5rem 3rem 2.5rem;
`;

const AdminLayout = ({
  children,
  title = "Dashboard",
  subtitle = "Overview",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout, adminUser } = useAuthStore();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Campaigns", path: "/admin/projects", icon: FileText },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart2 },
    { name: "Complaints", path: "/admin/complaints", icon: ShieldAlert },
    {
      name: "Verification",
      path: "/admin/document-verification",
      icon: ShieldCheck,
    },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <LayoutWrapper>
      <Sidebar>
        <LogoArea>
          <div
            style={{
              background: "#191919",
              borderRadius: "10px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontFamily: "var(--font-sans)",
            }}
          >
            A
          </div>
          <h2>Admin Portal</h2>
        </LogoArea>
        <NavList>
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.includes(item.path);
            return (
              <NavItem key={item.path} to={item.path} $active={active}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {item.name}
              </NavItem>
            );
          })}
        </NavList>
        <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
          <NavItem
            as="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              color: "#E31A1A",
            }}
          >
            <LogOut size={20} />
            Sign Out
          </NavItem>
        </div>
      </Sidebar>

      <MainContent>
        <TopHeader>
          <HeaderGreeting>
            <p>Pages / {title}</p>
            <h1>{title}</h1>
          </HeaderGreeting>
          <HeaderActions>
            <SearchBox>
              <Search size={16} color="#86868b" />
              <input type="text" placeholder="Search..." />
            </SearchBox>
            <ActionBtn>
              <Bell size={20} />
            </ActionBtn>
            <Avatar>{adminUser?.name?.charAt(0) || "A"}</Avatar>
            <ActionBtn
              onClick={handleLogout}
              title="Sign Out"
              style={{ color: "#E31A1A" }}
            >
              <LogOut size={20} />
            </ActionBtn>
          </HeaderActions>
        </TopHeader>

        <PageContainer>{children}</PageContainer>
      </MainContent>
    </LayoutWrapper>
  );
};

export default AdminLayout;
