const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const { addExpense } = require("../controllers/expenseContoller");

// GET /api/expenses?kitchen=Kitchen%201
router.get("/", async (req, res) => {
  try {
    const { kitchen } = req.query;
    const filter = kitchen ? { kitchen } : {};

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Error fetching expenses" });
  }
});

// POST /api/expenses/add
router.post("/add", addExpense);

module.exports = router;
