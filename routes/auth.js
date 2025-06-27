const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load .env

const SECRET = process.env.JWT_SECRET;

// Signup
router.post("/signup", async (req, res) => {
  const { name, mobile, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, mobile, password, role)
       VALUES ($1, $2, $3, 'user') RETURNING id, name, mobile, role`,
      [name, mobile, hashed]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const result = await db.query(`SELECT * FROM users WHERE mobile = $1`, [mobile]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const match1 = await bcrypt.compare(password, user.password);
    const match2 = password === user.password
    const match = match1 || match2
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "12h" });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/validate", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ user: decoded }); // Contains { id, role, ... }
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
