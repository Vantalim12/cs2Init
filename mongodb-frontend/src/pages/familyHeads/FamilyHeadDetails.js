// src/pages/familyHeads/FamilyHeadDetails.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Table,
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { familyHeadService } from "../../services/api";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaArrowLeft,
  FaTrash,
  FaUsers,
  FaQrcode,
  FaUser,
} from "react-icons/fa";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const FamilyHeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [familyHead, setFamilyHead] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);

  useEffect(() => {
    fetchFamilyHead();
    fetchFamilyMembers();
  }, [id]);

  const fetchFamilyHead = async () => {
    try {
      setLoading(true);
      const response = await familyHeadService.getById(id);
      setFamilyHead(response.data);
    } catch (error) {
      console.error("Error fetching family head:", error);
      setError("Failed to load family head data");
      toast.error("Failed to load family head data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await familyHeadService.getMembers(id);
      setFamilyMembers(response.data);
    } catch (error) {
      console.error("Error fetching family members:", error);
      toast.error("Failed to load family members");
    }
  };

  const fetchQrCode = async () => {
    try {
      setLoadingQrCode(true);
      const response = await familyHeadService.getQrCode(id);
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      toast.error("Failed to load QR code");
    } finally {
      setLoadingQrCode(false);
    }
  };

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

  const handleDelete = async () => {
    if (familyMembers.length > 0) {
      toast.error(
        "Cannot delete family head with existing members. Please reassign or delete members first."
      );
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this family head? This action cannot be undone."
      )
    ) {
      try {
        await familyHeadService.delete(id);
        toast.success("Family head deleted successfully");
        navigate("/dashboard/family-heads");
      } catch (error) {
        console.error("Error deleting family head:", error);
        toast.error(
          error.response?.data?.error || "Failed to delete family head"
        );
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
          onClick={() => navigate("/dashboard/family-heads")}
        >
          <FaArrowLeft className="me-2" /> Back to Family Heads
        </Button>
      </Container>
    );
  }

  if (!familyHead) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Family head not found</Alert>
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/family-heads")}
        >
          <FaArrowLeft className="me-2" /> Back to Family Heads
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Family Head Details</h2>
        <div>
          <Button
            variant="primary"
            className="me-2"
            as={Link}
            to={`/dashboard/family-heads/edit/${id}`}
          >
            <FaEdit className="me-2" /> Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={familyMembers.length > 0}
          >
            <FaTrash className="me-2" /> Delete
          </Button>
        </div>
      </div>

      <Tabs defaultActiveKey="info" className="mb-4">
        <Tab eventKey="info" title="Personal Information">
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Personal Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>ID:</strong> {familyHead.headId}
                  </p>
                  <p>
                    <strong>Name:</strong> {familyHead.firstName}{" "}
                    {familyHead.lastName}
                  </p>
                  <p>
                    <strong>Gender:</strong> {familyHead.gender}
                  </p>
                  <p>
                    <strong>Age:</strong> {calculateAge(familyHead.birthDate)}{" "}
                    years old
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Birth Date:</strong>{" "}
                    {new Date(familyHead.birthDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Address:</strong> {familyHead.address}
                  </p>
                  <p>
                    <strong>Contact Number:</strong> {familyHead.contactNumber}
                  </p>
                  <p>
                    <strong>Registration Date:</strong>{" "}
                    {new Date(familyHead.registrationDate).toLocaleDateString()}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab
          eventKey="members"
          title={
            <span>
              <FaUsers className="me-2" /> Family Members (
              {familyMembers.length})
            </span>
          }
        >
          <Card className="shadow-sm mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Family Members</h5>
              <Link
                to="/dashboard/residents/add"
                className="btn btn-primary btn-sm"
              >
                <FaUser className="me-2" /> Add Member
              </Link>
            </Card.Header>
            <Card.Body>
              {familyMembers.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Age</th>
                        <th>Contact</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyMembers.map((member) => (
                        <tr key={member._id}>
                          <td>{member.residentId}</td>
                          <td>
                            {member.firstName} {member.lastName}
                          </td>
                          <td>
                            <Badge
                              bg={member.gender === "Male" ? "info" : "danger"}
                            >
                              {member.gender}
                            </Badge>
                          </td>
                          <td>{calculateAge(member.birthDate)}</td>
                          <td>{member.contactNumber || "N/A"}</td>
                          <td>
                            <Link
                              to={`/dashboard/residents/view/${member.residentId}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">
                  No family members found
                </p>
              )}
            </Card.Body>
          </Card>
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
                  title={`${familyHead.firstName} ${familyHead.lastName} - Family Head ID`}
                  description={`This QR code contains verification information for family head ${familyHead.firstName} ${familyHead.lastName} (ID: ${familyHead.headId}).`}
                  size={300}
                />
              ) : (
                <Card className="shadow-sm">
                  <Card.Body className="text-center py-5">
                    <FaQrcode size={50} className="text-muted mb-3" />
                    <h5>QR Code Not Available</h5>
                    <p className="text-muted">
                      The QR code for this family head is not currently
                      available.
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
          onClick={() => navigate("/dashboard/family-heads")}
        >
          <FaArrowLeft className="me-2" /> Back to Family Heads
        </Button>
      </div>
    </Container>
  );
};

export default FamilyHeadDetails;
