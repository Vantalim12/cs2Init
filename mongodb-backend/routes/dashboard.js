// routes/dashboard.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// Import models
const Resident = require("../models/Resident");
const FamilyHead = require("../models/FamilyHead");
const Announcement = require("../models/Announcement");
const Event = require("../models/Event");
const DocumentRequest = require("../models/DocumentRequest");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    // Get counts
    const [totalResidents, totalFamilyHeads] = await Promise.all([
      Resident.countDocuments(),
      FamilyHead.countDocuments(),
    ]);

    // Get all residents and family heads for analysis
    const [residents, familyHeads] = await Promise.all([
      Resident.find().select("-qrCode"),
      FamilyHead.find().select("-qrCode"),
    ]);

    // Combine both for demographic analysis
    const allPeople = [...residents, ...familyHeads];

    // Gender distribution
    const genderCounts = {};
    for (const person of allPeople) {
      const gender = person.gender || "Unknown";
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    }

    const genderData = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
      color:
        name === "Male" ? "#0088FE" : name === "Female" ? "#FF8042" : "#FFBB28",
    }));

    // Age distribution
    const ageGroups = {
      "0-10": 0,
      "11-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51-60": 0,
      "61+": 0,
    };

    for (const person of allPeople) {
      if (person.birthDate) {
        const birthDate = new Date(person.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        if (age <= 10) ageGroups["0-10"]++;
        else if (age <= 20) ageGroups["11-20"]++;
        else if (age <= 30) ageGroups["21-30"]++;
        else if (age <= 40) ageGroups["31-40"]++;
        else if (age <= 50) ageGroups["41-50"]++;
        else if (age <= 60) ageGroups["51-60"]++;
        else ageGroups["61+"]++;
      }
    }

    const ageData = Object.entries(ageGroups).map(([name, count]) => ({
      name,
      count,
    }));

    // Monthly registrations
    const months = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    for (const person of allPeople) {
      if (person.registrationDate) {
        const date = new Date(person.registrationDate);
        const month = date.toLocaleString("default", { month: "short" });

        if (months[month] !== undefined) {
          months[month]++;
        }
      }
    }

    const monthlyData = Object.entries(months).map(([name, newResidents]) => ({
      name,
      newResidents,
    }));

    // Recent registrations
    const recentRegistrations = allPeople
      .filter((p) => p.registrationDate)
      .sort(
        (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
      )
      .slice(0, 5)
      .map((p) => ({
        id: p.residentId || p.headId,
        name: `${p.firstName} ${p.lastName}`,
        date: p.registrationDate,
        type: p.type || (p.residentId ? "Resident" : "Family Head"),
      }));

    res.json({
      totalResidents,
      totalFamilyHeads,
      genderData,
      ageData,
      monthlyRegistrations: monthlyData,
      recentRegistrations,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get recent registrations
router.get("/recent-registrations", async (req, res) => {
  try {
    // Get all residents and family heads
    const [residents, familyHeads] = await Promise.all([
      Resident.find().select("residentId firstName lastName registrationDate"),
      FamilyHead.find().select("headId firstName lastName registrationDate"),
    ]);

    // Combine and format data
    const allPeople = [
      ...residents.map((r) => ({
        id: r.residentId,
        name: `${r.firstName} ${r.lastName}`,
        date: r.registrationDate,
        type: "Resident",
      })),
      ...familyHeads.map((h) => ({
        id: h.headId,
        name: `${h.firstName} ${h.lastName}`,
        date: h.registrationDate,
        type: "Family Head",
      })),
    ];

    // Sort by registration date (newest first) and get top 5
    const recentRegistrations = allPeople
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json(recentRegistrations);
  } catch (error) {
    console.error("Error getting recent registrations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get gender distribution
router.get("/gender-distribution", async (req, res) => {
  try {
    // Get all residents and family heads
    const [residents, familyHeads] = await Promise.all([
      Resident.find().select("gender"),
      FamilyHead.find().select("gender"),
    ]);

    // Combine for analysis
    const allPeople = [...residents, ...familyHeads];

    // Count by gender
    const genderCounts = {};
    for (const person of allPeople) {
      const gender = person.gender || "Unknown";
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    }

    // Format for chart
    const genderData = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
      color:
        name === "Male" ? "#0088FE" : name === "Female" ? "#FF8042" : "#FFBB28",
    }));

    res.json(genderData);
  } catch (error) {
    console.error("Error getting gender distribution:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get age distribution
router.get("/age-distribution", async (req, res) => {
  try {
    // Get all residents and family heads
    const [residents, familyHeads] = await Promise.all([
      Resident.find().select("birthDate"),
      FamilyHead.find().select("birthDate"),
    ]);

    // Combine for analysis
    const allPeople = [...residents, ...familyHeads];

    // Initialize age groups
    const ageGroups = {
      "0-10": 0,
      "11-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51-60": 0,
      "61+": 0,
    };

    // Count by age group
    for (const person of allPeople) {
      if (person.birthDate) {
        const birthDate = new Date(person.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        if (age <= 10) ageGroups["0-10"]++;
        else if (age <= 20) ageGroups["11-20"]++;
        else if (age <= 30) ageGroups["21-30"]++;
        else if (age <= 40) ageGroups["31-40"]++;
        else if (age <= 50) ageGroups["41-50"]++;
        else if (age <= 60) ageGroups["51-60"]++;
        else ageGroups["61+"]++;
      }
    }

    // Format for chart
    const ageData = Object.entries(ageGroups).map(([name, count]) => ({
      name,
      count,
    }));

    res.json(ageData);
  } catch (error) {
    console.error("Error getting age distribution:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get monthly registration trends
router.get("/monthly-trends", async (req, res) => {
  try {
    // Get all residents and family heads
    const [residents, familyHeads] = await Promise.all([
      Resident.find().select("registrationDate"),
      FamilyHead.find().select("registrationDate"),
    ]);

    // Combine for analysis
    const allPeople = [...residents, ...familyHeads];

    // Initialize months
    const months = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    // Count registrations by month
    for (const person of allPeople) {
      if (person.registrationDate) {
        const date = new Date(person.registrationDate);
        const month = date.toLocaleString("default", { month: "short" });

        if (months[month] !== undefined) {
          months[month]++;
        }
      }
    }

    // Format for chart
    const monthlyData = Object.entries(months).map(([name, newResidents]) => ({
      name,
      newResidents,
    }));

    res.json(monthlyData);
  } catch (error) {
    console.error("Error getting monthly trends:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get data backup (admin only)
router.get("/backup", async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin rights required." });
    }

    // Get all data
    const [
      residents,
      familyHeads,
      announcements,
      events,
      documentRequests,
      users,
    ] = await Promise.all([
      Resident.find().select("-qrCode"),
      FamilyHead.find().select("-qrCode"),
      Announcement.find(),
      Event.find().select("-qrCode"),
      DocumentRequest.find().select("-qrCode"),
      // Excluding passwords for security reasons
      req.user.role === "admin"
        ? mongoose.model("User").find().select("-password -qrCode")
        : [],
    ]);

    // Create backup data
    const backupData = {
      timestamp: new Date(),
      data: {
        residents,
        familyHeads,
        announcements,
        events,
        documentRequests,
        users: req.user.role === "admin" ? users : [],
      },
    };

    res.json(backupData);
  } catch (error) {
    console.error("Error creating data backup:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
