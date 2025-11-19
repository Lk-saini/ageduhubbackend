const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

// === CONFIGURATION ===
const baseYearlyCount = 150000; // Fixed visitors till cutoff date
const baseMonthlyCount = 12000; // Fixed monthly visitors till cutoff
const cutoffDate = new Date("2025-10-31T23:59:59Z"); // Start real tracking after this date

router.get("/visitor-stats", async (req, res) => {
  try {
    const now = new Date();

    // Log new visit only after cutoff
    if (now > cutoffDate) {
      await Visitor.create({});
    }

    // === 1️⃣ WEEKLY VISITORS ===
    // Get start of current week (Monday)
    const currentDay = now.getDay(); // 0=Sunday, 1=Monday...
    const diffToMonday = (currentDay + 6) % 7;
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diffToMonday
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyVisitorCount = await Visitor.countDocuments({
      visitedAt: { $gte: startOfWeek, $gt: cutoffDate },
    });

    // === 2️⃣ FIXED VALUES (BEFORE CUTOFF) ===
    const yearlyVisitors =
      now <= cutoffDate ? baseYearlyCount : baseYearlyCount + weeklyVisitorCount;

    const monthlyVisitors =
      now <= cutoffDate ? baseMonthlyCount : baseMonthlyCount + weeklyVisitorCount;

    // === 3️⃣ TOTAL VISITORS ===
    const totalVisitors = yearlyVisitors;

    // === 4️⃣ RESPONSE ===
    res.json({
      totalVisitors,
      yearlyVisitors,
      monthlyVisitors,
      weeklyVisitors: now <= cutoffDate ? 0 : weeklyVisitorCount,
    });
  } catch (error) {
    console.error("Visitor stats error:", error);
    res.status(500).json({ error: "Failed to fetch visitor stats" });
  }
});

module.exports = router;
