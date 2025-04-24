// src/pages/events/EventsDisplay.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Tab,
  Tabs,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import { eventService } from "../../services/api";

const EventsDisplay = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAll();
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (type) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      if (type === "upcoming") {
        return eventDate >= today;
      } else if (type === "today") {
        return eventDate.getTime() === today.getTime();
      } else {
        return eventDate < today;
      }
    });
  };

  const renderEventCard = (event) => (
    <Col md={6} lg={4} key={event._id} className="mb-4">
      <Card className="h-100 shadow-sm">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{event.title}</h5>
            <Badge bg="primary" pill>
              {event.category}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <p className="mb-1">
              <FaCalendarAlt className="me-2 text-primary" />
              {new Date(event.eventDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="mb-1">
              <FaClock className="me-2 text-primary" />
              {event.time}
            </p>
            <p className="mb-1">
              <FaMapMarkerAlt className="me-2 text-primary" />
              {event.location}
            </p>
            <p className="mb-1">
              <FaUsers className="me-2 text-primary" />
              {event.attendees?.length || 0} registered
            </p>
          </div>
          <p className="card-text">{event.description}</p>
        </Card.Body>
        <Card.Footer className="bg-white">
          <small className="text-muted">
            Posted on {new Date(event.createdDate).toLocaleDateString()}
          </small>
        </Card.Footer>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading events...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Community Events</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="upcoming" title="Upcoming Events">
          <Row>
            {filterEvents("upcoming").length > 0 ? (
              filterEvents("upcoming").map(renderEventCard)
            ) : (
              <Col>
                <Card className="shadow-sm">
                  <Card.Body className="text-center py-5">
                    <FaCalendarAlt size={50} className="text-muted mb-3" />
                    <h4>No Upcoming Events</h4>
                    <p className="text-muted">
                      Check back later for new community events.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Tab>

        <Tab eventKey="today" title="Today's Events">
          <Row>
            {filterEvents("today").length > 0 ? (
              filterEvents("today").map(renderEventCard)
            ) : (
              <Col>
                <Card className="shadow-sm">
                  <Card.Body className="text-center py-5">
                    <FaCalendarAlt size={50} className="text-muted mb-3" />
                    <h4>No Events Today</h4>
                    <p className="text-muted">
                      There are no events scheduled for today.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Tab>

        <Tab eventKey="past" title="Past Events">
          <Row>
            {filterEvents("past").length > 0 ? (
              filterEvents("past").map(renderEventCard)
            ) : (
              <Col>
                <Card className="shadow-sm">
                  <Card.Body className="text-center py-5">
                    <FaCalendarAlt size={50} className="text-muted mb-3" />
                    <h4>No Past Events</h4>
                    <p className="text-muted">No previous events to display.</p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default EventsDisplay;
