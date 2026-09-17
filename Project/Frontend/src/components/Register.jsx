import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Building2,
  Briefcase,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { toast as hotToast } from "react-hot-toast";
import { toast as sonnerToast } from "sonner";
import { Button, Input, Card, Container, Flex, Grid } from "./ui";
import api from "../services/api";

const RegisterWrapper = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
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
  margin-bottom: 1.25rem;
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

const StyledInput = styled(Input)`
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  border: 1px solid #dcdad2;
  font-size: 0.95rem;
  height: 3rem;
  background: #ffffff;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-color: ${({ $hasError, $isValid }) =>
    $hasError ? "#e53e3e" : $isValid ? "#38a169" : undefined};
  width: 100%;

  &:focus {
    border-color: ${({ $hasError, $isValid }) =>
      $hasError ? "#e53e3e" : $isValid ? "#38a169" : "#191919"};
    background: #ffffff;
    box-shadow: ${({ $hasError, $isValid }) =>
      $hasError
        ? "0 0 0 4px rgba(229,62,62,0.15)"
        : $isValid
          ? "0 0 0 4px rgba(56,161,105,0.1)"
          : "0 0 0 4px rgba(25, 25, 25, 0.05)"};
  }
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const RoleCard = styled.div`
  background: ${(props) => (props.$active ? "#ffffff" : "rgba(0, 0, 0, 0.02)")};
  color: ${(props) => (props.$active ? "#191919" : "#6e6e73")};
  border: 1px solid ${(props) => (props.$active ? "#191919" : "#e3e0d8")};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${(props) => (props.$active ? "0 4px 12px rgba(0, 0, 0, 0.02)" : "none")};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props) => (props.$active ? "#ffffff" : "rgba(0, 0, 0, 0.04)")};
    border-color: ${(props) => (props.$active ? "#191919" : "#dcdad2")};
  }

  &:active {
    transform: scale(0.97);
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 2rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: #6e6e73;

  input {
    margin-top: 0.2rem;
  }
`;

const ValidationIndicator = styled.div`
  color: ${(props) => (props.$isValid ? "#38a169" : "#e53e3e")};
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.4rem;
`;

const CriteriaList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const CriteriaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: ${(props) => (props.$isValid ? "#38a169" : "#718096")};
  font-weight: ${(props) => (props.$isValid ? "600" : "400")};
  transition: all 0.2s;
`;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "startup",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const isFirstNameValid = formData.firstName.trim().length >= 2;
  const isLastNameValid = formData.lastName.trim().length >= 2;

  // Email validation regex check
  const isEmailValid = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
    formData.email.trim(),
  );

  // Password criteria checks matching AuthController's complexity rule
  const pass = formData.password;
  const hasMinLength = pass.length >= 8;
  const hasUppercase = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':",.<>?]/.test(pass);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasNumber && hasSpecial;

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (emailTouched && isEmailValid) {
        setCheckingEmail(true);
        try {
          const res = await api.get(
            `/auth/check-email?email=${encodeURIComponent(formData.email.trim())}`,
          );
          setEmailExists(res.data.exists);
        } catch (error) {
          console.error("Error checking email", error);
        } finally {
          setCheckingEmail(false);
        }
      } else {
        setEmailExists(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email, emailTouched, isEmailValid]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (e.target.name === "firstName") setFirstNameTouched(true);
    if (e.target.name === "lastName") setLastNameTouched(true);
    if (e.target.name === "email") setEmailTouched(true);
    if (e.target.name === "password") setPasswordTouched(true);
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFirstNameValid || !isLastNameValid) {
      hotToast.error("First and last name must be at least 2 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      sonnerToast.error("Please agree to the terms and conditions");
      return;
    }

    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailExists) {
      sonnerToast.error("An account with this email already exists");
      return;
    }

    if (!isPasswordValid) {
      hotToast.error(
        "Password must be at least 8 characters and include an uppercase letter, a number, and a special character",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const {
        confirmPassword,
        agreeToTerms,
        firstName,
        lastName,
        ...registerData
      } = formData;
      registerData.name = `${firstName} ${lastName}`.trim();

      await api.post("/auth/register", registerData);

      sonnerToast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      hotToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterWrapper>
      <Container>
        <Flex justify="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <StyledCard>
              <FormTitle>Create Account</FormTitle>
              <FormSubtitle>
                Join the premium crowdfunding ecosystem
              </FormSubtitle>

              <form onSubmit={handleSubmit}>
                <Grid cols={2} gap="1rem">
                  <FormGroup>
                    <Label>First Name</Label>
                    <StyledInput
                      type="text"
                      name="firstName"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={handleChange}
                      $isValid={firstNameTouched && isFirstNameValid}
                      $hasError={firstNameTouched && !isFirstNameValid}
                      required
                    />
                    {firstNameTouched && (
                      <ValidationIndicator $isValid={isFirstNameValid}>
                        {isFirstNameValid ? (
                          <>
                            <Check size={14} /> First name{" "}
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} /> At least 2 characters
                            required
                          </>
                        )}
                      </ValidationIndicator>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label>Last Name</Label>
                    <StyledInput
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      $isValid={lastNameTouched && isLastNameValid}
                      $hasError={lastNameTouched && !isLastNameValid}
                      required
                    />
                    {lastNameTouched && (
                      <ValidationIndicator $isValid={isLastNameValid}>
                        {isLastNameValid ? (
                          <>
                            <Check size={14} /> Last name
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} /> At least 2 characters
                            required
                          </>
                        )}
                      </ValidationIndicator>
                    )}
                  </FormGroup>
                </Grid>

                <FormGroup>
                  <Label>Email Address</Label>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    $isValid={emailTouched && isEmailValid && !emailExists}
                    $hasError={emailTouched && (!isEmailValid || emailExists)}
                    required
                  />
                  {emailTouched && (
                    <ValidationIndicator
                      $isValid={isEmailValid && !emailExists}
                    >
                      {checkingEmail ? (
                        <>
                          <AlertCircle size={14} /> Checking email...
                        </>
                      ) : !isEmailValid ? (
                        <>
                          <AlertCircle size={14} /> Please enter a valid email
                          format
                        </>
                      ) : emailExists ? (
                        <>
                          <X size={14} /> Email already exists
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Email address is valid
                        </>
                      )}
                    </ValidationIndicator>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Password</Label>
                  <StyledInput
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    $isValid={passwordTouched && isPasswordValid}
                    $hasError={passwordTouched && !isPasswordValid}
                    required
                  />
                  {passwordTouched && (
                    <CriteriaList>
                      <CriteriaItem $isValid={hasMinLength}>
                        {hasMinLength ? <Check size={12} /> : <X size={12} />}{" "}
                        At least 8 characters
                      </CriteriaItem>
                      <CriteriaItem $isValid={hasUppercase}>
                        {hasUppercase ? <Check size={12} /> : <X size={12} />}{" "}
                        One uppercase letter
                      </CriteriaItem>
                      <CriteriaItem $isValid={hasNumber}>
                        {hasNumber ? <Check size={12} /> : <X size={12} />} One
                        number
                      </CriteriaItem>
                      <CriteriaItem $isValid={hasSpecial}>
                        {hasSpecial ? <Check size={12} /> : <X size={12} />} One
                        special character (!@#$%^&*)
                      </CriteriaItem>
                    </CriteriaList>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Confirm Password</Label>
                  <StyledInput
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    $isValid={
                      formData.confirmPassword &&
                      formData.password === formData.confirmPassword
                    }
                    $hasError={
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                    }
                    required
                  />
                  {formData.confirmPassword && (
                    <ValidationIndicator
                      $isValid={formData.password === formData.confirmPassword}
                    >
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <Check size={14} /> Passwords match
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} /> Passwords do not match
                        </>
                      )}
                    </ValidationIndicator>
                  )}
                </FormGroup>

                <FormGroup style={{ marginBottom: "2.5rem" }}>
                  <Label>I am a...</Label>
                  <RoleGrid>
                    {[
                      { value: "startup", label: "Startup", icon: Building2 },
                      { value: "investor", label: "Single Investor", icon: User },
                      { value: "mnc", label: "MNC / Enterprise", icon: Briefcase },
                      { value: "employee", label: "Individual Employee", icon: Briefcase },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <RoleCard
                          key={opt.value}
                          $active={formData.role === opt.value}
                          onClick={() => setFormData({ ...formData, role: opt.value })}
                        >
                          <Icon size={16} />
                          {opt.label}
                        </RoleCard>
                      );
                    })}
                  </RoleGrid>
                </FormGroup>

                <CheckboxContainer>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      style={{ color: "#191919", textDecoration: "none", fontWeight: 600 }}
                    >
                      Terms of Service
                    </Link>
                    ,
                    <Link
                      to="/privacy"
                      style={{ color: "#191919", textDecoration: "none", fontWeight: 600 }}
                    >
                      {" "}
                      Privacy Policy
                    </Link>
                    , and
                    <Link
                      to="/agreement"
                      style={{ color: "#191919", textDecoration: "none", fontWeight: 600 }}
                    >
                      {" "}
                      User Agreement
                    </Link>
                    .
                  </span>
                </CheckboxContainer>

                <Button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", marginBottom: "1.5rem", background: "#191919", color: "#ffffff" }}
                >
                  <UserPlus size={18} style={{ marginRight: 8 }} />
                  {loading ? "Creating Account..." : "Join StartupFund"}
                </Button>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.9rem", color: "#6e6e73" }}>
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      style={{
                        color: "#191919",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Log in
                    </Link>
                  </span>
                </div>
              </form>
            </StyledCard>
          </motion.div>
        </Flex>
      </Container>
    </RegisterWrapper>
  );
};

export default Register;
