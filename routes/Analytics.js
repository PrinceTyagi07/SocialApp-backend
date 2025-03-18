const express = require("express");
const router = express.Router();
const User = require("../models/UserModel"); // Import User model
const moment = require("moment"); // For date formatting

// API to get user growth data based on signup timestamps
router.get("/user-growth", async (req, res) => {
  try {
    const days = 15; // Last 15 days
    const userGrowthData = [];

    for (let i = days - 1; i >= 0; i--) {
      const startDate = moment().subtract(i, "days").startOf("day");
      const endDate = moment().subtract(i, "days").endOf("day");

      const count = await User.countDocuments({
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      });

      userGrowthData.push({
        date: startDate.format("YYYY-MM-DD"), // Format date (e.g., 2025-03-01)
        users: count,
      });
    }

    return res.status(200).json(userGrowthData);
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
