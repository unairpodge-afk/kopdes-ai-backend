import React, { useState, useEffect, useRef } from 'react';

// ─── DUMMY DATA ────────────────────────────────────────────────────────────────

const KOPERASI_LIST = [
  {
    id: 'kop-001',
    name: 'KopDes Sumber Makmur',
    desa: 'Ds. Sumber Makmur',
    kecamatan: 'Kec. Wlingi',
    kabupaten: 'Kab. Blitar',
    distance: 1.2,
    rating: 4.8,
    totalProduk: 34,
    badge: 'Terpercaya',
    badgeColor: '#10b981',
    avatar: '🌾',
    verified: true,
    joined: '2023',
  },
  {
    id: 'kop-002',
    name: 'KUD Tani Sejahtera',
    desa: 'Ds. Talun',
    kecamatan: 'Kec. Talun',
    kabupaten: 'Kab. Blitar',
    distance: 2.7,
    rating: 4.6,
    totalProduk: 21,
    badge: 'Aktif',
    badgeColor: '#3b82f6',
    avatar: '🐄',
    verified: true,
    joined: '2022',
  },
  {
    id: 'kop-003',
    name: 'KopDes Harapan Baru',
    desa: 'Ds. Panggungrejo',
    kecamatan: 'Kec. Panggungrejo',
    kabupaten: 'Kab. Blitar',
    distance: 4.1,
    rating: 4.4,
    totalProduk: 18,
    badge: 'Baru',
    badgeColor: '#f59e0b',
    avatar: '🥬',
    verified: false,
    joined: '2024',
  },
  {
    id: 'kop-004',
    name: 'KopDes Mekar Jaya',
    desa: 'Ds. Kesamben',
    kecamatan: 'Kec. Kesamben',
    kabupaten: 'Kab. Blitar',
    distance: 6.3,
    rating: 4.7,
    totalProduk: 27,
    badge: 'Terpercaya',
    badgeColor: '#10b981',
    avatar: '🌿',
    verified: true,
    joined: '2022',
  },
  {
    id: 'kop-005',
    name: 'KopDes Maju Bersama',
    desa: 'Ds. Gandusari',
    kecamatan: 'Kec. Gandusari',
    kabupaten: 'Kab. Blitar',
    distance: 8.5,
    rating: 4.5,
    totalProduk: 15,
    badge: 'Aktif',
    badgeColor: '#3b82f6',
    avatar: '🌽',
    verified: true,
    joined: '2023',
  },
];

