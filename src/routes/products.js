const express = require('express');
const router = express.Router();
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');

// Admin CRUD operations for products catalog
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
