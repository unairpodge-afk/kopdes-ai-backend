import React, { useState, useEffect } from 'react';

const ShopPage = ({ apiBase, profile, setProfile, logEcosystemActivity, navigateTo }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Shopping History and Tabs states
  const [activeRightTab, setActiveRightTab] = useState('cart'); // 'cart' | 'history'
  const [orderHistory, setOrderHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Admin form states
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Sembako');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Kg');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [adminMsg, setAdminMsg] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAdminMsg('');
    try {
      const res = await fetch(`${apiBase}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCategory,
          price: Number(newProdPrice),
          unit: newProdUnit,
          stock: Number(newProdStock),
          image: newProdImage || undefined,
          description: newProdDesc
        })
      });
      const result = await res.json();
      if (result.success) {
        setAdminMsg('Produk baru berhasil ditambahkan!');
        setNewProdName('');
        setNewProdPrice('');
        setNewProdStock('');
        setNewProdImage('');
        setNewProdDesc('');
        fetchProducts();
      } else {
        alert(result.error?.message || 'Gagal menambahkan produk.');
      }
    } catch (err) {
      alert('Gagal menghubungi backend.');
    }
  };

  const handleUpdateStock = async (productId, currentStock) => {
    const amtStr = prompt('Masukkan jumlah stok baru:', currentStock);
    if (amtStr === null) return;
    const newStock = Number(amtStr);
    if (isNaN(newStock) || newStock < 0) {
      alert('Masukkan angka stok yang valid.');
      return;
    }
    try {
      const res = await fetch(`${apiBase}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      const result = await res.json();
      if (result.success) {
        fetchProducts();
      } else {
        alert('Gagal memperbarui stok.');
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) return;
    try {
      const res = await fetch(`${apiBase}/products/${productId}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        fetchProducts();
      } else {
        alert('Gagal menghapus produk.');
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/shop/products`);
      const result = await res.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        setError('Gagal memuat katalog produk.');
      }
    } catch (err) {
      setError('Gagal menghubungi backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!profile) {
      setCart([]);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/shop/cart?memberId=${profile.id}`);
      const result = await res.json();
      if (result.success) {
        // Map backend structure: { id, products: { ... }, quantity } -> frontend expects product details + quantity
        const mappedCart = result.data.map(item => ({
          ...item.products,
          quantity: item.quantity,
          cartItemId: item.id
        }));
        setCart(mappedCart);
      }
    } catch (err) {
      console.error('Gagal mengambil data keranjang:', err);
    }
  };

  const fetchOrderHistory = async () => {
    if (!profile) return;
    try {
      setHistoryLoading(true);
      const res = await fetch(`${apiBase}/shop/orders?memberId=${profile.id}`);
      const result = await res.json();
      if (result.success) {
        setOrderHistory(result.data);
      }
    } catch (err) {
      console.error('Gagal memuat riwayat belanja:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchOrderHistory();
  }, [apiBase, profile?.id]);

  const getAvailableStock = (product) => {
    // For database cart, database quantities are already validated at update time
    return product.stock;
  };

  const addToCart = async (product) => {
    if (!profile) {
      alert('Silakan masuk (login) terlebih dahulu melalui Portal / halaman Membership.');
      return;
    }
    setOrderSuccess(null);
    const existing = cart.find(item => item.id === product.id);
    const newQty = existing ? existing.quantity + 1 : 1;

    if (newQty > product.stock) {
      alert('Stok tidak mencukupi untuk menambah item.');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/shop/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.id,
          productId: product.id,
          quantity: newQty
        })
      });
      const result = await res.json();
      if (result.success) {
        fetchCart();
        if (logEcosystemActivity) logEcosystemActivity('SHOP_ADD_TO_CART', 'Menambahkan ke keranjang: ' + (product?.name || 'Produk'), null, 'shop');
      } else {
        alert(result.error?.message || 'Gagal menambah item ke keranjang.');
      }
    } catch (err) {
      alert('Gagal menghubungi server keranjang belanja.');
    }
  };

  const updateCartQty = async (productId, qty) => {
    if (!profile) return;
    const product = products.find(p => p.id === productId);

    if (qty > product.stock) {
      alert('Stok tidak mencukupi.');
      return;
    }

    if (qty <= 0) {
      try {
        const res = await fetch(`${apiBase}/shop/cart?memberId=${profile.id}&productId=${productId}`, {
          method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
          fetchCart();
        } else {
          alert('Gagal menghapus item dari keranjang.');
        }
      } catch (err) {
        alert('Gagal memperbarui keranjang.');
      }
    } else {
      try {
        const res = await fetch(`${apiBase}/shop/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: profile.id,
            productId: productId,
            quantity: qty
          })
        });
        const result = await res.json();
        if (result.success) {
          fetchCart();
        } else {
          alert('Gagal memperbarui kuantitas.');
        }
      } catch (err) {
        alert('Gagal memperbarui keranjang.');
      }
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!profile) return;
    if (cart.length === 0) return;

    try {
      const res = await fetch(`${apiBase}/shop/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.id,
          paymentMethod: 'KOPDES_PAY'
        })
      });

      const result = await res.json();
      if (result.success) {
        setOrderSuccess(result.data);
        setCart([]); // Clear local cart
        
        // Update global user balance
        const nextBal = Number(profile.balance) - result.data.totalAmount;
        setProfile({
          ...profile,
          balance: nextBal
        });
        
        fetchProducts(); // Refresh catalog stock levels
        fetchOrderHistory(); // Refresh order history
        if (logEcosystemActivity) logEcosystemActivity('SHOPPING_CHECKOUT', 'Checkout berhasil, order ID: ' + (result?.data?.orderId || 'N/A'), result?.data?.totalAmount || 0, 'shop');
      } else {
        alert(result.error?.message || 'Proses checkout gagal.');
      }
    } catch (err) {
      alert('Gagal mengirimkan order ke backend.');
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Kopdes Shop</h2>
        <p style={{ color: 'var(--text-muted)' }}>Marketplace digital produk unggulan desa hasil bumi pertanian dan UMKM lokal.</p>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>}

      <div className="responsive-grid-sidebar">
        {/* Marketplace Goods Grid */}
        <div>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Memuat katalog produk...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '20px'
            }}>
              {products.map((product) => (
                <div key={product.id} className="glass-card" style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  <div style={{ position: 'relative', width: '100%', height: '140px', background: '#0e1423' }}>
                    <img src={product.image} alt={product.name} style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }} />
                    <span className="badge badge-blue" style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      fontSize: '0.65rem'
                    }}>{product.category}</span>
                    {profile?.status === 'Mitra Investor' && (
                      <span className="badge badge-purple" style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontSize: '0.65rem',
                        background: '#7c3aed'
                      }}>
                        {product.id === 'p1' || product.id === 'p2' ? 'Demand Tinggi 🔥' : 'Stabil 📈'}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{product.name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px', height: '36px', overflow: 'hidden' }}>
                        {product.description}
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / {product.unit}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: getAvailableStock(product) > 0 ? 'var(--text-muted)' : '#ef4444' }}>
                          Stok: {getAvailableStock(product)}
                        </span>
                      </div>

                      {profile?.status === 'Admin Koperasi' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-blue"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '6px', height: '30px' }}
                            onClick={() => handleUpdateStock(product.id, product.stock)}
                          >
                            ✏️ Edit Stok
                          </button>
                          <button
                            className="btn"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '6px', height: '30px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            ❌ Hapus
                          </button>
                        </div>
                      ) : profile?.status === 'Mitra Investor' ? (
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          color: '#fbbf24',
                          fontWeight: 600
                        }}>
                          Margin Bersih: {product.id === 'p2' ? '22%' : '15%'}
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}
                          onClick={() => addToCart(product)}
                          disabled={getAvailableStock(product) <= 0}
                        >
                          {getAvailableStock(product) > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping Cart Sidebar / Admin Form / Investor Info */}
        {profile?.status === 'Admin Koperasi' ? (
          <div className="glass-card" style={{ padding: '20px', position: 'sticky', top: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
              <span>📦 Otoritas Produk</span>
              <span className="badge badge-blue">Admin Power</span>
            </h3>

            {adminMsg && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--primary-green)',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.8rem',
                color: '#34d399',
                fontWeight: 600
              }}>{adminMsg}</div>
            )}

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nama Produk</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ height: '32px', fontSize: '0.8rem' }}
                  placeholder="Contoh: Pupuk Organik Cair"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kategori</label>
                <select
                  className="form-control"
                  style={{ height: '32px', fontSize: '0.8rem', background: '#0e1423' }}
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                >
                  <option value="Sembako">Sembako</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Bahan Kue">Bahan Kue</option>
                  <option value="Pertanian">Pertanian</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Harga (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ height: '32px', fontSize: '0.8rem' }}
                    placeholder="25000"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Satuan</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ height: '32px', fontSize: '0.8rem' }}
                    placeholder="Kg, Botol, Pcs"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stok Awal</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ height: '32px', fontSize: '0.8rem' }}
                  placeholder="100"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tautan Gambar (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ height: '32px', fontSize: '0.8rem' }}
                  placeholder="https://images.unsplash..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deskripsi Produk</label>
                <textarea
                  className="form-control"
                  style={{ fontSize: '0.8rem', padding: '6px' }}
                  placeholder="Keterangan singkat barang..."
                  rows="2"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-blue" style={{ width: '100%', fontWeight: 700, fontSize: '0.8rem', height: '34px', marginTop: '6px' }}>
                + Tambah ke Katalog
              </button>
            </form>
          </div>
        ) : profile?.status === 'Mitra Investor' ? (
          <div className="glass-card" style={{ padding: '20px', position: 'sticky', top: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
              <span>📊 Analisis Pasar Investor</span>
              <span className="badge badge-purple">Investor Info</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid #a78bfa' }}>
                <div style={{ fontWeight: 700, color: '#c084fc' }}>Produk Terlaris</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>Beras Premium Cianjur</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Total volume: 500 Kg terjual bulan ini.</div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid #34d399' }}>
                <div style={{ fontWeight: 700, color: '#34d399' }}>Margin Rata-Rata Koperasi</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>18.4%</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Efisiensi rantai pasok meminimalkan kerugian logistik.</div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid #60a5fa' }}>
                <div style={{ fontWeight: 700, color: '#60a5fa' }}>Rantai Pasok Logistik</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>Tujuan Medan: Pengiriman</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>TRK-2026-001 Kopi Arabika Gayo sedang dalam perjalanan.</div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Tertarik mendanai pengadaan dan peningkatan kapasitas produk tani desa?</p>
                <button
                  className="btn btn-green"
                  style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, padding: '10px', cursor: 'pointer' }}
                  onClick={() => navigateTo ? navigateTo('investor/crowdfunding') : null}
                >
                  🚀 Buka Proyek Crowdfunding →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '20px', position: 'sticky', top: '20px' }}>
            {/* Tabs Selector at the top of right column */}
            <div style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              padding: '2px',
              marginBottom: '16px'
            }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  background: activeRightTab === 'cart' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  color: activeRightTab === 'cart' ? 'var(--primary-green)' : 'var(--text-muted)',
                  fontWeight: activeRightTab === 'cart' ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: '0.2s'
                }}
                onClick={() => setActiveRightTab('cart')}
              >
                🛒 Keranjang ({cart.length})
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  background: activeRightTab === 'history' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  color: activeRightTab === 'history' ? 'var(--primary-green)' : 'var(--text-muted)',
                  fontWeight: activeRightTab === 'history' ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: '0.2s'
                }}
                onClick={() => {
                  setActiveRightTab('history');
                  fetchOrderHistory();
                }}
              >
                📜 Riwayat Belanja
              </button>
            </div>

            {/* 1. CARTS TAB */}
            {activeRightTab === 'cart' && (
              <>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Keranjang Belanja</span>
                  <span className="badge badge-purple">{cart.length} Item</span>
                </h3>

                {orderSuccess && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--primary-green)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '0.8rem',
                    color: '#34d399'
                  }}>
                    🎉 <strong>Pesanan Berhasil!</strong>
                    <div style={{ marginTop: '4px' }}>ID: {orderSuccess.orderId}</div>
                    <div>Metode: {orderSuccess.paymentMethod}</div>
                    <div>Total: Rp {orderSuccess.totalAmount.toLocaleString('id-ID')}</div>
                  </div>
                )}

                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Keranjang masih kosong.<br />Pilih produk di samping.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                      {cart.map((item) => (
                        <div key={item.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingBottom: '10px',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div style={{ flexGrow: 1, marginRight: '10px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Rp {item.price.toLocaleString('id-ID')}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={() => updateCartQty(item.id, item.quantity - 1)}
                            >-</button>
                            <span style={{ fontSize: '0.85rem', width: '16px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={() => updateCartQty(item.id, item.quantity + 1)}
                            >+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      marginTop: '10px',
                      paddingTop: '14px',
                      borderTop: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Bayar</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                          Rp {getCartTotal().toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div style={{
                        background: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px'
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>Metode Bayar</span>
                        <span style={{ fontWeight: 700, color: '#60a5fa' }}>📱 Kopdes Pay (E-Wallet)</span>
                      </div>

                      <button
                        className="btn btn-green"
                        style={{ width: '100%' }}
                        onClick={handleCheckout}
                      >
                        Bayar & Checkout
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. HISTORY TAB */}
            {activeRightTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Riwayat Belanja</span>
                  <span className="badge badge-purple">{orderHistory.length} Transaksi</span>
                </h3>

                {historyLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Memuat riwayat belanja...
                  </div>
                ) : orderHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '45px 0', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    Belum ada riwayat transaksi.<br />Silakan belanja produk di samping.
                  </div>
                ) : (
                  <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                    {orderHistory.map((order) => (
                      <div key={order.id} style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                          <span>📦 {order.orderId}</span>
                          <span style={{ color: '#34d399' }}>Lunas</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px' }}>
                          <span>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>{order.paymentMethod}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '6px', fontWeight: 700 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Total Belanja</span>
                          <span style={{ color: 'var(--primary-green)' }}>Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
