const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT books.id, title, author, description, available, categories.name AS category
      FROM books
      JOIN categories ON books.category_id = categories.id
      ORDER BY books.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
