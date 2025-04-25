// mongodb-frontend/src/services/api.js - Updated with QR code and backup functionality
import axios from "axios";

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "";

// Set default headers for axios
axios.defaults.headers.common["Content-Type"] = "application/json";

// Dashboard service
export const dashboardService = {
  getStats: () => axios.get(`${API_URL}/api/dashboard/stats`),
  getRecentRegistrations: () =>
    axios.get(`${API_URL}/api/dashboard/recent-registrations`),
  getGenderDistribution: () =>
    axios.get(`${API_URL}/api/dashboard/gender-distribution`),
  getAgeDistribution: () =>
    axios.get(`${API_URL}/api/dashboard/age-distribution`),
  getMonthlyTrends: () => axios.get(`${API_URL}/api/dashboard/monthly-trends`),
  getBackup: () => axios.get(`${API_URL}/api/dashboard/backup`),
};

// Resident service
export const residentService = {
  getAll: () => axios.get(`${API_URL}/api/residents`),
  getById: (id) => axios.get(`${API_URL}/api/residents/${id}`),
  getQrCode: (id) => axios.get(`${API_URL}/api/residents/${id}/qrcode`),
  create: (data) => axios.post(`${API_URL}/api/residents`, data),
  update: (id, data) => axios.put(`${API_URL}/api/residents/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/api/residents/${id}`),
};

// Family Head service
export const familyHeadService = {
  getAll: () => axios.get(`${API_URL}/api/familyHeads`),
  getById: (id) => axios.get(`${API_URL}/api/familyHeads/${id}`),
  getQrCode: (id) => axios.get(`${API_URL}/api/familyHeads/${id}/qrcode`),
  getMembers: (id) => axios.get(`${API_URL}/api/familyHeads/${id}/members`),
  create: (data) => axios.post(`${API_URL}/api/familyHeads`, data),
  update: (id, data) => axios.put(`${API_URL}/api/familyHeads/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/api/familyHeads/${id}`),
};

// Announcement service
export const announcementService = {
  getAll: () => axios.get(`${API_URL}/api/announcements`),
  getById: (id) => axios.get(`${API_URL}/api/announcements/${id}`),
  create: (data) => axios.post(`${API_URL}/api/announcements`, data),
  update: (id, data) => axios.put(`${API_URL}/api/announcements/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/api/announcements/${id}`),
};

// Events service
export const eventService = {
  getAll: () => axios.get(`${API_URL}/api/events`),
  getById: (id) => axios.get(`${API_URL}/api/events/${id}`),
  getQrCode: (id) => axios.get(`${API_URL}/api/events/${id}/qrcode`),
  create: (data) => axios.post(`${API_URL}/api/events`, data),
  update: (id, data) => axios.put(`${API_URL}/api/events/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/api/events/${id}`),
  registerAttendee: (id, attendee) =>
    axios.post(`${API_URL}/api/events/${id}/register`, { attendee }),
  unregisterAttendee: (id, attendeeId) =>
    axios.delete(`${API_URL}/api/events/${id}/register/${attendeeId}`),
  scanQrCodeToRegister: (id, scannedData) =>
    axios.post(`${API_URL}/api/events/${id}/register/scan`, { scannedData }),
};

// Document Request service
export const documentRequestService = {
  getAll: () => axios.get(`${API_URL}/api/documents`),
  getById: (id) => axios.get(`${API_URL}/api/documents/${id}`),
  getQrCode: (id) => axios.get(`${API_URL}/api/documents/${id}/qrcode`),
  getByResident: (residentId) =>
    axios.get(`${API_URL}/api/documents/resident/${residentId}`),
  create: (data) => axios.post(`${API_URL}/api/documents`, data),
  updateStatus: (id, data) =>
    axios.put(`${API_URL}/api/documents/${id}/status`, data),
  delete: (id) => axios.delete(`${API_URL}/api/documents/${id}`),
  verifyQrCode: (scannedData) =>
    axios.post(`${API_URL}/api/documents/verify-qrcode`, { scannedData }),
};

// QR code utilities service
export const qrCodeService = {
  // Verify any QR code (resident, family head, event, document)
  verifyQrCode: (scannedData) =>
    axios.post(`${API_URL}/api/qrcode/verify`, { scannedData }),

  // Generate QR code for any data
  generateQrCode: (data) =>
    axios.post(`${API_URL}/api/qrcode/generate`, { data }),
};

// Setup axios interceptors for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling logic
    console.error("API Error:", error);

    // Check if error has response from server
    if (error.response) {
      // Server responded with non-2xx status code
      if (error.response.status === 401) {
        // Handle authentication error - could redirect to login
        console.log("Authentication error - redirecting to login");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      // Handle specific HTTP error codes
      switch (error.response.status) {
        case 400:
          console.log("Bad request error:", error.response.data);
          break;
        case 403:
          console.log("Forbidden error:", error.response.data);
          break;
        case 404:
          console.log("Not found error:", error.response.data);
          break;
        case 500:
          console.log("Server error:", error.response.data);
          break;
        default:
          console.log(`Error (${error.response.status}):`, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.log("Network error - no response received:", error.request);
    } else {
      // Something else caused the error
      console.log("Error message:", error.message);
    }

    // Pass error along to be handled by components
    return Promise.reject(error);
  }
);

// Set auth header if token exists
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
