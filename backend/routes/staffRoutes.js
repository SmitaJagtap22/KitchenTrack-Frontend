const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");

// GET /api/staff?kitchen=Kitchen%201
router.get("/", async (req, res) => {
  try {
    const { kitchen } = req.query;
    const filter = kitchen ? { kitchen } : {};
    const staff = await Staff.find(filter).sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ message: "Error fetching staff" });
  }
});

// POST /api/staff/add
router.post("/add", async (req, res) => {
  try {
    const { name, role, email, phone, kitchen } = req.body;

    const staffMember = new Staff({
      name,
      role,
      email,
      phone,
      kitchen,
    });

    await staffMember.save();
    res.status(201).json(staffMember);
  } catch (err) {
    console.error("Error adding staff:", err);
    res.status(500).json({ message: "Error adding staff" });
  }
});

// DELETE /api/staff/:id
router.delete("/:id", async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Staff member removed successfully" });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ message: "Error deleting staff" });
  }
});

module.exports = router;