const INITIAL_PRODUCTS = [
  // KopDes Sumber Makmur
  { id: 'p01', kopId: 'kop-001', name: 'Beras Premium Merah', category: 'Pangan', price: 18500, unit: 'kg', stock: 120, sold: 312, rating: 4.9, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', desc: 'Beras merah organik varietas lokal kaya serat & antioksidan', isFlashSale: true, originalPrice: 22000, discount: 16 },
  { id: 'p02', kopId: 'kop-001', name: 'Kopi Robusta Blitar', category: 'Minuman', price: 45000, unit: '250g', stock: 80, sold: 198, rating: 4.8, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80', desc: 'Kopi robusta single-origin petik merah, proses natural', isFlashSale: false, discount: 0 },
  { id: 'p03', kopId: 'kop-001', name: 'Gula Aren Cair', category: 'Bumbu', price: 28000, unit: '500ml', stock: 55, sold: 89, rating: 4.7, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', desc: 'Gula aren murni tanpa tambahan dari pohon aren hutan', isFlashSale: false, discount: 0 },
  { id: 'p04', kopId: 'kop-001', name: 'Tempe Kedelai Lokal', category: 'Pangan', price: 6500, unit: 'papan', stock: 200, sold: 543, rating: 4.6, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', desc: 'Tempe segar dari kedelai lokal non-GMO, pengrajin tradisional', isFlashSale: true, originalPrice: 8000, discount: 19 },

  // KUD Tani Sejahtera
  { id: 'p05', kopId: 'kop-002', name: 'Susu Sapi Segar', category: 'Minuman', price: 12000, unit: 'liter', stock: 60, sold: 267, rating: 4.9, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', desc: 'Susu murni segar dari peternakan sapi perah Talun', isFlashSale: true, originalPrice: 15000, discount: 20 },
  { id: 'p06', kopId: 'kop-002', name: 'Keju Mozarella Desa', category: 'Pangan', price: 65000, unit: '250g', stock: 30, sold: 76, rating: 4.7, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80', desc: 'Mozarella artisan dari susu sapi segar berkualitas tinggi', isFlashSale: false, discount: 0 },
  { id: 'p07', kopId: 'kop-002', name: 'Yoghurt Plain Organik', category: 'Minuman', price: 22000, unit: '250ml', stock: 45, sold: 121, rating: 4.8, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', desc: 'Yoghurt probiotik alami tanpa pengawet & pewarna buatan', isFlashSale: false, discount: 0 },

  // KopDes Harapan Baru
  { id: 'p08', kopId: 'kop-003', name: 'Sayur Kangkung Organik', category: 'Sayuran', price: 5000, unit: 'ikat', stock: 150, sold: 432, rating: 4.5, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', desc: 'Kangkung segar panen pagi, bebas pestisida', isFlashSale: false, discount: 0 },
  { id: 'p09', kopId: 'kop-003', name: 'Cabe Rawit Merah', category: 'Bumbu', price: 35000, unit: 'kg', stock: 40, sold: 156, rating: 4.4, image: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&q=80', desc: 'Cabai rawit merah segar panenan hari ini, pedas alami', isFlashSale: true, originalPrice: 45000, discount: 22 },
  { id: 'p10', kopId: 'kop-003', name: 'Tomat Cherry Lokal', category: 'Sayuran', price: 18000, unit: '500g', stock: 70, sold: 93, rating: 4.6, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', desc: 'Tomat cherry manis dipetik matang dari kebun lereng gunung', isFlashSale: false, discount: 0 },

  // KopDes Mekar Jaya
  { id: 'p11', kopId: 'kop-004', name: 'Jahe Merah Kering', category: 'Herbal', price: 42000, unit: '500g', stock: 90, sold: 234, rating: 4.9, image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80', desc: 'Jahe merah simplisia kering tinggi gingerol, kualitas ekspor', isFlashSale: false, discount: 0 },
  { id: 'p12', kopId: 'kop-004', name: 'Empon-Empon Jamu', category: 'Herbal', price: 32000, unit: 'paket', stock: 65, sold: 187, rating: 4.8, image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=400&q=80', desc: 'Racikan empon-empon jamu tradisional: kunyit, temulawak, kencur', isFlashSale: true, originalPrice: 40000, discount: 20 },
  { id: 'p13', kopId: 'kop-004', name: 'Minyak Kelapa VCO', category: 'Herbal', price: 75000, unit: '250ml', stock: 35, sold: 112, rating: 4.7, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80', desc: 'Virgin Coconut Oil cold-pressed, kemurnian 100% dari kelapa tua', isFlashSale: false, discount: 0 },

  // KopDes Maju Bersama
  { id: 'p14', kopId: 'kop-005', name: 'Jagung Manis Bakar', category: 'Pangan', price: 8000, unit: 'buah', stock: 200, sold: 389, rating: 4.6, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80', desc: 'Jagung manis varietas super sweet siap bakar/rebus', isFlashSale: false, discount: 0 },
  { id: 'p15', kopId: 'kop-005', name: 'Ubi Cilembu Madu', category: 'Pangan', price: 24000, unit: 'kg', stock: 80, sold: 276, rating: 4.8, image: 'https://images.unsplash.com/photo-1596097635121-14b38c5d7f80?w=400&q=80', desc: 'Ubi cilembu terkenal dengan rasa manis madu alami', isFlashSale: true, originalPrice: 30000, discount: 20 },
  { id: 'p16', kopId: 'kop-005', name: 'Pisang Kepok Organik', category: 'Buah', price: 15000, unit: 'sisir', stock: 100, sold: 445, rating: 4.7, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', desc: 'Pisang kepok matang pohon, cocok untuk olahan & langsung makan', isFlashSale: false, discount: 0 },
];

const CATEGORIES = ['Semua', 'Pangan', 'Sayuran', 'Buah', 'Minuman', 'Bumbu', 'Herbal'];

const BANNERS = [
  { id: 1, bg: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)', emoji: '🌾', title: 'Flash Sale Pangan Desa', subtitle: 'Diskon hingga 22% – Hari ini saja!', badge: 'Flash Sale' },
  { id: 2, bg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)', emoji: '🥛', title: 'Susu & Produk Peternakan', subtitle: 'Segar langsung dari peternak lokal', badge: 'Pilihan Segar' },
  { id: 3, bg: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a78bfa 100%)', emoji: '🌿', title: 'Herbal & Jamu Tradisional', subtitle: 'Racikan nenek moyang, kualitas modern', badge: 'Herbal Pilihan' },
];

const SORT_OPTIONS = ['Terdekat', 'Rating Tertinggi', 'Harga Terendah', 'Terlaris'];

const AVAILABLE_VOUCHERS = [
  { code: 'KOPDESDEAL', discount: 10, desc: 'Diskon 10% untuk semua produk' },
  { code: 'PANENRAYA', discount: 15, desc: 'Diskon 15% khusus hari raya tani' },
  { code: 'DISKONUMKM', discount: 5, desc: 'Diskon 5% dukung produk lokal' }
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const ShopPage = ({ apiBase, profile, setProfile, logEcosystemActivity, navigateTo }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeSort, setActiveSort] = useState('Terdekat');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKop, setSelectedKop] = useState(null); // null = all stores
  const [bannerIdx, setBannerIdx] = useState(0);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [userLocation, setUserLocation] = useState('Blitar, Jawa Timur'); // default
  const [activeRightTab, setActiveRightTab] = useState('cart');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [flashSaleOnly, setFlashSaleOnly] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const bannerTimer = useRef(null);

  // Shopee-like Overhaul State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [detailModalTab, setDetailModalTab] = useState('desc'); // 'desc' | 'reviews'
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const [trackingOrder, setTrackingOrder] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null);

  // Flash Sale Countdown State
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 14, seconds: 45 });

  // Range Harga Filter State
  const [priceRange, setPriceRange] = useState(100000); // max price filter

  // Filter Rating
  const [ratingFilter, setRatingFilter] = useState(0); // 0 = all

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 3, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch reviews when product selected
  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct.id);
      setDetailModalTab('desc');
    }
  }, [selectedProduct]);

  const fetchReviews = async (productId) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${apiBase}/shop/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setProductReviews(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const submitReview = async (e, productId) => {
    e.preventDefault();
    if (!profile) {
      showToast('Silakan login untuk memberikan ulasan', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${apiBase}/shop/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          memberId: profile.id,
          memberName: profile.name,
          rating: newRating,
          comment: newComment
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('🎉 Terima kasih! Ulasan berhasil dikirim.');
        setNewComment('');
        setNewRating(5);
        fetchReviews(productId);

        // Update local rating of the product to make it responsive
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            const currentTotal = p.sold || 10;
            const newRatingAvg = Number(((p.rating * currentTotal + newRating) / (currentTotal + 1)).toFixed(1));
            return { ...p, rating: newRatingAvg, sold: currentTotal + 1 };
          }
          return p;
        }));
      } else {
        showToast(data.message || 'Gagal mengirim ulasan', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // ─── CART SYNC WITH BACKEND (Supabase) ──────────────────────────────────────

  // Fetch cart from backend when profile is available
  useEffect(() => {
    if (profile?.id) {
      fetchCartFromBackend();
      fetchOrderHistoryFromBackend();
    }
  }, [profile?.id]);

  const fetchCartFromBackend = async () => {
    try {
      const res = await fetch(`${apiBase}/shop/cart?memberId=${encodeURIComponent(profile.id)}`);
      const data = await res.json();
      if (data.success && data.data) {
        // Transform backend data to frontend format
        const backendCart = data.data.map(item => ({
          id: item.product_id,
          name: item.products?.name || 'Produk',
          price: Number(item.products?.price || 0),
          unit: item.products?.unit || 'unit',
          stock: item.products?.stock || 0,
          image: item.products?.image || '',
          qty: item.quantity,
          kopId: item.products?.kop_id || 'kop-001',
          category: item.products?.category || 'Pangan',
          desc: item.products?.description || '',
          isFlashSale: item.products?.is_flash_sale || false,
          originalPrice: item.products?.original_price || item.products?.price,
          discount: item.products?.discount || 0
        }));
        setCart(backendCart);
      }
    } catch (err) {
      console.error('Gagal mengambil data keranjang dari server:', err);
    }
  };

  const fetchOrderHistoryFromBackend = async () => {
    try {
      const res = await fetch(`${apiBase}/shop/orders?memberId=${encodeURIComponent(profile.id)}`);
      const data = await res.json();
      if (data.success && data.data) {
        // Transform backend orders to frontend format
        const backendOrders = data.data.map(order => ({
          orderId: order.orderId || order.id,
          total: order.totalAmount || order.total_amount || 0,
          subtotal: order.totalAmount || order.total_amount || 0,
          discount: 0,
          voucherCode: null,
          items: [],
          date: order.createdAt || order.created_at || new Date(),
          status: order.status === 'Paid' ? 'Selesai' : order.status || 'Proses',
          trackingHistory: [
            { status: 'Dibuat', note: 'Pesanan berhasil dibuat', time: order.createdAt || order.created_at || new Date().toISOString() },
            { status: 'Proses', note: 'Penjual sedang menyiapkan barang', time: order.createdAt || order.created_at || new Date().toISOString() }
          ]
        }));
        setOrderHistory(backendOrders);
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat pesanan dari server:', err);
    }
  };

  const syncCartToBackend = async (product, quantity, action = 'add') => {
    try {
      if (action === 'remove') {
        await fetch(`${apiBase}/shop/cart?memberId=${encodeURIComponent(profile.id)}&productId=${encodeURIComponent(product.id)}`, {
          method: 'DELETE'
        });
      } else {
        await fetch(`${apiBase}/shop/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: profile.id,
            productId: product.id,
            quantity: quantity
          })
        });
      }
    } catch (err) {
      console.error('Gagal sync keranjang ke server:', err);
    }
  };

  // Banner auto-scroll
  useEffect(() => {
    bannerTimer.current = setInterval(() => {
      setBannerIdx(i => (i + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(bannerTimer.current);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const detectLocation = () => {
    setLocationDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setTimeout(() => {
            setUserLocation('Blitar, Jawa Timur (GPS)');
            setLocationDetecting(false);
            showToast('📍 Lokasi berhasil dideteksi!');
          }, 1200);
        },
        () => {
          setLocationDetecting(false);
          showToast('Gagal deteksi lokasi, pakai lokasi default', 'error');
        }
      );
    } else {
      setLocationDetecting(false);
    }
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const addToCart = (product) => {
    if (!profile) {
      showToast('Silakan login terlebih dahulu', 'error');
      return;
    }

    // Sync to backend first
    syncCartToBackend(product, 1, 'add');

    // Update local state
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) { showToast('Stok tidak cukup', 'error'); return prev; }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`🛒 ${product.name} ditambahkan!`);
    if (logEcosystemActivity) logEcosystemActivity('SHOP_ADD_CART', 'Tambah: ' + product.name);
  };

  const updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        // Remove from cart
        syncCartToBackend(item, 0, 'remove');
      } else {
        // Update quantity
        syncCartToBackend(item, newQty, 'add');
      }
    }
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  };

  const applyVoucher = () => {
    const code = voucherCode.toUpperCase().trim();
    const found = AVAILABLE_VOUCHERS.find(v => v.code === code);
    if (found) {
      setAppliedVoucher(found);
      showToast(`🎫 Voucher ${found.code} berhasil dipasang!`);
      setVoucherCode('');
    } else {
      showToast('Kode voucher tidak ditemukan', 'error');
    }
  };

  const getSubtotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

  const getCartTotal = () => {
    const subtotal = getSubtotal();
    if (appliedVoucher) {
      return subtotal * (1 - appliedVoucher.discount / 100);
    }
    return subtotal;
  };

  const getCartCount = () => cart.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = async () => {
    if (!profile || cart.length === 0) return;
    const subtotal = getSubtotal();
    const total = getCartTotal();
    const discountVal = subtotal - total;

    if (Number(profile.balance || 0) < total) {
      showToast('Saldo Kopdes Pay tidak cukup!', 'error');
      return;
    }

    // Sync checkout to backend (Supabase) - cart tersimpan permanen
    try {
      const res = await fetch(`${apiBase}/shop/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.id,
          paymentMethod: 'KOPDES_PAY'
        })
      });
      const checkoutData = await res.json();
      if (!checkoutData.success) {
        showToast(checkoutData.message || 'Checkout gagal', 'error');
        return;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }

    const orderId = 'ORD-' + Date.now().toString().slice(-8);
    const newOrder = {
      orderId,
      total,
      subtotal,
      discount: discountVal,
      voucherCode: appliedVoucher?.code || null,
      items: [...cart],
      date: new Date(),
      status: 'Proses', // 'Proses' | 'Kirim' | 'Selesai'
      trackingHistory: [
        { status: 'Dibuat', note: 'Pesanan berhasil dibuat & dibayar via Kopdes Pay', time: new Date().toISOString() },
        { status: 'Proses', note: 'Penjual Koperasi sedang menyiapkan barang Anda', time: new Date().toISOString() }
      ]
    };

    setOrderSuccess(newOrder);
    setOrderHistory(prev => [newOrder, ...prev]);
    setProfile(prev => ({ ...prev, balance: Number(prev.balance) - total }));
    setCart([]);
    setAppliedVoucher(null);
    showToast('🎉 Pembayaran sukses! Pesanan diproses.');
    if (logEcosystemActivity) logEcosystemActivity('SHOPPING_CHECKOUT', 'Checkout: ' + orderId, total);
  };

  const confirmDeliveryReceived = (orderId) => {
    setOrderHistory(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return {
          ...o,
          status: 'Selesai',
          trackingHistory: [
            ...o.trackingHistory,
            { status: 'Selesai', note: 'Paket telah diterima dengan baik oleh anggota koperasi', time: new Date().toISOString() }
          ]
        };
      }
      return o;
    }));
    showToast('📦 Pesanan diselesaikan! Silakan berikan ulasan Anda.');
  };

  const simulateShipping = (orderId) => {
    setOrderHistory(prev => prev.map(o => {
      if (o.orderId === orderId && o.status === 'Proses') {
        return {
          ...o,
          status: 'Kirim',
          trackingHistory: [
            ...o.trackingHistory,
            { status: 'Kirim', note: 'Paket diserahkan ke Kurir Desa dan sedang dikirim', time: new Date().toISOString() }
          ]
        };
      }
      return o;
    }));
    showToast('🚚 Simulasi: Kurir desa mulai mengirim barang!');
  };

  // Filter & Sort products
  const getKopById = (id) => KOPERASI_LIST.find(k => k.id === id);

  const filteredProducts = products
    .filter(p => selectedKop ? p.kopId === selectedKop : true)
    .filter(p => activeCategory === 'Semua' || p.category === activeCategory)
    .filter(p => flashSaleOnly ? p.isFlashSale : true)
    .filter(p => p.price <= priceRange)
    .filter(p => ratingFilter === 0 || p.rating >= ratingFilter)
    .filter(p => searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (activeSort === 'Harga Terendah') return a.price - b.price;
      if (activeSort === 'Rating Tertinggi') return b.rating - a.rating;
      if (activeSort === 'Terlaris') return b.sold - a.sold;
      if (activeSort === 'Terdekat') return (getKopById(a.kopId)?.distance || 99) - (getKopById(b.kopId)?.distance || 99);
      return 0;
    });

  const sortedKoperasi = [...KOPERASI_LIST].sort((a, b) => {
    if (activeSort === 'Rating Tertinggi') return b.rating - a.rating;
    return a.distance - b.distance;
  });

  const banner = BANNERS[bannerIdx];

  return (
    <div className="animate-fade" style={{ maxWidth: '1280px', margin: '0 auto', color: 'white', fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Toast ─── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
          color: 'white', padding: '12px 20px', borderRadius: '12px',
          fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'fadeInDown 0.3s ease', backdropFilter: 'blur(12px)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🛒 <span style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kopdes Marketplace</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belanja produk UMKM & hasil tani langsung dari koperasi terdekat Anda</p>
          </div>
          {/* Location badge */}
          <button
            onClick={detectLocation}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399', padding: '8px 16px', borderRadius: '20px',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span>{locationDetecting ? '⏳' : '📍'}</span>
            <span>{locationDetecting ? 'Mendeteksi...' : userLocation}</span>
          </button>
        </div>
      </div>

      {/* ─── Main Layout ─── */}
      <div className="shop-grid">

        {/* ─── LEFT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

          {/* Search bar & Filter Panel */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', opacity: 0.5 }}>🔍</span>
              <input
                type="text"
                placeholder="Cari produk dari koperasi terdekat..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '12px 14px 12px 40px',
                  color: 'white', fontSize: '0.9rem', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Promo Banner Carousel */}
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '140px' }}>
            <div style={{
              background: banner.bg, height: '100%',
              display: 'flex', alignItems: 'center', padding: '0 32px',
              gap: '24px', transition: 'background 0.5s ease'
            }}>
              <div style={{ fontSize: '4.5rem' }}>{banner.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '6px', color: 'white' }}>
                  {banner.badge}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>{banner.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{banner.subtitle}</div>
              </div>

              {/* Flash Sale countdown badge */}
              {banner.badge === 'Flash Sale' && (
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '12px', textAlign: 'center', minWidth: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#ff8a8a', fontWeight: 800, marginBottom: '4px' }}>Sisa Waktu</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 800, display: 'flex', justifyContent: 'center', gap: '3px' }}>
                    <span style={{ background: '#ef4444', padding: '2px 4px', borderRadius: '4px' }}>{String(countdown.hours).padStart(2, '0')}</span>:
                    <span style={{ background: '#ef4444', padding: '2px 4px', borderRadius: '4px' }}>{String(countdown.minutes).padStart(2, '0')}</span>:
                    <span style={{ background: '#ef4444', padding: '2px 4px', borderRadius: '4px' }}>{String(countdown.seconds).padStart(2, '0')}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Dots */}
            <div style={{ position: 'absolute', bottom: '10px', right: '16px', display: 'flex', gap: '6px' }}>
              {BANNERS.map((_, i) => (
                <div key={i} onClick={() => setBannerIdx(i)} style={{
                  width: i === bannerIdx ? '20px' : '6px', height: '6px',
                  borderRadius: '3px', background: i === bannerIdx ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s', cursor: 'pointer'
                }} />
              ))}
            </div>
          </div>

          {/* ─── Koperasi Terdekat ─── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏪 <span>Koperasi Terdekat</span>
                <span style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {KOPERASI_LIST.length} toko
                </span>
              </h3>
              {selectedKop && (
                <button onClick={() => setSelectedKop(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Semua Koperasi ✕
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {sortedKoperasi.map(kop => (
                <div
                  key={kop.id}
                  onClick={() => setSelectedKop(selectedKop === kop.id ? null : kop.id)}
                  style={{
                    minWidth: '180px', background: selectedKop === kop.id
                      ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                    border: selectedKop === kop.id
                      ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px', padding: '14px', cursor: 'pointer',
                    transition: 'all 0.2s', flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      {kop.avatar}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kop.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{kop.kecamatan}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: kop.badgeColor + '22', color: kop.badgeColor, padding: '2px 7px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700 }}>
                      {kop.badge}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📍 {kop.distance} km</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>⭐ {kop.rating}</span>
                    <span>{kop.totalProduk} produk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Filter & Advance Filter Bar ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              {/* Categories */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                    background: activeCategory === cat ? 'var(--primary-green)' : 'rgba(255,255,255,0.05)',
                    color: activeCategory === cat ? 'black' : 'var(--text-muted)'
                  }}>
                    {cat}
                  </button>
                ))}
              </div>
              
              {/* Sort */}
              <select
                value={activeSort}
                onChange={e => setActiveSort(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.78rem',
                  cursor: 'pointer', outline: 'none'
                }}
              >
                {SORT_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#0d1324' }}>{s}</option>)}
              </select>
            </div>

            {/* Slider Price Range & Star Rating Filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Batas Harga Maks:</span>
                  <strong style={{ color: 'var(--primary-green)' }}>Rp {priceRange.toLocaleString('id-ID')}</strong>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary-green)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rating Minimal:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 4, 4.5, 4.8].map(star => (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(star)}
                      style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                        border: 'none', cursor: 'pointer',
                        background: ratingFilter === star ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                        color: ratingFilter === star ? '#f59e0b' : 'var(--text-muted)',
                        border: ratingFilter === star ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent'
                      }}
                    >
                      {star === 0 ? 'Semua ⭐' : `⭐ ${star}+`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFlashSaleOnly(v => !v)}
                style={{
                  padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s', marginLeft: 'auto',
                  background: flashSaleOnly ? '#ef4444' : 'rgba(255,255,255,0.05)',
                  color: flashSaleOnly ? 'white' : 'var(--text-muted)'
                }}
              >
                ⚡ Flash Sale Saja
              </button>
            </div>
          </div>

          {/* ─── Selected Store Indicator ─── */}
          {selectedKop && (
            <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(() => { const k = getKopById(selectedKop); return (
                <>
                  <span style={{ fontSize: '1.5rem' }}>{k.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#34d399', cursor: 'pointer' }} onClick={() => setSelectedStore(k)}>{k.name} (Lihat Toko ↗)</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{k.desa}, {k.kecamatan} · {k.distance} km · ⭐ {k.rating}</div>
                  </div>
                  {k.verified && <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>✓ Terverifikasi</span>}
                </>
              ); })()}
            </div>
          )}

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
            Menampilkan <strong style={{ color: 'white' }}>{filteredProducts.length}</strong> produk
            {selectedKop && <> dari <strong style={{ color: '#34d399' }}>{getKopById(selectedKop)?.name}</strong></>}
          </div>

          {/* ─── Products Grid ─── */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontWeight: 600 }}>Tidak ada produk ditemukan</div>
              <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>Coba ubah filter atau kata kunci pencarian</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '14px' }}>
              {filteredProducts.map(product => {
                const kop = getKopById(product.kopId);
                const inCart = cart.find(i => i.id === product.id);
                const inWishlist = wishlist.includes(product.id);
                return (
                  <div key={product.id} 
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                      transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: '148px', background: '#0a0f1e', overflow: 'hidden' }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                        onMouseLeave={e => e.target.style.transform = ''}
                      />
                      {/* Badges */}
                      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {product.isFlashSale && (
                          <span style={{ background: '#ef4444', color: 'white', padding: '2px 7px', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 800 }}>
                            ⚡ -{product.discount}%
                          </span>
                        )}
                        <span style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 7px', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                          {product.category}
                        </span>
                      </div>
                      {/* Wishlist */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem', backdropFilter: 'blur(4px)', color: 'white' }}
                      >
                        {inWishlist ? '❤️' : '🤍'}
                      </button>
                      {product.stock <= 10 && product.stock > 0 && (
                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(245,158,11,0.85)', color: 'white', fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', padding: '3px' }}>
                          Sisa {product.stock} lagi!
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3, color: 'white' }}>{product.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4, flexGrow: 1 }}>{product.desc}</div>

                      {/* Store info */}
                      <div 
                        onClick={e => { e.stopPropagation(); setSelectedStore(kop); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: '0.75rem' }}>{kop?.avatar}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kop?.name}</span>
                        <span style={{ fontSize: '0.65rem', color: '#34d399', flexShrink: 0 }}>📍{kop?.distance}km</span>
                      </div>

                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: product.isFlashSale ? '#ef4444' : 'var(--primary-green)' }}>
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        {product.isFlashSale && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            Rp {product.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/{product.unit}</span>
                      </div>

                      {/* Rating & sold */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        <span>⭐ {product.rating} · {product.sold} terjual</span>
                        <span style={{ color: product.stock > 0 ? 'var(--text-muted)' : '#ef4444' }}>
                          Stok: {product.stock}
                        </span>
                      </div>

                      {/* Cart button */}
                      {inCart ? (
                        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '4px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.3)' }}>
                          <button onClick={() => updateQty(product.id, -1)} style={{ flex: 1, background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', padding: '5px' }}>−</button>
                          <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{inCart.qty}</span>
                          <button onClick={() => updateQty(product.id, 1)} style={{ flex: 1, background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', padding: '5px' }}>+</button>
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); addToCart(product); }}
                          disabled={product.stock <= 0}
                          style={{
                            width: '100%', padding: '7px', borderRadius: '8px', border: 'none',
                            marginTop: '4px', fontSize: '0.78rem', fontWeight: 700, cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                            background: product.stock > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                            color: product.stock > 0 ? 'white' : 'var(--text-muted)',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={e => product.stock > 0 && (e.target.style.opacity = '0.85')}
                          onMouseLeave={e => (e.target.style.opacity = '1')}
                        >
                          {product.stock > 0 ? '+ Keranjang' : 'Stok Habis'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN: Cart + History ─── */}
        <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Koperasi Aktif', value: KOPERASI_LIST.length, icon: '🏪', color: '#10b981' },
              { label: 'Total Produk', value: products.length, icon: '📦', color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Cart Panel */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Tab switcher */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px' }}>
              {[['cart', `🛒 Keranjang (${getCartCount()})`], ['history', `📜 Riwayat (${orderHistory.length})`]].map(([tab, label]) => (
                <button key={tab} onClick={() => { setActiveRightTab(tab); setOrderSuccess(null); }} style={{
                  flex: 1, padding: '8px 6px', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeRightTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeRightTab === tab ? 'var(--primary-green)' : 'var(--text-muted)'
                }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: '16px' }}>
              {/* CART TAB */}
              {activeRightTab === 'cart' && (
                <>
                  {orderSuccess && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '14px', fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>🎉 Pesanan Berhasil!</div>
                      <div style={{ color: 'var(--text-muted)' }}>ID: {orderSuccess.orderId}</div>
                      <div style={{ color: 'var(--text-muted)' }}>Total: Rp {orderSuccess.total.toLocaleString('id-ID')}</div>
                    </div>
                  )}

                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛒</div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>Keranjang kosong</div>
                      <div style={{ fontSize: '0.75rem' }}>Pilih produk dari toko koperasi terdekat</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', marginBottom: '14px' }}>
                        {cart.map(item => (
                          <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--primary-green)', fontWeight: 700 }}>Rp {(item.price * item.qty).toLocaleString('id-ID')}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button onClick={() => updateQty(item.id, -1)} style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>−</button>
                              <span style={{ width: '16px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700 }}>{item.qty}</span>
                              <button onClick={() => updateQty(item.id, 1)} style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Voucher Section */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Kupon Belanja Desa</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="Kode Voucher (Contoh: PANENRAYA)"
                            value={voucherCode}
                            onChange={e => setVoucherCode(e.target.value)}
                            style={{
                              flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '0.75rem', outline: 'none'
                            }}
                          />
                          <button
                            onClick={applyVoucher}
                            style={{ background: 'var(--primary-green)', color: 'black', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Pakai
                          </button>
                        </div>
                        {appliedVoucher && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '6px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>🎫 {appliedVoucher.code} (-{appliedVoucher.discount}%)</span>
                            <button onClick={() => setAppliedVoucher(null)} style={{ background: 'none', border: 'none', color: '#ff8a8a', cursor: 'pointer', fontSize: '0.72rem' }}>Hapus</button>
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '14px' }}>
                        {appliedVoucher && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                            <span style={{ color: 'white' }}>Rp {getSubtotal().toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {appliedVoucher && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Potongan Voucher</span>
                            <span style={{ color: '#ef4444' }}>-Rp {(getSubtotal() - getCartTotal()).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total ({getCartCount()} item)</span>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-green)' }}>Rp {getCartTotal().toLocaleString('id-ID')}</span>
                        </div>
                        <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Metode Bayar</span>
                          <span style={{ fontWeight: 700, color: '#60a5fa' }}>📱 Kopdes Pay</span>
                        </div>
                        {profile && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'right' }}>
                            Saldo: <strong style={{ color: '#34d399' }}>Rp {Number(profile.balance || 0).toLocaleString('id-ID')}</strong>
                          </div>
                        )}
                        <button
                          onClick={handleCheckout}
                          style={{
                            width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.opacity = '0.88'}
                          onMouseLeave={e => e.target.style.opacity = '1'}
                        >
                          Bayar & Checkout →
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* HISTORY TAB */}
              {activeRightTab === 'history' && (
                orderHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📜</div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>Belum ada transaksi</div>
                    <div style={{ fontSize: '0.75rem' }}>Selesaikan checkout untuk melihat riwayat</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto' }}>
                    {orderHistory.map(order => (
                      <div key={order.orderId} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700 }}>📦 {order.orderId}</span>
                          <span style={{
                            color: order.status === 'Selesai' ? '#34d399' : order.status === 'Kirim' ? '#60a5fa' : '#f59e0b',
                            fontWeight: 700
                          }}>
                            {order.status}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>
                          {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '6px' }}>
                          {order.items.length} produk dari {[...new Set(order.items.map(i => getKopById(i.kopId)?.name))].join(', ')}
                        </div>

                        {/* Subtotal, discount & total */}
                        {order.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0' }}>
                            <span>Subtotal:</span>
                            <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#ff8a8a', margin: '2px 0' }}>
                            <span>Kupon ({order.voucherCode}):</span>
                            <span>-Rp {order.discount.toLocaleString('id-ID')}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.08)', fontWeight: 700 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Total Belanja</span>
                          <span style={{ color: 'var(--primary-green)' }}>Rp {order.total.toLocaleString('id-ID')}</span>
                        </div>

                        {/* Interactive Timeline & Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                          <button
                            onClick={() => setTrackingOrder(order)}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            🚚 Lacak
                          </button>

                          {order.status === 'Proses' && (
                            <button
                              onClick={() => simulateShipping(order.orderId)}
                              style={{ flex: 1, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#93c5fd', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                            >
                              ⚡ Kirim (Simulasi)
                            </button>
                          )}

                          {order.status === 'Kirim' && (
                            <button
                              onClick={() => confirmDeliveryReceived(order.orderId)}
                              style={{ flex: 1, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ✓ Terima Barang
                            </button>
                          )}

                          {order.status === 'Selesai' && (
                            <button
                              onClick={() => setReviewingOrder(order)}
                              style={{ flex: 1, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ⭐ Beri Ulasan
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Wishlist count pill */}
          {wishlist.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#f87171' }}>❤️ Wishlist kamu ({wishlist.length} produk)</span>
              <button onClick={() => setWishlist([])} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>Hapus semua</button>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL 1: PRODUCT DETAIL MODAL (Shopee-like Overlay) ─── */}
      {selectedProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '20px',
          backdropFilter: 'blur(10px)'
        }}
          onClick={() => setSelectedProduct(null)}
        >
          <div style={{
            background: '#0d1324', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', maxWidth: '850px', width: '100%',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)', maxHeight: '90vh',
            animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', overflowY: 'auto', flex: 1 }}>
              {/* Product Gallery & Store info */}
              <div style={{ background: '#070a14', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {selectedProduct.isFlashSale && (
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      ⚡ FLASH SALE -{selectedProduct.discount}%
                    </span>
                  )}
                </div>

                {/* Seller Store Info */}
                {(() => {
                  const s = getKopById(selectedProduct.kopId);
                  return (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '1.8rem' }}>{s?.avatar}</div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{s?.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s?.desa}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>⭐ {s?.rating} / 5</span>
                        <span>Joined: {s?.joined}</span>
                      </div>
                      <button
                        onClick={() => { setSelectedStore(s); setSelectedProduct(null); }}
                        style={{ width: '100%', background: 'none', border: '1px solid var(--primary-green)', color: '#34d399', fontSize: '0.75rem', fontWeight: 600, padding: '6px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
                      >
                        Kunjungi Toko Koperasi →
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Product Info & Tabs */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Header info */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', right: -10, top: -10, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
                  <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {selectedProduct.category}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px', marginBottom: '4px', color: 'white' }}>{selectedProduct.name}</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {selectedProduct.rating}</span>
                    <span>|</span>
                    <span>{selectedProduct.sold} Terjual</span>
                    <span>|</span>
                    <span style={{ color: selectedProduct.stock > 0 ? '#34d399' : '#ff8a8a' }}>Stok: {selectedProduct.stock}</span>
                  </div>
                </div>

                {/* Price tag */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedProduct.isFlashSale ? '#ef4444' : 'var(--primary-green)' }}>
                    Rp {selectedProduct.price.toLocaleString('id-ID')}
                  </span>
                  {selectedProduct.isFlashSale && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      Rp {selectedProduct.originalPrice.toLocaleString('id-ID')}
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{selectedProduct.unit}</span>
                </div>

                {/* Tab selector */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '14px' }}>
                  <button
                    onClick={() => setDetailModalTab('desc')}
                    style={{
                      padding: '8px 16px', background: 'none', border: 'none', color: detailModalTab === 'desc' ? 'var(--primary-green)' : 'var(--text-muted)',
                      borderBottom: detailModalTab === 'desc' ? '2px solid var(--primary-green)' : 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    Deskripsi Produk
                  </button>
                  <button
                    onClick={() => setDetailModalTab('reviews')}
                    style={{
                      padding: '8px 16px', background: 'none', border: 'none', color: detailModalTab === 'reviews' ? 'var(--primary-green)' : 'var(--text-muted)',
                      borderBottom: detailModalTab === 'reviews' ? '2px solid var(--primary-green)' : 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    Ulasan Anggota ({productReviews.length})
                  </button>
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                  {detailModalTab === 'desc' ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      {selectedProduct.desc}. Kami memproduksi bahan pangan organik berkualitas tinggi dari petani koperasi lokal demi menjaga keaslian nutrisi dan memajukan perekonomian UMKM pedesaan secara berkelanjutan.
                    </div>
                  ) : (
                    <div>
                      {/* Review average block */}
                      <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '16px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center', minWidth: '100px' }}>
                          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{selectedProduct.rating}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>dari 5 Bintang</div>
                          <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '4px' }}>{"★".repeat(Math.round(selectedProduct.rating))}</div>
                        </div>
                        <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Dapatkan feedback langsung dari ulasan nyata anggota koperasi desa. Bantu sesama pembeli dengan memberikan ulasan yang bermanfaat!
                        </div>
                      </div>

                      {/* Loading reviews state */}
                      {loadingReviews ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memuat ulasan...</div>
                      ) : productReviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Belum ada ulasan untuk produk ini.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {productReviews.map(rev => (
                            <div key={rev.id || rev.created_at} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>👤 {rev.member_name}</div>
                                <div style={{ color: '#f59e0b', fontSize: '0.75rem' }}>{"★".repeat(rev.rating)}</div>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'white', lineHeight: '1.4' }}>{rev.comment}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                                {new Date(rev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <button
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                    disabled={selectedProduct.stock <= 0}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: selectedProduct.stock > 0 ? 'pointer' : 'not-allowed',
                      background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)'
                    }}
                  >
                    🛒 Masuk Keranjang
                  </button>
                  <button
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setActiveRightTab('cart'); }}
                    disabled={selectedProduct.stock <= 0}
                    style={{
                      flex: 1.5, padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: selectedProduct.stock > 0 ? 'pointer' : 'not-allowed',
                      background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'
                    }}
                  >
                    Beli Sekarang →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: SELLER STORE DETAIL MODAL (Mini Koperasi) ─── */}
      {selectedStore && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '20px',
          backdropFilter: 'blur(10px)'
        }}
          onClick={() => setSelectedStore(null)}
        >
          <div style={{
            background: '#0d1324', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', maxWidth: '750px', width: '100%',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)', maxHeight: '85vh',
            animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
            onClick={e => e.stopPropagation()}
          >
            {/* Store Header */}
            <div style={{ background: 'linear-gradient(135deg, #059669, #0e1324)', padding: '24px', position: 'relative', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={() => setSelectedStore(null)} style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                {selectedStore.avatar}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedStore.name}
                  {selectedStore.verified && <span style={{ background: '#10b981', color: 'black', fontSize: '0.55rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>VERIFIED</span>}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>📍 {selectedStore.desa}, {selectedStore.kecamatan}, {selectedStore.kabupaten}</p>
              </div>
            </div>

            {/* Store Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div>Jarak Lokasi</div>
                <strong style={{ color: 'white', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>📍 {selectedStore.distance} km</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div>Rating Koperasi</div>
                <strong style={{ color: '#fbbf24', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>⭐ {selectedStore.rating} / 5</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div>Bergabung</div>
                <strong style={{ color: 'white', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>📅 Tahun {selectedStore.joined}</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div>Status Koperasi</div>
                <strong style={{ color: selectedStore.badgeColor, fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>{selectedStore.badge}</strong>
              </div>
            </div>

            {/* Store Products List */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'white' }}>Semua Produk dari Toko Ini:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                {products.filter(p => p.kopId === selectedStore.id).map(prod => (
                  <div key={prod.id}
                    onClick={() => { setSelectedProduct(prod); setSelectedStore(null); }}
                    style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px'
                    }}
                  >
                    <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <strong style={{ color: 'var(--primary-green)' }}>Rp {prod.price.toLocaleString('id-ID')}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>⭐ {prod.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: TRACKING SHIPMENT TIMELINE MODAL ─── */}
      {trackingOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '20px',
          backdropFilter: 'blur(10px)'
        }}
          onClick={() => setTrackingOrder(null)}
        >
          <div style={{
            background: '#0d1324', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', maxWidth: '500px', width: '100%',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>🚚 Detail Pelacakan Paket</h3>
              <button onClick={() => setTrackingOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID Pesanan: <strong style={{ color: 'white' }}>{trackingOrder.orderId}</strong></div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Total Belanja: <strong style={{ color: 'var(--primary-green)' }}>Rp {trackingOrder.total.toLocaleString('id-ID')}</strong></div>
            </div>

            {/* Timeline steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px' }}>
              {/* Verticle bar line */}
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.1)' }} />

              {[
                { status: 'Dibuat', label: 'Pesanan Dibuat', icon: '📝', date: trackingOrder.date },
                { status: 'Proses', label: 'Sedang Diproses Penjual', icon: '🏭', active: trackingOrder.status === 'Proses' },
                { status: 'Kirim', label: 'Kurir Desa Mengirim Barang', icon: '🏍️', active: trackingOrder.status === 'Kirim', completed: trackingOrder.status === 'Selesai' },
                { status: 'Selesai', label: 'Pesanan Selesai / Diterima', icon: '📦', active: trackingOrder.status === 'Selesai' }
              ].map((step, idx) => {
                const isDone = idx === 0 || step.completed || step.active || (step.status === 'Proses' && (trackingOrder.status === 'Kirim' || trackingOrder.status === 'Selesai')) || (step.status === 'Kirim' && trackingOrder.status === 'Selesai');
                return (
                  <div key={step.status} style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {/* Circle bullet */}
                    <div style={{
                      position: 'absolute', left: '-23px', top: '2px', width: '12px', height: '12px',
                      borderRadius: '50%', background: isDone ? 'var(--primary-green)' : '#1e293b',
                      border: isDone ? '3px solid rgba(16,185,129,0.3)' : '3px solid rgba(255,255,255,0.05)',
                      boxShadow: step.active ? '0 0 10px var(--primary-green)' : 'none'
                    }} />

                    <div style={{ fontSize: '1.25rem', marginTop: '-2px' }}>{step.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDone ? 'white' : 'var(--text-muted)' }}>{step.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {step.status === 'Dibuat' ? new Date(step.date).toLocaleString('id-ID') : 
                         isDone ? 'Aktif dan Tercatat di Blockchain Desa' : 'Menunggu status pembaruan'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={() => setTrackingOrder(null)}
              style={{ width: '100%', background: 'var(--primary-green)', color: 'black', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '24px' }}
            >
              Tutup Pelacakan
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: FEEDBACK / REVIEW WRITING MODAL ─── */}
      {reviewingOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '20px',
          backdropFilter: 'blur(10px)'
        }}
          onClick={() => setReviewingOrder(null)}
        >
          <div style={{
            background: '#0d1324', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', maxWidth: '520px', width: '100%',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            maxHeight: '90vh', overflowY: 'auto',
            animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>⭐ Beri Feedback & Ulasan</h3>
              <button onClick={() => setReviewingOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Ulasan Anda sangat berharga bagi Koperasi Desa dan anggota lainnya. Pilih produk yang ingin Anda ulas di bawah:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviewingOrder.items.map(item => (
                <div key={item.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Jumlah: {item.qty} unit</div>
                    </div>
                  </div>

                  {/* Review form */}
                  <form onSubmit={e => { submitReview(e, item.id); setReviewingOrder(null); }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Skor Rating (Bintang):</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            style={{
                              background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer',
                              color: star <= newRating ? '#fbbf24' : 'rgba(255,255,255,0.15)',
                              padding: 0
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tulis Komentar / Ulasan:</label>
                      <textarea
                        required
                        placeholder="Contoh: Sangat pulen berasnya, pengiriman cepat & aman oleh kurir desa. Rekomen banget!"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        style={{
                          width: '100%', height: '70px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px', padding: '8px 10px', color: 'white', fontSize: '0.78rem', outline: 'none', resize: 'none'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      style={{
                        width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                        border: 'none', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      {submittingReview ? 'Mengirim...' : 'Kirim Feedback'}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .shop-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .shop-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ShopPage;
