import React, { useState } from 'react';

const CommodityExchangePage = ({ profile, logEcosystemActivity }) => {
  const [exchangeProducts, setExchangeProducts] = useState([
    { id: 'c1', name: 'Kopi Arabika Gayo', price: 72000, bid: 71500, ask: 72500, trend: 'up' },
    { id: 'c2', name: 'Kakao Bubuk Organik', price: 28500, bid: 28200, ask: 28800, trend: 'stable' },
    { id: 'c3', name: 'Beras Premium Cianjur', price: 14800, bid: 14600, ask: 14900, trend: 'up' }
  ]);

  const [tradeLogs, setTradeLogs] = useState([
    { id: 't1', commodity: 'Kopi Arabika Gayo', type: 'Beli', qty: '100 Kg', price: 72000, total: 7200000, time: '10 Menit lalu' },
    { id: 't2', commodity: 'Beras Premium Cianjur', type: 'Jual', qty: '200 Kg', price: 14800, total: 2960000, time: '25 Menit lalu' }
  ]);

  // Trading form state
  const [selectedComm, setSelectedComm] = useState('c1');
  const [tradeType, setTradeType] = useState('Beli');
  const [quantity, setQuantity] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleExecuteTrade = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    
    if (!quantity || Number(quantity) <= 0) return;

    const comm = exchangeProducts.find(c => c.id === selectedComm);
    const qtyNum = Number(quantity);
    const unitPrice = tradeType === 'Beli' ? comm.ask : comm.bid;
    const totalAmount = unitPrice * qtyNum;

    const newTrade = {
      id: `t-${Date.now()}`,
      commodity: comm.name,
      type: tradeType,
      qty: `${qtyNum} Kg`,
      price: unitPrice,
      total: totalAmount,
      time: 'Baru saja'
    };

    setTradeLogs([newTrade, ...tradeLogs]);
    setSuccessMsg(`Transaksi ${tradeType} ${qtyNum} Kg ${comm.name} berhasil dieksekusi!`);
    setQuantity('');
    if (logEcosystemActivity) logEcosystemActivity('COMMODITY_EXCHANGE_TRADE', 'Eksekusi perdagangan komoditas: ' + tradeType + ' ' + comm.name, totalAmount, 'exchange');
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>AI Commodity Exchange</h2>
        <p style={{ color: 'var(--text-muted)' }}>Bursa komoditas desa digital terintegrasi untuk penawaran tender transparan dan prediksi harga cerdas.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '30px'
      }}>
        {/* Left Side: Live Ticker & Bid/Ask Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📈</span> Harga Pasar Bursa Desa
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {exchangeProducts.map((p) => (
              <div key={p.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.name}</span>
                  <span className={p.trend === 'up' ? 'badge badge-green' : 'badge badge-blue'} style={{ fontSize: '0.65rem' }}>
                    {p.trend === 'up' ? 'Meningkat ▲' : 'Stabil'}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BID (Harga Beli)</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-green)', marginTop: '4px' }}>
                      Rp {p.bid.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TERAKHIR</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '4px' }}>
                      Rp {p.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ASK (Harga Jual)</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ef4444', marginTop: '4px' }}>
                      Rp {p.ask.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI price forecasting widget */}
          <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary-purple)' }}>
            <h4 style={{ fontSize: '1rem', color: '#c084fc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔮</span> AI Forecast Bursa 7 Hari Ke Depan
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Berdasarkan sensor kelembapan tanah Command Center dan permintaan bursa regional Medan, harga <strong>Kopi Arabika</strong> diproyeksikan melonjak ke <strong>Rp 73.500 (+2.1%)</strong> karena potensi curah hujan lebat menghambat distribusi logistik.
            </p>
          </div>
        </div>

        {/* Right Side: Trade Execution Form & Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Entry Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Entry Order Perdagangan</h3>
            
            <form onSubmit={handleExecuteTrade}>
              <div className="form-group">
                <label>Pilih Komoditas</label>
                <select
                  className="form-control"
                  style={{ background: '#0e1423' }}
                  value={selectedComm}
                  onChange={(e) => setSelectedComm(e.target.value)}
                >
                  {exchangeProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <button
                  type="button"
                  className={`btn ${tradeType === 'Beli' ? 'btn-green' : 'btn-outline'}`}
                  style={{ fontSize: '0.9rem', padding: '10px' }}
                  onClick={() => setTradeType('Beli')}
                >
                  🟢 Beli (ASK)
                </button>
                <button
                  type="button"
                  className={`btn ${tradeType === 'Jual' ? 'btn-purple' : 'btn-outline'}`}
                  style={{ fontSize: '0.9rem', padding: '10px' }}
                  onClick={() => setTradeType('Jual')}
                >
                  🔴 Jual (BID)
                </button>
              </div>

              <div className="form-group">
                <label>Jumlah Volume (Kg)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Contoh: 100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {successMsg && (
                <div style={{ color: 'var(--primary-green)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                  {successMsg}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Eksekusi Transaksi Bursa
              </button>
            </form>
          </div>

          {/* Trade History logs */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Riwayat Transaksi Terbaru</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '160px', overflowY: 'auto' }}>
              {tradeLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{
                      fontWeight: 700,
                      color: log.type === 'Beli' ? 'var(--primary-green)' : 'var(--primary-purple)',
                      marginRight: '6px'
                    }}>[{log.type}]</span>
                    <strong>{log.commodity}</strong> ({log.qty})
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 600 }}>Rp {log.total.toLocaleString('id-ID')}</span>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommodityExchangePage;
