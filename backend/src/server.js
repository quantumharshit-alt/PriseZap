const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const productRoutes = require('../routes/products');
const pricingRoutes = require('../routes/pricing');
const analyticsRoutes = require('../routes/analytics');

app.use('/api/products', productRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 Dynamic Pricing API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});