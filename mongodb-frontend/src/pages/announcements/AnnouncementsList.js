// src/pages/announcements/AnnouncementsList.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaPlus,
} from "react-icons/fa";
import { announcementService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const AnnouncementsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAll();
      setAnnouncements(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements");
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filter === "all") return true;
    return announcement.type === filter;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case "important":
        return <Badge bg="danger">Important</Badge>;
      case "warning":
        return <Badge bg="warning">Warning</Badge>;
      case "info":
        return <Badge bg="info">Information</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
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
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Announcements</h2>
        <div>
          <ButtonGroup className="me-2">
            <Button
              variant={filter === "all" ? "primary" : "outline-primary"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "important" ? "danger" : "outline-danger"}
              onClick={() => setFilter("important")}
            >
              Important
            </Button>
            <Button
              variant={filter === "warning" ? "warning" : "outline-warning"}
              onClick={() => setFilter("warning")}
            >
              Warning
            </Button>
            <Button
              variant={filter === "info" ? "info" : "outline-info"}
              onClick={() => setFilter("info")}
            >
              Information
            </Button>
          </ButtonGroup>
          {currentUser?.role === "admin" && (
            <Button
              variant="success"
              onClick={() => navigate("/dashboard/announcements")}
            >
              <FaPlus className="me-2" /> Create Announcement
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {filteredAnnouncements.length > 0 ? (
        <Row>
          {filteredAnnouncements.map((announcement) => (
            <Col md={6} lg={4} key={announcement._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Header className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">
                        <FaBullhorn className="me-2 text-primary" />
                        {announcement.title}
                      </h5>
                      <small className="text-muted">
                        <FaCalendarAlt className="me-1" />
                        {new Date(announcement.date).toLocaleDateString()}
                      </small>
                    </div>
                    {getTypeBadge(announcement.type)}
                  </div>
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    <Badge bg="secondary" className="mb-2">
                      {announcement.category}
                    </Badge>
                    <p className="mb-0">
                      {announcement.content.length > 150
                        ? `${announcement.content.substring(0, 150)}...`
                        : announcement.content}
                    </p>
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      navigate(`/dashboard/announcements/${announcement._id}`)
                    }
                  >
                    <FaEye className="me-2" /> Read More
                  </Button>
                </Card.Footer>
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
              {filter !== "all"
                ? `No ${filter} announcements found.`
                : "There are no announcements at this time."}
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AnnouncementsList;
