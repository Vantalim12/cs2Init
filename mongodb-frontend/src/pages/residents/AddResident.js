// mongodb-frontend/src/pages/residents/AddResident.js
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
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { residentService, familyHeadService } from "../../services/api";
import { toast } from "react-toastify";

const AddResident = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    fetchFamilyHeads();
  }, []);

  const fetchFamilyHeads = async () => {
    try {
      const response = await familyHeadService.getAll();
      setFamilyHeads(response.data);
    } catch (err) {
      console.error("Error fetching family heads:", err);
      toast.error("Failed to load family heads");
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
      setLoading(true);
      setError("");

      // Prepare data for submission
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        birthDate: new Date(formData.birthDate).toISOString(),
        address: formData.address.trim(),
        contactNumber: formData.contactNumber.trim(),
        familyHeadId: formData.familyHeadId || null,
      };

      console.log("Submitting resident data:", submitData);

      const response = await residentService.create(submitData);
      console.log("Resident creation response:", response);

      toast.success("Resident added successfully");
      navigate("/dashboard/residents");
    } catch (err) {
      console.error("Error adding resident:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to add resident";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Add New Resident</h2>
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard/residents")}
        >
          <FaArrowLeft className="me-2" /> Back to Residents
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                disabled={loading || !!formData.familyHeadId}
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
                onClick={() => navigate("/dashboard/residents")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Add Resident
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

export default AddResident;
