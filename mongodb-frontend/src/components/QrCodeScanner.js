// mongodb-frontend/src/components/QrCodeScanner.js
import React, { useState } from "react";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { Card, Alert, Button, Spinner } from "react-bootstrap";

const QrCodeScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState("");

  const handleScan = (result) => {
    if (result) {
      try {
        console.log("Raw QR code result:", result);

        // Some QR scanners return the data as a text property
        const qrData = result.text || result;

        // Try to parse QR code data
        let scannedData;
        try {
          scannedData = JSON.parse(qrData);
        } catch (err) {
          console.error("Failed to parse QR code data:", err);
          // If parsing fails, pass the raw data
          scannedData = qrData;
        }

        console.log("Processed QR code data:", scannedData);

        // Call the provided callback
        onScan(scannedData);

        // Stop scanning
        setScanning(false);
      } catch (err) {
        console.error("QR code processing error:", err);
        setError("Error processing QR code");
        if (onError) {
          onError("Error processing QR code");
        }
      }
    }
  };

  const handleError = (err) => {
    console.error("QR scanner error:", err);
    setError(err?.message || "QR code scanning error");
    if (onError) {
      onError(err?.message || "QR code scanning error");
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
            <QrScanner
              onDecode={handleScan}
              onError={handleError}
              constraints={{ facingMode: "environment" }}
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
