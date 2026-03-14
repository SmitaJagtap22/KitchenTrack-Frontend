const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");

function getCurrentMonthKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// GET /api/budget/current?kitchen=Kitchen%201
router.get("/current", async (req, res) => {
  try {
    const { kitchen } = req.query;
    if (!kitchen) {
      return res.status(400).json({ message: "kitchen is required" });
    }

    const monthKey = getCurrentMonthKey();
    const budget = await Budget.findOne({ kitchen, monthKey });

    res.json({
      kitchen,
      monthKey,
      amount: budget ? budget.amount : 0,
    });
  } catch (err) {
    console.error("Error fetching budget:", err);
    res.status(500).json({ message: "Error fetching budget" });
  }
});

// POST /api/budget/set
// Body: { kitchen, monthKey (optional), amount }
router.post("/set", async (req, res) => {
  try {
    const { kitchen, monthKey, amount } = req.body;
    if (!kitchen) return res.status(400).json({ message: "kitchen is required" });
    if (amount === undefined || amount === null)
      return res.status(400).json({ message: "amount is required" });

    const key = monthKey || getCurrentMonthKey();

    const updated = await Budget.findOneAndUpdate(
      { kitchen, monthKey: key },
      { $set: { amount: Number(amount) } },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error setting budget:", err);
    res.status(500).json({ message: "Error setting budget" });
  }
});

// GET /api/budget/history?kitchen=Kitchen%201
router.get("/history", async (req, res) => {
  try {
    const { kitchen } = req.query;
    if (!kitchen) {
      return res.status(400).json({ message: "kitchen is required" });
    }

    const items = await Budget.find({ kitchen }).sort({ monthKey: -1 }).limit(12);
    res.json(items);
  } catch (err) {
    console.error("Error fetching budget history:", err);
    res.status(500).json({ message: "Error fetching budget history" });
  }
});

module.exports = router;

