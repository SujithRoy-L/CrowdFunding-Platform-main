import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Building2,
  Globe,
  ShieldCheck,
  Save,
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Container, Flex, Grid, Input } from "../components/ui";
import useAuthStore from "../store/authStore";
import { userAPI, b2bAPI } from "../services/api";

const ProfileWrapper = styled.div`
  padding: 4rem 0;
  background: #fafafa;
  min-height: calc(100vh - 80px);
`;

const ProfileCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #444;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 2.5rem 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: ${(props) => props.theme.fonts.serif};
`;

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    companyName: user?.companyName || "",
    companyWebsite: user?.companyWebsite || "",
    bio: user?.bio || "",
    logo: "",
    slogan: "",
    portfolio: [],
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [companyData, setCompanyData] = useState(null);

  React.useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const res = await b2bAPI.getCompany(user.id);
      setCompanyData(res.data);
      setFormData((prev) => ({
        ...prev,
        logo: res.data.branding?.logo || "",
        slogan: res.data.branding?.slogan || "",
        portfolio: res.data.portfolio || [],
      }));
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("New passwords do not match");
          setLoading(false);
          return;
        }
      }

      const updateData = {
        name: formData.name,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        bio: formData.bio,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      const response = await userAPI.updateProfile(updateData);

      // Update Company Data
      await b2bAPI.updateCompany(companyData?.id || user?.id, {
        branding: {
          logo: formData.logo,
          slogan: formData.slogan,
        },
        portfolio: formData.portfolio,
      });

      updateUser(response.data.user);
      toast.success("Professional journey and profile updated!");

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      fetchCompanyData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioItem = () => {
    setFormData({
      ...formData,
      portfolio: [
        ...formData.portfolio,
        { title: "", description: "", link: "", image: "" },
      ],
    });
  };

  const removePortfolioItem = (index) => {
    const newPortfolio = formData.portfolio.filter((_, i) => i !== index);
    setFormData({ ...formData, portfolio: newPortfolio });
  };

  const updatePortfolioItem = (index, field, value) => {
    const newPortfolio = [...formData.portfolio];
    newPortfolio[index] = { ...newPortfolio[index], [field]: value };
    setFormData({ ...formData, portfolio: newPortfolio });
  };

  return (
    <ProfileWrapper>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProfileCard>
            <header style={{ marginBottom: "3rem", textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "24px",
                  background: "rgba(0, 113, 227, 0.08)",
                  color: "#0071e3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  margin: "0 auto 1.5rem",
                  border: "1px solid rgba(0, 113, 227, 0.15)",
                }}
              >
                {user?.name.charAt(0)}
              </div>
              <h1
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  letterSpacing: "-1.5px",
                  marginBottom: "0.5rem",
                  fontFamily: '"Crimson Pro", Lora, Georgia, serif',
                }}
              >
                Professional Identity
              </h1>
              <p style={{ color: "#666" }}>
                Manage your personal and company metadata for the crowdfunding
                ecosystem.
              </p>
            </header>

            <form onSubmit={handleSubmit}>
              <SectionTitle>
                <User size={20} /> Personal Information
              </SectionTitle>
              <Grid cols={2} gap="1.5rem">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Email Address (Locked)</Label>
                  <Input
                    value={user?.email}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
              </Grid>

              <SectionTitle>
                <Building2 size={20} /> Company Profile
              </SectionTitle>
              <Grid cols={2} gap="1.5rem">
                <div>
                  <Label>Entity / Company Name</Label>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Acme Innovations"
                  />
                </div>
                <div>
                  <Label>Official Website</Label>
                  <Input
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://acme.io"
                  />
                </div>
              </Grid>
              <div style={{ marginTop: "1.5rem" }}>
                <Label>Company Bio / Vision</Label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your company's role in the ecosystem..."
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    minHeight: "100px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <SectionTitle>
                <Globe size={20} /> Branding & Visibility
              </SectionTitle>
              <Grid cols={2} gap="1.5rem">
                <div>
                  <Label>Company Logo URL</Label>
                  <Input
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="https://path-to-logo.png"
                  />
                </div>
                <div>
                  <Label>Core Slogan / Mission Statement</Label>
                  <Input
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleChange}
                    placeholder="e.g. Revolutionizing the industry"
                  />
                </div>
              </Grid>

              <SectionTitle>
                <Briefcase size={20} /> Portfolio & Legit Works
              </SectionTitle>
              <p
                style={{
                  color: "#666",
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                }}
              >
                Showcase your past projects and successful collaborations.
              </p>

              {formData.portfolio.map((item, index) => (
                <Card
                  key={index}
                  style={{
                    marginBottom: "1.5rem",
                    background: "#fcfcfc",
                    border: "1px dashed #ddd",
                  }}
                >
                  <Flex
                    justify="space-between"
                    style={{ marginBottom: "1rem" }}
                  >
                    <h4 style={{ fontWeight: 800 }}>Project #{index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => removePortfolioItem(index)}
                      style={{ color: "#e53e3e", borderColor: "#fed7d7" }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Flex>
                  <Grid cols={2} gap="1rem">
                    <div>
                      <Label>Project Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          updatePortfolioItem(index, "title", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Project Link</Label>
                      <Input
                        value={item.link}
                        onChange={(e) =>
                          updatePortfolioItem(index, "link", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </Grid>
                  <div style={{ marginTop: "1rem" }}>
                    <Label>Description of Work</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updatePortfolioItem(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </Card>
              ))}

              <Button
                variant="outline"
                type="button"
                onClick={addPortfolioItem}
                style={{ width: "100%" }}
              >
                <Plus size={18} style={{ marginRight: 8 }} /> Add Portfolio Item
              </Button>

              <SectionTitle>
                <Lock size={20} /> Security Update
              </SectionTitle>
              <Grid cols={3} gap="1rem">
                <div>
                  <Label>Current Passphrase</Label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>New Passphrase</Label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Confirm New</Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </Grid>

              <Button
                size="lg"
                style={{ width: "100%", marginTop: "3.5rem" }}
                disabled={loading}
              >
                <Save size={18} style={{ marginRight: 8 }} />
                {loading ? "Saving Identity..." : "Update Ecosystem Profile"}
              </Button>
            </form>

            <Flex
              gap="1rem"
              style={{
                marginTop: "2.5rem",
                padding: "1.5rem",
                background: "#f8f9fa",
                borderRadius: "16px",
              }}
            >
              <ShieldCheck size={20} style={{ color: "#2f855a" }} />
              <span style={{ fontSize: "0.85rem", color: "#666" }}>
                Your information is verified and secured using industry-standard
                crowdfunding protocols.
              </span>
            </Flex>
          </ProfileCard>
        </motion.div>
      </Container>
    </ProfileWrapper>
  );
};

export default Profile;
