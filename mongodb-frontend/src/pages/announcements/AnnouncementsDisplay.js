// src/pages/announcements/AnnouncementsDisplay.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import { FaBullhorn, FaClock, FaFilter } from "react-icons/fa";
import { announcementService } from "../../services/api";

const AnnouncementsDisplay = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const categories = [
    "Health",
    "Safety",
    "Community",
    "Events",
    "Government",
    "Maintenance",
    "Education",
    "Other",
  ];

  const types = [
    { value: "important", label: "Important", color: "danger" },
    { value: "warning", label: "Warning", color: "warning" },
    { value: "info", label: "Information", color: "info" },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAll();
      setAnnouncements(response.data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (
      selectedCategory !== "all" &&
      announcement.category !== selectedCategory
    ) {
      return false;
    }
    if (selectedType !== "all" && announcement.type !== selectedType) {
      return false;
    }
    return true;
  });

  const getTypeBadge = (type) => {
    const typeConfig = types.find((t) => t.value === type);
    return typeConfig ? (
      <Badge bg={typeConfig.color}>{typeConfig.label}</Badge>
    ) : (
      <Badge bg="secondary">{type}</Badge>
    );
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading announcements...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Barangay Announcements</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <FaFilter className="me-2" />
                  Filter by Category
                </Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <FaFilter className="me-2" />
                  Filter by Type
                </Form.Label>
                <Form.Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Announcements List */}
      {filteredAnnouncements.length > 0 ? (
        <Row>
          {filteredAnnouncements.map((announcement) => (
            <Col md={6} lg={4} key={announcement._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Header className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FaBullhorn className="me-2 text-primary" />
                      {announcement.title}
                    </h5>
                    {getTypeBadge(announcement.type)}
                  </div>
                  <small className="text-muted">
                    <FaClock className="me-1" />
                    {new Date(announcement.date).toLocaleDateString()}
                  </small>
                </Card.Header>
                <Card.Body>
                  <Badge bg="secondary" className="mb-3">
                    {announcement.category}
                  </Badge>
                  <p className="card-text">{announcement.content}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <FaBullhorn size={50} className="text-muted mb-3" />
            <h4>No Announcements</h4>
            <p className="text-muted">
              {selectedCategory !== "all" || selectedType !== "all"
                ? "No announcements match your filter criteria."
                : "There are no announcements at this time."}
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AnnouncementsDisplay;
