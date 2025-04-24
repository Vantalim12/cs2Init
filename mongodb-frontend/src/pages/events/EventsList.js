// src/pages/events/EventsList.js
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
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaQrcode,
  FaCheck,
} from "react-icons/fa";
import { eventService, residentService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const EventsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [residentInfo, setResidentInfo] = useState(null);

  useEffect(() => {
    fetchEvents();
    if (currentUser?.residentId) {
      fetchResidentInfo();
    }
  }, [currentUser]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAll();
      setEvents(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchResidentInfo = async () => {
    try {
      const response = await residentService.getById(currentUser.residentId);
      setResidentInfo(response.data);
    } catch (err) {
      console.error("Error fetching resident info:", err);
    }
  };

  const handleRegister = async () => {
    if (!selectedEvent || !residentInfo) return;

    try {
      setRegistering(true);
      const attendee = {
        id: residentInfo.residentId,
        name: `${residentInfo.firstName} ${residentInfo.lastName}`,
        contactNumber: residentInfo.contactNumber || "",
      };

      await eventService.registerAttendee(selectedEvent._id, attendee);
      toast.success("Successfully registered for the event!");
      setShowRegisterModal(false);
      fetchEvents(); // Refresh events to update attendee count
    } catch (err) {
      console.error("Error registering for event:", err);
      toast.error(err.response?.data?.error || "Failed to register for event");
    } finally {
      setRegistering(false);
    }
  };

  const handleViewQr = async (event) => {
    setSelectedEvent(event);
    setShowQrModal(true);
    setLoadingQr(true);

    try {
      const response = await eventService.getQrCode(event._id);
      setQrCode(response.data.qrCode);
    } catch (err) {
      console.error("Error fetching QR code:", err);
      toast.error("Failed to load QR code");
    } finally {
      setLoadingQr(false);
    }
  };

  const isRegistered = (event) => {
    return event.attendees?.some(
      (attendee) => attendee.id === currentUser?.residentId
    );
  };

  const upcomingEvents = events.filter(
    (event) => new Date(event.eventDate) >= new Date()
  );

  const pastEvents = events.filter(
    (event) => new Date(event.eventDate) < new Date()
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
    <Container>
      <h2 className="mb-4">Community Events</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <h4 className="mb-3">Upcoming Events</h4>
      {upcomingEvents.length > 0 ? (
        <Row>
          {upcomingEvents.map((event) => (
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
                  <p className="mb-2">
                    <FaCalendarAlt className="me-2 text-primary" />
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="mb-2">
                    <FaClock className="me-2 text-primary" />
                    {event.time}
                  </p>
                  <p className="mb-2">
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    {event.location}
                  </p>
                  <p className="mb-3">
                    <FaUsers className="me-2 text-primary" />
                    {event.attendees?.length || 0} registered
                  </p>
                  <p className="card-text">{event.description}</p>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    {currentUser?.role === "resident" &&
                      (isRegistered(event) ? (
                        <Button variant="success" disabled>
                          <FaCheck className="me-2" /> Registered
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowRegisterModal(true);
                          }}
                        >
                          Register Now
                        </Button>
                      ))}
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleViewQr(event)}
                    >
                      <FaQrcode className="me-2" /> QR Code
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="shadow-sm mb-5">
          <Card.Body className="text-center py-5">
            <FaCalendarAlt size={50} className="text-muted mb-3" />
            <h4>No Upcoming Events</h4>
            <p className="text-muted">
              Check back later for new community events.
            </p>
          </Card.Body>
        </Card>
      )}

      <h4 className="mb-3 mt-5">Past Events</h4>
      {pastEvents.length > 0 ? (
        <Row>
          {pastEvents.map((event) => (
            <Col md={6} lg={4} key={event._id} className="mb-4">
              <Card className="h-100 shadow-sm bg-light">
                <Card.Header className="bg-secondary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{event.title}</h5>
                    <Badge bg="light" text="dark" pill>
                      {event.category}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p className="mb-2">
                    <FaCalendarAlt className="me-2 text-secondary" />
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <FaMapMarkerAlt className="me-2 text-secondary" />
                    {event.location}
                  </p>
                  <p className="mb-3">
                    <FaUsers className="me-2 text-secondary" />
                    {event.attendees?.length || 0} attended
                  </p>
                  <p className="card-text">{event.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <FaCalendarAlt size={50} className="text-muted mb-3" />
            <h4>No Past Events</h4>
            <p className="text-muted">No previous events to display.</p>
          </Card.Body>
        </Card>
      )}

      {/* Registration Modal */}
      <Modal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Register for Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <h5>{selectedEvent.title}</h5>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedEvent.eventDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {selectedEvent.time}
              </p>
              <p>
                <strong>Location:</strong> {selectedEvent.location}
              </p>
              <hr />
              <p>
                <strong>Registering as:</strong>{" "}
                {residentInfo
                  ? `${residentInfo.firstName} ${residentInfo.lastName}`
                  : "Loading..."}
              </p>
              <p>
                <strong>Resident ID:</strong>{" "}
                {residentInfo?.residentId || "Loading..."}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRegisterModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRegister}
            disabled={registering || !residentInfo}
          >
            {registering ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Registering...
              </>
            ) : (
              "Confirm Registration"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        show={showQrModal}
        onHide={() => {
          setShowQrModal(false);
          setSelectedEvent(null);
          setQrCode(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Event QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingQr ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading QR Code...</p>
            </div>
          ) : qrCode ? (
            <QrCodeDisplay
              qrCodeData={qrCode}
              title={selectedEvent?.title}
              description={`QR Code for event - ${new Date(
                selectedEvent?.eventDate
              ).toLocaleDateString()}`}
              size={300}
            />
          ) : (
            <Alert variant="danger">
              Failed to load QR code. Please try again later.
            </Alert>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EventsList;
