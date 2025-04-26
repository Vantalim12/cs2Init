// src/pages/auth/Login.js
import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaUser, FaLock } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const result = await login(formData);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2">
      <h2 className="auth-title">Login to Your Account</h2>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
          className="py-2 px-3"
        >
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <div className="input-group">
            <span className="input-group-text">
              <FaUser />
            </span>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <div className="input-group">
            <span className="input-group-text">
              <FaLock />
            </span>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
        </Form.Group>

        <div className="d-grid gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="py-2"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </Form>

      <div className="text-center mt-3">
        <p className="mb-0">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
