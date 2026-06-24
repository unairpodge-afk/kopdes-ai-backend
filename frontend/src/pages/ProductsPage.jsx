import React, { useState, useEffect } from 'react';

const ProductsPage = ({ apiBase, profile, logEcosystemActivity }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sembako');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);

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

  useEffect(() => {
    fetchProducts();
  }, [apiBase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      category,
      price: Number(price),
      unit,
      stock: Number(stock),
      description
    };

    try {
      let res;
      if (editId) {
        // Edit existing product
        res = await fetch(`${apiBase}/products/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new product
        res = await fetch(`${apiBase}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await res.json();
      if (result.success) {
        // Clear form
        setName('');
        setPrice('');
        setStock('');
        setDescription('');
        setEditId(null);
        // Refresh catalog
        fetchProducts();
        if (logEcosystemActivity) logEcosystemActivity('PRODUCT_MANAGEMENT_ACTION', editId ? 'Produk diperbarui: ' + name : 'Produk baru ditambahkan: ' + name, price, 'products');
      } else {
        setError(result.error?.message || 'Gagal menyimpan produk.');
      }
    } catch (err) {
      setError('Gagal menghubungi backend.');
    }
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setUnit(product.unit);
    setStock(product.stock);
    setDescription(product.description || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    setError('');

    try {
      const res = await fetch(`${apiBase}/products/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        fetchProducts();
        if (logEcosystemActivity) logEcosystemActivity('PRODUCT_MANAGEMENT_ACTION', 'Produk dihapus dari katalog', null, 'products');
      } else {
        setError(result.error?.message || 'Gagal menghapus produk.');
      }
    } catch (err) {
      setError('Gagal menghubungi backend.');
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Manajemen Produk</h2>
        <p style={{ color: 'var(--text-muted)' }}>Panel Administrasi Koperasi untuk memperbarui katalog produk, harga, dan ketersediaan stok.</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          color: '#fca5a5',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.85rem'
        }}>{error}</div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Side: Product Entry Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
            {editId ? 'Edit Detail Produk' : 'Tambah Produk Desa Baru'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama Produk</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Madu Hutan Liar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Kategori</label>
                <select
                  className="form-control"
                  style={{ background: '#0e1423' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Sembako">Sembako</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Bahan Kue">Bahan Kue</option>
                </select>
              </div>

              <div className="form-group">
                <label>Satuan Unit</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Kg, Botol, Pcs"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Harga (IDR)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Contoh: 15000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Jumlah Stok</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Contoh: 100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Deskripsi Produk</label>
              <textarea
                className="form-control"
                placeholder="Tulis deskripsi singkat produk..."
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-green" style={{ flexGrow: 1 }}>
                {editId ? 'Simpan Perubahan' : 'Publish Produk'}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditId(null);
                    setName('');
                    setPrice('');
                    setStock('');
                    setDescription('');
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Inventory List Table */}
        <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Daftar Inventaris</h3>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Memuat inventaris...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Produk</th>
                  <th style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Stok</th>
                  <th style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Harga</th>
                  <th style={{ padding: '10px 0', color: 'var(--text-muted)', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.category}</div>
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <span className={p.stock < 10 ? 'badge badge-purple' : 'badge badge-blue'} style={{ fontSize: '0.7rem' }}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', fontWeight: 600 }}>
                      Rp {p.price.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'right' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', marginRight: '10px', fontSize: '0.8rem', fontWeight: 600 }}
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        onClick={() => handleDelete(p.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
