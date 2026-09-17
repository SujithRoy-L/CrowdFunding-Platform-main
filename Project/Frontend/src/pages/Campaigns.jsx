import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Container, Flex, Input } from "../components/ui";
import { projectAPI } from "../services/api";

const PageHeader = styled.div`
  padding: 6rem 0 5rem 0;
  text-align: center;
  background-color: #fbf9f6;
  background-image: radial-gradient(#e3e0d8 1px, transparent 1px);
  background-size: 32px 32px;
  border-bottom: 1px solid #e3e0d8;
`;

const FilterSection = styled.div`
  padding: 1.5rem 0;
  background: #ffffff;
  border-bottom: 1px solid #e3e0d8;
`;

const CampaignGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2.5rem;
  padding: 4rem 0;
`;

const CampaignCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #e3e0d8;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.015);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-6px) scale(1.015);
    border-color: #191919;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.04);
  }
`;

const ImageWrapper = styled.div`
  height: 200px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: #fbf9f6;
  border-bottom: 1px solid #e3e0d8;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  ${CampaignCard}:hover & img {
    transform: scale(1.06);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.35rem 0.8rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #191919;
  border: 1px solid #e3e0d8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Content = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Category = styled.span`
  font-size: 0.75rem;
  font-weight: 850;
  color: #6e6e73;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 0.5rem;
  display: block;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: #191919;
  font-family: ${(props) => props.theme.fonts.serif};
  letter-spacing: -0.02em;
`;

const SegmentedControl = styled.div`
  display: inline-flex;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 99px;
  align-items: center;
  width: fit-content;
`;

const SegmentButton = styled.button`
  background: ${(props) => (props.$active ? "#ffffff" : "transparent")};
  color: ${(props) => (props.$active ? "#191919" : "#6e6e73")};
  border: none;
  padding: 0.5rem 1.4rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${(props) => (props.$active ? "0px 2px 8px rgba(0, 0, 0, 0.08)" : "none")};
  outline: none;

  &:hover {
    color: #191919;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 300px;

  svg {
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: #86868b;
    pointer-events: none;
    z-index: 2;
  }

  input {
    padding-left: 3rem !important;
    border-radius: 99px !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    height: 2.5rem !important;
    font-size: 0.88rem !important;
    font-weight: 500 !important;
    background: rgba(255, 255, 255, 0.7) !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;

    &:focus {
      border-color: #191919 !important;
      background: #ffffff !important;
    }
  }
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #6e6e73;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: ${(props) => props.theme.fonts.serif};
`;

const ProgressInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const ProgressBarBase = styled.div`
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: #10b981;
  width: ${(props) => props.progress}%;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e3e0d8;
  margin-top: auto;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6e6e73;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-sans);
