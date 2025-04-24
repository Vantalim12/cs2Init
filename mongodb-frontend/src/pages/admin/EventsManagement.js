// src/pages/admin/EventsManagement.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Alert,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUsers,
  FaQrcode,
} from "react-icons/fa";
import { eventService } from "../../services/api";
import { toast } from "react-toastify";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    eventDate: "",
    time: "",
    location: "",
  });

  const categories = [
    "Community Meeting",
    "Health Campaign",
    "Sports",
    "Cultural",
    "Educational",
    "Clean-up Drive",
    "Emergency Drill",
    "Other",
  ];

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
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await eventService.update(selectedEvent._id, formData);
        toast.success("Event updated successfully");
      } else {
        await eventService.create(formData);
        toast.success("Event created successfully");
      }
      handleCloseModal();
      fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      setError(err.response?.data?.error || "Failed to save event");
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      eventDate: new Date(event.eventDate).toISOString().split("T")[0],
      time: event.time,
      location: event.location,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventService.delete(id);
        toast.success("Event deleted successfully");
        fetchEvents();
      } catch (err) {
        console.error("Error deleting event:", err);
        toast.error("Failed to delete event");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedEvent(null);
    setError("");
    setFormData({
      title: "",
      description: "",
      category: "",
      eventDate: "",
      time: "",
      location: "",
    });
  };

  const handleViewAttendees = (event) => {
    setSelectedEvent(event);
    setShowAttendeesModal(true);
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

  const filterEvents = (type) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      if (type === "upcoming") {
        return eventDate >= today;
      } else {
        return eventDate < today;
      }
    });
  };

  const renderEventTable = (eventsList) => (
    <div className="table-responsive">
      <Table hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th>Attendees</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {eventsList.map((event) => (
            <tr key={event._id}>
              <td>{event.title}</td>
              <td>{event.category}</td>
              <td>{new Date(event.eventDate).toLocaleDateString()}</td>
              <td>{event.time}</td>
              <td>{event.location}</td>
              <td>
                <Badge bg="primary" pill>
                  {event.attendees?.length || 0}
                </Badge>
              </td>
              <td>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleViewAttendees(event)}
                >
                  <FaUsers />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleViewQr(event)}
                >
                  <FaQrcode />
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(event)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(event._id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
          {eventsList.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center">
                No events found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Events Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Add Event
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="upcoming" title="Upcoming Events">
              {renderEventTable(filterEvents("upcoming"))}
            </Tab>
            <Tab eventKey="past" title="Past Events">
              {renderEventTable(filterEvents("past"))}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Event Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCalendarAlt className="me-2" />
            {editMode ? "Edit Event" : "Add New Event"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Event Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editMode ? "Update" : "Create"} Event
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Attendees Modal */}
      <Modal
        show={showAttendeesModal}
        onHide={() => setShowAttendeesModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUsers className="me-2" />
            Event Attendees - {selectedEvent?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contact Number</th>
                </tr>
              </thead>
              <tbody>
                {selectedEvent?.attendees?.map((attendee, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{attendee.id}</td>
                    <td>{attendee.name}</td>
                    <td>{attendee.contactNumber || "N/A"}</td>
                  </tr>
                ))}
                {(selectedEvent?.attendees?.length || 0) === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No attendees registered
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
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
              description={`QR Code for event registration - ${new Date(
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

export default EventsManagement;
