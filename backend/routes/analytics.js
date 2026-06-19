const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET dashboard KPIs
router.get('/kpis', async (req, res) => {
  try {
    const revenue = await pool.query(
      `SELECT COALESCE(SUM(revenue), 0) as total 
       FROM price_history 
       WHERE timestamp > NOW() - INTERVAL '30 days'`
    );
    const orders = await pool.query(
      `SELECT COALESCE(SUM(quantity_sold), 0) as total 
       FROM price_history 
       WHERE timestamp > NOW() - INTERVAL '30 days'`
    );
    const products = await pool.query(
      `SELECT COUNT(*) as total FROM products`
    );
    const avgPrice = await pool.query(
      `SELECT COALESCE(AVG(current_price), 0) as avg FROM products`
    );

    res.json({
      total_revenue: parseFloat(revenue.rows[0].total),
      total_orders: parseInt(orders.rows[0].total),
      total_products: parseInt(products.rows[0].total),
      avg_price: parseFloat(avgPrice.rows[0].avg).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET revenue chart (last 7 days)
router.get('/revenue-chart', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         DATE(timestamp) as date,
         SUM(revenue) as daily_revenue,
         SUM(quantity_sold) as daily_units
       FROM price_history
       WHERE timestamp > NOW() - INTERVAL '7 days'
       GROUP BY DATE(timestamp)
       ORDER BY date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;