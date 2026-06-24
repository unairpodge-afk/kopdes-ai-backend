const express = require('express');
const router = express.Router();

const membershipRoutes = require('./membership');
const shopRoutes = require('./shop');
const productsRoutes = require('./products');
const financeRoutes = require('./finance');
const governanceRoutes = require('./governance');
const delphiRoutes = require('./delphi');
const adminRoutes = require('./admin');
const investorRoutes = require('./investor');

// Register modular routes
router.use('/membership', membershipRoutes);
router.use('/shop', shopRoutes);
router.use('/products', productsRoutes);
router.use('/finance', financeRoutes);
router.use('/governance', governanceRoutes);
router.use('/delphi', delphiRoutes);
router.use('/admin', adminRoutes);
router.use('/investor', investorRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kopdes AI Backend API is healthy and running',
    version: '1.0.0-MVP',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
