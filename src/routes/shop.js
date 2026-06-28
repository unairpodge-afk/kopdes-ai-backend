const express = require('express');
const router = express.Router();
const {
  getShopProducts,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  checkout,
  getOrderHistory,
  getReviews,
  addReview,
  getOrderItems
} = require('../controllers/shopController');

// Product listing in shop
router.get('/products', getShopProducts);

// Product reviews
router.get('/reviews', getReviews);
router.post('/reviews', addReview);

// Checkout and Order actions
router.post('/checkout', checkout);
router.get('/orders', getOrderHistory);
router.get('/orders/:orderId/items', getOrderItems);

// Cart management
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart', removeFromCart);
router.delete('/cart/clear', clearCart);

module.exports = router;

