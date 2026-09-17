import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Globe,
  Mail,
  MessageSquare,
  ShieldCheck,
  Plus,
  Rocket,
  CheckCircle2,
  Clock,
  History,
  TrendingUp,
  Users,
  Star,
  Flag,
  ThumbsUp,
  Heart,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button, Card, Container, Flex, Grid, Input } from "../components/ui";
import StarRating from "../components/ui/StarRating";
import ComplaintBox from "../components/ui/ComplaintBox";
import useAuthStore from "../store/authStore";
import { b2bAPI, userAPI, projectAPI } from "../services/api";

const ProfileWrapper = styled.div`
  padding: 4rem 0;
  background-color: #fbf9f6;
  background-image: radial-gradient(#e3e0d8 1px, transparent 1px);
  background-size: 32px 32px;
  min-height: calc(100vh - 80px);
`;

const ProfileHeader = styled(Card)`
  padding: 3rem;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #e3e0d8;
  margin-bottom: 2rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.015);
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.05);
  color: #191919;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  margin-right: 2rem;
  overflow: hidden;
  border: 1px solid #e3e0d8;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Badge = styled.span`
  padding: 0.35rem 0.8rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(0, 0, 0, 0.04);
  color: #6e6e73;
  margin-bottom: 0.5rem;
  display: inline-block;
  border: 1px solid #e3e0d8;
`;

const ReviewCard = styled(Card)`
  margin-bottom: 1.5rem;
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid #e3e0d8;
  background: #ffffff;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.01);
`;

const ServiceTag = styled.span`
  padding: 0.35rem 0.8rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 99px;
  border: 1px solid #e3e0d8;
  font-size: 0.8rem;
  font-weight: 700;
  color: #191919;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #dcdad2;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-family: inherit;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: #191919;
  }
