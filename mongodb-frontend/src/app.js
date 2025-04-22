// src/app.js - Updated with QR code and data backup routes
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.js";

// Layouts
import MainLayout from "./layouts/MainLayout.js";
import AuthLayout from "./layouts/AuthLayout.js";

// Auth Pages
import Login from "./pages/auth/Login.js";
import Register from "./pages/auth/Register.js";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard.js";

// Family Heads Pages
import FamilyHeadsList from "./pages/familyHeads/FamilyHeadsList.js";
import AddFamilyHead from "./pages/familyHeads/AddFamilyHead.js";
import EditFamilyHead from "./pages/familyHeads/EditFamilyHead.js";
import FamilyHeadDetails from "./pages/familyHeads/FamilyHeadDetails.js";

// Residents Pages
import ResidentList from "./pages/residents/ResidentList.js";
import AddResident from "./pages/residents/AddResident.js";
import EditResident from "./pages/residents/EditResident.js";
import ResidentDetails from "./pages/residents/ResidentDetails.js";
import ResidentProfile from "./pages/residents/ResidentProfile.js";

// Resident Portal Pages
import CertificateRequest from "./pages/residents/CertificateRequest.js";
import Announcements from "./pages/residents/Announcements.js";
import Events from "./pages/residents/Events.js";

// Admin Management Pages
import DocumentRequests from "./pages/admin/DocumentRequests.js";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement.js";
import EventsManagement from "./pages/admin/EventsManagement.js";
import SystemTools from "./pages/admin/SystemTools.js"; // New page for data backup and QR tools

// User Profile Pages
import UserProfile from "./pages/profile/UserProfile.js";

// NotFound Page
import NotFound from "./pages/NotFound.js";

import AnnouncementsList from "./pages/announcements/AnnouncementsList";
import AnnouncementsDisplay from "./pages/announcements/AnnouncementsDisplay";
import EventsList from "./pages/events/EventsList";
import EventsDisplay from "./pages/events/EventsDisplay";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if admin access is required
  if (requireAdmin && currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Family Heads Routes - Admin Only */}
        <Route path="family-heads">
          <Route
            index
            element={
              <ProtectedRoute requireAdmin={true}>
                <FamilyHeadsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="add"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AddFamilyHead />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditFamilyHead />
              </ProtectedRoute>
            }
          />
          <Route
            path="view/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <FamilyHeadDetails />
              </ProtectedRoute>
            }
          />
          {/* Announcements Routes */}
          <Route path="announcements">
            <Route index element={<AnnouncementsList />} />
            <Route path="display" element={<AnnouncementsDisplay />} />
          </Route>

          {/* Events Routes */}
          <Route path="events">
            <Route index element={<EventsList />} />
            <Route path="display" element={<EventsDisplay />} />
          </Route>
        </Route>

        {/* Residents Routes */}
        <Route path="residents">
          {/* Admin can see all residents */}
          <Route
            index
            element={
              <ProtectedRoute requireAdmin={true}>
                <ResidentList />
              </ProtectedRoute>
            }
          />
          {/* Only admin can add residents */}
          <Route
            path="add"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AddResident />
              </ProtectedRoute>
            }
          />
          {/* For editing a resident */}
          <Route
            path="edit/:id"
            element={
              <ProtectedRoute>
                <EditResident />
              </ProtectedRoute>
            }
          />
          {/* For viewing a resident */}
          <Route
            path="view/:id"
            element={
              <ProtectedRoute>
                <ResidentDetails />
              </ProtectedRoute>
            }
          />
          {/* Resident profile page (accessible to logged-in resident) */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ResidentProfile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Management Routes - Admin Only */}
        <Route
          path="documents"
          element={
            <ProtectedRoute requireAdmin={true}>
              <DocumentRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="announcements"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AnnouncementsManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="events-management"
          element={
            <ProtectedRoute requireAdmin={true}>
              <EventsManagement />
            </ProtectedRoute>
          }
        />

        {/* New System Tools Route - Admin Only */}
        <Route
          path="system-tools"
          element={
            <ProtectedRoute requireAdmin={true}>
              <SystemTools />
            </ProtectedRoute>
          }
        />

        {/* Resident Portal Routes */}
        <Route
          path="certificates"
          element={
            <ProtectedRoute>
              <CertificateRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="announcements"
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          }
        />

        <Route
          path="events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        {/* Profile Route - Available to all authenticated users */}
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
