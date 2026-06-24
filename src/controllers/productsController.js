/**
 * Products Management Controller
 * Handles CRUD operations for admin management of village products
 */
const supabase = require('../config/supabaseClient');

// Create a new product
const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, unit, stock, image, description } = req.body;

    if (!name || !category || !price || !unit || stock === undefined) {
      const error = new Error('Name, category, price, unit, and stock are required');
      error.statusCode = 400;
      throw error;
    }

    const newId = `p${Date.now()}`;
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

    const { data, error } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, unit, stock, image, description } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = Number(price);
    if (unit !== undefined) updates.unit = unit;
    if (stock !== undefined) updates.stock = Number(stock);
    if (image !== undefined) updates.image = image;
    if (description !== undefined) updates.description = description;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const err = new Error(error.message || `Failed to update product with ID ${id}`);
      err.statusCode = 400;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const err = new Error(error.message || `Product with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: data
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
