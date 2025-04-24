// src/pages/residents/ResidentProfile.js
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
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  residentService,
  familyHeadService,
  documentRequestService,
  eventService,
} from "../../services/api";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaUserFriends,
  FaQrcode,
  FaIdCard,
  FaLock,
  FaSave,
} from "react-icons/fa";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const ResidentProfile = () => {
  const { currentUser, changePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [familyHead, setFamilyHead] = useState(null);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (currentUser?.residentId) {
      fetchResidentData();
    }
  }, [currentUser]);

  const fetchResidentData = async () => {
    try {
      setLoading(true);
      const [residentRes, documentsRes, eventsRes] = await Promise.all([
        residentService.getById(currentUser.residentId),
        documentRequestService.getByResident(currentUser.residentId),
        eventService.getAll(),
      ]);

      setResident(residentRes.data);
      setDocumentRequests(documentsRes.data);

      // Filter events where the resident is registered
      const registeredEvents = eventsRes.data.filter((event) =>
        event.attendees?.some(
          (attendee) => attendee.id === currentUser.residentId
        )
      );
      setRegisteredEvents(registeredEvents);

      // If resident belongs to a family, fetch family head data
      if (residentRes.data.familyHeadId) {
        const headResponse = await familyHeadService.getById(
          residentRes.data.familyHeadId
        );
        setFamilyHead(headResponse.data);
      }
    } catch (error) {
      console.error("Error fetching resident data:", error);
      setError("Failed to load profile data");
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCode = async () => {
    try {
      setLoadingQrCode(true);
      const response = await residentService.getQrCode(currentUser.residentId);
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      toast.error("Failed to load QR code");
    } finally {
      setLoadingQrCode(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      setChangingPassword(true);
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
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

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  if (error || !resident) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Resident data not found"}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">My Profile</h2>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="info" title="Personal Information">
          <Card className="shadow-sm mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaIdCard className="me-2" /> Personal Information
              </h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  navigate(
                    `/dashboard/residents/edit/${currentUser.residentId}`
                  )
                }
              >
                <FaEdit className="me-2" /> Edit Profile
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Resident ID:</strong> {resident.residentId}
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

          {familyHead && (
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaUserFriends className="me-2" /> Family Information
                </h5>
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
                  description={`This QR code contains your resident verification information.`}
                  size={300}
                />
              ) : (
                <Card className="shadow-sm">
                  <Card.Body className="text-center py-5">
                    <FaQrcode size={50} className="text-muted mb-3" />
                    <h5>QR Code Not Available</h5>
                    <p className="text-muted">
                      Your QR code is not currently available.
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

        <Tab eventKey="documents" title="My Document Requests">
          <Card className="shadow-sm">
            <Card.Body>
              {documentRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Document Type</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Request Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.requestId}</td>
                          <td>
                            {request.documentType
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </td>
                          <td>{request.purpose}</td>
                          <td>
                            <Badge
                              bg={
                                request.status === "completed"
                                  ? "success"
                                  : request.status === "approved"
                                  ? "info"
                                  : request.status === "rejected"
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </Badge>
                          </td>
                          <td>
                            {new Date(request.requestDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">
                  No document requests found
                </p>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="events" title="My Events">
          <Card className="shadow-sm">
            <Card.Body>
              {registeredEvents.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Event Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredEvents.map((event) => (
                        <tr key={event._id}>
                          <td>{event.title}</td>
                          <td>{event.category}</td>
                          <td>
                            {new Date(event.eventDate).toLocaleDateString()}
                          </td>
                          <td>{event.time}</td>
                          <td>{event.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">
                  You haven't registered for any events yet
                </p>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="security" title="Security">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <FaLock className="me-2" /> Change Password
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={changingPassword}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={changingPassword}
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Must be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={changingPassword}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" /> Change Password
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-4">
            <Card.Header>
              <h5 className="mb-0">Account Information</h5>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Username:</strong> {currentUser.username}
              </p>
              <p>
                <strong>Account Type:</strong>{" "}
                <Badge bg="primary">Resident</Badge>
              </p>
              <p>
                <strong>Account Created:</strong>{" "}
                {currentUser.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString()
                  : "Not available"}
              </p>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ResidentProfile;
