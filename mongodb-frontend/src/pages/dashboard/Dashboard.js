// src/pages/dashboard/Dashboard.js
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import ResidentDashboard from "./ResidentDashboard";

const Dashboard = () => {
  const { currentUser } = useAuth();

  if (currentUser?.role === "admin") {
    return <AdminDashboard />;
  }

  return <ResidentDashboard />;
};

export default Dashboard;
