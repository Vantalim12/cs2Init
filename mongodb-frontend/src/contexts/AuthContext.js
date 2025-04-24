// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Set default axios header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Get current user info
        const response = await axios.get("/api/auth/me");
        setCurrentUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        // If token is invalid, clean up
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);
      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");

    // Remove axios default header
    delete axios.defaults.headers.common["Authorization"];

    // Clear state
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await axios.post(
        "/api/auth/change-password",
        passwordData
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to change password",
      };
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
