const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

// GET /api/products - list all products with category name
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/categories
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/products/low-stock
router.get("/low-stock", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE quantity <= reorder_level ORDER BY quantity ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch low-stock products" });
  }
});

// GET /api/products/summary - counts per category, for charts
router.get("/summary/by-category", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.name AS category, COALESCE(SUM(p.quantity), 0) AS total_quantity
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.name
       ORDER BY c.name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// POST /api/products - create a product
router.post("/", async (req, res) => {
  try {
    const { name, sku, category_id, quantity, unit_price, reorder_level } = req.body;
    if (!name || !sku) return res.status(400).json({ error: "name and sku are required" });

    const result = await pool.query(
      `INSERT INTO products (name, sku, category_id, quantity, unit_price, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, sku, category_id || null, quantity || 0, unit_price || 0, reorder_level || 10]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "SKU already exists" });
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id - update product details
router.put("/:id", async (req, res) => {
  try {
    const { name, category_id, quantity, unit_price, reorder_level } = req.body;
    const result = await pool.query(
      `UPDATE products SET
         name = COALESCE($1, name),
         category_id = COALESCE($2, category_id),
         quantity = COALESCE($3, quantity),
         unit_price = COALESCE($4, unit_price),
         reorder_level = COALESCE($5, reorder_level)
       WHERE id = $6 RETURNING *`,
      [name, category_id, quantity, unit_price, reorder_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// POST /api/products/:id/stock - record a stock in/out movement
router.post("/:id/stock", async (req, res) => {
  const client = await pool.connect();
  try {
    const { change_type, quantity, note } = req.body;
    if (!["in", "out"].includes(change_type) || !quantity) {
      return res.status(400).json({ error: "change_type ('in'/'out') and quantity are required" });
    }

    await client.query("BEGIN");

    const delta = change_type === "in" ? quantity : -quantity;
    const updated = await client.query(
      "UPDATE products SET quantity = quantity + $1 WHERE id = $2 RETURNING *",
      [delta, req.params.id]
    );

    if (updated.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }
    if (updated.rows[0].quantity < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Not enough stock for this movement" });
    }

    await client.query(
      "INSERT INTO stock_movements (product_id, change_type, quantity, note) VALUES ($1, $2, $3, $4)",
      [req.params.id, change_type, quantity, note || null]
    );

    await client.query("COMMIT");
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to record stock movement" });
  } finally {
    client.release();
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
