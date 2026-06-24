import React, { useState, useEffect } from 'react';

const InvestorPage = ({ apiBase, profile, setProfile, navigateTo, subRoute }) => {
  const [projects, setProjects] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [blockchain, setBlockchain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Investment form states
  const [selectedProject, setSelectedProject] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [investMsg, setInvestMsg] = useState('');
  const [investErr, setInvestErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin form states for project creation
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTarget, setNewProjTarget] = useState('');
  const [newProjDuration, setNewProjDuration] = useState('12');
  const [newProjRoi, setNewProjRoi] = useState('');
  const [newProjImage, setNewProjImage] = useState('');
  const [adminProjMsg, setAdminProjMsg] = useState('');

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setAdminProjMsg('');
    try {
      const res = await fetch(`${apiBase}/investor/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProjTitle,
          description: newProjDesc,
          targetAmount: Number(newProjTarget),
          durationMonths: Number(newProjDuration),
          estimatedRoi: Number(newProjRoi),
          image: newProjImage || undefined
        })
      });
      const result = await res.json();
      if (result.success) {
        setAdminProjMsg('Proyek crowdfunding baru berhasil didaftarkan!');
        setNewProjTitle('');
        setNewProjDesc('');
        setNewProjTarget('');
        setNewProjRoi('');
        setNewProjImage('');
        fetchData();
        
        // Redirect back to investor home after 2 seconds
        if (navigateTo) {
          setTimeout(() => {
            setAdminProjMsg('');
            navigateTo('investor');
          }, 2000);
        }
      } else {
        alert(result.error?.message || 'Gagal membuat proyek.');
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  const handleActivateInvestor = async () => {
    try {
      const res = await fetch(`${apiBase}/admin/members/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.id,
          status: 'Mitra Investor'
        })
      });
      const result = await res.json();
      if (result.success) {
        alert('Selamat! Akun Anda telah resmi diaktifkan sebagai Mitra Investor Koperasi.');
        setProfile({
          ...profile,
          status: 'Mitra Investor'
        });
      } else {
        alert('Gagal mengaktifkan akun investor.');
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      setError('');

      // Fetch projects
      try {
        const projRes = await fetch(`${apiBase}/investor/projects`);
        const projResult = await projRes.json();
        if (projResult.success) setProjects(projResult.data || []);
      } catch (e) { console.error('Gagal memuat proyek:', e); }

      // Fetch my portfolio
      try {
        const myInvRes = await fetch(`${apiBase}/investor/my-investments?memberId=${profile.id}`);
        const myInvResult = await myInvRes.json();
        if (myInvResult.success) setMyInvestments(myInvResult.data || []);
      } catch (e) { console.error('Gagal memuat investasi:', e); }

      // Fetch blockchain
      try {
        const blockchainRes = await fetch(`${apiBase}/investor/blockchain`);
        const blockchainResult = await blockchainRes.json();
        if (blockchainResult.success) setBlockchain(blockchainResult.data || []);
      } catch (e) { console.error('Gagal memuat blockchain:', e); }

    } catch (err) {
      setError('Gagal menghubungi server backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBase, profile?.id]);

  const handleInvest = async (e) => {
    e.preventDefault();
    if (!profile || !selectedProject) return;

    const amount = Number(investAmount);
    if (!amount || amount <= 0) {
      alert('Masukkan jumlah investasi yang valid.');
      return;
    }

    if (amount > Number(profile.balance)) {
      alert('Saldo Kopdes Pay Anda tidak mencukupi.');
      return;
    }

    setSubmitting(true);
    setInvestMsg('');
    setInvestErr('');

    try {
      const res = await fetch(`${apiBase}/investor/invest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          memberId: profile.id,
          amount
        })
      });

      const result = await res.json();

      if (result.success) {
        setInvestMsg('Investasi berhasil disalurkan! Terima kasih.');
        setInvestAmount('');
        
        // Deduct balance locally
        setProfile({
          ...profile,
          balance: Number(profile.balance) - amount
        });

        // Close modal after delay and refresh
        setTimeout(() => {
          setSelectedProject(null);
          setInvestMsg('');
          fetchData();
        }, 2000);
      } else {
        setInvestErr(result.error?.message || 'Investasi gagal.');
      }
    } catch (err) {
      setInvestErr('Gagal memproses investasi ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute portfolio aggregates
  const totalInvested = myInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const averageRoi = myInvestments.length > 0 
    ? (myInvestments.reduce((sum, inv) => sum + Number(inv.investment_projects?.estimated_roi || 0), 0) / myInvestments.length).toFixed(1)
    : 0;
  const estimatedDividends = myInvestments.reduce((sum, inv) => {
    const roi = Number(inv.investment_projects?.estimated_roi || 0) / 100;
    const months = Number(inv.investment_projects?.duration_months || 0);
    return sum + (Number(inv.amount) * roi * (months / 12));
  }, 0);

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Akses Dibatasi</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Silakan masuk (login) melalui Portal terlebih dahulu.</p>
      </div>
    );
  }

  if (profile.status !== 'Mitra Investor' && profile.status !== 'Admin Koperasi' && profile.status !== 'Anggota & Investor') {
    return (
      <div className="glass-card animate-fade" style={{ padding: '50px 30px', maxWidth: '600px', margin: '40px auto', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📈</div>
        <h3 style={{ fontSize: '1.6rem', color: '#fbbf24', fontWeight: 700, marginBottom: '14px' }}>Hub Investor Koperasi Desa</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px' }}>
          Dukung pendanaan petani lokal dan perluasan lahan tani kita. Sambungkan identitas koperasi Anda ke ledger blockchain terdistribusi untuk menyalurkan modal kerja, menikmati bagi hasil panen (ROI 12% - 18%), dan memantau portofolio pertanian Anda secara transparan.
        </p>
        <button 
          className="btn btn-green" 
          style={{ padding: '12px 30px', fontSize: '1rem', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
          onClick={() => navigateTo ? navigateTo('daftar') : handleActivateInvestor()}
        >
          🚀 Daftar Node & Hubungkan Kunci Ledger
        </button>
      </div>
    );
  }

  if (subRoute === 'crowdfunding') {
    return (
      <div className="animate-fade" style={{ maxWidth: '650px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            onClick={() => navigateTo ? navigateTo('investor') : null} 
            style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.9rem', padding: 0, marginBottom: '10px' }}
          >
            ← Kembali ke Investor Hub
          </button>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Crowdfunding Launchpad</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Rilis proyek pendanaan pertanian baru dan galang modal dari ekosistem Koperasi Desa.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: '30px' }}>
          {adminProjMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--primary-green)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#34d399',
              fontWeight: 600
            }}>{adminProjMsg}</div>
          )}

          <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Judul Proyek Crowdfunding</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Perluasan Kebun Kopi Organik Bener Meriah"
                value={newProjTitle}
                onChange={(e) => setNewProjTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Target Nominal Pendanaan (Rp)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Contoh: 150000000"
                value={newProjTarget}
                onChange={(e) => setNewProjTarget(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Tenor Pengembalian</label>
                <select
                  className="form-control"
                  style={{ background: '#0e1423' }}
                  value={newProjDuration}
                  onChange={(e) => setNewProjDuration(e.target.value)}
                >
                  <option value="6">6 Bulan</option>
                  <option value="8">8 Bulan</option>
                  <option value="12">12 Bulan</option>
                  <option value="24">24 Bulan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estimasi Imbal Hasil / ROI (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="Contoh: 15.5"
                  value={newProjRoi}
                  onChange={(e) => setNewProjRoi(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Link Gambar Proyek (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={newProjImage}
                onChange={(e) => setNewProjImage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Deskripsi Detail Rencana Kerja Tani</label>
              <textarea
                className="form-control"
                placeholder="Jelaskan secara rinci alokasi modal dan rencana bagi hasil panen..."
                rows="4"
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
              <input
                type="checkbox"
                id="auditCheck"
                required
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <label htmlFor="auditCheck" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: '1.4' }}>
                Saya menyetujui audit kelayakan proyek oleh Dewan Pengawas Koperasi sebelum kampanye resmi dibuka untuk pendanaan publik.
              </label>
            </div>

            <button type="submit" className="btn btn-blue" style={{ width: '100%', height: '40px', fontWeight: 700, marginTop: '10px' }}>
              🚀 Rilis Kampanye Crowdfunding
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Investor Hub (V2.0)</h2>
          <p style={{ color: 'var(--text-muted)' }}>Pemberdayaan ekonomi desa melalui crowdfunding modal tani, peternakan, dan UMKM lokal secara transparan.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigateTo ? navigateTo('investor/crowdfunding') : null}
            className="btn btn-blue"
            style={{ fontSize: '0.85rem', height: '38px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, cursor: 'pointer' }}
          >
            <span>➕</span> Rilis Proyek Baru
          </button>
          <div style={{
            background: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '0.85rem'
          }}>
            Saldo K-Pay Anda: <strong style={{ color: 'var(--primary-green)' }}>Rp {Number(profile.balance).toLocaleString('id-ID')}</strong>
          </div>
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>}

      {/* PORTFOLIO SUMMARY CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Total Dana Investasi</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
            Rp {totalInvested.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Dana aktif disalurkan pada {myInvestments.length} proyek tani
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Estimasi ROI Rata-rata</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
            {averageRoi}% <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ Tahun</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Berdasarkan bunga flat bagi hasil panen
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Estimasi Imbal Hasil</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-green)' }}>
            +Rp {Math.round(estimatedDividends).toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Akan didistribusikan saat kontrak proyek jatuh tempo
          </div>
        </div>
      </div>

      <div className="responsive-grid-sidebar">
        {/* INVESTMENT CAMPAIGNS CATALOG */}
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Proyek Koperasi Terbuka (Crowdfunding)</h3>
          {loading && projects.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>Memuat daftar proyek...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {projects.map((proj) => {
                const percent = Math.min(100, Math.round((Number(proj.raised_amount) / Number(proj.target_amount)) * 100));
                return (
                  <div key={proj.id} className="glass-card" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    overflow: 'hidden',
                    alignItems: 'stretch',
                    border: proj.status === 'closed' ? '1px solid rgba(255,255,255,0.03)' : '1px solid var(--border-light)'
                  }}>
                    {/* Project Thumbnail */}
                    <div style={{ width: '200px', minWidth: '200px', background: '#0e1423', position: 'relative' }}>
                      <img src={proj.image} alt={proj.title} style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} />
                      {proj.status === 'closed' && (
                        <div style={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0, bottom: 0,
                          background: 'rgba(10, 15, 29, 0.75)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f8fafc',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}>
                          🔒 Terpenuhi
                        </div>
                      )}
                    </div>

                    {/* Project Body */}
                    <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{proj.title}</h4>
                          <span className={`badge ${proj.status === 'funding' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.65rem' }}>
                            {proj.status === 'funding' ? 'Terbuka' : 'Kontrak Berjalan'}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5', marginBottom: '14px' }}>
                          {proj.description}
                        </p>
                      </div>

                      {/* Financial details & Progress bar */}
                      <div>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', fontSize: '0.8rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Target Modal:</span><br />
                            <strong style={{ fontSize: '0.9rem' }}>Rp {Number(proj.target_amount).toLocaleString('id-ID')}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Estimasi ROI:</span><br />
                            <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>{proj.estimated_roi}% / Thn</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Durasi Kontrak:</span><br />
                            <strong style={{ fontSize: '0.9rem' }}>{proj.duration_months} Bulan</strong>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            <span>Terkumpul: <strong>Rp {Number(proj.raised_amount).toLocaleString('id-ID')}</strong></span>
                            <span>{percent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${percent}%`,
                              height: '100%',
                              background: 'linear-gradient(to right, var(--primary-blue), #60a5fa)',
                              borderRadius: '4px',
                              boxShadow: '0 0 10px rgba(37,99,235,0.4)'
                            }}></div>
                          </div>
                        </div>

                        {proj.status === 'funding' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            onClick={() => setSelectedProject(proj)}
                          >
                            🤝 Beri Pendanaan Tani
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: INVESTOR PORTFOLIO OR ADMIN PROJECT CREATOR */}
        <div className="glass-card" style={{ padding: '20px', position: 'sticky', top: '20px' }}>
          {profile?.status === 'Admin Koperasi' ? (
            <>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌱 Buat Proyek Baru</span>
                <span className="badge badge-blue">Admin Power</span>
              </h3>

              {adminProjMsg && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--primary-green)',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.8rem',
                  color: '#34d399',
                  fontWeight: 600
                }}>{adminProjMsg}</div>
              )}

              <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Judul Kampanye Proyek</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ height: '32px', fontSize: '0.8rem' }}
                    placeholder="Contoh: Pembibitan Cengkeh"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Pendanaan (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ height: '32px', fontSize: '0.8rem' }}
                    placeholder="Contoh: 120000000"
                    value={newProjTarget}
                    onChange={(e) => setNewProjTarget(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tenor Kontrak</label>
                    <select
                      className="form-control"
                      style={{ height: '32px', fontSize: '0.8rem', background: '#0e1423' }}
                      value={newProjDuration}
                      onChange={(e) => setNewProjDuration(e.target.value)}
                    >
                      <option value="6">6 Bulan</option>
                      <option value="8">8 Bulan</option>
                      <option value="12">12 Bulan</option>
                      <option value="24">24 Bulan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimasi ROI (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      style={{ height: '32px', fontSize: '0.8rem' }}
                      placeholder="Contoh: 15.5"
                      value={newProjRoi}
                      onChange={(e) => setNewProjRoi(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tautan Gambar Proyek (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ height: '32px', fontSize: '0.8rem' }}
                    placeholder="https://images.unsplash..."
                    value={newProjImage}
                    onChange={(e) => setNewProjImage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deskripsi Proyek</label>
                  <textarea
                    className="form-control"
                    style={{ fontSize: '0.8rem', padding: '6px' }}
                    placeholder="Jelaskan penggunaan modal & prospek bisnis tani..."
                    rows="3"
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-blue" style={{ width: '100%', fontWeight: 700, fontSize: '0.8rem', height: '34px', marginTop: '6px' }}>
                  + Rilis Kampanye Proyek
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                Investasi Aktif Anda
              </h3>
              {myInvestments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Anda belum menyalurkan investasi.<br />Pilih proyek pertanian aktif untuk memulai.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {myInvestments.map((inv) => (
                    <div key={inv.id} style={{
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                        {inv.investment_projects?.title || 'Proyek Tani'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Pokok: Rp {Number(inv.amount).toLocaleString('id-ID')}</span>
                        <span style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Aktif</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Tanggal: {new Date(inv.created_at || inv.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Log Aktivitas Investor & Anggota */}
          <div style={{ marginTop: '24px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⛓️</span> Log Aktivitas Ledger
            </h3>
            {blockchain.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Belum ada log aktivitas.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {[...blockchain].sort((a, b) => b.index - a.index).slice(0, 5).map((block) => {
                  let backLink = '';
                  let label = '';
                  switch (block.data.type) {
                    case 'PROJECT_CREATION':
                      backLink = 'investor/crowdfunding';
                      label = 'Rilis Proyek';
                      break;
                    case 'INVESTOR_REGISTRATION':
                      backLink = 'daftar';
                      label = 'Daftar Node';
                      break;
                    case 'PROJECT_INVESTMENT':
                      backLink = 'investor';
                      label = 'Hub Investor';
                      break;
                    case 'DELPHI_ANP_SUBMISSION':
                    case 'DELPHI_ANP_SIMULATION':
                      backLink = 'delphi';
                      label = 'Delphi Hub';
                      break;
                    case 'MEMBER_REGISTRATION':
                      backLink = 'membership';
                      label = 'Membership';
                      break;
                    case 'SHOPPING_CHECKOUT':
                      backLink = 'shop';
                      label = 'Belanja';
                      break;
                    default:
                      break;
                  }

                  return (
                    <div key={block.index} style={{
                      padding: '10px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      fontSize: '0.78rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                          {label || block.data.type || 'Log'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          Block #{block.index}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                        {block.data.message || block.data.title}
                      </p>
                      {backLink && navigateTo && (
                        <button
                          onClick={() => navigateTo(backLink)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#60a5fa',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            padding: 0,
                            marginTop: '2px',
                            fontWeight: 700,
                            display: 'block',
                            textAlign: 'left'
                          }}
                        >
                          Buka Link Fitur 🔗
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* INVESTMENT MODAL DIALOG */}
      {selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 15, 29, 0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '450px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Salurkan Pendanaan Koperasi</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Anda mendanai: <strong>{selectedProject.title}</strong>
            </p>

            <form onSubmit={handleInvest}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Nominal Pendanaan (IDR)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Contoh: 5000000"
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  required
                  min="100000"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>Min Investasi: Rp 100.000</span>
                  <span>Saldo K-Pay: Rp {Number(profile.balance).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Estimate returns display */}
              {investAmount && Number(investAmount) > 0 && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.8rem',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Estimasi ROI ({selectedProject.estimated_roi}%):</span>
                    <strong style={{ color: '#fbbf24' }}>
                      Rp {Math.round(Number(investAmount) * (Number(selectedProject.estimated_roi) / 100) * (Number(selectedProject.duration_months) / 12)).toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    *Bagi hasil dihitung flat proporsional terhadap durasi kontrak {selectedProject.duration_months} bulan.
                  </div>
                </div>
              )}

              {investMsg && (
                <div style={{ color: 'var(--primary-green)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>
                  ✓ {investMsg}
                </div>
              )}
              {investErr && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>
                  ⚠️ {investErr}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white' }}
                  onClick={() => setSelectedProject(null)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-green"
                  style={{ flex: 1.5, fontWeight: 700 }}
                  disabled={submitting}
                >
                  {submitting ? 'Memproses...' : 'Konfirmasi Investasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorPage;
