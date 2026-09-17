import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
//import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from "react-hot-toast";
import axios from "axios";

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch project details.");
        toast.error("Error fetching project.");
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "primary";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm">
        <Row className="g-0">
          <Col md={6}>
            <div
              className="position-relative h-100"
              style={{ minHeight: "400px" }}
            >
              <img
                src={
                  project.image?.startsWith("http")
                    ? project.image
                    : `http://localhost:5000${project.image}`
                }
                alt={project.title}
                className="w-100 h-100 object-fit-cover"
                style={{ objectPosition: "center" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/800x400?text=No+Image";
                }}
              />
            </div>
          </Col>
          <Col md={6}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-1">{project.title}</h2>
                  <p className="text-muted mb-0">
                    by {project.creator?.name || "Unknown"}
                  </p>
                </div>
                <Badge
                  bg={getStatusBadgeVariant(project.status)}
                  className="px-3 py-2"
                >
                  {project.status}
                </Badge>
              </div>

              <Card.Text className="mb-4" style={{ fontSize: "1.1rem" }}>
                {project.description}
              </Card.Text>

              <Row className="mb-4">
                <Col>
                  <h5>Category</h5>
                  <p className="text-muted">{project.category}</p>
                </Col>
                <Col>
                  <h5>Target Amount</h5>
                  <p className="text-muted">
                    ₹{project.targetAmount.toLocaleString()}
                  </p>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <h5>Start Date</h5>
                  <p className="text-muted">{formatDate(project.startDate)}</p>
                </Col>
                <Col>
                  <h5>End Date</h5>
                  <p className="text-muted">{formatDate(project.endDate)}</p>
                </Col>
              </Row>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={project.status === "completed"}
                  onClick={() => navigate(`/projects/${id}/invest`)}
                >
                  {project.status === "completed"
                    ? "Fully Funded"
                    : "Invest Now"}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default ProjectView;
