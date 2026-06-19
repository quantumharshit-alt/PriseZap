const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET price history for a product
router.get('/history/:productId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT price, quantity_sold, revenue, timestamp 
       FROM price_history 
       WHERE product_id = $1 
       ORDER BY timestamp DESC LIMIT 30`,
      [req.params.productId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all active A/B tests
router.get('/abtests', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ab_tests.*, products.name as product_name 
       FROM ab_tests 
       JOIN products ON ab_tests.product_id = products.id
       WHERE ab_tests.status = 'running'`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create A/B test
router.post('/abtest', async (req, res) => {
  const { product_id, test_name, control_price, variant_price } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO ab_tests 
        (product_id, test_name, control_price, variant_price, start_date, status)
       VALUES ($1,$2,$3,$4,NOW(),'running') RETURNING *`,
      [product_id, test_name, control_price, variant_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST record a sale
router.post('/transaction', async (req, res) => {
  const { product_id, quantity, sale_price } = req.body;
  const revenue = quantity * sale_price;
  try {
    await pool.query(
      `INSERT INTO transactions (product_id, quantity, sale_price) VALUES ($1,$2,$3)`,
      [product_id, quantity, sale_price]
    );
    await pool.query(
      `INSERT INTO price_history (product_id, price, quantity_sold, revenue) VALUES ($1,$2,$3,$4)`,
      [product_id, sale_price, quantity, revenue]
    );
    res.json({ success: true, revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;