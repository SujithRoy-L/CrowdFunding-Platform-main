import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Flex, Grid, Card } from "../components/ui";
import useAuthStore from "../store/authStore";

const HeroSection = styled.section`
  padding: 9rem 0 7rem 0;
  text-align: center;
  background-color: #fbf9f6;
  background-image: radial-gradient(#e3e0d8 1px, transparent 1px);
  background-size: 32px 32px;
  border-bottom: 1px solid #e3e0d8;
`;

const Badge = styled.div`
  display: inline-flex;
  padding: 0.5rem 1.25rem;
  background: #ffffff;
  color: #191919;
  border: 1px solid #e3e0d8;
  border-radius: 99px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;

const Title = styled(motion.h1)`
  font-size: 4.5rem;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
  color: #191919;
  font-family: ${(props) => props.theme.fonts.serif};

  span {
    color: #0071e3;
  }

  @media (max-width: 768px) {
    font-size: 2.75rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: #6e6e73;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  font-family: ${(props) => props.theme.fonts.serif};
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.04);
  color: #191919;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

const StyledCard = styled(Card)`
  background: #ffffff;
  border: 1px solid #e3e0d8;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.015);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;

  &:hover {
    transform: translateY(-4px) scale(1.015);
    border-color: #191919;
    box-shadow: 0 20px 40px rgba(0,0,0,0.04);

    ${FeatureIcon} {
      background: #191919;
      color: #ffffff;
    }
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: #191919;
  font-family: var(--font-sans);
`;

const FeatureText = styled.p`
  color: #6e6e73;
  line-height: 1.6;
  font-size: 0.95rem;
  font-family: ${(props) => props.theme.fonts.serif};
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;

  h2 {
    font-size: 2.75rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: #191919;
    font-family: ${(props) => props.theme.fonts.serif};
    letter-spacing: -0.03em;
  }

  p {
    color: #6e6e73;
    font-size: 1.15rem;
    font-family: ${(props) => props.theme.fonts.serif};
  }
`;

const CTAPanel = styled(motion.div)`
  background: #191919;
  color: #ffffff;
  text-align: center;
  padding: 5rem 4rem;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);

  h2 {
    font-size: 2.75rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    font-family: ${(props) => props.theme.fonts.serif};
    letter-spacing: -0.03em;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2.5rem;
    opacity: 0.85;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    font-family: ${(props) => props.theme.fonts.serif};
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <>
      <HeroSection>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge>Welcome to StartupFund</Badge>
            <Title>
              Empowering Startups to <br /> <span>Raise Capital</span> & Scale
            </Title>
            <Subtitle>
              Launch campaigns, discover high-potential startups, and manage your investment portfolio all in one platform.
            </Subtitle>
            <Flex justify="center" gap="1rem">
              <Button
                size="lg"
                onClick={handleGetStarted}
                style={{
                  background: "#191919",
                  color: "#ffffff",
                  border: "none",
                }}
              >
                {user ? "Go to Dashboard" : "Join the Network"}{" "}
                <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/campaigns")}
                style={{
                  borderColor: "#e3e0d8",
                  color: "#6e6e73",
                  background: "transparent",
                }}
              >
                Explore Campaigns
              </Button>
            </Flex>
          </motion.div>
        </Container>
      </HeroSection>

      <section style={{ padding: "7rem 0", backgroundColor: "#ffffff" }}>
        <Container>
          <SectionHeader>
            <h2>One Platform, Endless Possibilities</h2>
            <p>Everything you need to scale your startup or portfolio.</p>
          </SectionHeader>
          <Grid cols={3}>
            <StyledCard>
              <FeatureIcon>
                <Zap size={24} />
              </FeatureIcon>
              <FeatureTitle>Launch Campaigns</FeatureTitle>
              <FeatureText>
                Raise capital quickly with transparent equity offerings and attract the right investors for your vision.
              </FeatureText>
            </StyledCard>
            <StyledCard>
              <FeatureIcon>
                <Target size={24} />
              </FeatureIcon>
              <FeatureTitle>Discover Opportunities</FeatureTitle>
              <FeatureText>
                Browse verified startups, review comprehensive metrics, and invest in high-potential ventures.
              </FeatureText>
            </StyledCard>
            <StyledCard>
              <FeatureIcon>
                <Briefcase size={24} />
              </FeatureIcon>
              <FeatureTitle>Manage Portfolio</FeatureTitle>
              <FeatureText>
                Track your investments, view campaign progress, and securely monitor your equity in real-time.
              </FeatureText>
            </StyledCard>
          </Grid>
        </Container>
      </section>

      <section style={{ padding: "6rem 0", background: "#fbf9f6", borderTop: "1px solid #e3e0d8" }}>
        <Container>
          <CTAPanel
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>Start Your Fundraising Journey</h2>
            <p>
              Create your account today and connect with investors who believe in your vision.
            </p>
            <Button
              style={{
                background: "#ffffff",
                color: "#191919",
                border: "none",
              }}
              size="lg"
              onClick={handleGetStarted}
            >
              Get Started for Free
            </Button>
          </CTAPanel>
        </Container>
      </section>
    </>
  );
};

export default Home;
