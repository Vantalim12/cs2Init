// src/pages/profile/UserProfile.js
import React, { useState } from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import { FaUser, FaLock, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

const UserProfile = () => {
  const { currentUser, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        setSuccess("Password changed successfully");
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2 className="mb-4">User Profile</h2>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaUser className="me-2" /> Profile Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Username:</strong>
                <p className="mb-0">{currentUser.username}</p>
              </div>
              <div className="mb-3">
                <strong>Name:</strong>
                <p className="mb-0">{currentUser.name}</p>
              </div>
              <div className="mb-3">
                <strong>Role:</strong>
                <p className="mb-0">
                  <span
                    className={`badge bg-${
                      currentUser.role === "admin" ? "danger" : "primary"
                    }`}
                  >
                    {currentUser.role.charAt(0).toUpperCase() +
                      currentUser.role.slice(1)}
                  </span>
                </p>
              </div>
              {currentUser.residentId && (
                <div className="mb-3">
                  <strong>Resident ID:</strong>
                  <p className="mb-0">{currentUser.residentId}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <FaLock className="me-2" /> Change Password
              </h5>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}
              {success && (
                <Alert
                  variant="success"
                  dismissible
                  onClose={() => setSuccess("")}
                >
                  {success}
                </Alert>
              )}

              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? (
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
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
