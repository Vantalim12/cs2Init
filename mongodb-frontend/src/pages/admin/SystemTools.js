// mongodb-frontend/src/pages/admin/SystemTools.js
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Button,
  Modal,
  Spinner,
  Alert,
  ListGroup,
} from "react-bootstrap";
import {
  FaDatabase,
  FaQrcode,
  FaFileDownload,
  FaFileUpload,
  FaSearch,
  FaTools,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
} from "react-icons/fa";
import DataBackup from "../../components/DataBackup";
import QrCodeScanner from "../../components/QrCodeScanner";
import { toast } from "react-toastify";
import { qrCodeService } from "../../services/api";

const SystemTools = () => {
  const [activeTab, setActiveTab] = useState("backup");
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [verifyingQR, setVerifyingQR] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  // Handle QR code scan
  const handleScan = async (data) => {
    setScanning(false);
    console.log("Scanned data received:", data);

    if (!data) {
      setError("No data found in QR code");
      return;
    }

    try {
      setVerifyingQR(true);
      setError("");

      // Verify QR code with backend
      console.log("Sending to API for verification:", data);
      const response = await qrCodeService.verifyQrCode(data);
      console.log("Verification response:", response.data);

      // Set scan result
      setScanResult(response.data);

      toast.success("QR code verified successfully");
    } catch (err) {
      console.error("QR verification error:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to verify QR code";
      setError(errorMessage);
      toast.error(errorMessage);
      setScanResult(null);
    } finally {
      setVerifyingQR(false);
    }
  };

  // Handle QR code scanner error
  const handleScanError = (err) => {
    console.error("Scanner error:", err);
    setError(`Scanner error: ${err}`);
    setScanning(false);
  };

  // Start QR code scanning
  const startScanning = () => {
    setScanResult(null);
    setError("");
    setScanning(true);
    setShowScanModal(true);
  };

  // Format scan result for display
  const formatScanResult = (result) => {
    if (!result) return null;

    const { verified, data, type } = result;

    switch (type) {
      case "Resident":
        return {
          title: "Resident Information",
          fields: [
            { label: "ID", value: data.id },
            { label: "Name", value: data.name },
            { label: "Gender", value: data.gender || "N/A" },
            { label: "Address", value: data.address || "N/A" },
            { label: "Contact", value: data.contactNumber || "N/A" },
            { label: "Type", value: type },
            { label: "Verification", value: verified ? "Valid" : "Invalid" },
          ],
          status: verified ? "success" : "danger",
          icon: <FaUser />,
        };

      case "Family Head":
        return {
          title: "Family Head Information",
          fields: [
            { label: "ID", value: data.id },
            { label: "Name", value: data.name },
            { label: "Gender", value: data.gender || "N/A" },
            { label: "Address", value: data.address || "N/A" },
            { label: "Contact", value: data.contactNumber || "N/A" },
            { label: "Type", value: type },
            { label: "Verification", value: verified ? "Valid" : "Invalid" },
          ],
          status: verified ? "success" : "danger",
          icon: <FaUser />,
        };

      case "DocumentRequest":
        return {
          title: "Document Request",
          fields: [
            { label: "Request ID", value: data.requestId },
            { label: "Resident Name", value: data.residentName },
            { label: "Document Type", value: data.documentType },
            { label: "Status", value: data.status },
            {
              label: "Request Date",
              value: new Date(data.date).toLocaleString(),
            },
            { label: "Verification", value: verified ? "Valid" : "Invalid" },
          ],
          status: verified ? "success" : "danger",
          icon: <FaFileAlt />,
        };

      case "Event":
        return {
          title: "Event Information",
          fields: [
            { label: "Event ID", value: data.id },
            { label: "Title", value: data.title },
            { label: "Date", value: new Date(data.date).toLocaleDateString() },
            { label: "Location", value: data.location },
            { label: "Category", value: data.category },
            { label: "Attendees", value: data.attendees || 0 },
            { label: "Verification", value: verified ? "Valid" : "Invalid" },
          ],
          status: verified ? "success" : "danger",
          icon: <FaCalendarAlt />,
        };

      default:
        return {
          title: "QR Code Data",
          fields: Object.entries(data).map(([key, value]) => ({
            label: key,
            value: typeof value === "object" ? JSON.stringify(value) : value,
          })),
          status: verified ? "success" : "danger",
          icon: <FaQrcode />,
        };
    }
  };

  return (
    <Container>
      <h2 className="mb-4">System Tools</h2>

      <Row>
        <Col md={3}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Tools</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Nav className="flex-column">
                <Nav.Link
                  className={activeTab === "backup" ? "active bg-light" : ""}
                  onClick={() => setActiveTab("backup")}
                >
                  <FaDatabase className="me-2" /> Data Backup & Restore
                </Nav.Link>
                <Nav.Link
                  className={activeTab === "qrcode" ? "active bg-light" : ""}
                  onClick={() => setActiveTab("qrcode")}
                >
                  <FaQrcode className="me-2" /> QR Code Tools
                </Nav.Link>
                <Nav.Link
                  className={activeTab === "system" ? "active bg-light" : ""}
                  onClick={() => setActiveTab("system")}
                >
                  <FaTools className="me-2" /> System Maintenance
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {activeTab === "backup" && (
            <DataBackup
              onBackupComplete={() =>
                toast.success("System data exported successfully")
              }
              onRestoreComplete={() =>
                toast.success("System data restored successfully")
              }
            />
          )}

          {activeTab === "qrcode" && (
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">QR Code Tools</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  Use these tools to validate QR codes used in the Barangay
                  Management System. You can scan QR codes from resident IDs,
                  event tickets, or document requests.
                </p>

                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={startScanning}>
                    <FaSearch className="me-2" /> Scan QR Code
                  </Button>
                </div>

                {scanResult && (
                  <div className="mt-4">
                    <Alert variant={formatScanResult(scanResult).status}>
                      <Alert.Heading>
                        {formatScanResult(scanResult).icon}{" "}
                        {formatScanResult(scanResult).title}
                      </Alert.Heading>

                      <ListGroup variant="flush" className="mt-3">
                        {formatScanResult(scanResult).fields.map(
                          (field, index) => (
                            <ListGroup.Item
                              key={index}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <span>
                                <strong>{field.label}:</strong>
                              </span>
                              <span>{field.value}</span>
                            </ListGroup.Item>
                          )
                        )}
                      </ListGroup>
                    </Alert>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {activeTab === "system" && (
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">System Maintenance</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  System maintenance tools help you manage your Barangay
                  Management System installation. You can optimize database
                  performance, clear temporary files, and check system health.
                </p>

                <ListGroup>
                  <ListGroup.Item
                    action
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-1">Database Optimization</h6>
                      <p className="text-muted mb-0 small">
                        Optimize database indexes and performance
                      </p>
                    </div>
                    <Button variant="primary" size="sm" disabled>
                      Run
                    </Button>
                  </ListGroup.Item>

                  <ListGroup.Item
                    action
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-1">Clear Temporary Files</h6>
                      <p className="text-muted mb-0 small">
                        Remove temporary files and cache
                      </p>
                    </div>
                    <Button variant="primary" size="sm" disabled>
                      Run
                    </Button>
                  </ListGroup.Item>

                  <ListGroup.Item
                    action
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-1">System Health Check</h6>
                      <p className="text-muted mb-0 small">
                        Check overall system health and performance
                      </p>
                    </div>
                    <Button variant="primary" size="sm" disabled>
                      Run
                    </Button>
                  </ListGroup.Item>
                </ListGroup>

                <Alert variant="info" className="mt-3">
                  <strong>Note:</strong> System maintenance tools are currently
                  under development and will be available in a future update.
                </Alert>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* QR Code Scanner Modal */}
      <Modal
        show={showScanModal}
        onHide={() => setShowScanModal(false)}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Scan QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {scanning ? (
            <QrCodeScanner onScan={handleScan} onError={handleScanError} />
          ) : (
            <>
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              {verifyingQR ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Verifying QR code...</p>
                </div>
              ) : scanResult ? (
                <Alert variant={formatScanResult(scanResult).status}>
                  <Alert.Heading>
                    {formatScanResult(scanResult).icon}{" "}
                    {formatScanResult(scanResult).title}
                  </Alert.Heading>

                  <ListGroup variant="flush" className="mt-3">
                    {formatScanResult(scanResult).fields.map((field, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span>
                          <strong>{field.label}:</strong>
                        </span>
                        <span>{field.value}</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Alert>
              ) : (
                <div className="text-center py-4">
                  <FaQrcode size={60} className="text-muted mb-3" />
                  <h5>No QR Code Scanned</h5>
                  <p>Click the button below to start scanning</p>
                  <Button variant="primary" onClick={() => setScanning(true)}>
                    Start Scanning
                  </Button>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowScanModal(false)}>
            Close
          </Button>
          {!scanning && scanResult && (
            <Button variant="primary" onClick={() => setScanning(true)}>
              Scan Another
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SystemTools;
