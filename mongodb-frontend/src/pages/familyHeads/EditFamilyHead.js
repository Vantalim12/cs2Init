// src/pages/familyHeads/EditFamilyHead.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { familyHeadService } from "../../services/api";
import { toast } from "react-toastify";

const EditFamilyHead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    contactNumber: "",
  });

  useEffect(() => {
    fetchFamilyHead();
  }, [id]);

  const fetchFamilyHead = async () => {
    try {
      setLoading(true);
      const response = await familyHeadService.getById(id);
      const familyHead = response.data;

      setFormData({
        firstName: familyHead.firstName,
        lastName: familyHead.lastName,
        gender: familyHead.gender,
        birthDate: new Date(familyHead.birthDate).toISOString().split("T")[0],
        address: familyHead.address,
        contactNumber: familyHead.contactNumber,
      });
    } catch (err) {
      console.error("Error fetching family head:", err);
      setError("Failed to load family head data");
      toast.error("Failed to load family head data");
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
      setSaving(true);
      setError("");

      // Prepare data for submission
      const submitData = {
        ...formData,
        birthDate: new Date(formData.birthDate).toISOString(),
      };

      await familyHeadService.update(id, submitData);
      toast.success("Family head updated successfully");
      navigate(`/dashboard/family-heads/view/${id}`);
    } catch (err) {
      console.error("Error updating family head:", err);
      setError(err.response?.data?.error || "Failed to update family head");
      toast.error(err.response?.data?.error || "Failed to update family head");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading family head data...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Family Head</h2>
        <Button
          variant="secondary"
          onClick={() => navigate(`/dashboard/family-heads/view/${id}`)}
        >
          <FaArrowLeft className="me-2" /> Back to Details
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Birth Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={saving}
                placeholder="Enter complete address"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                disabled={saving}
                placeholder="Enter contact number"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(`/dashboard/family-heads/view/${id}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditFamilyHead;
