/**
 * Products Management Controller
 * Handles CRUD operations for admin management of village products
 */
const { products } = require('../models/mockDb');

// Create a new product
const createProduct = (req, res, next) => {
  try {
    const { name, category, price, unit, stock, image, description } = req.body;

    if (!name || !category || !price || !unit || stock === undefined) {
      const error = new Error('Name, category, price, unit, and stock are required');
      error.statusCode = 400;
      throw error;
    }

    const newId = `p${products.length + 1}`;
    const newProduct = {
      id: newId,
      name,
      category,
      price: Number(price),
      unit,
      stock: Number(stock),
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300',
      description: description || ''
    };

    products.push(newProduct);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing product
const updateProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, unit, stock, image, description } = req.body;

    const product = products.find(p => p.id === id);

    if (!product) {
      const error = new Error(`Product with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (unit !== undefined) product.unit = unit;
    if (stock !== undefined) product.stock = Number(stock);
    if (image !== undefined) product.image = image;
    if (description !== undefined) product.description = description;

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product
const deleteProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      const error = new Error(`Product with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    const deletedProduct = products.splice(index, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct
};
