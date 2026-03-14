const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");

const Expense = require("../models/Expense");
const Sale = require("../models/sales");
const History = require("../models/History");

function toDateStart(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateEnd(dateStr) {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// GET /api/reports/export?kitchen=Kitchen%201&from=2026-02-01&to=2026-02-29
router.get("/export", async (req, res) => {
  try {
    const { kitchen, from, to } = req.query;
    if (!kitchen) {
      return res.status(400).json({ message: "kitchen is required" });
    }

    let startDate;
    let endDate;

    if (from && to) {
      startDate = toDateStart(from);
      endDate = toDateEnd(to);
    } else {
      const range = getCurrentMonthRange();
      startDate = range.start;
      endDate = range.end;
    }

    const expenseFilter = {
      kitchen,
      date: { $gte: startDate, $lte: endDate },
    };

    const salesFilter = {
      kitchen,
      date: { $gte: startDate, $lte: endDate },
    };

    const [expenses, sales] = await Promise.all([
      Expense.find(expenseFilter).sort({ date: 1 }),
      Sale.find(salesFilter).sort({ date: 1 }),
    ]);

    const totalExpenses = expenses.reduce((sum, x) => sum + Number(x.amount || 0), 0);
    const totalSales = sales.reduce((sum, x) => sum + Number(x.amount || 0), 0);
    const profit = totalSales - totalExpenses;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "KitchenTrack";
    workbook.created = new Date();

    // Summary sheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.addRow(["Kitchen", kitchen]);
    summarySheet.addRow(["From", startDate.toISOString()]);
    summarySheet.addRow(["To", endDate.toISOString()]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Total Expenses", totalExpenses]);
    summarySheet.addRow(["Total Sales", totalSales]);
    summarySheet.addRow(["Profit/Loss", profit]);
    summarySheet.columns = [{ width: 18 }, { width: 40 }];

    // Expenses sheet
    const expSheet = workbook.addWorksheet("Expenses");
    expSheet.columns = [
      { header: "Date", key: "date", width: 18 },
      { header: "Title", key: "title", width: 25 },
      { header: "Category", key: "category", width: 18 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Kitchen", key: "kitchen", width: 14 },
      { header: "Payment Method", key: "paymentMethod", width: 18 },
    ];
    expenses.forEach((e) => {
      expSheet.addRow({
        date: e.date ? new Date(e.date).toISOString().slice(0, 10) : "",
        title: e.title || "",
        category: e.category || "",
        amount: Number(e.amount || 0),
        kitchen: e.kitchen || kitchen,
        paymentMethod: e.paymentMethod || "Cash",
      });
    });
    expSheet.getRow(1).font = { bold: true };

    // Sales sheet
    const salesSheet = workbook.addWorksheet("Sales");
    salesSheet.columns = [
      { header: "Date", key: "date", width: 18 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Kitchen", key: "kitchen", width: 14 },
      { header: "Source", key: "source", width: 18 },
      { header: "Payment Method", key: "paymentMethod", width: 18 },
    ];
    sales.forEach((s) => {
      salesSheet.addRow({
        date: s.date ? new Date(s.date).toISOString().slice(0, 10) : "",
        amount: Number(s.amount || 0),
        kitchen: s.kitchen || kitchen,
        source: s.source || "-",
        paymentMethod: s.paymentMethod || "Online",
      });
    });
    salesSheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    const safeKitchen = String(kitchen).replace(/\s+/g, "_");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="KitchenTrack_${safeKitchen}_Report.xlsx"`
    );

    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Error exporting report:", err);
    return res.status(500).json({ message: "Error exporting report" });
  }
});

// GET /api/reports/history?kitchen=Kitchen%201
router.get("/history", async (req, res) => {
  try {
    const { kitchen } = req.query;
    const history = await History.find({ kitchen }).sort({ archivedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

// POST /api/reports/archive-reset
router.post("/archive-reset", async (req, res) => {
  try {
    const { kitchen } = req.body;
    if (!kitchen) return res.status(400).json({ message: "Kitchen is required" });

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get all current data for this kitchen
    const [expenses, sales] = await Promise.all([
      Expense.find({ kitchen }),
      Sale.find({ kitchen })
    ]);

    const totalExpenses = expenses.reduce((sum, x) => sum + Number(x.amount || 0), 0);
    const totalSales = sales.reduce((sum, x) => sum + Number(x.amount || 0), 0);

    // Create breakdown
    const salesBreakdown = {};
    sales.forEach(s => {
      salesBreakdown[s.source || 'Other'] = (salesBreakdown[s.source || 'Other'] || 0) + Number(s.amount || 0);
    });

    const expensesBreakdown = {};
    expenses.forEach(e => {
      expensesBreakdown[e.category || 'Other'] = (expensesBreakdown[e.category || 'Other'] || 0) + Number(e.amount || 0);
    });

    // Save to history
    const history = new History({
      kitchen,
      month: monthKey,
      totalSales,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
      salesBreakdown,
      expensesBreakdown
    });
    await history.save();

    // Reset current data (Delete current records)
    await Promise.all([
      Expense.deleteMany({ kitchen }),
      Sale.deleteMany({ kitchen })
    ]);

    res.json({ success: true, message: `Archived ${monthKey} and reset current data.` });
  } catch (err) {
    console.error("Error in archive-reset:", err);
    res.status(500).json({ message: "Error during archive/reset" });
  }
});

// GET /api/reports/metrics?kitchen=Kitchen%201
router.get("/metrics", async (req, res) => {
  try {
    const { kitchen } = req.query;
    if (!kitchen) return res.status(400).json({ message: "Kitchen is required" });

    // Fetch current sales and expenses
    const [sales, expenses] = await Promise.all([
      Sale.find({ kitchen }),
      Expense.find({ kitchen })
    ]);

    const totalNetSales = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const deliveredOrders = sales.length;
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    
    // Exact logic for specific sources
    const salesFromAds = sales.filter(s => s.source === 'Sales from Ads').reduce((sum, s) => sum + Number(s.amount), 0);
    const salesFromOffers = sales.filter(s => s.source === 'Sales from Offers').reduce((sum, s) => sum + Number(s.amount), 0);

    // Logic for Advertising spend (assuming category 'Ads' or 'Advertising')
    const adSpends = expenses.filter(e => e.category?.toLowerCase().includes('ad')).reduce((sum, e) => sum + Number(e.amount), 0);
    
    // M2O calculation (Ad Spends as % of Total Net Sales)
    const m2oValue = totalNetSales > 0 ? (adSpends / totalNetSales) * 100 : 0;
    const m2o = m2oValue.toFixed(1) + '%';

    const metrics = [
      { name: 'Net Sales', value: `₹${totalNetSales.toLocaleString('en-IN')}`, change: totalNetSales > 0 ? 8 : 0, emoji: '🟢' },
      { name: 'Delivered Orders', value: String(deliveredOrders), change: deliveredOrders > 0 ? 4 : 0, emoji: '🟢' },
      { name: 'Rejections', value: '1.2%', change: -0.5, emoji: '🟢' }, // Hardcoded placeholder
      { name: 'M2O', value: m2o, change: m2oValue > 15 ? 2 : -1, emoji: m2oValue > 15 ? '🔴' : '🟢' },
      { name: 'Sales from Offers', value: `₹${salesFromOffers.toLocaleString('en-IN')}`, change: salesFromOffers > 0 ? 10 : 0, emoji: '🔵' },
      { name: 'Sales from Ads', value: `₹${salesFromAds.toLocaleString('en-IN')}`, change: salesFromAds > 0 ? 22 : 0, emoji: '🚀' },
      { name: 'Ad Spends', value: `₹${adSpends.toLocaleString('en-IN')}`, change: adSpends > 1000 ? 12 : 0, emoji: adSpends > 5000 ? '🔴' : '🟢' },
    ];

    res.json(metrics);
  } catch (err) {
    console.error("Metrics API Error:", err);
    res.status(500).json({ message: "Error fetching metrics" });
  }
});

// GET /api/reports/data?kitchen=Kitchen%201&filter=monthly
router.get("/data", async (req, res) => {
  try {
    const { kitchen, filter } = req.query;
    if (!kitchen) return res.status(400).json({ message: "Kitchen is required" });

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const now = new Date();

    if (filter === "daily") {
      // Today already set by default
    } else if (filter === "weekly") {
      // current week (starting from Monday)
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const [sales, expenses] = await Promise.all([
      Sale.find({ kitchen, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 }),
      Expense.find({ kitchen, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 }),
    ]);

    const totalSales = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const chartLabels = [];
    const chartSales = [];
    const chartExpenses = [];

    const dateMap = {};

    sales.forEach(s => {
      const d = new Date(s.date).toISOString().split('T')[0];
      if (!dateMap[d]) dateMap[d] = { s: 0, e: 0 };
      dateMap[d].s += Number(s.amount || 0);
    });

    expenses.forEach(e => {
      const d = new Date(e.date).toISOString().split('T')[0];
      if (!dateMap[d]) dateMap[d] = { s: 0, e: 0 };
      dateMap[d].e += Number(e.amount || 0);
    });

    const sortedDates = Object.keys(dateMap).sort();
    sortedDates.forEach(d => {
      chartLabels.push(d);
      chartSales.push(dateMap[d].s);
      chartExpenses.push(dateMap[d].e);
    });

    res.json({
      summary: {
        totalSales,
        totalExpenses,
        netProfit: totalSales - totalExpenses
      },
      chartData: {
        labels: chartLabels,
        sales: chartSales,
        expenses: chartExpenses
      },
      details: {
        sales,
        expenses
      }
    });
  } catch (err) {
    console.error("Reports Data API Error:", err);
    res.status(500).json({ message: "Error fetching reports data" });
  }
});

module.exports = router;
