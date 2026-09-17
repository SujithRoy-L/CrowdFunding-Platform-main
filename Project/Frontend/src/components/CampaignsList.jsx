import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";

const CampaignsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading campaigns...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Active Campaigns</h2>
        <select
          className="form-select w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Environment">Environment</option>
          <option value="Social">Social</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-5">
          <h3>No campaigns found</h3>
          <p className="text-muted">Be the first to start a campaign!</p>
          <Link to="/projects/new" className="btn btn-primary">
            Create Campaign
          </Link>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredProjects.map((project) => (
            <Col key={project._id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={project.image?.startsWith("http") ? project.image : `http://localhost:5000${project.image}`}
                  alt={project.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{project.title}</Card.Title>
                  <Card.Text className="text-muted mb-2">
                    by {project.creator?.name || "Anonymous"}
                  </Card.Text>
                  <Card.Text>
                    {project.description.length > 100
                      ? `${project.description.substring(0, 100)}...`
                      : project.description}
                  </Card.Text>
                  <div className="mb-3">
                    <Badge bg="primary" className="me-2">
                      {project.category}
                    </Badge>
                    <Badge
                      bg={
                        project.status === "completed"
                          ? "info"
                          : project.status === "approved"
                            ? "success"
                            : project.status === "pending"
                              ? "warning"
                              : "danger"
                      }
                    >
                      {project.status === "completed"
                        ? "Fully Funded"
                        : project.status}
                    </Badge>
                  </div>
                  <Link
                    to={`/projects/${project._id}`}
                    className="btn btn-outline-primary"
                  >
                    View Details
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CampaignsList;
