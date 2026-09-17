import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, ShieldCheck } from "lucide-react";
import { Button, Input, Card, Container, Flex } from "../components/ui";
import { toast } from "react-hot-toast";
import useAuthStore from "../store/authStore";

const LoginWrapper = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fbf9f6;
  background-image: radial-gradient(#d3d0c9 1px, transparent 1px);
  background-size: 24px 24px;
`;

const StyledCard = styled.div`
  background: #ffffff;
  border: 1px solid #e3e0d8;
  border-radius: 24px;
  padding: 3.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.015);
  width: 100%;
`;

const FormTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-align: center;
  letter-spacing: -0.03em;
  font-family: ${(props) => props.theme.fonts.serif};
  color: #191919;
`;

const FormSubtitle = styled.p`
  color: #86868b;
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 0.95rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6e6e73;
  margin-bottom: 0.5rem;
`;

const ErrorBox = styled.div`
  background: #fff5f5;
  color: #e53e3e;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #fed7d7;
`;

const StyledInput = styled(Input)`
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  border: 1px solid #dcdad2;
  font-size: 0.95rem;
  height: 3rem;
  background: #ffffff;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-color: ${({ $hasError }) => ($hasError ? "#e53e3e" : undefined)};
  width: 100%;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? "#e53e3e" : "#191919")};
    background: #ffffff;
    box-shadow: ${({ $hasError }) =>
      $hasError ? "0 0 0 4px rgba(229,62,62,0.15)" : "0 0 0 4px rgba(25, 25, 25, 0.05)"};
  }
`;

const FieldError = styled.div`
  color: #e53e3e;
  font-size: 0.82rem;
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 500;
`;

// Small "go to admin login" link at bottom
const AdminHint = styled.div`
  margin-top: 2rem;
  padding: 0.85rem 1rem;
  background: #fbf9f6;
  border: 1px solid #e3e0d8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #6e6e73;

  a {
    color: #191919;
    font-weight: 700;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    login,
    adminLogin,
    isAuthenticated,
    adminAuthenticated,
    error,
    errorField,
    isLoading,
  } = useAuthStore();
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (adminAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [adminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login(formData.email, formData.password);
    if (success) {
      toast.success("Welcome back! Successfully logged in.");
      navigate(from, { replace: true });
    } else {
      const errorMsg = useAuthStore.getState().error;
      if (errorMsg?.includes("Access Denied")) {
        toast.error(errorMsg);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <LoginWrapper>
      <Container>
        <Flex justify="center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", maxWidth: "440px" }}
          >
            <StyledCard>
              <FormTitle>Welcome Back</FormTitle>
              <FormSubtitle>Sign in to your account</FormSubtitle>

              {error && !errorField && (
                <ErrorBox>
                  <AlertCircle size={18} />
                  {error}
                </ErrorBox>
              )}

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Email address</Label>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    $hasError={errorField === "email"}
                    required
                  />
                  {errorField === "email" && (
                    <FieldError>
                      <AlertCircle size={13} />
                      {error}
                    </FieldError>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Password</Label>
                  <StyledInput
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    $hasError={errorField === "password"}
                    required
                  />
                  {errorField === "password" && (
                    <FieldError>
                      <AlertCircle size={13} />
                      {error}
                    </FieldError>
                  )}
                </FormGroup>

                <Button
                  type="submit"
                  disabled={isLoading}
                  style={{ width: "100%", marginBottom: "1.5rem", background: "#191919", color: "#ffffff" }}
                >
                  <LogIn size={18} style={{ marginRight: 8 }} />
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.9rem", color: "#6e6e73" }}>
                    New to StartupFund?{" "}
                    <Link
                      to="/register"
                      style={{
                        color: "#191919",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Get started
                    </Link>
                  </span>
                </div>
              </form>

              {/* Admin hint */}
              <AdminHint>
                Admin? Use your admin credentials above or{" "}
                <Link to="/admin/login">go to the Admin Portal →</Link>
              </AdminHint>
            </StyledCard>
          </motion.div>
        </Flex>
      </Container>
    </LoginWrapper>
  );
};

export default Login;
