// src/pages/residents/ResidentDetails.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { residentService, familyHeadService } from "../../services/api";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaArrowLeft,
  FaTrash,
  FaUserFriends,
  FaQrcode,
} from "react-icons/fa";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const ResidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [familyHead, setFamilyHead] = useState(null);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);

  // Fetch resident data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await residentService.getById(id);
        setResident(response.data);

        // If resident belongs to a family, fetch family head data
        if (response.data.familyHeadId) {
          const headResponse = await familyHeadService.getById(
            response.data.familyHeadId
          );
          setFamilyHead(headResponse.data);
        }
      } catch (error) {
        console.error("Error fetching resident:", error);
        setError("Failed to load resident data");
        toast.error("Failed to load resident data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch resident QR code
  const fetchQrCode = async () => {
    try {
      setLoadingQrCode(true);
      const response = await residentService.getQrCode(id);
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      toast.error("Failed to load QR code");
    } finally {
      setLoadingQrCode(false);
    }
  };

  // Calculate age from birthdate
  const calculateAge = (birthDate) => {
    const dob = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Handle deletion
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this resident? This action cannot be undone."
      )
    ) {
      try {
        await residentService.delete(id);
        toast.success("Resident deleted successfully");
        navigate("/dashboard/residents");
      } catch (error) {
        console.error("Error deleting resident:", error);
        toast.error(error.response?.data?.error || "Failed to delete resident");
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/residents")}
        >
          <FaArrowLeft className="me-2" /> Back to Residents
        </Button>
      </Container>
    );
  }

  if (!resident) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Resident not found</Alert>
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/residents")}
        >
          <FaArrowLeft className="me-2" /> Back to Residents
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Resident Details</h2>
        <div>
          <Button
            variant="primary"
            className="me-2"
            as={Link}
            to={`/dashboard/residents/edit/${id}`}
          >
            <FaEdit className="me-2" /> Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="me-2" /> Delete
          </Button>
        </div>
      </div>

      <Tabs defaultActiveKey="info" className="mb-4">
        <Tab eventKey="info" title="Resident Information">
          {/* Resident Information */}
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Personal Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>ID:</strong> {resident.residentId}
                  </p>
                  <p>
                    <strong>Name:</strong> {resident.firstName}{" "}
                    {resident.lastName}
                  </p>
                  <p>
                    <strong>Gender:</strong> {resident.gender}
                  </p>
                  <p>
                    <strong>Age:</strong> {calculateAge(resident.birthDate)}{" "}
                    years old
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Birth Date:</strong>{" "}
                    {new Date(resident.birthDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Address:</strong> {resident.address}
                  </p>
                  <p>
                    <strong>Contact Number:</strong>{" "}
                    {resident.contactNumber || "Not specified"}
                  </p>
                  <p>
                    <strong>Registration Date:</strong>{" "}
                    {new Date(resident.registrationDate).toLocaleDateString()}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Family Information */}
          {familyHead && (
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">Family Information</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Family Head:</strong> {familyHead.firstName}{" "}
                  {familyHead.lastName} ({familyHead.headId})
                </p>
                <p>
                  <strong>Family Address:</strong> {familyHead.address}
                </p>
                <p>
                  <strong>Family Head Contact:</strong>{" "}
                  {familyHead.contactNumber}
                </p>
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    as={Link}
                    to={`/dashboard/family-heads/view/${familyHead.headId}`}
                  >
                    <FaUserFriends className="me-2" /> View Family Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Tab>

        <Tab
          eventKey="qrcode"
          title={
            <span>
              <FaQrcode className="me-2" /> QR Code
            </span>
          }
          onEnter={fetchQrCode}
        >
          <Row>
            <Col md={8} lg={6} className="mx-auto">
              {loadingQrCode ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading QR Code...</p>
                </div>
              ) : qrCode ? (
                <QrCodeDisplay
                  qrCodeData={qrCode}
                  title={`${resident.firstName} ${resident.lastName} - Resident ID`}
                  description={`This QR code contains verification information for resident ${resident.firstName} ${resident.lastName} (ID: ${resident.residentId}).`}
                  size={300}
                />
              ) : (
                <Card className="shadow-sm">
                  <Card.Body className="text-center py-5">
                    <FaQrcode size={50} className="text-muted mb-3" />
                    <h5>QR Code Not Available</h5>
                    <p className="text-muted">
                      The QR code for this resident is not currently available.
                    </p>
                    <Button variant="primary" onClick={fetchQrCode}>
                      Generate QR Code
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>
      </Tabs>

      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard/residents")}
        >
          <FaArrowLeft className="me-2" /> Back to Residents
        </Button>
      </div>
    </Container>
  );
};

export default ResidentDetails;
