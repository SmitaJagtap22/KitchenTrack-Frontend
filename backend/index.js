require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { initSchedulers, triggerAllReminders } = require("./utils/scheduler");
const app = express();
app.use(express.json());
const corsOptions = {
  origin: ['http://localhost:3000', 'https://kitchentrack.vercel.app'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
const connectDB = require("./config/db");
connectDB();

// Initialize schedulers
initSchedulers();

const requireOwner = (req, res, next) => {
  const role = req.headers["x-user-role"];
  if (role === "chef") {
    return res.status(403).json({ message: "Access Denied: Owner only feature" });
  }
  next();
};

const expenseRoutes = require("./routes/expenseRoutes");
const salesRoutes = require("./routes/salesRoutes");
const staffRoutes = require("./routes/staffRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const reportRoutes = require("./routes/reportRoutes");
const config = require("./config/businessConfig");

app.use("/api/expenses", expenseRoutes);
app.use("/api/sales", requireOwner, salesRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/budget", requireOwner, budgetRoutes);
app.use("/api/reports", requireOwner, reportRoutes);

// Demo login — two hard-coded users for final-year project
const DEMO_USERS = [
  { username: "admin", password: "password123", role: "owner" },
  { username: "chef", password: "chef123", role: "chef" },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = DEMO_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    return res.json({
      success: true,
      user: { username: user.username, role: user.role },
      message: "Login successful",
    });
  }
  return res.status(401).json({
    success: false,
    message: "Invalid username or password",
  });
});

const Staff = require("./models/Staff");
app.get("/api/owner", async (req, res) => {
  try {
    const { kitchen } = req.query;
    if (!kitchen) return res.json(null);
    const owner = await Staff.findOne({ kitchen, role: "Owner" });
    res.json(owner || null);
  } catch (err) {
    console.error("Error fetching owner:", err);
    res.status(500).json({ message: "Error fetching owner" });
  }
});

app.get("/", (req, res) => {
  res.send("Cloud kitchen finance tracker backend is running");
});

app.post("/api/test-email-reminder", async (req, res) => {
  try {
    const result = await triggerAllReminders();
    if (result.success) {
      res.json({ message: `Reminders sent successfully to ${result.count} owners.` });
    } else {
      res.status(500).json({ message: result.message || "Failed to send reminders." });
    }
  } catch (err) {
    console.error("Error in manual trigger:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
