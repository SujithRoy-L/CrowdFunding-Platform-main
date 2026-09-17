import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Trash2,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { projectAPI } from "../services/api";
import { Button, Card, Container, Flex, Grid, Input, ImageUpload } from "./ui";

const EditWrapper = styled.div`
  padding: 4rem 0;
  background: ${(props) => props.theme.colors.background};
  min-height: calc(100vh - 80px);
`;

const FormSection = styled(motion.div)`
  max-width: 820px;
  margin: 0 auto;
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

const Select = styled.select`
  width: 100%;
  padding: 0.85rem 1.25rem;
  border: 1px solid #dcdad2;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  height: 3rem;
  background: #ffffff;
  margin-bottom: 1.5rem;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236e6e73%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 16px) center;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(25, 25, 25, 0.04);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #dcdad2;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  min-height: 150px;
  margin-bottom: 1.5rem;
  resize: vertical;
  background: #ffffff;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(25, 25, 25, 0.04);
  }
`;

const LockBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  color: #b45309;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 2rem;
`;

const CATEGORIES = [
  "Technology",
  "Healthcare",
  "Education",
  "Environment",
  "Finance",
  "Social",
  "Other",
];

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [campaignImages, setCampaignImages] = useState([]);
  const [newCampaignImages, setNewCampaignImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technology",
    targetAmount: "",
    equity: "",
    startDate: "",
    endDate: "",
    image: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await projectAPI.getProject(id);
        const p = res.data;
        setIsLocked(p.isLocked || false);
        setCampaignImages(p.campaignImages || []);
        setFormData({
          title: p.title || "",
          description: p.description || "",
          category: p.category || "Technology",
          targetAmount: p.targetAmount || "",
          equity: p.equity || "",
          startDate: p.startDate?.split("T")[0] || "",
          endDate: p.endDate?.split("T")[0] || "",
          image: p.image || null,
        });
        if (p.image && typeof p.image === "string") {
          setImagePreview(
            p.image?.startsWith("http")
              ? p.image
              : `http://localhost:5000${p.image}`,
          );
        }
      } catch {
        toast.error("Failed to load campaign");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "newImage" && files?.[0]) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else if (name === "campaignImages" && files) {
      setNewCampaignImages((prev) => [...prev, ...Array.from(files)]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDeleteCampaignImage = async (imageUrl) => {
    try {
      setUploadingImages(true);
      await projectAPI.deleteCampaignImage(id, imageUrl);
      setCampaignImages((prev) => prev.filter((img) => img !== imageUrl));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleUploadNewCampaignImages = async () => {
    if (newCampaignImages.length === 0) {
      toast.info("No new images to upload");
      return;
    }

    try {
      setUploadingImages(true);
      const imagePayload = new FormData();
      newCampaignImages.forEach((file) => {
        imagePayload.append("images", file);
      });
      const response = await projectAPI.uploadCampaignImages(id, imagePayload);
      setCampaignImages(response.data.campaignImages);
      setNewCampaignImages([]);
      toast.success("Campaign images uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeNewCampaignImage = (index) => {
    setNewCampaignImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      toast.error("This campaign is locked and cannot be edited.");
      return;
    }
    setSaving(true);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      // Skip existing image URL string (only upload if it's a File object)
      if (key === "image" && typeof val === "string") return;
      if (key === "image" && val instanceof File) {
        payload.append("image", val);
        return;
      }
      if (val !== null && val !== undefined) {
        payload.append(key, val);
      }
    });

    try {
      await projectAPI.updateProject(id, payload);
      toast.success("🎉 Campaign updated successfully!");
      navigate(`/projects/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EditWrapper>
        <div style={{ textAlign: "center", paddingTop: "4rem", color: "#666" }}>
          Loading campaign…
        </div>
      </EditWrapper>
    );
  }

  return (
    <EditWrapper>
      <Container>
        <FormSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${id}`)}
            style={{
              marginBottom: "2rem",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: 8 }} /> Cancel Editing
          </Button>

          <Card style={{ padding: "3rem" }}>
            <Flex
              justify="space-between"
              align="flex-start"
              style={{ marginBottom: "2.5rem" }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    letterSpacing: "-1px",
                  }}
                >
                  Edit Campaign
                </h2>
                <p style={{ color: "#666" }}>
                  Update your venture details and funding strategy.
                </p>
              </div>
              <Button
                variant="outline"
                style={{ color: "#e53e3e", borderColor: "#fed7d7" }}
                onClick={() => toast.info("Delete from the dashboard")}
              >
                <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
              </Button>
            </Flex>

            {isLocked && (
              <LockBanner>
                <AlertTriangle size={18} />
                This campaign has expired and is locked. Editing is disabled.
              </LockBanner>
            )}

            <form onSubmit={handleSubmit}>
              <Label>Campaign Title *</Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. GreenTech Solar Solutions"
                style={{ marginBottom: "1.5rem" }}
                required
                disabled={isLocked}
              />

              <Label>Project Vision *</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your startup, problem, and solution…"
                required
                disabled={isLocked}
              />

              <Grid cols={2} gap="1.5rem">
                <div>
                  <Label>Category</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isLocked}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Equity Offered (%)</Label>
                  <Input
                    type="number"
                    name="equity"
                    value={formData.equity}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="0"
                    max="100"
                    style={{ marginBottom: "1.5rem" }}
                    required
                    disabled={isLocked}
                  />
                </div>
              </Grid>

              <Grid cols={2} gap="1.5rem">
                <div>
                  <Label>Funding Goal (₹)</Label>
                  <Input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    placeholder="e.g. 5000000"
                    style={{ marginBottom: "1.5rem" }}
                    required
                    disabled={isLocked}
                  />
                </div>
                <div>
                  <Label>Campaign End Date</Label>
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={{ marginBottom: "1.5rem" }}
                    required
                    disabled={isLocked}
                  />
                </div>
              </Grid>

              <div style={{ marginTop: "1rem", marginBottom: "2.5rem" }}>
                <Label>Hero Image</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(file) =>
                    setFormData((prev) => ({ ...prev, image: file }))
                  }
                  onRemove={() =>
                    setFormData((prev) => ({ ...prev, image: null }))
                  }
                  disabled={isLocked}
                  maxSizeMB={5}
                />
              </div>

              {/* Campaign Gallery */}
              <div style={{ marginBottom: "3rem" }}>
                <Label>Campaign Gallery</Label>
                <ImageUpload
                  value={newCampaignImages}
                  existingImages={campaignImages}
                  multiple={true}
                  onChange={(files) =>
                    setNewCampaignImages((prev) => [...prev, ...files])
                  }
                  onRemove={(index) =>
                    setNewCampaignImages((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  onDeleteExisting={handleDeleteCampaignImage}
                  disabled={isLocked}
                  maxSizeMB={5}
                />

                {newCampaignImages.length > 0 && (
                  <Button
                    type="button"
                    onClick={handleUploadNewCampaignImages}
                    disabled={uploadingImages || isLocked}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      marginTop: "1rem",
                    }}
                  >
                    {uploadingImages
                      ? "Uploading..."
                      : "Upload New Gallery Images Now"}
                  </Button>
                )}
              </div>

              <Button
                type="submit"
                disabled={saving || isLocked}
                style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem" }}
              >
                {saving ? "Saving Changes..." : "Save & Publish Updates"}{" "}
                <Save size={18} style={{ marginLeft: 8 }} />
              </Button>
            </form>
          </Card>
        </FormSection>
      </Container>
    </EditWrapper>
  );
};

export default EditProject;
