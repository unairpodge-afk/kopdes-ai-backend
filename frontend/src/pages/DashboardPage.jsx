import React, { useState, useEffect } from 'react';

const DashboardPage = ({ apiBase, profile, navigateTo, subRoute, logEcosystemActivity }) => {
  const [stats, setStats] = useState({
    totalMembers: 1250,
    totalSales: 12080000000,
    shuThisYear: 1100000000
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [blockchain, setBlockchain] = useState([]);
  const [activeLogTab, setActiveLogTab] = useState('orders'); // 'orders' or 'blockchain'
  const [loading, setLoading] = useState(true);

  // Load child-handwriting font dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Short+Stack&family=Patrick+Hand&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    // Fetch stats, orders and blockchain from backend
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${apiBase}/finance/summary`);
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats({
            totalMembers: 1250, // Static presenter target
            totalSales: statsData.data.totalSales,
            shuThisYear: statsData.data.shuThisYear
          });
        }

        const ordersRes = await fetch(`${apiBase}/shop/orders`);
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setRecentOrders(ordersData.data.slice(0, 5));
        }

        const blockchainRes = await fetch(`${apiBase}/investor/blockchain`);
        const blockchainData = await blockchainRes.json();
        if (blockchainData.success) {
          const sortedBlocks = (blockchainData.data || []).sort((a, b) => b.index - a.index);
          setBlockchain(sortedBlocks.slice(0, 6)); // Display last 6 activities
        }
      } catch (err) {
        console.error('Gagal mengambil data dasbor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Log dashboard access activity to ledger
    if (logEcosystemActivity) {
      const displayRole = subRoute === 'anggota' ? 'Anggota' : subRoute === 'investor' ? 'Investor' : (profile?.status || 'Tamu');
      logEcosystemActivity(
        'DASHBOARD_ACCESS',
        `Akses dashboard utama koperasi desa dengan tampilan ${displayRole}`,
        null,
        subRoute ? `dashboard/${subRoute}` : 'dashboard'
      );
    }
  }, [apiBase, subRoute, profile?.id]);

  // Format currency helper
  const formatIDR = (value) => {
    if (value >= 1e9) {
      return `Rp ${(value / 1e9).toFixed(2)} Milyar`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const chartData = [
    { month: 'Jan', val: 3.2, color: '#f87171' }, // Red crayon
    { month: 'Feb', val: 4.8, color: '#fbbf24' }, // Yellow crayon
    { month: 'Mar', val: 5.5, color: '#34d399' }, // Green crayon
    { month: 'Apr', val: 6.0, color: '#60a5fa' }, // Blue crayon
    { month: 'May', val: 9.1, color: '#c084fc' }, // Purple crayon
    { month: 'Jun', val: 12.08, color: '#f472b6' } // Pink crayon
  ];

  const playfulFontStyles = {
    fontFamily: "'Short Stack', 'Patrick Hand', cursive, sans-serif",
    letterSpacing: '0.01em'
  };

  const effectiveRole = subRoute === 'anggota' ? 'Anggota Aktif' : subRoute === 'investor' ? 'Mitra Investor' : (profile?.status || 'Anggota Aktif');

  return (
    <div className="animate-fade" style={{ ...playfulFontStyles, paddingBottom: '40px' }}>
      
      {/* 1. Header Section */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '6px', color: '#34d399' }}>
          🎨 Koperasi Desa Cerdas
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Ekosistem Desa Digital Gotong Royong Kita — Dipersembahkan oleh Kopdes AI
        </p>
        <span style={{
          position: 'absolute',
          right: '10px',
          top: '-10px',
          fontSize: '3rem',
          opacity: 0.15,
          pointerEvents: 'none'
        }} className="animate-float">⛅</span>
      </div>

      {/* 2. HERO ART BANNER (THE CHILD'S PAINTING VISUAL) */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '30px',
        border: '3px dashed #10b981',
        borderRadius: '30px 15px 30px 15px/15px 30px 15px 30px',
        background: 'rgba(20, 83, 45, 0.15)',
        boxShadow: 'var(--glass-shadow)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}>
          {/* Painting Image display styled like a school blackboard drawing */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #064e3b 100%)',
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.08)',
            position: 'relative'
          }}>
            <img 
              src="/kopdes_child_painting.png" 
              alt="Koperasi Desa Lukisan Anak" 
              style={{
                width: '100%',
                borderRadius: '8px',
                display: 'block',
                filter: 'saturate(1.15) contrast(1.05)'
              }} 
            />
            {/* Indonesian Flag Ribbon */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, #ef4444 50%, #ffffff 50%)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.65rem',
              padding: '2px 14px',
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.2)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              MEREDEKA! 🇮🇩
            </div>
          </div>

          {/* Painting Narrative Story */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#fbbf24', fontWeight: 700 }}>
              🏡 Desa Subur Makmur Kita
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.6' }}>
              Di bawah <strong>langit hijau</strong> yang sejuk dan <strong>pegunungan Gayo</strong> yang biru membentang, berdirilah <strong>koperasi desa</strong> kebanggaan kita.
            </p>
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              <strong>Bendera Merah Putih</strong> berkibar tinggi di tiang bambu. Di depan pintu, <strong>Pak Penjaga Kopdes</strong> menyapa ramah setiap warga, sementara <strong>Pak Petani</strong> tersenyum lebar membawa padi emas hasil panen sawah kita.
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '10px 14px',
              borderRadius: '10px',
              borderLeft: '4px solid #f59e0b',
              fontSize: '0.85rem',
              color: '#f3f4f6',
              fontStyle: 'italic'
            }}>
              "Dari warga, oleh warga, untuk kemakmuran bersama se-Nusantara."
            </div>
          </div>
        </div>
      </div>

      {/* 3. STICKY NOTES STATS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {effectiveRole === 'Mitra Investor' ? (
          <>
            {/* Investor Projects (Yellow sticky note style) */}
            <div style={{
              background: '#fef08a',
              color: '#854d0e',
              padding: '24px',
              borderRadius: '20px 8px 20px 8px/8px 20px 8px 20px',
              border: '2px solid #eab308',
              boxShadow: '4px 6px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(-1deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>🌱</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                📈 Proyek Tani Aktif
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>
                3 Kampanye
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Investasi tersebar di kopi, beras, & madu
              </div>
            </div>

            {/* Total Raised (Blue sticky note style) */}
            <div style={{
              background: '#bfdbfe',
              color: '#1e40af',
              padding: '24px',
              borderRadius: '8px 20px 8px 20px/20px 8px 20px 8px',
              border: '2px solid #3b82f6',
              boxShadow: '6px 4px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(1deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>💰</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                🌾 Total Dana Kelolaan
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                Rp 430 Juta
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Gotong royong permodalan tani desa
              </div>
            </div>

            {/* Average ROI (Purple sticky note style) */}
            <div style={{
              background: '#e9d5ff',
              color: '#6b21a8',
              padding: '24px',
              borderRadius: '15px 15px 15px 15px/25px 25px 25px 25px',
              border: '2px solid #8b5cf6',
              boxShadow: '5px 5px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(-0.5deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>📈</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                📊 Proyeksi ROI Rata-Rata
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                15.1% / Thn
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Jauh di atas rata-rata bunga deposito bank!
              </div>
            </div>
          </>
        ) : effectiveRole === 'Admin Koperasi' ? (
          <>
            {/* Total Members (Yellow sticky note style) */}
            <div style={{
              background: '#fef08a',
              color: '#854d0e',
              padding: '24px',
              borderRadius: '20px 8px 20px 8px/8px 20px 8px 20px',
              border: '2px solid #eab308',
              boxShadow: '4px 6px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(-1deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>🧑‍🌾</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                🌾 Keluarga Anggota
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>
                {stats.totalMembers.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Tambah 16 tetangga bergabung bulan ini!
              </div>
            </div>

            {/* Total Sales (Blue sticky note style) */}
            <div style={{
              background: '#bfdbfe',
              color: '#1e40af',
              padding: '24px',
              borderRadius: '8px 20px 8px 20px/20px 8px 20px 8px',
              border: '2px solid #3b82f6',
              boxShadow: '6px 4px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(1deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>💰</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                📈 Hasil Jualan Toko
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                {formatIDR(stats.totalSales)}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Omset penjualan terintegrasi real-time
              </div>
            </div>

            {/* SHU (Purple sticky note style) */}
            <div style={{
              background: '#e9d5ff',
              color: '#6b21a8',
              padding: '24px',
              borderRadius: '15px 15px 15px 15px/25px 25px 25px 25px',
              border: '2px solid #8b5cf6',
              boxShadow: '5px 5px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(-0.5deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>🎁</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                🍯 Celengan Sisa SHU
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                {formatIDR(stats.shuThisYear)}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Siap dibagi rata pas RAT nanti!
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Member Wallet (Yellow sticky note style) */}
            <div style={{
              background: '#fef08a',
              color: '#854d0e',
              padding: '24px',
              borderRadius: '20px 8px 20px 8px/8px 20px 8px 20px',
              border: '2px solid #eab308',
              boxShadow: '4px 6px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(-1deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>💳</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                💵 Saldo Kopdes Pay Anda
              </div>
              <div style={{ fontSize: '2.0rem', fontWeight: 800 }}>
                Rp {Number(profile?.balance || 0).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Dompet elektronik serbaguna desa
              </div>
            </div>

            {/* Total Orders (Blue sticky note style) */}
            <div style={{
              background: '#bfdbfe',
              color: '#1e40af',
              padding: '24px',
              borderRadius: '8px 20px 8px 20px/20px 8px 20px 8px',
              border: '2px solid #3b82f6',
              boxShadow: '6px 4px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(1deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>🛒</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                📦 Jumlah Transaksi Belanja
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>
                {recentOrders.length} Pesanan
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Pembelian sembako dan kebutuhan tani
              </div>
            </div>

            {/* SHU projection (Purple sticky note style) */}
            <div style={{
              background: '#e9d5ff',
              color: '#6b21a8',
              padding: '24px',
              borderRadius: '15px 15px 15px 15px/25px 25px 25px 25px',
              border: '2px solid #8b5cf6',
              boxShadow: '5px 5px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              transform: 'rotate(-0.5deg)'
            }}>
              <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.5rem' }}>🍯</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                🍯 Proyeksi SHU Anda
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                Rp 1.100.000
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                ● Estimasi dividen gotong royong tahun ini
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. MAIN WORKSPACE: CRAYON CHART & CHALKBOARD INSIGHTS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        marginBottom: '30px'
      }}>
        {/* Sales Chart (Crayon bar chart style) */}
        <div className="glass-card" style={{
          padding: '24px',
          border: '2px solid var(--border-light)',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📊 Grafik Penjualan (Hasil Crayon)</span>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Bulan ini</span>
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '220px',
            paddingTop: '20px',
            borderBottom: '3px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }}>
            {chartData.map((d, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '12%',
                height: '100%',
                justifyContent: 'flex-end'
              }}>
                {/* Crayon Shaped Bar */}
                <div style={{
                  width: '100%',
                  height: `${(d.val / 13) * 100}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  position: 'relative'
                }} className="chart-bar">
                  
                  {/* Crayon Tip (Triangle) */}
                  <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderBottom: `10px solid ${d.color}`,
                    alignSelf: 'center',
                    marginBottom: '-1px'
                  }}></div>

                  {/* Crayon Body */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: d.color,
                    borderRadius: '2px 2px 0 0',
                    boxShadow: `0 0 10px ${d.color}66`,
                    position: 'relative',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    {/* Crayon Label */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(90deg)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'rgba(0,0,0,0.6)',
                      whiteSpace: 'nowrap'
                    }}>
                      KOPDES
                    </div>
                  </div>

                  {/* Value bubble */}
                  <div style={{
                    position: 'absolute',
                    top: '-32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'white',
                    background: 'rgba(10,15,29,0.7)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>{d.val}M</div>
                </div>
                
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {d.month}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight (School Chalkboard style) */}
        <div style={{
          background: '#14532d', // Deep green board
          border: '2px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          color: '#f8fafc',
          position: 'relative'
        }}>
          {/* Chalk dust effect */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle, transparent 70%, rgba(255,255,255,0.02) 100%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', borderBottom: '2px dashed rgba(255,255,255,0.2)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', marginRight: '10px' }} className="animate-float">🤖</span>
            <h3 style={{ fontSize: '1.25rem', color: '#fef08a' }}>Papan Rekomendasi Guru AI</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fca5a5', marginBottom: '2px' }}>☕ Ramalan Kopi Panen Depan:</div>
              <div style={{ color: '#e2e8f0' }}>Penjualan kopi & madu bakal melejit naik <strong>12%</strong> bulan depan. Waktunya tambah stok karung beras!</div>
            </div>
            
            <div>
              <div style={{ fontWeight: 700, color: '#86efac', marginBottom: '2px' }}>🌾 Produk Paling Banyak Dibeli:</div>
              <div style={{ color: '#e2e8f0' }}><strong>Kopi Arabika Gayo</strong> paling cepat habis terjual! Pak Petani di kebun sawah harus dibantu perbanyak panenan.</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#fde047', marginBottom: '2px' }}>🍯 Saran Jualan Laris:</div>
              <div style={{ color: '#e2e8f0' }}>Madu Hutan sisa 60 botol di rak gudang. Yuk buat diskon bundling bersama beras premium desa biar cepat habis!</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY (LINED NOTEBOOK PAPER STYLE) */}
      <div style={{
        background: '#f8fafc', // Notebook white paper
        color: '#0f172a',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        border: '1px solid #cbd5e1',
        position: 'relative'
      }}>
        {/* Left red margin line of notebook paper */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '40px',
          width: '2px',
          background: '#fca5a5'
        }}></div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
          paddingLeft: '32px',
          gap: '12px'
        }}>
          <h3 style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 700, margin: 0 }}>
            📝 Catatan Buku Kas & Ledger Aktivitas
          </h3>
          
          {/* Lined Notebook Tabs */}
          <div style={{ display: 'flex', gap: '8px', zIndex: 5 }}>
            <button
              onClick={() => setActiveLogTab('orders')}
              style={{
                background: activeLogTab === 'orders' ? '#3b82f6' : 'rgba(0,0,0,0.05)',
                color: activeLogTab === 'orders' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              🛒 Kas Toko
            </button>
            <button
              onClick={() => setActiveLogTab('blockchain')}
              style={{
                background: activeLogTab === 'blockchain' ? '#10b981' : 'rgba(0,0,0,0.05)',
                color: activeLogTab === 'blockchain' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              ⛓️ Ledger Koperasi
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem', paddingLeft: '32px' }}>Membaca data buku kas...</div>
        ) : activeLogTab === 'orders' ? (
          /* ORDERS TAB */
          recentOrders.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem', paddingLeft: '32px' }}>Belum ada catatan pembukuan terbaru.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {recentOrders.map((order, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px 12px 32px',
                  borderBottom: '1px solid #e2e8f0', // Horizontal blue lines of paper
                  fontSize: '0.9rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>
                      🛒 Pesanan baru {order.orderId}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Bayar pakai: {order.paymentMethod} • {new Date(order.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.05rem' }}>
                      +Rp {order.totalAmount.toLocaleString('id-ID')}
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      border: '1px solid #bbf7d0'
                    }}>LUNAS</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* BLOCKCHAIN LEDGER TAB */
          blockchain.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem', paddingLeft: '32px' }}>Belum ada aktivitas ledger yang terekam.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {blockchain.map((block, idx) => {
                let badgeColor = '#64748b';
                let icon = '📝';
                let backLink = '';
                let label = '';
                switch (block.data.type) {
                  case 'PROJECT_CREATION':
                    badgeColor = '#3b82f6';
                    icon = '➕';
                    backLink = 'investor/crowdfunding';
                    label = 'Rilis Proyek';
                    break;
                  case 'INVESTOR_REGISTRATION':
                    badgeColor = '#10b981';
                    icon = '🔑';
                    backLink = 'daftar';
                    label = 'Daftar Node';
                    break;
                  case 'PROJECT_INVESTMENT':
                    badgeColor = '#fbbf24';
                    icon = '📈';
                    backLink = 'investor';
                    label = 'Investasi';
                    break;
                  case 'DELPHI_ANP_SUBMISSION':
                  case 'DELPHI_ANP_SIMULATION':
                    badgeColor = '#8b5cf6';
                    icon = '🔮';
                    backLink = 'delphi';
                    label = 'Evaluasi Delphi';
                    break;
                  case 'MEMBER_REGISTRATION':
                    badgeColor = '#ec4899';
                    icon = '👤';
                    backLink = 'membership';
                    label = 'Anggota Baru';
                    break;
                  case 'SHOPPING_CHECKOUT':
                    badgeColor = '#ef4444';
                    icon = '🛒';
                    backLink = 'shop';
                    label = 'Belanja Shop';
                    break;
                  default:
                    break;
                }

                return (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px 12px 32px',
                    borderBottom: '1px solid #e2e8f0',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            background: badgeColor,
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {label || block.data.type || 'Activity'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            Block #{block.index}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem', marginTop: '4px' }}>
                          {block.data.message || block.data.title}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {backLink && navigateTo ? (
                        <button
                          onClick={() => navigateTo(backLink)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.15)',
                            color: '#2563eb',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: '0.15s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#2563eb';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                            e.currentTarget.style.color = '#2563eb';
                          }}
                        >
                          Buka Fitur 🔗
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {new Date(block.timestamp).toLocaleTimeString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
