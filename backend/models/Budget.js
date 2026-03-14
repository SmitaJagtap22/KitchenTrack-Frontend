const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    kitchen: {
      type: String,
      required: true,
    },
    // YYYY-MM (example: 2026-02)
    monthKey: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ kitchen: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);

