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

// POST sync competitor prices and auto-match
router.post('/sync-competitors', async (req, res) => {
  try {
    // 1. Fetch all products from DB
    const productsResult = await pool.query('SELECT * FROM products');
    const products = productsResult.rows;
    const updates = [];

    // 2. Evaluate competitor match logic for each SKU
    for (const prod of products) {
      // Simulate competitor price: varying by +/- 6% organically
      const priceVariation = (Math.random() * 0.12) - 0.06; // -6% to +6%
      const newCompetitorPrice = Math.round(prod.current_price * (1 + priceVariation));

      let matchedPrice = prod.current_price;
      let matched = false;
      let reason = 'Market stable';

      // Rule: If competitor drops price, we match them (unless it drops below our min_price floor)
      if (newCompetitorPrice < prod.current_price) {
        if (newCompetitorPrice >= prod.min_price) {
          matchedPrice = newCompetitorPrice;
          matched = true;
          reason = `Matched competitor underpricing (New Comp: ₹${newCompetitorPrice})`;
        } else {
          // If competitor undercuts our floor, lock to min_price guardrail
          matchedPrice = prod.min_price;
          matched = true;
          reason = `Floor limit hit (Comp: ₹${newCompetitorPrice}, Floor: ₹${prod.min_price})`;
        }
      }

      if (matched) {
        // Update product price
        await pool.query(
          'UPDATE products SET current_price = $1 WHERE id = $2',
          [matchedPrice, prod.id]
        );
        // Insert into price history log
        await pool.query(
          'INSERT INTO price_history (product_id, price, quantity_sold, revenue, pricing_strategy) VALUES ($1, $2, 0, 0, $3)',
          [prod.id, matchedPrice, reason]
        );

        updates.push({
          product_id: prod.id,
          name: prod.name,
          old_price: prod.current_price,
          new_price: matchedPrice,
          competitor_price: newCompetitorPrice,
          action: reason
        });
      }
    }

    res.json({
      success: true,
      message: `Competitor sync completed. Evaluated ${products.length} products.`,
      updated_skus: updates.length,
      details: updates
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
