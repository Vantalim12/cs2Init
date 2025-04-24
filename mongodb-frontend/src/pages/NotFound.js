// src/pages/NotFound.js
import React from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <div className="mb-4">
        <FaExclamationTriangle size={60} className="text-warning" />
      </div>
      <h1>404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="text-muted mb-4">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">
          <FaHome className="me-2" /> Back to Dashboard
        </Button>
      </Link>
    </Container>
  );
};

export default NotFound;
