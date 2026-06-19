const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product
router.post('/', async (req, res) => {
  const { sku, name, base_cost, category, current_price, min_price, max_price, current_inventory } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products 
        (sku, name, base_cost, category, current_price, min_price, max_price, current_inventory)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [sku, name, base_cost, category, current_price, min_price, max_price, current_inventory]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update price
router.patch('/:id/price', async (req, res) => {
  const { new_price, reason } = req.body;
  try {
    await pool.query(
      'UPDATE products SET current_price = $1 WHERE id = $2',
      [new_price, req.params.id]
    );
    await pool.query(
      'INSERT INTO price_history (product_id, price, pricing_strategy) VALUES ($1, $2, $3)',
      [req.params.id, new_price, reason || 'manual']
    );
    res.json({ success: true, new_price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;