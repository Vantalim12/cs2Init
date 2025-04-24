// src/pages/residents/EditResident.js
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
import { residentService, familyHeadService } from "../../services/api";
import { toast } from "react-toastify";

const EditResident = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [familyHeads, setFamilyHeads] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    contactNumber: "",
    familyHeadId: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [residentResponse, familyHeadsResponse] = await Promise.all([
        residentService.getById(id),
        familyHeadService.getAll(),
      ]);

      const resident = residentResponse.data;
      setFormData({
        firstName: resident.firstName,
        lastName: resident.lastName,
        gender: resident.gender,
        birthDate: new Date(resident.birthDate).toISOString().split("T")[0],
        address: resident.address,
        contactNumber: resident.contactNumber || "",
        familyHeadId: resident.familyHeadId || "",
      });

      setFamilyHeads(familyHeadsResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load resident data");
      toast.error("Failed to load resident data");
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

  const handleFamilyHeadChange = (e) => {
    const selectedFamilyHeadId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      familyHeadId: selectedFamilyHeadId,
    }));

    // If a family head is selected, auto-fill the address
    if (selectedFamilyHeadId) {
      const selectedFamilyHead = familyHeads.find(
        (fh) => fh.headId === selectedFamilyHeadId
      );
      if (selectedFamilyHead) {
        setFormData((prev) => ({
          ...prev,
          address: selectedFamilyHead.address,
        }));
      }
    }
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

      await residentService.update(id, submitData);
      toast.success("Resident updated successfully");
      navigate(`/dashboard/residents/view/${id}`);
    } catch (err) {
      console.error("Error updating resident:", err);
      setError(err.response?.data?.error || "Failed to update resident");
      toast.error(err.response?.data?.error || "Failed to update resident");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading resident data...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Resident</h2>
        <Button
          variant="secondary"
          onClick={() => navigate(`/dashboard/residents/view/${id}`)}
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Optional"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Family Head</Form.Label>
                  <Form.Select
                    name="familyHeadId"
                    value={formData.familyHeadId}
                    onChange={handleFamilyHeadChange}
                    disabled={saving}
                  >
                    <option value="">No Family Head (Independent)</option>
                    {familyHeads.map((fh) => (
                      <option key={fh.headId} value={fh.headId}>
                        {fh.firstName} {fh.lastName} - {fh.headId}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    If resident belongs to a family, select the family head
                  </Form.Text>
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
                disabled={saving || !!formData.familyHeadId}
                placeholder={
                  formData.familyHeadId
                    ? "Address auto-filled from family head"
                    : "Enter address"
                }
              />
              {formData.familyHeadId && (
                <Form.Text className="text-muted">
                  Address automatically filled from selected family head
                </Form.Text>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(`/dashboard/residents/view/${id}`)}
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

export default EditResident;
