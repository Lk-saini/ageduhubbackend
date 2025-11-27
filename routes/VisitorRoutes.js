const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

// === CONFIGURATION ===
const baseYearlyCount = 150000; // Fixed visitors till cutoff date
const baseMonthlyCount = 12000; // Fixed monthly visitors till cutoff
const cutoffDate = new Date("2025-10-31T23:59:59Z"); // Start real tracking after 



router.get("/visitor-stats", async (req, res) => {
  try {
    const now = new Date();

    // Save new visit only after cutoff date
    if (now > cutoffDate) {
      await Visitor.create({});
    }

    // Get start of current week (Monday)
    const currentDay = now.getDay(); // 0=Sunday
    const diffToMonday = (currentDay + 6) % 7;
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diffToMonday
    );
    startOfWeek.setHours(0, 0, 0, 0);

    // Use the later date: cutoff OR week start
    const effectiveStart =
      startOfWeek > cutoffDate ? startOfWeek : cutoffDate;

    // Weekly visitors
    const weeklyVisitorCount =
      now <= cutoffDate
        ? 0
        : await Visitor.countDocuments({
            visitedAt: { $gte: effectiveStart },
          });

    // Monthly visitors
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyDBCount =
      now <= cutoffDate
        ? 0
        : await Visitor.countDocuments({
            visitedAt: { $gte: startOfMonth },
          });

    // Yearly visitors
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const yearlyDBCount =
      now <= cutoffDate
        ? 0
        : await Visitor.countDocuments({
            visitedAt: { $gte: startOfYear },
          });

    const yearlyVisitors = baseYearlyCount + yearlyDBCount;
    const monthlyVisitors = baseMonthlyCount + monthlyDBCount;
    const totalVisitors = yearlyVisitors;

    res.json({
      totalVisitors,
      yearlyVisitors,
      monthlyVisitors,
      weeklyVisitors: weeklyVisitorCount,
    });
  } catch (error) {
    console.error("Visitor stats error:", error);
    res.status(500).json({ error: "Failed to fetch visitor stats" });
  }
});
module.exports = router;
