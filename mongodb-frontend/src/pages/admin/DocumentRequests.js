// src/pages/admin/DocumentRequests.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaEye,
  FaPrint,
  FaCheck,
  FaTimes,
  FaQrcode,
  FaEdit,
} from "react-icons/fa";
import { documentRequestService } from "../../services/api";
import { toast } from "react-toastify";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const DocumentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [processingNotes, setProcessingNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const documentTypes = [
    { value: "barangay-clearance", label: "Barangay Clearance" },
    { value: "residency", label: "Certificate of Residency" },
    { value: "indigency", label: "Certificate of Indigency" },
    { value: "good-conduct", label: "Good Conduct Clearance" },
    { value: "business-permit", label: "Business Permit Clearance" },
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await documentRequestService.getAll();
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching document requests:", err);
      setError("Failed to load document requests");
      toast.error("Failed to load document requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedRequest) return;

    try {
      setUpdating(true);
      await documentRequestService.updateStatus(selectedRequest._id, {
        status,
        processingNotes,
      });
      toast.success(`Request ${status} successfully`);
      setShowModal(false);
      setProcessingNotes("");
      fetchRequests();
    } catch (err) {
      console.error("Error updating request status:", err);
      toast.error("Failed to update request status");
    } finally {
      setUpdating(false);
    }
  };

  const handleViewQr = async (request) => {
    if (request.status !== "approved" && request.status !== "completed") {
      toast.warning(
        "QR code is only available for approved or completed requests"
      );
      return;
    }

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

  const formatDocumentType = (type) => {
    const doc = documentTypes.find((d) => d.value === type);
    return doc ? doc.label : type;
  };

  const openStatusModal = (request) => {
    setSelectedRequest(request);
    setProcessingNotes(request.processingNotes || "");
    setShowModal(true);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading document requests...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Document Requests Management</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Resident</th>
                  <th>Document Type</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Request Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.requestId}</td>
                    <td>{request.residentName}</td>
                    <td>{formatDocumentType(request.documentType)}</td>
                    <td>{request.purpose}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => openStatusModal(request)}
                      >
                        <FaEdit /> Process
                      </Button>
                      {(request.status === "approved" ||
                        request.status === "completed") && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleViewQr(request)}
                        >
                          <FaQrcode /> QR
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No document requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => !updating && setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Process Document Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <h6>Request Details</h6>
              <p>
                <strong>Request ID:</strong> {selectedRequest.requestId}
              </p>
              <p>
                <strong>Resident:</strong> {selectedRequest.residentName}
              </p>
              <p>
                <strong>Document Type:</strong>{" "}
                {formatDocumentType(selectedRequest.documentType)}
              </p>
              <p>
                <strong>Purpose:</strong> {selectedRequest.purpose}
              </p>
              {selectedRequest.additionalDetails && (
                <p>
                  <strong>Additional Details:</strong>{" "}
                  {selectedRequest.additionalDetails}
                </p>
              )}
              <p>
                <strong>Current Status:</strong>{" "}
                {getStatusBadge(selectedRequest.status)}
              </p>

              <Form.Group className="mt-3">
                <Form.Label>Processing Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={processingNotes}
                  onChange={(e) => setProcessingNotes(e.target.value)}
                  placeholder="Add any processing notes or instructions..."
                  disabled={updating}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleStatusUpdate("rejected")}
            disabled={updating}
          >
            <FaTimes className="me-2" /> Reject
          </Button>
          <Button
            variant="success"
            onClick={() => handleStatusUpdate("approved")}
            disabled={updating}
          >
            <FaCheck className="me-2" /> Approve
          </Button>
          <Button
            variant="primary"
            onClick={() => handleStatusUpdate("completed")}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <FaCheck className="me-2" /> Complete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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
          <Modal.Title>Document Request QR Code</Modal.Title>
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
              description="Use this QR code to verify the authenticity of the document"
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

export default DocumentRequests;
