// src/layouts/AuthLayout.js
import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Logo from "../components/Logo";

const AuthLayout = () => {
  return (
    <div className="auth-wrapper">
      <Container className="px-3">
        <div className="auth-card">
          <div className="auth-logo">
            <Logo width={60} height={60} />
            <h4 className="mt-3 px-2">Barangay Kabacsanan Management System</h4>
          </div>
          <Outlet />
        </div>
      </Container>
    </div>
  );
};

export default AuthLayout;
