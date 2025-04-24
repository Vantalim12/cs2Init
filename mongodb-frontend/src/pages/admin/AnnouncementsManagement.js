// src/pages/admin/AnnouncementsManagement.js
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
} from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaBullhorn } from "react-icons/fa";
import { announcementService } from "../../services/api";
import { toast } from "react-toastify";

const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    type: "",
    content: "",
  });

  const announcementTypes = [
    { value: "important", label: "Important", color: "danger" },
    { value: "warning", label: "Warning", color: "warning" },
    { value: "info", label: "Information", color: "info" },
  ];

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
      toast.error("Failed to load announcements");
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
        await announcementService.update(selectedAnnouncement._id, formData);
        toast.success("Announcement updated successfully");
      } else {
        await announcementService.create(formData);
        toast.success("Announcement created successfully");
      }

      handleCloseModal();
      fetchAnnouncements();
    } catch (err) {
      console.error("Error saving announcement:", err);
      setError(err.response?.data?.error || "Failed to save announcement");
    }
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      category: announcement.category,
      type: announcement.type,
      content: announcement.content,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementService.delete(id);
        toast.success("Announcement deleted successfully");
        fetchAnnouncements();
      } catch (err) {
        console.error("Error deleting announcement:", err);
        toast.error("Failed to delete announcement");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedAnnouncement(null);
    setError("");
    setFormData({
      title: "",
      category: "",
      type: "",
      content: "",
    });
  };

  const getTypeBadge = (type) => {
    const typeConfig = announcementTypes.find((t) => t.value === type);
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
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Announcements Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Add Announcement
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement._id}>
                    <td>{announcement.title}</td>
                    <td>{announcement.category}</td>
                    <td>{getTypeBadge(announcement.type)}</td>
                    <td>{new Date(announcement.date).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(announcement)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(announcement._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No announcements found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Announcement Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBullhorn className="me-2" />
            {editMode ? "Edit Announcement" : "Add New Announcement"}
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

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                {announcementTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editMode ? "Update" : "Create"} Announcement
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AnnouncementsManagement;