`;

const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showComplaintBox, setShowComplaintBox] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    appreciation: "",
    feedback: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      const profileRes = await b2bAPI.getCompany(id);
      // Flatten: user fields (name,email,role) + company fields (bio,portfolio,branding,stars…)
      const companyData = profileRes.data;
      const merged = { ...companyData.user, ...companyData };
      setProfile(merged);

      // Fetch this creator's approved campaigns
      try {
        const userId = companyData.user?._id || id;
        const allRes = await fetch(`http://localhost:5000/api/projects`);
        const allData = await allRes.json();
        const userProjects = Array.isArray(allData)
          ? allData.filter(
              (p) => p.creator?._id === userId || p.creator === userId,
            )
          : [];
        setProjects(userProjects);
      } catch (e) {
        console.warn("Could not load projects:", e);
      }

      const reviewsRes = await b2bAPI.getReviews(id);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    try {
      await b2bAPI.postReview({ companyId: id, ...newReview });
      toast.success("Review posted successfully!");
      setShowReviewModal(false);
      fetchProfileData(); // Refresh reviews
    } catch (error) {
      toast.error("Failed to post review");
    }
  };

  if (loading)
    return (
      <ProfileWrapper>
        <Container>
          <div style={{ padding: "8rem 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "800px", height: "300px", background: "#ffffff", borderRadius: "24px", border: "1px solid #e3e0d8" }} />
          </div>
        </Container>
      </ProfileWrapper>
    );
  if (!profile)
    return (
      <div style={{ padding: "8rem", textAlign: "center", color: "#191919", fontFamily: "var(--font-serif)", fontSize: "1.25rem" }}>
        Profile Not Found
      </div>
    );

  return (
    <ProfileWrapper>
      <Container>
        <ProfileHeader>
          <Flex align="flex-start" wrap="wrap" gap="2rem">
            <Avatar>{profile.name.charAt(0)}</Avatar>
            <div style={{ flexGrow: 1, minWidth: "280px" }}>
              <Badge>{profile.role}</Badge>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.03em",
                  fontFamily: "var(--font-serif)",
                  color: "#191919"
                }}
              >
                {profile.companyName || profile.name}
              </h1>
              {profile.branding?.slogan && (
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#6e6e73",
                    marginBottom: "1.5rem",
                    fontWeight: 500,
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  "{profile.branding.slogan}"
                </p>
              )}
              <Flex
                gap="1.5rem"
                style={{ color: "#6e6e73", marginBottom: "1.5rem", flexWrap: "wrap" }}
              >
                <Flex gap="0.5rem">
                  <Globe size={18} /> {profile.companyWebsite || "N/A"}
                </Flex>
                <Flex gap="0.5rem">
                  <Mail size={18} /> {profile.email}
                </Flex>
                <Flex gap="0.5rem">
                  <ShieldCheck size={18} style={{ color: "#10b981" }} />{" "}
                  Verified Member
                </Flex>
              </Flex>
              <Flex gap="1rem" wrap="wrap">
                <Button
                  onClick={() => navigate(`/messages/${id}`)}
                  style={{ background: "#191919", color: "#ffffff", border: "none" }}
                >
                  <MessageSquare size={18} style={{ marginRight: 8 }} /> Message / Connect
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(true)}
                  style={{ borderColor: "#e3e0d8", color: "#6e6e73", background: "transparent" }}
                >
                  <Star size={18} style={{ marginRight: 8 }} /> Leave a Review
                </Button>
                <Button
                  variant="outline"
                  style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.2)", background: "transparent" }}
                  onClick={() => setShowComplaintBox(true)}
                >
                  <Flag size={18} />
                </Button>
              </Flex>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "2.75rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#191919" }}>
                {profile.stars?.toFixed(1) || "0.0"}
              </h2>
              <StarRating rating={Math.round(profile.stars || 0)} readonly />
              <p style={{ color: "#86868b", marginTop: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>
                {profile.reviewsCount || 0} Collaborative Reviews
              </p>
            </div>
          </Flex>

          {/* Dynamic Trust Bar */}
          <Grid
            cols={4}
            gap="1rem"
            style={{
              marginTop: "3rem",
              paddingTop: "2.5rem",
              borderTop: "1px solid #e3e0d8",
            }}
          >
            <Flex
              gap="1rem"
              direction="column"
              align="center"
              style={{ textAlign: "center" }}
            >
              <Users size={24} style={{ color: "#0071e3" }} />
              <div>
                <h4 style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#191919" }}>
                  {profile.dynamicMetrics?.trustedByCount || 0}+
                </h4>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#86868b",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Trusted by Entities
                </p>
              </div>
            </Flex>
            <Flex
              gap="1rem"
              direction="column"
              align="center"
              style={{ textAlign: "center" }}
            >
              <TrendingUp size={24} style={{ color: "#10b981" }} />
              <div>
                <h4 style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#191919" }}>
                  {profile.dynamicMetrics?.collaborationsCount || 0}
                </h4>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#86868b",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Active Collaborations
                </p>
              </div>
            </Flex>
            <Flex
              gap="1rem"
              direction="column"
              align="center"
              style={{ textAlign: "center" }}
            >
              <Briefcase size={24} style={{ color: "#0071e3" }} />
              <div>
                <h4 style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#191919" }}>
                  {profile.dynamicMetrics?.projectsCount || 0}
                </h4>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#86868b",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Platform Ventures
                </p>
              </div>
            </Flex>
            <Flex
              gap="1rem"
              direction="column"
              align="center"
              style={{ textAlign: "center" }}
            >
              <ShieldCheck size={24} style={{ color: "#10b981" }} />
              <div>
                <h4 style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#191919" }}>100%</h4>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#86868b",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Security Score
                </p>
              </div>
            </Flex>
          </Grid>
          <ComplaintBox
            isOpen={showComplaintBox}
            onClose={() => setShowComplaintBox(false)}
            targetCompanyId={id}
          />
        </ProfileHeader>

        <AnimatePresence>
          {showReviewModal && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
            >
              <Card
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "100%", maxWidth: "500px", padding: "2.5rem", border: "1px solid #e3e0d8", borderRadius: "24px" }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    color: "#191919",
                    fontFamily: "var(--font-serif)"
                  }}
                >
                  Professional Review
                </h2>
                <p
                  style={{
                    color: "#6e6e73",
                    marginBottom: "2rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Your feedback helps maintain high standards in our
                  crowdfunding ecosystem.
                </p>

                <form onSubmit={handlePostReview}>
                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#6e6e73",
                      marginBottom: "0.5rem",
                      display: "block",
                    }}
                  >
                    Rating
                  </label>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <StarRating
                      rating={newReview.rating}
                      onChange={(r) =>
                        setNewReview({ ...newReview, rating: r })
                      }
                    />
                  </div>

                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#6e6e73",
                      marginBottom: "0.5rem",
                      display: "block",
                    }}
                  >
                    Comment
                  </label>
                  <TextArea
                    placeholder="General experience working with this company..."
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    required
                  />

                  <Grid cols={2} gap="1rem">
                    <div>
                      <label
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#6e6e73",
                          marginBottom: "0.5rem",
                          display: "block",
                        }}
                      >
                        Appreciation
                      </label>
                      <Input
                        placeholder="What did they do well?"
                        value={newReview.appreciation}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            appreciation: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#6e6e73",
                          marginBottom: "0.5rem",
                          display: "block",
                        }}
                      >
                        Feedback
                      </label>
                      <Input
                        placeholder="Room for improvement?"
                        value={newReview.feedback}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            feedback: e.target.value,
                          })
                        }
                      />
                    </div>
                  </Grid>

                  <Flex gap="1rem" style={{ marginTop: "2rem" }}>
                    <Button
                      variant="outline"
                      type="button"
                      style={{ flexGrow: 1, borderColor: "#e3e0d8", color: "#6e6e73", background: "transparent" }}
                      onClick={() => setShowReviewModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      style={{ flexGrow: 2, background: "#191919", color: "#ffffff", border: "none" }}
                    >
                      Submit Review
                    </Button>
                  </Flex>
                </form>
              </Card>
            </ModalOverlay>
          )}
        </AnimatePresence>

        <Grid cols="2fr 1fr" gap="2rem">
          <div>
            <Card style={{ padding: "2.5rem", marginBottom: "2rem", border: "1px solid #e3e0d8", borderRadius: "24px" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  marginBottom: "1.5rem",
                  color: "#191919",
                  fontFamily: "var(--font-sans)",
                }}
              >
                About the Company
              </h3>
              <p
                style={{
                  color: "#6e6e73",
                  lineHeight: "1.7",
                  marginBottom: "2rem",
                  fontFamily: "var(--font-serif)",
                }}
              >
                {profile.bio ||
                  "This company has not provided a detailed description yet."}
              </p>

              <h4
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  marginBottom: "1rem",
                  color: "#191919",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Services Offered
              </h4>
              <Flex gap="0.75rem" wrap="wrap">
                {profile.services && profile.services.length > 0 ? (
                  profile.services.map((service, i) => (
                    <ServiceTag key={i}>{service}</ServiceTag>
                  ))
                ) : (
                  <p style={{ color: "#86868b", fontWeight: 500 }}>No services specified.</p>
                )}
              </Flex>
            </Card>

            {/* Active Campaigns */}
            {projects.length > 0 && (
              <>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "1.25rem",
                    color: "#191919",
                    fontFamily: "var(--font-serif)"
                  }}
                >
                  Active Campaigns
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    marginBottom: "3rem",
                  }}
                >
                  {projects.map((proj) => {
                    const progress = Math.min(
                      100,
                      ((proj.currentAmount || 0) / proj.targetAmount) * 100,
                    );
                    return (
                      <Card
                        key={proj._id}
                        style={{
                          padding: "1.5rem",
                          display: "flex",
                          gap: "1.25rem",
                          alignItems: "center",
                          cursor: "pointer",
                          border: "1px solid #e3e0d8",
                          borderRadius: "24px",
                          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.015)"
                        }}
                        onClick={() => navigate(`/projects/${proj._id}`)}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#191919"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e3e0d8"; }}
                      >
                        <img
                          src={
                            proj.image?.startsWith("http")
                              ? proj.image
                              : `http://localhost:5000${proj.image}`
                          }
                          alt={proj.title}
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 12,
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "1px solid rgba(0,0,0,0.05)"
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div style={{ flexGrow: 1 }}>
                          <Flex
                            justify="space-between"
                            style={{ marginBottom: "0.4rem" }}
                          >
                            <h4 style={{ fontWeight: 800, fontSize: "1rem", color: "#191919" }}>
                              {proj.title}
                            </h4>
                            <span
                              style={{
                                padding: "0.25rem 0.65rem",
                                borderRadius: 99,
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                background:
                                  proj.status === "approved"
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : "rgba(245, 158, 11, 0.1)",
                                color:
                                  proj.status === "approved"
                                    ? "#10b981"
                                    : "#f59e0b",
                              }}
                            >
                              {proj.status}
                            </span>
                          </Flex>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "#86868b",
                              marginBottom: "0.6rem",
                              fontWeight: 500,
                            }}
                          >
                            {proj.category} · <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>₹{proj.targetAmount?.toLocaleString("en-IN")} goal</span>
                          </p>
                          <div
                            style={{
                              height: 6,
                              background: "rgba(0,0,0,0.05)",
                              borderRadius: 3,
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${progress}%`,
                                background: "#10b981",
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#6e6e73",
                              marginTop: "0.4rem",
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ fontFamily: "var(--font-mono)" }}>₹{(proj.currentAmount || 0).toLocaleString("en-IN")}</span> raised
                            · <span style={{ fontFamily: "var(--font-mono)" }}>{progress.toFixed(0)}%</span>
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}

            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: "1.5rem",
                color: "#191919",
                fontFamily: "var(--font-serif)"
              }}
            >
              Legit Works & Portfolio
            </h3>
            <Grid cols={2} gap="1.5rem" style={{ marginBottom: "3rem" }}>
              {profile.portfolio?.map((work, i) => (
                <Card key={i} style={{ padding: "0", overflow: "hidden", border: "1px solid #e3e0d8", borderRadius: "24px" }}>
                  <div
                    style={{
                      height: "160px",
                      background: "#fbf9f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ddd",
                      borderBottom: "1px solid #e3e0d8"
                    }}
                  >
                    {work.image ? (
                      <img
                        src={work.image}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Briefcase size={48} style={{ color: "#86868b", opacity: 0.3 }} />
                    )}
                  </div>
                  <div style={{ padding: "1.5rem" }}>
                    <h4
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        marginBottom: "0.5rem",
                        color: "#191919",
                        fontFamily: "var(--font-sans)"
                      }}
                    >
                      {work.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#6e6e73",
                        marginBottom: "1rem",
                        lineHeight: "1.5",
                        fontFamily: "var(--font-serif)"
                      }}
                    >
                      {work.description}
                    </p>
                    {work.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(work.link, "_blank")}
                        style={{ borderColor: "#e3e0d8", color: "#6e6e73", background: "transparent" }}
                      >
                        View Project{" "}
                        <ExternalLink size={14} style={{ marginLeft: 8 }} />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
              {(!profile.portfolio || profile.portfolio.length === 0) && (
                <p style={{ color: "#86868b", fontStyle: "italic" }}>
                  No portfolio items uploaded yet.
                </p>
              )}
            </Grid>

            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: "1.5rem",
                color: "#191919",
                fontFamily: "var(--font-serif)"
              }}
            >
              Collaborator Feedbacks
            </h3>
            {reviews.map((review) => (
              <ReviewCard key={review._id}>
                <Flex justify="space-between" style={{ marginBottom: "1.5rem" }}>
                  <Flex gap="1rem" align="center">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.05)",
                        color: "#191919",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.95rem"
                      }}
                    >
                      {review.author?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#191919" }}>
                        {review.author?.name}
                      </h4>
                      <p style={{ fontSize: "0.8rem", color: "#86868b", fontFamily: "var(--font-mono)" }}>
                        {new Date(review.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </Flex>
                  <StarRating rating={review.rating} readonly />
                </Flex>
                <p
                  style={{
                    color: "#6e6e73",
                    lineHeight: "1.6",
                    marginBottom: "1.5rem",
                    fontFamily: "var(--font-serif)"
                  }}
                >
                  {review.comment}
                </p>
                <Grid cols={2} gap="1rem">
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.04)",
                      padding: "1rem",
                      borderRadius: "12px",
                      borderLeft: "3px solid #10b981",
                      border: "1px solid rgba(16, 185, 129, 0.08)",
                      borderLeftWidth: "3px"
                    }}
                  >
                    <Flex
                      gap="0.5rem"
                      style={{
                        marginBottom: "0.5rem",
                        color: "#10b981",
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      <ThumbsUp size={14} /> APPRECIATION
                    </Flex>
                    <p style={{ fontSize: "0.9rem", color: "#10b981", fontWeight: 500 }}>
                      {review.appreciation || "N/A"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.04)",
                      padding: "1rem",
                      borderRadius: "12px",
                      borderLeft: "3px solid #ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.08)",
                      borderLeftWidth: "3px"
                    }}
                  >
                    <Flex
                      gap="0.5rem"
                      style={{
                        marginBottom: "0.5rem",
                        color: "#ef4444",
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      <Heart size={14} /> FEEDBACK
                    </Flex>
                    <p style={{ fontSize: "0.9rem", color: "#ef4444", fontWeight: 500 }}>
                      {review.feedback || "N/A"}
                    </p>
                  </div>
                </Grid>
              </ReviewCard>
            ))}
            {reviews.length === 0 && (
              <p
                style={{ textAlign: "center", padding: "3rem", color: "#86868b", fontWeight: 500 }}
              >
                No reviews yet. Be the first to leave one!
              </p>
            )}
          </div>

          <div>
            <Card style={{ padding: "1.5rem", marginBottom: "2rem", border: "1px solid #e3e0d8", borderRadius: "24px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  marginBottom: "1.5rem",
                  color: "#191919"
                }}
              >
                Review Summary
              </h3>
              <div
                style={{
                  paddingBottom: "1.5rem",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <Flex
                    key={star}
                    gap="1rem"
                    style={{ marginBottom: "0.5rem" }}
                  >
                    <span style={{ fontSize: "0.85rem", width: "40px", fontWeight: 600 }}>
                      {star} star
                    </span>
                    <div
                      style={{
                        flexGrow: 1,
                        height: "6px",
                        background: "rgba(0,0,0,0.05)",
                        borderRadius: "99px",
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: star === 5 ? "80%" : "5%",
                          background: "#ffc107",
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                  </Flex>
                ))}
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#6e6e73",
                    marginBottom: "1.5rem",
                    fontFamily: "var(--font-serif)"
                  }}
                >
                  Our operations are governed by verified crowdfunding
                  protocols.
                </p>
                <Button
                  variant="outline"
                  style={{ width: "100%", borderColor: "#e3e0d8", color: "#6e6e73", background: "transparent" }}
                  onClick={() => navigate("/terms")}
                >
                  View Policies
                </Button>
              </div>
            </Card>

            <Card style={{ padding: "1.5rem", border: "1px solid #e3e0d8", borderRadius: "24px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  marginBottom: "1.5rem",
                  color: "#191919"
                }}
              >
                Professional Journey
              </h3>
              <div
                style={{
                  position: "relative",
                  paddingLeft: "1.5rem",
                  borderLeft: "2px solid rgba(0,0,0,0.05)",
                }}
              >
                {profile.activityLog
                  ?.slice()
                  .reverse()
                  .map((log, i) => (
                    <div
                      key={i}
                      style={{ position: "relative", marginBottom: "1.5rem" }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "-1.9rem",
                          top: "0.2rem",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background:
                            log.type === "automatic" ? "#0071e3" : "#6e6e73",
                        }}
                      />
                      <h5
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 800,
                          marginBottom: "0.25rem",
                          color: "#191919"
                        }}
                      >
                        {log.milestone}
                      </h5>
                      <p style={{ fontSize: "0.75rem", color: "#86868b", fontFamily: "var(--font-mono)" }}>
                        {new Date(log.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </Grid>
      </Container>
    </ProfileWrapper>
  );
};

export default CompanyProfile;
