const Expense = require("../models/Expense");

// Create a new expense using data sent from the frontend
// Expected body: { title, amount, category, date, kitchen, paymentMethod }
const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date, kitchen, paymentMethod } = req.body;

    const expense = new Expense({
      title,
      amount,
      category,
      date,
      kitchen,
      paymentMethod,
    });

    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Error adding expense" });
  }
};

module.exports = { addExpense };
