/**
 * Shop Controller
 * Handles Kopdes Shop (Marketplace, Cart, Checkout, and Payments) via Supabase Client
 */
const supabase = require('../config/supabaseClient');

// Get all marketplace products
const getShopProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = supabase.from('products').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;
    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Get cart items for a member
const getCart = async (req, res, next) => {
  try {
    const { memberId } = req.query;

    if (!memberId) {
      const error = new Error('Member ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    const { data: items, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('member_id', memberId);

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      data: items || []
    });
  } catch (error) {
    next(error);
  }
};

// Add / Update item in cart
const addToCart = async (req, res, next) => {
  try {
    const { memberId, productId, quantity } = req.body;

    if (!memberId || !productId || quantity === undefined) {
      const error = new Error('Member ID, Product ID, dan quantity wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    // Verify product exists and has stock
    const { data: pList } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId);

    if (!pList || pList.length === 0) {
      const error = new Error('Produk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const product = pList[0];
    if (product.stock < quantity) {
      const error = new Error(`Stok tidak mencukupi. Stok saat ini: ${product.stock}`);
      error.statusCode = 400;
      throw error;
    }

    // Upsert the item into the cart. This will update the quantity if the product already exists for this member, avoiding unique constraint violations.
    const { data: upsertData, error: upsertErr } = await supabase
      .from('cart_items')
      .upsert({
        member_id: memberId,
        product_id: productId,
        quantity: Number(quantity)
      }, { onConflict: 'member_id,product_id' })
      .select();

    if (upsertErr) throw new Error(upsertErr.message);
    const data = upsertData;

    res.status(200).json({
      success: true,
      message: 'Keranjang berhasil diperbarui',
      data
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
const removeFromCart = async (req, res, next) => {
  try {
    const { memberId, productId } = req.query;

    if (!memberId || !productId) {
      const error = new Error('Member ID dan Product ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('member_id', memberId)
      .eq('product_id', productId);

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      message: 'Barang dihapus dari keranjang'
    });
  } catch (error) {
    next(error);
  }
};

// Clear entire cart
const clearCart = async (req, res, next) => {
  try {
    const { memberId } = req.query;

    if (!memberId) {
      const error = new Error('Member ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('member_id', memberId);

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      message: 'Keranjang berhasil dikosongkan'
    });
  } catch (error) {
    next(error);
  }
};

// Database-Backed Cart checkout
const checkout = async (req, res, next) => {
  try {
    const { memberId, paymentMethod } = req.body;

    if (!memberId) {
      const error = new Error('Member ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    // 1. Get cart items
    const { data: cartItems, error: cartErr } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('member_id', memberId);

    if (cartErr || !cartItems || cartItems.length === 0) {
      const error = new Error('Keranjang belanja Anda masih kosong');
      error.statusCode = 400;
      throw error;
    }

    let totalAmount = 0;
    const orderItems = [];

    // 2. Verify stock of all products and calculate total
    for (const item of cartItems) {
      const product = item.products;
      if (!product) {
        const error = new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);
        error.statusCode = 404;
        throw error;
      }

      if (product.stock < item.quantity) {
        const error = new Error(`Stok tidak mencukupi untuk ${product.name}. Tersedia: ${product.stock}, diminta: ${item.quantity}`);
        error.statusCode = 400;
        throw error;
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // 3. Check user balance
    const { data: membersList, error: memErr } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId);

    if (memErr || !membersList || membersList.length === 0) {
      const error = new Error('Anggota tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const member = membersList[0];
    const method = paymentMethod || 'KOPDES_PAY';

    if (method === 'KOPDES_PAY') {
      if (Number(member.balance) < totalAmount) {
        const error = new Error(`Saldo Kopdes Pay Anda tidak mencukupi. Dibutuhkan: Rp ${totalAmount.toLocaleString('id-ID')}, Saldo Anda: Rp ${Number(member.balance).toLocaleString('id-ID')}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Create Order
    const orderId = `ORD-${Date.now()}`;
    const { error: orderErr } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_id: orderId,
        member_id: memberId,
        total_amount: totalAmount,
        payment_method: method,
        status: 'Paid'
      });

    if (orderErr) throw new Error(orderErr.message);

    // 5. Create Order Items & Deduct Stock
    for (const orderItem of orderItems) {
      const { error: itemErr } = await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          product_id: orderItem.productId,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          total: orderItem.total
        });

      if (itemErr) throw new Error(itemErr.message);

      // Re-fetch product current stock to prevent issues
      const { data: pData } = await supabase
        .from('products')
        .select('stock')
        .eq('id', orderItem.productId);
      const currentStock = pData && pData.length > 0 ? pData[0].stock : 0;

      // Update product stock
      await supabase
        .from('products')
        .update({ stock: Math.max(0, currentStock - orderItem.quantity) })
        .eq('id', orderItem.productId);
    }

    // 6. Deduct balance (if using KOPDES_PAY)
    if (method === 'KOPDES_PAY') {
      await supabase
        .from('members')
        .update({ balance: Number(member.balance) - totalAmount })
        .eq('id', memberId);
    }

    // 7. Clear cart in database
    await supabase
      .from('cart_items')
      .delete()
      .eq('member_id', memberId);

    // Record shopping checkout to Blockchain Ledger
    const blockchain = require('../utils/blockchain');
    if (blockchain.addBlock) {
      blockchain.addBlock({
        type: "SHOPPING_CHECKOUT",
        memberId,
        memberName: member.name,
        amount: totalAmount,
        message: `Transaksi belanja ${orderItems.map(item => `${item.quantity} ${item.name}`).join(', ')} seharga Rp ${totalAmount.toLocaleString('id-ID')} lunas`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Checkout sukses & Pembayaran telah diproses',
      data: {
        orderId,
        items: orderItems,
        totalAmount,
        paymentMethod: method,
        status: 'Paid',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve order history
const getOrderHistory = async (req, res, next) => {
  try {
    const { memberId } = req.query;
    let query = supabase.from('orders').select('*');

    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    const { data: orders, error } = await query;
    if (error) throw new Error(error.message);

    // Map to camelCase for frontend compatibility
    const mapped = (orders || []).map(o => ({
      id: o.id,
      orderId: o.order_id || o.id,
      memberId: o.member_id,
      totalAmount: Number(o.total_amount || 0),
      paymentMethod: o.payment_method || 'Kopdes Pay',
      createdAt: o.created_at || new Date().toISOString()
    }));

    res.status(200).json({
      success: true,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShopProducts,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  checkout,
  getOrderHistory
};
