import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  Upload,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Target,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button, Card, Container, Flex, Grid, Input, ImageUpload } from "./ui";
import { projectAPI } from "../services/api";

const CreateWrapper = styled.div`
  padding: 4rem 0;
  background: ${(props) => props.theme.colors.background};
  min-height: calc(100vh - 80px);
`;

const Stepper = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: ${(props) => (props.active ? 1 : 0.4)};
  transition: all 0.3s;
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) =>
    props.active ? props.theme.colors.primary : "transparent"};
  color: ${(props) => (props.active ? "#ffffff" : "#86868b")};
  border: 1px solid ${(props) => (props.active ? props.theme.colors.primary : "#e3e0d8")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 850;
  font-size: 0.9rem;
`;

const StepLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #191919;
`;

const FormSection = styled(motion.div)`
  max-width: 700px;
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

const CreateProject = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
  const [campaignImages, setCampaignImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else if (name === "startDate") {
      const start = new Date(value);
      if (!isNaN(start.getTime())) {
        const futureDate = new Date(start);
        futureDate.setDate(start.getDate() + 30);
        const formattedEndDate = futureDate.toISOString().split("T")[0];
        setFormData({
          ...formData,
          startDate: value,
          endDate: formattedEndDate,
        });
      } else {
        setFormData({ ...formData, startDate: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCampaignImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setCampaignImages((prev) => [...prev, ...files]);
  };

  const removeCampaignImage = (index) => {
    setCampaignImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      payload.append(key, formData[key]);
    });

    try {
      const response = await projectAPI.createProject(payload);
      const projectId = response.data.project._id;

      // Upload campaign images if any
      if (campaignImages.length > 0) {
        const imagePayload = new FormData();
        campaignImages.forEach((file) => {
          imagePayload.append("campaignImages", file);
        });
        await projectAPI.uploadCampaignImages(projectId, imagePayload);
      }

      toast.success("Campaign launched successfully! Awaiting verification.");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to launch campaign");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.title.trim() || formData.title.trim().length < 5) {
        toast.error("Campaign title must be at least 5 characters long");
        return;
      }
      if (!formData.description.trim() || formData.description.trim().length < 20) {
        toast.error("Venture description must be at least 20 characters long");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.targetAmount || Number(formData.targetAmount) < 1000) {
        toast.error("Target funding amount must be at least ₹1,000");
        return;
      }
      if (!formData.equity || Number(formData.equity) <= 0 || Number(formData.equity) > 100) {
        toast.error("Equity offered must be between 0.1% and 100%");
        return;
      }
      if (!formData.startDate) {
        toast.error("Please specify a launch date");
        return;
      }
      if (!formData.endDate) {
        toast.error("Please specify an expiration date");
        return;
      }
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        toast.error("Expiration date must be after the launch date");
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.image) {
        toast.error("Please upload a cover image for your campaign");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  return (
    <CreateWrapper>
      <Container>
        <Stepper>
          <StepItem active={currentStep >= 1}>
            <StepCircle active={currentStep >= 1}>1</StepCircle>
            <StepLabel>Identity</StepLabel>
          </StepItem>
          <StepItem active={currentStep >= 2}>
            <StepCircle active={currentStep >= 2}>2</StepCircle>
            <StepLabel>Strategy</StepLabel>
          </StepItem>
          <StepItem active={currentStep >= 3}>
            <StepCircle active={currentStep >= 3}>3</StepCircle>
            <StepLabel>Cover</StepLabel>
          </StepItem>
          <StepItem active={currentStep >= 4}>
            <StepCircle active={currentStep >= 4}>4</StepCircle>
            <StepLabel>Gallery</StepLabel>
          </StepItem>
        </Stepper>

        <FormSection
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card style={{ padding: "3rem" }}>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <>
                  <h2
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                      letterSpacing: "-1px",
                    }}
                  >
                    Project Identity
                  </h2>
                  <p style={{ color: "#666", marginBottom: "2.5rem" }}>
                    Define the core vision of your venture.
                  </p>

                  <Label>Campaign Title</Label>
                  <Input
                    name="title"
                    placeholder="e.g. Next-Gen AI Logistics"
                    value={formData.title}
                    onChange={handleChange}
                    style={{ marginBottom: "1.5rem" }}
                    required
                  />

                  <Label>Detailed Vision</Label>
                  <TextArea
                    name="description"
                    placeholder="What problem are you solving for the ecosystem?"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />

                  <Label>Category</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </Select>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h2
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                      letterSpacing: "-1px",
                    }}
                  >
                    Funding Strategy
                  </h2>
                  <p style={{ color: "#666", marginBottom: "2.5rem" }}>
                    Set your financial goals and timeline.
                  </p>

                  <Grid cols={2} gap="1.5rem">
                    <div>
                      <Label>Target Amount (₹)</Label>
                      <Input
                        type="number"
                        name="targetAmount"
                        placeholder="5,000,000"
                        value={formData.targetAmount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label>Equity Offered (%)</Label>
                      <Input
                        type="number"
                        name="equity"
                        placeholder="10"
                        value={formData.equity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Grid>

                  <Grid cols={2} gap="1.5rem" style={{ marginTop: "1.5rem" }}>
                    <div>
                      <Label>Launch Date</Label>
                      <Input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label>Expiration Date</Label>
                      <Input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        min={
                          formData.startDate
                            ? (() => {
                                const start = new Date(formData.startDate);
                                start.setDate(start.getDate() + 1);
                                return start.toISOString().split("T")[0];
                              })()
                            : new Date().toISOString().split("T")[0]
                        }
                        required
                      />
                    </div>
                  </Grid>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                      letterSpacing: "-1px",
                    }}
                  >
                    Cover Image
                  </h2>
                  <p style={{ color: "#666", marginBottom: "2.5rem" }}>
                    Upload your campaign cover image that will be displayed
                    prominently.
                  </p>

                  <ImageUpload
                    value={formData.image}
                    onChange={(file) => setFormData({ ...formData, image: file })}
                    onRemove={() => setFormData({ ...formData, image: null })}
                    maxSizeMB={5}
                  />

                  <Flex
                    gap="1rem"
                    style={{
                      padding: "1.5rem",
                      background: "#f8f9fa",
                      borderRadius: "12px",
                    }}
                  >
                    <ShieldCheck size={20} style={{ color: "#2f855a" }} />
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>
                      Your data is protected by StartupFund's enterprise
                      security protocols.
                    </span>
                  </Flex>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h2
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                      letterSpacing: "-1px",
                    }}
                  >
                    Campaign Gallery
                  </h2>
                  <p style={{ color: "#666", marginBottom: "2.5rem" }}>
                    Upload additional images to showcase your campaign
                    (optional). Upload up to 10 images.
                  </p>

                  <ImageUpload
                    value={campaignImages}
                    multiple={true}
                    onChange={(files) => setCampaignImages((prev) => [...prev, ...files])}
                    onRemove={(index) => setCampaignImages((prev) => prev.filter((_, i) => i !== index))}
                    maxSizeMB={5}
                  />

                  <Flex
                    gap="1rem"
                    style={{
                      padding: "1.5rem",
                      background: "#f8f9fa",
                      borderRadius: "12px",
                    }}
                  >
                    <ShieldCheck size={20} style={{ color: "#2f855a" }} />
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>
                      Gallery images are optional. You can add them later from
                      your dashboard.
                    </span>
                  </Flex>
                </>
              )}

              <Flex gap="1rem" style={{ marginTop: "3rem" }}>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={prevStep}
                    style={{ flexGrow: 1 }}
                  >
                    Back
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    style={{ flexGrow: 2 }}
                  >
                    Continue <ArrowRight size={18} style={{ marginLeft: 8 }} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{ flexGrow: 2 }}
                  >
                    {loading ? "Launching..." : "Launch Campaign"}{" "}
                    <Rocket size={18} style={{ marginLeft: 8 }} />
                  </Button>
                )}
              </Flex>
            </form>
          </Card>
        </FormSection>
      </Container>
    </CreateWrapper>
  );
};

export default CreateProject;
