import React, { useState, useEffect } from 'react';

const PortalPage = ({ setViewMode, apiBase, setProfile, profile }) => {
  useEffect(() => {
    if (profile) {
      setViewMode('desktop');
    }
  }, [profile, setViewMode]);
  const [role, setRole] = useState('member'); // 'member', 'investor', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Predefined credentials for hackathon presentation convenience
  const demoAccounts = {
    member: { email: 'budi.santoso@kopdes.id', password: 'password123' },
    investor: { email: 'dewi.lestari@kopdes.id', password: 'password123' },
    admin: { email: 'admin@kopdes.id', password: 'password123' }
  };

  const handleAutofill = (selectedRole) => {
    setRole(selectedRole);
    const acc = demoAccounts[selectedRole];
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // For Admin, we can mock it directly since we don't have standard tables for admin accounts in public
      if (role === 'admin' && email === 'admin@kopdes.id' && password === 'password123') {
        const adminProfile = {
          id: 'ADM-KOPDES-001',
          name: 'Pak Sugeng (Admin)',
          email: 'admin@kopdes.id',
          status: 'Admin Koperasi',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
          balance: 99000000,
          qrCode: 'KOPDES-ADMIN'
        };
        setProfile(adminProfile);
        setSuccessMsg('Login Admin Sukses!');
        return;
      }

      // For Member and Investor, fetch from backend membership login API
      const res = await fetch(`${apiBase}/membership/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (result.success) {
        // Map backend response status to show "Investor" if they logged in as investor
        const userProfile = {
          ...result.data,
          status: role === 'investor' ? 'Mitra Investor' : result.data.status
        };
        setProfile(userProfile);
        setSuccessMsg(`Selamat datang kembali, ${result.data.name}!`);
      } else {
        setErrorMsg(result.error?.message || 'Login gagal. Periksa kembali email & password.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung dengan server backend. Pastikan server aktif.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setProfile(null);
    setEmail('');
    setPassword('');
    setSuccessMsg('');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      {/* AURORA ANIMATED BACKGROUND LAYER */}
      <div className="animation-bg-container">
        <div className="aurora-blob blob-blue"></div>
        <div className="aurora-blob blob-green"></div>
        <div className="aurora-blob blob-purple"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* PORTAL GRID CONTAINER */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '900px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '30px',
        alignItems: 'center'
      }} className="animate-fade">
        
        {/* TOP BRANDING */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            fontSize: '1.1rem',
            fontWeight: 700,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '8px 20px',
            borderRadius: '40px',
            color: 'var(--primary-green)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <span>🌾</span> KOPDES AI ECOSYSTEM PORTAL
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            lineHeight: '1.2',
            letterSpacing: '-0.03em',
            marginBottom: '10px',
            background: 'linear-gradient(to right, #f8fafc, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Masuk ke Ekosistem Kopdes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '550px', margin: '0 auto' }}>
            Silakan masuk menggunakan kredensial koperasi Anda untuk mengakses dashboard keuangan, bursa, dan investor hub.
          </p>
        </div>

        {/* LOGIN PANEL */}
        <div className="glass-card" style={{
          maxWidth: '450px',
          width: '100%',
          margin: '0 auto',
          padding: '30px',
          boxShadow: 'var(--glass-shadow)',
          border: '1px solid var(--border-light)'
        }}>
          {/* Role Select Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            {[
              { id: 'member', label: 'Anggota' },
              { id: 'investor', label: 'Investor' },
              { id: 'admin', label: 'Admin' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                style={{
                  flex: 1,
                  background: role === t.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  color: role === t.id ? 'var(--primary-green)' : 'var(--text-muted)',
                  fontWeight: role === t.id ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: '0.2s'
                }}
                onClick={() => handleAutofill(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Quick Demo Autofill Notice */}
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '16px',
            textAlign: 'center',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
            padding: '6px',
            borderRadius: '6px'
          }}>
            💡 Klik tab role di atas untuk autofill akun demo.
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Koperasi</label>
              <input
                type="email"
                className="form-control"
                style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}
                placeholder="Contoh: budi.santoso@kopdes.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sandi Masuk</label>
              <input
                type="password"
                className="form-control"
                style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}
                placeholder="Password akun Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.8rem',
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: 600
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{
                color: 'var(--primary-green)',
                fontSize: '0.8rem',
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: 600
              }}>
                ✓ {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-green"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700
              }}
            >
              {loading ? 'Menghubungkan...' : 'Masuk Ekosistem'}
            </button>
          </form>
        </div>

        {/* ECOSYSTEM ROADMAP LABELS */}
        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '10px'
        }}>
          <span>⚡ V1.0 Digital Cooperative Foundation</span>
          <span>•</span>
          <span>⚡ V2.0 Smart Cooperative Ecosystem</span>
          <span>•</span>
          <span>⚡ V3.0 Village Intelligence Platform</span>
        </div>

      </div>
    </div>
  );
};

export default PortalPage;
