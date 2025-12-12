const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

// === CONFIGURATION ===
const baseYearlyCount = 150000;     // Fixed total visitors until cutoff
const baseMonthlyCount = 12000;     // Fixed monthly only for the FIRST month
const cutoffDate = new Date("2025-10-31T23:59:59Z");

router.get("/visitor-stats", async (req, res) => {
  try {
    const now = new Date();

    // Log new visit only after cutoff
    if (now > cutoffDate) {
      await Visitor.create({});
    }

    // --- 1️⃣ WEEKLY VISITORS ---
    const currentDay = now.getDay(); // 0=Sunday
    const diffToMonday = (currentDay + 6) % 7;
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diffToMonday
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyVisitorCount = await Visitor.countDocuments({
      visitedAt: { $gte: startOfWeek }
    });

    // --- 2️⃣ MONTHLY VISITORS ---
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const realMonthlyVisitors = await Visitor.countDocuments({
      visitedAt: { $gte: startOfMonth }
    });

    let monthlyVisitors;

    // Apply fixed monthly count ONLY for the FIRST month after cutoff
    const isFirstMonthAfterCutoff =
      now.getFullYear() === cutoffDate.getFullYear() &&
      now.getMonth() === cutoffDate.getMonth() + 1; // next month

    if (now <= cutoffDate) {
      // Before cutoff, show fixed number
      monthlyVisitors = baseMonthlyCount;
    } else if (isFirstMonthAfterCutoff) {
      // First real month → fixed base + real visitors
      monthlyVisitors = baseMonthlyCount + realMonthlyVisitors;
    } else {
      // Normal months → real visitors only
      monthlyVisitors = realMonthlyVisitors;
    }

    // --- 3️⃣ YEARLY VISITORS ---
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const realYearlyVisitors = await Visitor.countDocuments({
      visitedAt: { $gte: startOfYear }
    });

    const yearlyVisitors =
      now <= cutoffDate
        ? baseYearlyCount
        : baseYearlyCount + realYearlyVisitors;

    // --- 4️⃣ TOTAL VISITORS (same as yearly) ---
    const totalVisitors = yearlyVisitors;

    // --- 5️⃣ SEND RESPONSE ---
    res.json({
      totalVisitors,
      yearlyVisitors,
      monthlyVisitors,
      weeklyVisitors: now <= cutoffDate ? 0 : weeklyVisitorCount
    });

  } catch (error) {
    console.error("Visitor stats error:", error);
    res.status(500).json({ error: "Failed to fetch visitor stats" });
  }
});

module.exports = router;
