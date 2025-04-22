// src/components/QrCodeDisplay.js
import React, { useState } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { FaDownload, FaPrint, FaShare } from "react-icons/fa";

const QrCodeDisplay = ({ qrCodeData, title, description, size = 250 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle download QR code
  const handleDownload = async () => {
    try {
      setLoading(true);
      setError("");

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = qrCodeData;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Failed to download QR code");
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle print QR code
  const handlePrint = () => {
    try {
      setLoading(true);
      setError("");

      // Create a new window with just the QR code
      const printWindow = window.open("", "_blank");

      printWindow.document.write(`
        <html>
          <head>
            <title>${title} - QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              h2 {
                margin-bottom: 10px;
              }
              p {
                margin-bottom: 20px;
                text-align: center;
                max-width: 400px;
              }
              img {
                border: 1px solid #ddd;
                padding: 10px;
              }
              .print-info {
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
              @media print {
                .print-info {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <h2>${title}</h2>
            <p>${
              description ||
              "Scan this QR code using the Barangay Management System app"
            }</p>
            <img src="${qrCodeData}" width="${size}" height="${size}" alt="${title} QR Code" />
            <div class="print-info">
              <p>Click the print button in your browser to print this QR code.</p>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (err) {
      setError("Failed to print QR code");
      console.error("Print error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle share QR code (for mobile devices)
  const handleShare = async () => {
    try {
      setLoading(true);
      setError("");

      // Check if the Web Share API is available
      if (navigator.share) {
        // Convert data URL to a Blob
        const response = await fetch(qrCodeData);
        const blob = await response.blob();

        // Create a File object
        const file = new File([blob], `${title}-QR-Code.png`, {
          type: "image/png",
        });

        // Share the file
        await navigator.share({
          title: `${title} - QR Code`,
          text: description || "Barangay Management System QR Code",
          files: [file],
        });
      } else {
        setError("Sharing is not supported on this device");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to share QR code");
        console.error("Share error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">{title}</h5>
      </Card.Header>
      <Card.Body className="text-center">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {qrCodeData ? (
          <>
            <img
              src={qrCodeData}
              alt={`${title} QR Code`}
              width={size}
              height={size}
              className="mb-3 border p-2"
            />
            {description && <p className="text-muted mb-3">{description}</p>}

            <div className="d-flex justify-content-center gap-2">
              <Button
                variant="primary"
                onClick={handleDownload}
                disabled={loading}
              >
                <FaDownload className="me-2" /> Download
              </Button>
              <Button variant="info" onClick={handlePrint} disabled={loading}>
                <FaPrint className="me-2" /> Print
              </Button>
              {navigator.share && (
                <Button
                  variant="success"
                  onClick={handleShare}
                  disabled={loading}
                >
                  <FaShare className="me-2" /> Share
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading QR code...</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default QrCodeDisplay;
