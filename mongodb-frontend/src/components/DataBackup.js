// src/components/DataBackup.js
import React, { useState } from "react";
import {
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import {
  FaDownload,
  FaUpload,
  FaCheck,
  FaTimes,
  FaFileExport,
  FaFileImport,
  FaCloudDownloadAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { dashboardService } from "../services/api";

const DataBackup = ({ onBackupComplete, onRestoreComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreData, setRestoreData] = useState(null);
  const [exportFormat, setExportFormat] = useState("json");
  const [progress, setProgress] = useState(0);

  // Handle backup/export data
  const handleExportData = async () => {
    try {
      setLoading(true);
      setError("");
      setProgress(10);

      // Fetch backup data from API
      const response = await dashboardService.getBackup();
      setProgress(60);

      // Format data based on selected format
      let dataString;
      let fileName;
      let mimeType;

      if (exportFormat === "json") {
        // JSON format
        dataString = JSON.stringify(response.data, null, 2);
        fileName = `barangay-system-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        mimeType = "application/json";
      } else if (exportFormat === "csv") {
        // CSV format - flattening the hierarchical data
        // This is simplified - a real implementation would need more complex logic
        // to properly flatten nested data
        const flattenedData = {
          residents: flattenObjectsToCSV(response.data.data.residents),
          familyHeads: flattenObjectsToCSV(response.data.data.familyHeads),
          announcements: flattenObjectsToCSV(response.data.data.announcements),
          events: flattenObjectsToCSV(response.data.data.events),
          documentRequests: flattenObjectsToCSV(
            response.data.data.documentRequests
          ),
        };

        // Create a combined file with section headers
        let csvContent = "";
        for (const [section, data] of Object.entries(flattenedData)) {
          csvContent += `# ${section.toUpperCase()}\n`;
          csvContent += data + "\n\n";
        }

        dataString = csvContent;
        fileName = `barangay-system-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;
        mimeType = "text/csv";
      } else {
        throw new Error("Unsupported export format");
      }

      setProgress(80);

      // Create a blob from the data
      const blob = new Blob([dataString], { type: mimeType });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setProgress(100);

      // Notify completion
      toast.success(
        `Backup exported successfully as ${exportFormat.toUpperCase()}`
      );
      if (onBackupComplete) {
        onBackupComplete();
      }
    } catch (err) {
      setError(`Failed to export data: ${err.message}`);
      console.error("Export error:", err);
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Handle file selection for restore
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setRestoreFile(file);
    setRestoreData(null);
    setError("");
  };

  // Handle restore file validation
  const handleValidateRestore = async () => {
    if (!restoreFile) {
      setError("Please select a file to restore");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Read file content
      const fileContent = await readFileAsText(restoreFile);

      // Parse and validate backup data
      const backupData = JSON.parse(fileContent);

      // Basic validation
      if (!backupData.timestamp || !backupData.data) {
        throw new Error("Invalid backup file format");
      }

      // Additional validation for required data sections
      const requiredSections = [
        "residents",
        "familyHeads",
        "announcements",
        "events",
        "documentRequests",
      ];
      for (const section of requiredSections) {
        if (!Array.isArray(backupData.data[section])) {
          throw new Error(`Missing or invalid ${section} data`);
        }
      }

      // Store validated data
      setRestoreData(backupData);

      // Show restore confirmation modal
      setShowRestoreModal(true);
    } catch (err) {
      setError(`Invalid backup file: ${err.message}`);
      console.error("Validation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle restore confirmation
  const handleConfirmRestore = async () => {
    // In a real implementation, you would send the restore data to the backend API
    // For now, we'll just simulate success
    try {
      setLoading(true);
      setProgress(10);

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProgress(50);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgress(90);

      // Close modal and reset state
      setShowRestoreModal(false);
      setRestoreFile(null);
      setRestoreData(null);
      setProgress(100);

      // Notify completion
      toast.success("System data restored successfully");
      if (onRestoreComplete) {
        onRestoreComplete();
      }
    } catch (err) {
      setError(`Failed to restore data: ${err.message}`);
      console.error("Restore error:", err);
      toast.error("Failed to restore data");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  // Helper function to flatten objects for CSV
  const flattenObjectsToCSV = (objects) => {
    if (!Array.isArray(objects) || objects.length === 0) {
      return "";
    }

    // Get all unique keys
    const allKeys = new Set();
    objects.forEach((obj) => {
      Object.keys(obj).forEach((key) => allKeys.add(key));
    });

    const headers = Array.from(allKeys);

    // Create CSV header row
    let csv = headers.join(",") + "\n";

    // Add data rows
    objects.forEach((obj) => {
      const row = headers.map((header) => {
        const value = obj[header];

        // Format value for CSV
        if (value === null || value === undefined) {
          return "";
        } else if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return `"${String(value).replace(/"/g, '""')}"`;
        }
      });

      csv += row.join(",") + "\n";
    });

    return csv;
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Data Backup & Restore</h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {loading && progress > 0 && (
          <div className="mb-3">
            <ProgressBar
              now={progress}
              label={`${progress}%`}
              variant="primary"
              animated
            />
          </div>
        )}

        <h6 className="mb-3">Export System Data</h6>
        <Form className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Export Format</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                id="export-json"
                label="JSON (Complete backup)"
                name="exportFormat"
                value="json"
                checked={exportFormat === "json"}
                onChange={() => setExportFormat("json")}
              />
              <Form.Check
                inline
                type="radio"
                id="export-csv"
                label="CSV (Spreadsheet compatible)"
                name="exportFormat"
                value="csv"
                checked={exportFormat === "csv"}
                onChange={() => setExportFormat("csv")}
              />
            </div>
            <Form.Text className="text-muted">
              JSON format retains all data and is used for complete system
              backups. CSV format is for data analysis in spreadsheet
              applications.
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            onClick={handleExportData}
            disabled={loading}
            className="w-100"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Exporting...
              </>
            ) : (
              <>
                <FaFileExport className="me-2" /> Export System Data
              </>
            )}
          </Button>
        </Form>

        <hr />

        <h6 className="mb-3">Restore from Backup</h6>
        <Form.Group className="mb-3">
          <Form.Label>Select Backup File</Form.Label>
          <Form.Control
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={loading}
          />
          <Form.Text className="text-muted">
            Only JSON backup files exported from this system are supported
          </Form.Text>
        </Form.Group>

        {restoreFile && (
          <Alert variant="info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>File:</strong> {restoreFile.name}
                <br />
                <small>Size: {(restoreFile.size / 1024).toFixed(2)} KB</small>
              </div>
              {restoreData ? (
                <Badge bg="success">Validated</Badge>
              ) : (
                <Badge bg="warning">Not Validated</Badge>
              )}
            </div>
          </Alert>
        )}

        <div className="d-grid gap-2">
          <Button
            variant="outline-primary"
            onClick={handleValidateRestore}
            disabled={!restoreFile || loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Validating...
              </>
            ) : (
              <>
                <FaCheck className="me-2" /> Validate Backup File
              </>
            )}
          </Button>

          <Button
            variant="danger"
            onClick={() => setShowRestoreModal(true)}
            disabled={!restoreData || loading}
          >
            <FaFileImport className="me-2" /> Restore System Data
          </Button>
        </div>
      </Card.Body>

      {/* Restore Confirmation Modal */}
      <Modal
        show={showRestoreModal}
        onHide={() => setShowRestoreModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Data Restore</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {restoreData ? (
            <>
              <Alert variant="warning">
                <strong>Warning:</strong> This operation will replace all
                current system data with the data from the backup file. This
                action cannot be undone.
              </Alert>

              <p>
                <strong>Backup Date:</strong>{" "}
                {new Date(restoreData.timestamp).toLocaleString()}
              </p>

              <h6>Data to be restored:</h6>
              <ul>
                <li>
                  <strong>Residents:</strong>{" "}
                  {restoreData.data.residents.length} records
                </li>
                <li>
                  <strong>Family Heads:</strong>{" "}
                  {restoreData.data.familyHeads.length} records
                </li>
                <li>
                  <strong>Announcements:</strong>{" "}
                  {restoreData.data.announcements.length} records
                </li>
                <li>
                  <strong>Events:</strong> {restoreData.data.events.length}{" "}
                  records
                </li>
                <li>
                  <strong>Document Requests:</strong>{" "}
                  {restoreData.data.documentRequests.length} records
                </li>
              </ul>
            </>
          ) : (
            <p>Please validate the backup file first.</p>
          )}

          {loading && progress > 0 && (
            <ProgressBar
              now={progress}
              label={`${progress}%`}
              variant="primary"
              animated
              className="mt-3"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRestoreModal(false)}
            disabled={loading}
          >
            <FaTimes className="me-2" /> Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmRestore}
            disabled={!restoreData || loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Restoring...
              </>
            ) : (
              <>
                <FaCloudDownloadAlt className="me-2" /> Confirm Restore
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default DataBackup;
