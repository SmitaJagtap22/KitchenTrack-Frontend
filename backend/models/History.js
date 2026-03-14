const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  kitchen: { type: String, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  totalSales: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  salesBreakdown: { type: Object }, // Detailed source breakdown
  expensesBreakdown: { type: Object }, // Detailed category breakdown
  archivedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
