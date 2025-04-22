// src/layouts/MainLayout.js - Updated with System Tools link
import Logo from "../components/Logo";
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, Button, Offcanvas } from "react-bootstrap";
import {
  FaChartBar,
  FaUsers,
  FaUserFriends,
  FaFileAlt,
  FaBullhorn,
  FaCalendarAlt,
  FaIdCard,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTachometerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaQrcode,
  FaDatabase,
  FaCog,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const closeMobileSidebar = () => setShowMobileSidebar(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Render different navigation items based on user role
  const renderNavItems = () => {
    // Admin navigation
    if (currentUser?.role === "admin") {
      return (
        <>
          <Nav.Link
            as={Link}
            to="/dashboard"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard") && location.pathname === "/dashboard"
                ? "active"
                : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaTachometerAlt className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/family-heads"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/family-heads") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaUserFriends className="nav-icon" />
            <span className="nav-text">Family Heads</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/residents"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/residents") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaUsers className="nav-icon" />
            <span className="nav-text">Residents</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/documents"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/documents") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaFileAlt className="nav-icon" />
            <span className="nav-text">Document Requests</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/announcements"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/announcements") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaBullhorn className="nav-icon" />
            <span className="nav-text">Announcements</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/events-management"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/events-management") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaCalendarAlt className="nav-icon" />
            <span className="nav-text">Events</span>
          </Nav.Link>

          {/* New System Tools Nav Item */}
          <Nav.Link
            as={Link}
            to="/dashboard/system-tools"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/system-tools") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaCog className="nav-icon" />
            <span className="nav-text">System Tools</span>
          </Nav.Link>
        </>
      );
    }
    // Resident navigation
    else if (currentUser?.role === "resident") {
      return (
        <>
          <Nav.Link
            as={Link}
            to="/dashboard"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard") && location.pathname === "/dashboard"
                ? "active"
                : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaChartBar className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to={`/dashboard/residents/view/${currentUser.residentId}`}
            className={`nav-item d-flex align-items-center ${
              isActive(`/dashboard/residents/view/${currentUser.residentId}`)
                ? "active"
                : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaIdCard className="nav-icon" />
            <span className="nav-text">My Profile</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/certificates"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/certificates") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaFileAlt className="nav-icon" />
            <span className="nav-text">Certificates</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/announcements"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/announcements") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaBullhorn className="nav-icon" />
            <span className="nav-text">Announcements</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/events"
            className={`nav-item d-flex align-items-center ${
              isActive("/dashboard/events") ? "active" : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaCalendarAlt className="nav-icon" />
            <span className="nav-text">Events</span>
          </Nav.Link>

          {/* QR Code for Resident */}
          <Nav.Link
            as={Link}
            to={`/dashboard/residents/view/${currentUser.residentId}?tab=qrcode`}
            className={`nav-item d-flex align-items-center ${
              isActive(`/dashboard/residents/view/${currentUser.residentId}`) &&
              location.search.includes("tab=qrcode")
                ? "active"
                : ""
            }`}
            onClick={closeMobileSidebar}
          >
            <FaQrcode className="nav-icon" />
            <span className="nav-text">My QR Code</span>
          </Nav.Link>
        </>
      );
    }

    // Default navigation for any other roles
    return (
      <Nav.Link
        as={Link}
        to="/dashboard"
        className={`nav-item d-flex align-items-center ${
          isActive("/dashboard") ? "active" : ""
        }`}
        onClick={closeMobileSidebar}
      >
        <FaChartBar className="nav-icon" />
        <span className="nav-text">Dashboard</span>
      </Nav.Link>
    );
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar for desktop */}
      <div
        className={`sidebar d-none d-md-flex ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header d-flex flex-column align-items-center justify-content-center py-3">
          <div className="logo-container text-center">
            <Logo width={120} height={120} />
          </div>
          {!sidebarCollapsed && <h5 className="text-white mt-2 mb-0"></h5>}
        </div>
        <div className="sidebar-header">
          <div className="logo-container">
            {!sidebarCollapsed && (
              <h4 className="text-white mb-0">Barangay Kabacsanan </h4>
            )}
            {sidebarCollapsed && <h4 className="text-white mb-0">BMS</h4>}
          </div>
          <Button
            variant="outline-light"
            size="sm"
            className="collapse-btn"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </Button>
        </div>

        <Nav className="sidebar-nav flex-column">{renderNavItems()}</Nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{currentUser?.name}</div>
                <div className="user-role">{currentUser?.role}</div>
              </div>
            )}
          </div>

          <Nav.Link
            as={Link}
            to="/dashboard/profile"
            className={`profile-link ${
              isActive("/dashboard/profile") ? "active" : ""
            }`}
          >
            <FaUser className="nav-icon" />
            <span className="nav-text">Profile</span>
          </Nav.Link>

          <Button
            variant="outline-light"
            size="sm"
            className="logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-text">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile navbar and sidebar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="d-md-none">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard">
            Barangay Management
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="sidebar-nav"
            onClick={() => setShowMobileSidebar(true)}
          >
            <FaBars />
          </Navbar.Toggle>

          <Offcanvas
            show={showMobileSidebar}
            onHide={() => setShowMobileSidebar(false)}
            placement="start"
            className="bg-primary text-white"
            style={{ width: "260px" }}
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>Barangay Management</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Nav className="flex-column sidebar-nav">{renderNavItems()}</Nav>

              <div className="sidebar-footer">
                <div className="user-info">
                  <div className="user-details">
                    <div className="user-name">{currentUser?.name}</div>
                    <div className="user-role">{currentUser?.role}</div>
                  </div>
                </div>

                <Nav.Link
                  as={Link}
                  to="/dashboard/profile"
                  className={`profile-link ${
                    isActive("/dashboard/profile") ? "active" : ""
                  }`}
                  onClick={closeMobileSidebar}
                >
                  <FaUser className="nav-icon" />
                  <span className="nav-text">Profile</span>
                </Nav.Link>

                <Button
                  variant="outline-light"
                  size="sm"
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="nav-icon" />
                  <span className="nav-text">Logout</span>
                </Button>
              </div>
            </Offcanvas.Body>
          </Offcanvas>
        </Container>
      </Navbar>

      {/* Main content */}
      <div className={`content-wrapper ${sidebarCollapsed ? "expanded" : ""}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
