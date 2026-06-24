import React, { useState, useEffect } from 'react';

const FinancePage = ({ apiBase, profile, setProfile, logEcosystemActivity }) => {
  const [summary, setSummary] = useState(null);
  const [memberFinance, setMemberFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Transaction form states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositType, setDepositType] = useState('sukarela');
  const [depositMsg, setDepositMsg] = useState('');

  const [loanAmount, setLoanAmount] = useState('');
  const [loanTenor, setLoanTenor] = useState('12');
  const [loanMsg, setLoanMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const summaryRes = await fetch(`${apiBase}/finance/summary`);
      const summaryResult = await summaryRes.json();
      
      const memberRes = await fetch(`${apiBase}/finance/member?id=${profile?.id || '1205 2024 0001'}`);
      const memberResult = await memberRes.json();

      if (summaryResult.success && memberResult.success) {
        setSummary(summaryResult.data);
        setMemberFinance(memberResult.data);
      } else {
        setError('Gagal mengambil informasi data finansial.');
      }
    } catch (err) {
      setError('Gagal menghubungi backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBase, profile?.id]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositMsg('');
    setError('');

    try {
      const res = await fetch(`${apiBase}/finance/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile?.id || '1205 2024 0001',
          amount: Number(depositAmount),
          type: depositType
        })
      });

      const result = await res.json();
      if (result.success) {
        setDepositMsg(result.message);
        setDepositAmount('');
        fetchData(); // Refresh summary values
        
        // Refresh balance context in App
        if (profile) {
          setProfile({
            ...profile,
            balance: Number(profile.balance) + Number(depositAmount)
          });
        }
        if (logEcosystemActivity) logEcosystemActivity('SAVINGS_DEPOSIT', 'Setor simpanan berhasil', Number(depositAmount), 'finance');
      } else {
        setError(result.error?.message || 'Deposit gagal.');
      }
    } catch (err) {
      setError('Gagal memproses simpanan ke server.');
    }
  };

  const handleLoanApply = async (e) => {
    e.preventDefault();
    setLoanMsg('');
    setError('');

    try {
      const res = await fetch(`${apiBase}/finance/loan-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile?.id || '1205 2024 0001',
          amount: Number(loanAmount),
          tenorMonths: Number(loanTenor)
        })
      });

      const result = await res.json();
      if (result.success) {
        setLoanMsg(`Pinjaman disetujui! Angsuran bulanan: Rp ${result.data.monthlyInstallment.toLocaleString('id-ID')}`);
        setLoanAmount('');
        fetchData();
        if (logEcosystemActivity) logEcosystemActivity('LOAN_APPLICATION', 'Pengajuan pinjaman baru diajukan', Number(loanAmount), 'finance');
      } else {
        setError(result.error?.message || 'Pengajuan pinjaman ditolak.');
      }
    } catch (err) {
      setError('Gagal memproses pinjaman ke server.');
    }
  };

  const calculateInstallment = () => {
    if (!loanAmount || Number(loanAmount) <= 0) return 0;
    const amount = Number(loanAmount);
    const tenor = Number(loanTenor);
    // Simple 2% interest model
    return Math.round((amount / tenor) * 1.02);
  };

  if (loading && !summary) {
    return <div style={{ color: 'var(--text-muted)' }}>Memuat data keuangan...</div>;
  }

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Digital Finance</h2>
        <p style={{ color: 'var(--text-muted)' }}>Pantau tabungan simpanan pokok/wajib, kalkulasi SHU, dan pengajuan pinjaman modal.</p>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>}

      {/* Financial Statement Overview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Assets Overview */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Total Aset Koperasi</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
            Rp {summary?.totalAssets.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Aset Lancar & Likuiditas Kas Desa
          </div>
        </div>

        {/* Savings Overview */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Dana Simpanan Terhimpun</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-green)' }}>
            Rp {summary?.totalSavings.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', gap: '8px' }}>
            <span>Pokok: {(summary?.savingsBreakdown.pokok / 1e9).toFixed(1)}M</span>
            <span>•</span>
            <span>Wajib: {(summary?.savingsBreakdown.wajib / 1e9).toFixed(1)}M</span>
            <span>•</span>
            <span>Sukarela: {(summary?.savingsBreakdown.sukarela / 1e9).toFixed(1)}M</span>
          </div>
        </div>

        {/* Loans Outstanding */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Total Pinjaman Aktif</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
            Rp {summary?.totalLoans.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Disalurkan untuk modal UMKM Desa
          </div>
        </div>
      </div>

      {/* Main Actions: Simpanan Form, Pinjaman Form, and Member Balance */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '24px'
      }}>
        {profile?.status === 'Admin Koperasi' ? (
          <>
            {/* Box 1: Admin Loan Disbursal Panel */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', color: '#60a5fa' }}>
                Otorisasi Pinjaman Warga
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Budi Santoso</span>
                    <span style={{ color: '#fbbf24' }}>Pending Review</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>Pengajuan Pinjaman: Rp 5.000.000 (12 Bulan)</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button className="btn btn-green" style={{ padding: '4px 10px', fontSize: '0.7rem', height: '24px', cursor: 'pointer' }} onClick={() => alert('Pinjaman Budi Santoso disetujui dan dicairkan!')}>✓ Cairkan</button>
                    <button className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem', height: '24px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }} onClick={() => alert('Pengajuan ditolak.')}>Tolak</button>
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Dewi Lestari</span>
                    <span style={{ color: 'var(--primary-green)' }}>Disbursed</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>Pencairan Modal Tani: Rp 12.000.000 (24 Bulan)</div>
                </div>
              </div>
            </div>

            {/* Box 2: Admin SHU Payout */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Distribusi Sisa Hasil Usaha (SHU)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                Lakukan pembagian SHU tahun buku berjalan secara rata kepada seluruh anggota koperasi aktif sesuai proporsi simpanan mereka.
              </p>
              <button className="btn btn-purple" style={{ width: '100%', cursor: 'pointer' }} onClick={() => alert('SHU sebesar total Rp 1,1 Milyar berhasil disalurkan ke saldo e-wallet seluruh anggota!')}>
                📢 Distribusikan Dana SHU
              </button>
            </div>

            {/* Box 3: Kas & Likuiditas Bendahara */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Mutasi Kas Bendahara</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Saldo Kas Utama</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>Rp 502.350.000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Giro Bank Mandiri</span>
                  <span style={{ fontWeight: 700 }}>Rp 1.450.000.000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sertifikat Bank Indonesia</span>
                  <span style={{ fontWeight: 700 }}>Rp 3.000.000.000</span>
                </div>
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Total Likuiditas</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-green)' }}>Rp 4.952.350.000</span>
                </div>
              </div>
            </div>
          </>
        ) : profile?.status === 'Mitra Investor' ? (
          <>
            {/* Box 1: Investor Transparency report */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', color: '#c084fc' }}>
                Laporan Aset & Likuiditas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Likuiditas kas koperasi dijamin oleh aset komoditas beras, kopi, dan madu di gudang dengan rasio kecukupan modal sebesar <strong>140%</strong>.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span>Rasio Likuiditas Kas</span>
                  <strong style={{ color: 'var(--primary-green)' }}>92.4% (Sangat Sehat)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rasio Solvabilitas</span>
                  <strong style={{ color: 'var(--primary-green)' }}>105.8%</strong>
                </div>
              </div>
            </div>

            {/* Box 2: Corporate Balance Sheet */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Buku Neraca Keuangan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Simpanan Pokok</span>
                  <span>Rp 1.000.000.000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Simpanan Wajib</span>
                  <span>Rp 2.500.000.000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Simpanan Sukarela</span>
                  <span>Rp 1.500.000.000</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total Kewajiban</span>
                  <span>Rp 5.000.000.000</span>
                </div>
              </div>
            </div>

            {/* Box 3: Audit risk index */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Pengawasan Audit Risiko</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Non-Performing Loan (NPL)</span>
                  <strong style={{ color: 'var(--primary-green)' }}>0.85% (Rendah)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Indeks Risiko Default Sawah</span>
                  <strong style={{ color: 'var(--primary-green)' }}>1.2%</strong>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px', lineHeight: '1.4' }}>
                  *Proyek gagal panen terlindungi oleh Asuransi Tani Desa Gotong Royong Bumiputera.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Box 1: Member Balance sheet */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                Saldo Tabungan Anda
              </h3>
              {memberFinance && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Simpanan Pokok</span>
                    <span style={{ fontWeight: 600 }}>Rp {memberFinance.savings.pokok.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Simpanan Wajib</span>
                    <span style={{ fontWeight: 600 }}>Rp {memberFinance.savings.wajib.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Simpanan Sukarela</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary-green)' }}>Rp {memberFinance.savings.sukarela.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Total Simpanan</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary-green)' }}>Rp {memberFinance.savings.total.toLocaleString('id-ID')}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.1rem', marginTop: '14px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    Informasi Pinjaman Aktif
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Pinjaman</span>
                    <span style={{ fontWeight: 600 }}>Rp {memberFinance.loans.outstanding.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Limit Sisa Pinjaman</span>
                    <span style={{ fontWeight: 600, color: '#60a5fa' }}>Rp {memberFinance.loans.remaining.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Jatuh Tempo</span>
                    <span style={{ fontWeight: 600, color: '#f59e0b' }}>{memberFinance.loans.dueDate}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Box 2: Tabung Uang (Deposit Savings) */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Setor Simpanan Mandiri</h3>
              <form onSubmit={handleDeposit}>
                <div className="form-group">
                  <label>Jenis Simpanan</label>
                  <select
                    className="form-control"
                    style={{ background: '#0e1423' }}
                    value={depositType}
                    onChange={(e) => setDepositType(e.target.value)}
                  >
                    <option value="sukarela">Simpanan Sukarela (Bisa ditarik kapan saja)</option>
                    <option value="wajib">Simpanan Wajib (Bulanan)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nominal Setoran (IDR)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Contoh: 100000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                  />
                </div>

                {depositMsg && (
                  <div style={{ color: 'var(--primary-green)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                    {depositMsg}
                  </div>
                )}

                <button type="submit" className="btn btn-green" style={{ width: '100%', cursor: 'pointer' }}>
                  Setor Simpanan
                </button>
              </form>
            </div>

            {/* Box 3: Pinjam Modal (Loan application) */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Pengajuan Pinjaman Modal</h3>
              <form onSubmit={handleLoanApply}>
                <div className="form-group">
                  <label>Jumlah Pinjaman (Maks: Rp 15.000.000)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Contoh: 5000000"
                    max="15000000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tenor Pengembalian</label>
                  <select
                    className="form-control"
                    style={{ background: '#0e1423' }}
                    value={loanTenor}
                    onChange={(e) => setLoanTenor(e.target.value)}
                  >
                    <option value="6">6 Bulan</option>
                    <option value="12">12 Bulan (1 Tahun)</option>
                    <option value="24">24 Bulan (2 Tahun)</option>
                  </select>
                </div>

                {loanAmount && Number(loanAmount) > 0 && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Estimasi Cicilan:</span>
                      <strong style={{ color: '#60a5fa' }}>
                        Rp {calculateInstallment().toLocaleString('id-ID')} / Bulan
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      *Termasuk bunga flat 2% simulasi Koperasi Digital.
                    </div>
                  </div>
                )}

                {loanMsg && (
                  <div style={{ color: 'var(--primary-green)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                    {loanMsg}
                  </div>
                )}

                <button type="submit" className="btn btn-purple" style={{ width: '100%', cursor: 'pointer' }}>
                  Ajukan Pinjaman
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinancePage;
