import React, { useState } from 'react';

const KopdesPayPage = ({ profile, setProfile, apiBase, logEcosystemActivity }) => {
  const [shuBalance, setShuBalance] = useState(1100000); // Rp 1.100.000 SHU Celengan
  const [showQris, setShowQris] = useState(false);
  
  // P2P Transfer form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transferMsg, setTransferMsg] = useState('');

  // Transaction history logs (Initial mock)
  const [transactions, setTransactions] = useState([
    { id: 'tx1', desc: 'Belanja di Kopdes Shop', amount: -225000, date: '22 Juni 2026', type: 'debit' },
    { id: 'tx2', desc: 'Bunga Simpanan Sukarela', amount: 45000, date: '20 Juni 2026', type: 'credit' }
  ]);

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Akses Dibatasi</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Silakan masuk (login) melalui Portal terlebih dahulu.</p>
      </div>
    );
  }

  const balance = Number(profile.balance || 0);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferMsg('');

    const transAmt = Number(amount);
    if (!recipient || transAmt <= 0) return;

    if (transAmt > balance) {
      alert('Saldo tidak mencukupi untuk melakukan transfer.');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/admin/members/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.id,
          balance: balance - transAmt
        })
      });
      const result = await res.json();
      if (result.success) {
        setProfile({
          ...profile,
          balance: balance - transAmt
        });
        const newTx = {
          id: `tx-${Date.now()}`,
          desc: `Transfer P2P ke ${recipient}`,
          amount: -transAmt,
          date: 'Baru saja',
          type: 'debit'
        };
        setTransactions([newTx, ...transactions]);
        setTransferMsg(`Sukses mentransfer Rp ${transAmt.toLocaleString('id-ID')} ke ${recipient}`);
        setRecipient('');
        setAmount('');

        // Log to Blockchain Ledger
        if (logEcosystemActivity) {
          logEcosystemActivity(
            'P2P_TRANSFER',
            `Transfer P2P sebesar Rp ${transAmt.toLocaleString('id-ID')} dikirim ke ${recipient}`,
            transAmt,
            'pay'
          );
        }
      } else {
        alert(result.error?.message || 'Transfer gagal.');
      }
    } catch (err) {
      alert('Gagal memproses transfer ke server.');
    }
  };

  const handleShuCashout = async () => {
    if (shuBalance <= 0) {
      alert('Saldo SHU Anda kosong.');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/admin/members/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.id,
          balance: balance + shuBalance
        })
      });
      const result = await res.json();
      if (result.success) {
        setProfile({
          ...profile,
          balance: balance + shuBalance
        });
        const newTx = {
          id: `tx-${Date.now()}`,
          desc: 'Pencairan Dana SHU Buku 2025',
          amount: shuBalance,
          date: 'Baru saja',
          type: 'credit'
        };
        setTransactions([newTx, ...transactions]);
        
        // Log to Blockchain Ledger
        if (logEcosystemActivity) {
          logEcosystemActivity(
            'SHU_CASHOUT',
            `Pencairan sisa hasil usaha (SHU) tahun buku 2025 sebesar Rp ${shuBalance.toLocaleString('id-ID')} ke dompet Kopdes Pay`,
            shuBalance,
            'pay'
          );
        }

        setShuBalance(0);
        alert('Sukses mencairkan Dana SHU ke saldo Kopdes Pay Utama!');
      } else {
        alert('Gagal mencairkan SHU.');
      }
    } catch (err) {
      alert('Gagal memproses pencairan ke server.');
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Kopdes Pay (V3.0)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Dompet digital integrasi Koperasi untuk sistem pembayaran QRIS, transfer antar-anggota, dan penarikan SHU.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Side: Wallet Card and QRIS */}
        <div>
          {/* E-Wallet Card */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
            padding: '24px',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 15px 30px rgba(16, 185, 129, 0.25)',
            border: '1px solid rgba(255,255,255,0.15)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em' }}>KOPDES PAY</div>
                <div style={{ fontSize: '0.6rem', color: '#a7f3d0', textTransform: 'uppercase' }}>SHU Wallet & QRIS</div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>📱</span>
            </div>

            <div style={{ color: '#d1fae5', fontSize: '0.75rem', textTransform: 'uppercase' }}>Saldo E-Wallet Utama</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0', fontFamily: 'var(--font-heading)' }}>
              Rp {balance.toLocaleString('id-ID')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', marginTop: '14px', fontSize: '0.8rem' }}>
              <span>{profile.name}</span>
              <span style={{ fontWeight: 700, color: '#34d399' }}>● Aktif ({profile.status})</span>
            </div>
          </div>

          {/* Quick Actions buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <button
              className="btn btn-green"
              style={{ fontSize: '0.85rem', gap: '8px', cursor: 'pointer' }}
              onClick={() => setShowQris(!showQris)}
            >
              <span>📷</span> QRIS Bayar
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', gap: '8px', cursor: 'pointer' }}
              onClick={handleShuCashout}
              disabled={shuBalance <= 0}
            >
              <span>📥</span> Tarik SHU ({shuBalance > 0 ? 'Cair' : 'Kosong'})
            </button>
          </div>

          {/* QRIS Code Output Modal/Widget */}
          {showQris && (
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Scan Kode QRIS Merchant Anda</h4>
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                display: 'inline-block',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                marginBottom: '16px'
              }}>
                {/* Mock QRIS grid graphic */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', width: '120px', height: '120px' }}>
                  {[...Array(36)].map((_, i) => (
                    <div key={i} style={{
                      background: (i * 9 + 4) % 3 === 0 ? '#111' : '#fff',
                      borderRadius: '1px'
                    }} />
                  ))}
                </div>
              </div>

              {/* QRIS Simulator Payment Button */}
              <div style={{ marginBottom: '10px' }}>
                <button
                  type="button"
                  className="btn btn-green"
                  style={{ width: '100%', fontSize: '0.8rem', height: '34px', fontWeight: 700, cursor: 'pointer' }}
                  onClick={async () => {
                    const payAmt = 75000;
                    if (balance < payAmt) {
                      alert('Saldo Anda tidak mencukupi.');
                      return;
                    }
                    try {
                      const res = await fetch(`${apiBase}/admin/members/update`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          memberId: profile.id,
                          balance: balance - payAmt
                        })
                      });
                      const result = await res.json();
                      if (result.success) {
                        setProfile({
                          ...profile,
                          balance: balance - payAmt
                        });
                        const newTx = {
                          id: `tx-${Date.now()}`,
                          desc: 'Belanja QRIS Merchant Desa',
                          amount: -payAmt,
                          date: 'Baru saja',
                          type: 'debit'
                        };
                        setTransactions([newTx, ...transactions]);
                        
                        if (logEcosystemActivity) {
                          logEcosystemActivity(
                            'QRIS_PAYMENT',
                            `Pembayaran QRIS Merchant Desa sebesar Rp ${payAmt.toLocaleString('id-ID')} Berhasil`,
                            payAmt,
                            'pay'
                          );
                        }
                        setShowQris(false);
                        alert(`Sukses melakukan pembayaran QRIS Merchant Desa sebesar Rp ${payAmt.toLocaleString('id-ID')}!`);
                      }
                    } catch (err) {
                      alert('Gagal melakukan pembayaran QRIS.');
                    }
                  }}
                >
                  ⚡ Simulasikan Scan & Bayar QRIS (Rp 75.000)
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Gunakan pembaca kamera kasir desa untuk melunasi checkout belanja otomatis.
              </div>
            </div>
          )}
        </div>

        {/* Right Side: P2P Transfer & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Transfer form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Transfer Saldo P2P</h3>
            
            <form onSubmit={handleTransfer}>
              <div className="form-group">
                <label>ID / Nama Penerima</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Dewi Lestari atau 1205 2026 0002"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nominal Transfer (IDR)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Contoh: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {transferMsg && (
                <div style={{ color: 'var(--primary-green)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                  {transferMsg}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', cursor: 'pointer' }}>
                Kirim Saldo Instan
              </button>
            </form>
          </div>

          {/* Wallet logs */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Riwayat Transaksi Dompet</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transactions.map((tx) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <strong>{tx.desc}</strong>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{tx.date}</div>
                  </div>
                  <span style={{
                    fontWeight: 700,
                    color: tx.amount < 0 ? '#fca5a5' : 'var(--primary-green)'
                  }}>
                    {tx.amount < 0 ? '-' : '+'}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KopdesPayPage;
