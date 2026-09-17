import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Container, Flex, Grid } from "./index";

const FooterWrapper = styled.footer`
  background: #ffffff;
  padding: 6rem 0 4rem;
  border-top: 1px solid #f0f0f0;
  color: #666;
`;

const FooterLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
    transform: translateX(4px);
  }
`;

const SubHeading = styled.h4`
  color: ${(props) => props.theme.colors.text};
  font-weight: 800;
  margin-bottom: 1.75rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${(props) => props.theme.colors.text};
  text-decoration: none;
  letter-spacing: -1.5px;
  margin-bottom: 1.5rem;
  display: block;

  span {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const Copyright = styled.div`
  margin-top: 6rem;
  padding-top: 2.5rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <Container>
        <Grid cols="1.5fr 1fr 1fr 1fr">
          <div>
            <Logo to="/">
              Startup<span>Fund</span>
            </Logo>
            <p
              style={{
                lineHeight: "1.6",
                fontSize: "0.95rem",
                maxWidth: "240px",
                marginBottom: "2rem",
              }}
            >
              The definitive crowdfunding infrastructure for the global startup
              ecosystem.
            </p>
            <Flex gap="1.5rem">
              <FooterLink
                to="/admin/login"
                style={{ fontSize: "0.8rem", opacity: 0.5 }}
              >
                Executive Terminal
              </FooterLink>
            </Flex>
          </div>
          <div>
            <SubHeading>Ecosystem</SubHeading>
            <Flex direction="column" align="flex-start" gap="1rem">
              <FooterLink to="/campaigns">Marketplace</FooterLink>
              <FooterLink to="/dashboard">Dashboard</FooterLink>
            </Flex>
          </div>
          <div>
            <SubHeading>Compliance</SubHeading>
            <Flex direction="column" align="flex-start" gap="1rem">
              <span style={{ fontSize: "0.95rem" }}>Secure Ledger</span>
              <span style={{ fontSize: "0.95rem" }}>Professional Terms</span>
              <span style={{ fontSize: "0.95rem" }}>Verification Audit</span>
            </Flex>
          </div>
          <div>
            <SubHeading>Connect</SubHeading>
            <Flex direction="column" align="flex-start" gap="1rem">
              <FooterLink to="#">Enterprise Support</FooterLink>
              <FooterLink to="#">Documentation</FooterLink>
              <FooterLink to="#">API Terminal</FooterLink>
            </Flex>
          </div>
        </Grid>
        <Copyright>
          <span>
            &copy; {new Date().getFullYear()} StartupFund Executive Terminal.
            ISO 27001 Compliant.
          </span>
          <Flex gap="2rem">
            <span style={{ fontSize: "0.8rem" }}>Cookie Policy</span>
            <span style={{ fontSize: "0.8rem" }}>Data Ethics</span>
          </Flex>
        </Copyright>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;
