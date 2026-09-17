import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { ShieldCheck } from "lucide-react";
import useAuthStore from "../store/authStore";

const StyledNavbar = styled(Navbar)`
  background: rgba(251, 249, 246, 0.8) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e3e0d8;
  padding: 0.85rem 0;
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  z-index: 1000;

  .navbar-brand {
    font-family: var(--font-sans);
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: -0.03em;
    color: #191919 !important;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-link {
    font-family: var(--font-sans);
    font-size: 0.88rem;
    font-weight: 600;
    color: #6e6e73 !important;
    padding: 0.5rem 1.25rem !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 99px;
    display: inline-flex;
    align-items: center;

    &:hover {
      color: #191919 !important;
      background: rgba(0, 0, 0, 0.03);
    }
  }

  .dropdown-toggle::after {
    display: none;
  }

  .dropdown-menu {
    background: #ffffff;
    border: 1px solid #e3e0d8;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.03);
    padding: 0.5rem;
    margin-top: 0.5rem;
    border-color: #e3e0d8;
  }

  .dropdown-item {
    font-family: var(--font-sans);
    font-size: 0.85rem;
    font-weight: 600;
    color: #6e6e73;
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      background: rgba(0, 0, 0, 0.03);
      color: #191919;
    }
  }

  .navbar-toggler {
    border: none;
    padding: 0.25rem 0.5rem;
    &:focus {
      box-shadow: none;
    }
  }
`;

const AdminPortalBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1.15rem;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none !important;
  border: 1px solid #191919;
  color: #191919;
  background: transparent;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin-left: 0.75rem;
  white-space: nowrap;

  &:hover {
    background: #191919;
    color: #ffffff;
    transform: scale(1.025);
  }

  &:active {
    transform: scale(0.965);
  }
`;

const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    adminUser,
    adminAuthenticated,
    isAdminMode,
    logout,
    adminLogout,
  } = useAuthStore();

  const isAdminPage = location.pathname.startsWith("/admin/");

  const handleLogout = () => {
    if (isAdminMode) {
      adminLogout();
      navigate("/admin/login");
    } else {
      logout();
      navigate("/login");
    }
  };

  // Determine which user to show
  const currentUser = isAdminMode ? adminUser : user;
  const isLoggedIn = isAdminMode ? adminAuthenticated : isAuthenticated;

  return (
    <StyledNavbar expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          StartupFund
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isAdminPage ? (
              <>
                <Nav.Link as={Link} to="/campaigns">
                  Campaigns
                </Nav.Link>
                {isLoggedIn && !isAdminMode && (
                  <Nav.Link as={Link} to="/dashboard">
                    Dashboard
                  </Nav.Link>
                )}
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/projects">
                  Projects
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users">
                  Users
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/analytics">
                  Analytics
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/document-verification">
                  Verification
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/complaints">
                  Complaints
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/settings">
                  Settings
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center">
            {isLoggedIn ? (
              <NavDropdown
                title={`${currentUser?.name || "Account"}${isAdminMode ? " (Admin)" : ""}`}
                id="basic-nav-dropdown"
              >
                {!isAdminPage && (
                  <NavDropdown.Item as={Link} to="/profile">
                    Profile
                  </NavDropdown.Item>
                )}
                {!isAdminPage && !isAdminMode && (
                  <NavDropdown.Item as={Link} to="/dashboard">
                    Dashboard
                  </NavDropdown.Item>
                )}
                {isAdminPage && (
                  <NavDropdown.Item as={Link} to="/admin/dashboard">
                    Admin Dashboard
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                {!isAdminPage ? (
                  <>
                    <Nav.Link as={Link} to="/login">
                      Login
                    </Nav.Link>
                    <Nav.Link as={Link} to="/register">
                      Register
                    </Nav.Link>
                  </>
                ) : (
                  <Nav.Link as={Link} to="/admin/login">
                    Admin Login
                  </Nav.Link>
                )}
              </>
            )}

            {/* Admin Portal button — visible to everyone on non-admin pages */}
            {!isAdminPage && (
              <AdminPortalBtn to="/admin/login">
                <ShieldCheck size={13} />
                Admin Portal
              </AdminPortalBtn>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </StyledNavbar>
  );
};

export default AppNavbar;
