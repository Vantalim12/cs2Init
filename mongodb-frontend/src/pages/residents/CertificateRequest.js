// src/pages/residents/CertificateRequest.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { documentRequestService } from "../../services/api";
import { toast } from "react-toastify";
import {
  FaFileAlt,
  FaPlus,
  FaQrcode,
  FaDownload,
  FaPrint,
} from "react-icons/fa";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const CertificateRequest = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const [formData, setFormData] = useState({
    documentType: "",
    purpose: "",
    additionalDetails: "",
    deliveryOption: "",
  });

  const documentTypes = [
    { value: "barangay-clearance", label: "Barangay Clearance" },
    { value: "residency", label: "Certificate of Residency" },
    { value: "indigency", label: "Certificate of Indigency" },
    { value: "good-conduct", label: "Good Conduct Clearance" },
    { value: "business-permit", label: "Business Permit Clearance" },
  ];

  const deliveryOptions = [
    { value: "pickup", label: "Pick up at Barangay Hall" },
    { value: "email", label: "Email (Digital Copy)" },
    { value: "delivery", label: "Home Delivery" },
  ];

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await documentRequestService.getByResident(
        currentUser.residentId
      );
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load certificate requests");
      toast.error("Failed to load certificate requests");
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
      setSubmitting(true);
      setError("");

      const submitData = {
        ...formData,
        residentId: currentUser.residentId,
      };

      await documentRequestService.create(submitData);
      toast.success("Certificate request submitted successfully");

      // Reset form and refresh requests
      setFormData({
        documentType: "",
        purpose: "",
        additionalDetails: "",
        deliveryOption: "",
      });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      console.error("Error submitting request:", err);
      setError(err.response?.data?.error || "Failed to submit request");
      toast.error(err.response?.data?.error || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewQr = async (request) => {
    setSelectedRequest(request);
    setShowQrModal(true);
    setLoadingQr(true);

    try {
      const response = await documentRequestService.getQrCode(request._id);
      setQrCode(response.data.qrCode);
    } catch (err) {
      console.error("Error fetching QR code:", err);
      toast.error("Failed to load QR code");
    } finally {
      setLoadingQr(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge bg="success">Completed</Badge>;
      case "approved":
        return <Badge bg="info">Approved</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      case "pending":
      default:
        return <Badge bg="warning">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading certificate requests...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Certificate Requests</h2>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <FaPlus className="me-2" />
          {showForm ? "Cancel Request" : "New Request"}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {showForm && (
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-3">New Certificate Request</h5>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Document Type</Form.Label>
                    <Form.Select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Document Type</option>
                      {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Delivery Option</Form.Label>
                    <Form.Select
                      name="deliveryOption"
                      value={formData.deliveryOption}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Delivery Option</option>
                      {deliveryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Purpose of Request</Form.Label>
                <Form.Control
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  placeholder="e.g., Employment, School requirements, etc."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Additional Details (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="Any additional information or specific requirements"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaFileAlt className="me-2" /> Submit Request
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">My Certificate Requests</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Document Type</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Request Date</th>
                  <th>Delivery Option</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.requestId}</td>
                    <td>
                      {documentTypes.find(
                        (t) => t.value === request.documentType
                      )?.label || request.documentType}
                    </td>
                    <td>{request.purpose}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td>
                      {deliveryOptions.find(
                        (o) => o.value === request.deliveryOption
                      )?.label || request.deliveryOption}
                    </td>
                    <td>
                      {(request.status === "approved" ||
                        request.status === "completed") && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewQr(request)}
                        >
                          <FaQrcode className="me-1" /> QR Code
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No certificate requests yet
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* QR Code Modal */}
      <Modal
        show={showQrModal}
        onHide={() => {
          setShowQrModal(false);
          setSelectedRequest(null);
          setQrCode(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Document QR Code</Modal.Title>
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
              title={`${selectedRequest?.documentType} - ${selectedRequest?.requestId}`}
              description="Use this QR code to verify the authenticity of your document"
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

export default CertificateRequest;
