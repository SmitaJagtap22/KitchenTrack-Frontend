const express = require("express");
const router = express.Router();
const Sale = require("../models/sales");
const multer = require("multer");
const ExcelJS = require("exceljs");
const upload = multer({ storage: multer.memoryStorage() });

// Helper to determine payment_source for manual entries
const getPaymentSource = (paymentMethod, source) => {
  if (paymentMethod === 'Cash') return 'cash';
  if (source === 'Swiggy') return 'swiggy';
  if (source === 'Zomato') return 'zomato';
  return 'online';
};

// GET /api/sales?kitchen=Kitchen%201
router.get("/", async (req, res) => {
  try {
    const { kitchen } = req.query;
    const filter = kitchen ? { kitchen } : {};

    const sales = await Sale.find(filter).sort({ date: -1 });

    res.json(sales);
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).json({ message: "Error fetching sales" });
  }
});

// POST /api/sales/add
router.post("/add", async (req, res) => {
  try {
    const { amount, date, kitchen, source, paymentMethod, orderId } = req.body;

    const newSale = new Sale({
      amount,
      date,
      kitchen,
      source,
      paymentMethod,
      orderId: orderId || undefined, // Use undefined for partial index to work
      payment_source: getPaymentSource(paymentMethod, source)
    });

    await newSale.save();

    res.json({ message: "Sale added successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate record detected (Order ID already exists for this platform)" });
    }
    console.error("Error adding sale:", err);
    res.status(500).json({ message: "Error adding sale" });
  }
});

// POST /api/sales/import
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    const { kitchen, platform } = req.body; // platform: 'swiggy' | 'zomato'
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1); // Read first sheet

    let addedCount = 0;
    let duplicateCount = 0;

    // Map columns flexibly
    let colIndices = { order_id: -1, date: -1, amount: -1 };
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      const header = cell.value?.toString().toLowerCase();
      if (header.includes("id")) colIndices.order_id = colNumber;
      if (header.includes("date")) colIndices.date = colNumber;
      if (header.includes("amount")) colIndices.amount = colNumber;
    });

    // Fallback if headers not found by keywords
    if (colIndices.order_id === -1) colIndices.order_id = 1;
    if (colIndices.date === -1) colIndices.date = 2;
    if (colIndices.amount === -1) colIndices.amount = 3;

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const orderId = row.getCell(colIndices.order_id).value?.toString();
      const orderDate = row.getCell(colIndices.date).value;
      const amountValue = row.getCell(colIndices.amount).value;

      if (!orderId || !amountValue) continue;

      try {
        const amount = typeof amountValue === 'object' ? amountValue.result : parseFloat(amountValue);

        const newSale = new Sale({
          amount: amount,
          date: orderDate instanceof Date ? orderDate : new Date(orderDate),
          kitchen,
          source: platform.charAt(0).toUpperCase() + platform.slice(1),
          paymentMethod: 'Online',
          payment_source: platform,
          orderId: orderId
        });

        await newSale.save();
        addedCount++;
      } catch (err) {
        if (err.code === 11000) {
          duplicateCount++;
        } else {
          console.error(`Error importing row ${i}:`, err);
        }
      }
    }

    res.json({
      message: "Import complete",
      addedCount,
      duplicateCount,
      summary: `${addedCount} records added, ${duplicateCount} duplicates skipped`
    });
  } catch (err) {
    console.error("Error importing Excel:", err);
    res.status(500).json({ message: "Error importing Excel file" });
  }
});

module.exports = router;
