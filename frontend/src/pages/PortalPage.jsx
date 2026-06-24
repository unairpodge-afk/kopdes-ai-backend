import React, { useState, useEffect } from 'react';

const PortalPage = ({ setViewMode, apiBase, setProfile, profile }) => {
  useEffect(() => {
    if (profile) {
      setViewMode('desktop');
    }
  }, [profile, setViewMode]);

  // Common states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login states
  const [role, setRole] = useState('member'); // 'member', 'investor', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register states
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [receivedOtp, setReceivedOtp] = useState('');
  const [showMockNotification, setShowMockNotification] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
      // Mock Admin login directly
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
        setSuccessMsg('Login Admin Sukses');
        return;
      }

      // Member and Investor login
      const res = await fetch(`${apiBase}/membership/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (result.success) {
        const userProfile = {
          ...result.data,
          status: role === 'investor' ? 'Mitra Investor' : result.data.status
        };
        setProfile(userProfile);
        setSuccessMsg(`Selamat datang kembali, ${result.data.name}`);
      } else {
        setErrorMsg(result.error?.message || 'Login gagal. Periksa kembali email & password.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung dengan server backend. Pastikan server aktif.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMsg('Semua field wajib diisi.');
      return;
    }

    if (!regEmail.toLowerCase().endsWith('@gmail.com')) {
      setErrorMsg('Registrasi baru wajib menggunakan email Gmail (@gmail.com).');
      return;
    }

    if (!/^08\d{8,11}$/.test(regPhone)) {
      setErrorMsg('Nomor telepon harus diawali 08 dan 10-13 digit.');
      return;
    }

    setOtpLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${apiBase}/membership/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail })
      });

      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setCountdown(60);
        setReceivedOtp(data.otp);
        setSuccessMsg('Kode OTP berhasil dikirim. Silakan periksa Gmail Anda.');
        
        // Trigger mock Gmail notification banner after 1.2 seconds for realistic experience
        setTimeout(() => {
          setShowMockNotification(true);
        }, 1200);
      } else {
        setErrorMsg(data.error?.message || 'Gagal mengirim OTP.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!regOtp) {
      setErrorMsg('Kode OTP wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${apiBase}/membership/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          otp: regOtp
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Registrasi berhasil. Menghubungkan ke ekosistem...');
        
        // Automatically login the newly registered user after 1.5 seconds
        setTimeout(() => {
          setProfile({
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            phone: data.data.phone,
            status: data.data.status,
            joinedDate: data.data.joined_date || data.data.joinedDate,
            avatarUrl: data.data.avatar_url || data.data.avatarUrl,
            qrCode: data.data.qr_code || data.data.qrCode,
            balance: Number(data.data.balance)
          });
          setViewMode('desktop');
        }, 1500);
      } else {
        setErrorMsg(data.error?.message || 'Registrasi gagal.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMsg('');
    setSuccessMsg('');
    setOtpSent(false);
    setRegOtp('');
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
      {/* MOCK GMAIL NOTIFICATION TOAST */}
      {showMockNotification && (
        <div className="gmail-notification-toast animate-slide-down" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          left: '20px',
          maxWidth: '400px',
          margin: '0 auto',
          background: 'rgba(30, 27, 38, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(16, 185, 129, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 9999,
          backdropFilter: 'blur(12px)',
          animation: 'slideDown 0.4s ease-out'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            📧
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>Gmail</strong>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Baru saja</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc', marginTop: '2px' }}>Kopdes OTP Service</div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '1px' }}>
              Kode verifikasi Anda adalah <strong style={{ color: '#34d399', fontSize: '0.95rem', fontFamily: 'monospace' }}>{receivedOtp}</strong>.
            </div>
          </div>
          <button 
            onClick={() => setShowMockNotification(false)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '0 4px' }}
          >
            ✕
          </button>
        </div>
      )}

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
            {isRegister ? 'Pendaftaran Anggota Koperasi' : 'Masuk ke Ekosistem Kopdes'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '550px', margin: '0 auto' }}>
            {isRegister 
              ? 'Daftarkan diri Anda sebagai anggota koperasi desa aktif untuk mendapatkan akses Super App dan Kopdes Pay.'
              : 'Silakan masuk menggunakan kredensial koperasi Anda untuk mengakses dashboard keuangan, bursa, dan investor hub.'
            }
          </p>
        </div>

        {/* MAIN PANEL */}
        <div className="glass-card" style={{
          maxWidth: '450px',
          width: '100%',
          margin: '0 auto',
          padding: '30px',
          boxShadow: 'var(--glass-shadow)',
          border: '1px solid var(--border-light)',
          background: 'rgba(15, 10, 22, 0.7)'
        }}>
          {!isRegister ? (
            /* ==================== LOGIN MODE ==================== */
            <>
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

              {/* Toggle Link */}
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Belum terdaftar? </span>
                <button 
                  onClick={toggleMode}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-green)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Daftar Anggota Baru
                </button>
              </div>
            </>
          ) : (
            /* ==================== REGISTER MODE (WITH OTP) ==================== */
            <>
              <form onSubmit={otpSent ? handleVerifyAndRegister : handleSendOTP}>
                {/* Name */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}
                    placeholder="Nama sesuai KTP"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={otpSent}
                    required
                  />
                </div>

                {/* Email (Gmail) */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Gmail</label>
                  <input
                    type="email"
                    className="form-control"
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}
                    placeholder="alamat@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={otpSent}
                    required
                  />
                  <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    *Wajib menggunakan alamat Gmail untuk verifikasi OTP.
                  </small>
                </div>

                {/* Phone */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nomor Telepon (WA)</label>
                  <input
                    type="tel"
                    className="form-control"
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}
                    placeholder="Contoh: 081234567890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    disabled={otpSent}
                    required
                  />
                </div>

                {/* Password */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sandi Baru</label>
                  <input
                    type="password"
                    className="form-control"
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={otpSent}
                    required
                  />
                </div>

                {/* OTP Input (Only shows up when OTP is sent) */}
                {otpSent && (
                  <div className="form-group animate-fade" style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px dashed rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px'
                  }}>
                    <label style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700 }}>
                      🔒 Masukkan 6-Digit Kode OTP
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        color: '#34d399',
                        fontSize: '1.5rem',
                        textAlign: 'center',
                        letterSpacing: '8px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        marginTop: '8px',
                        height: '48px'
                      }}
                      placeholder="XXXXXX"
                      maxLength={6}
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Tidak menerima kode?
                      </span>
                      {countdown > 0 ? (
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                          Kirim ulang dalam {countdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#60a5fa',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Kirim Ulang OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}

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

                {/* Submit Buttons */}
                {!otpSent ? (
                  <button
                    type="submit"
                    disabled={otpLoading}
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
                    {otpLoading ? 'Mengirim OTP...' : 'Kirim Kode OTP Realtime'}
                  </button>
                ) : (
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
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981, #059669)'
                    }}
                  >
                    {loading ? 'Memverifikasi...' : 'Verifikasi & Daftar Sekarang'}
                  </button>
                )}
              </form>

              {/* Toggle Link */}
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sudah punya akun? </span>
                <button 
                  onClick={toggleMode}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-green)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Masuk di sini
                </button>
              </div>
            </>
          )}
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
