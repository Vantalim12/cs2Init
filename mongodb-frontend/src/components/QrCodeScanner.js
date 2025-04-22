// src/components/QrCodeScanner.js
import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { Card, Alert, Button, Spinner } from "react-bootstrap";

const QrCodeScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState("");

  const handleScan = (result) => {
    if (result) {
      try {
        // Parse QR code data
        const scannedData = JSON.parse(result.text);

        // Call the provided callback
        onScan(scannedData);

        // Stop scanning
        setScanning(false);
      } catch (err) {
        setError("Invalid QR code format");
        if (onError) {
          onError("Invalid QR code format");
        }
      }
    }
  };

  const handleError = (err) => {
    setError(err.message || "QR code scanning error");
    if (onError) {
      onError(err.message || "QR code scanning error");
    }
  };

  const restartScanner = () => {
    setScanning(true);
    setError("");
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">QR Code Scanner</h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {scanning ? (
          <div className="position-relative">
            <QrReader
              constraints={{
                facingMode: { exact: "environment" }, // Use back camera on mobile
              }}
              scanDelay={500}
              onResult={handleScan}
              onError={handleError}
              style={{ width: "100%" }}
            />
            <div className="text-center mt-3">
              <p className="text-muted">
                Position the QR code within the scanner area
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p>Processing QR code...</p>
            <Button variant="primary" onClick={restartScanner} className="mt-2">
              Scan Again
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default QrCodeScanner;