`;

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await projectAPI.getProjects();
      setCampaigns(res.data || []);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(campaigns.map((c) => c.category).filter(Boolean))),
  ];

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesCategory =
      selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <PageHeader>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                marginBottom: "1rem",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-serif)",
                color: "#191919",
              }}
            >
              Campaign Marketplace
            </h1>
            <p
              style={{
                color: "#6e6e73",
                fontSize: "1.1rem",
                maxWidth: "600px",
                margin: "0 auto",
                fontFamily: "var(--font-serif)",
              }}
            >
              Browse active fundraising rounds and support emerging startups.
            </p>
          </motion.div>
        </Container>
      </PageHeader>

      <FilterSection>
        <Container>
          <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
            <Flex gap="1.5rem" align="center" wrap="wrap">
              <SearchInputWrapper>
                <Search size={18} />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchInputWrapper>
              <SegmentedControl>
                {categories.map((cat) => (
                  <SegmentButton
                    key={cat}
                    $active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </SegmentButton>
                ))}
              </SegmentedControl>
            </Flex>
            <div style={{ color: "#6e6e73", fontSize: "0.88rem", fontWeight: 700, fontFamily: "var(--font-sans)" }}>
              Showing {filteredCampaigns.length} campaigns
            </div>
          </Flex>
        </Container>
      </FilterSection>

      <Container>
        <CampaignGrid>
          {loading
            ? Array(6)
                .fill(0)
                .map((_, i) => (
                  <CampaignCard
                    key={i}
                    style={{ padding: "1.5rem", minHeight: "400px" }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "200px",
                        background: "#fbf9f6",
                        borderRadius: "16px",
                        marginBottom: "1rem",
                        border: "1px solid #e3e0d8",
                      }}
                    />
                    <div
                      style={{
                        width: "40%",
                        height: "16px",
                        background: "#f0f0f0",
                        borderRadius: "4px",
                        marginBottom: "1rem",
                      }}
                    />
                    <div
                      style={{
                        width: "80%",
                        height: "24px",
                        background: "#f0f0f0",
                        borderRadius: "4px",
                        marginBottom: "1rem",
                      }}
                    />
                    <div
                      style={{
                        width: "100%",
                        height: "48px",
                        background: "#f0f0f0",
                        borderRadius: "4px",
                        marginBottom: "1rem",
                      }}
                    />
                  </CampaignCard>
                ))
            : filteredCampaigns.map((campaign) => {
                const progress = Math.min(
                  100,
                  (campaign.currentAmount / campaign.targetAmount) * 100,
                );
                const daysLeft = calculateDaysLeft(campaign.endDate);
                const isLocked = daysLeft === 0;

                return (
                  <CampaignCard key={campaign._id}>
                    <ImageWrapper>
                      <img
                        src={
                          campaign.image?.startsWith("http")
                            ? campaign.image
                            : `http://localhost:5000${campaign.image}`
                        }
                        alt={campaign.title}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=2070";
                        }}
                      />
                      <Badge>
                        {isLocked ? (
                          <CheckCircle2
                            size={12}
                            style={{ marginRight: 4, display: "inline" }}
                          />
                        ) : (
                          <Clock
                            size={12}
                            style={{ marginRight: 4, display: "inline" }}
                          />
                        )}
                        {isLocked ? "COMPLETED" : `${daysLeft} DAYS LEFT`}
                      </Badge>
                    </ImageWrapper>
                    <Content>
                      <Category>{campaign.category}</Category>
                      <Title>{campaign.title}</Title>
                      <Description>{campaign.description}</Description>

                      <ProgressInfo>
                        <Flex
                          justify="space-between"
                          style={{
                            marginBottom: "0.4rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span style={{ fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)" }}>
                            {progress.toFixed(1)}% funded
                          </span>
                          <span style={{ color: "#6e6e73", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                            Target: ₹{campaign.targetAmount.toLocaleString("en-IN")}
                          </span>
                        </Flex>
                        <ProgressBarBase>
                          <ProgressBarFill progress={progress} />
                        </ProgressBarBase>
                      </ProgressInfo>

                      <StatsGrid>
                        <StatItem>
                          <Users size={16} style={{ color: "#86868b" }} />
                          <span>
                            {campaign.creator?.name || "Vetted Startup"}
                          </span>
                        </StatItem>
                        <StatItem style={{ justifyContent: "flex-end", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#191919" }}>
                          <span>Equity: {campaign.equity}%</span>
                        </StatItem>
                      </StatsGrid>

                      <Link
                        to={`/projects/${campaign._id}`}
                        style={{ textDecoration: "none", marginTop: "1.5rem" }}
                      >
                        <Button
                          style={{
                            width: "100%",
                            background: "#191919",
                            color: "#ffffff",
                            border: "none",
                          }}
                        >
                          View Portfolio{" "}
                          <ArrowRight size={18} style={{ marginLeft: 8 }} />
                        </Button>
                      </Link>
                    </Content>
                  </CampaignCard>
                );
              })}
        </CampaignGrid>
      </Container>
    </>
  );
};

export default Campaigns;
