import React, { useState } from 'react';

const ESGScorecardPage = ({ profile, setProfile, apiBase }) => {
  const [eScore, setEScore] = useState(85);
  const [sScore, setSScore] = useState(88);
  const [gScore, setGScore] = useState(90);
  const [carbonPoints, setCarbonPoints] = useState(150);

  const esgMetrics = [
    { name: 'Environmental (E)', score: eScore, color: '#10b981', label: 'Dampak Lingkungan', desc: 'Pengurangan karbon, pupuk organik, pengelolaan limbah.' },
    { name: 'Social (S)', score: sScore, color: '#3b82f6', label: 'Dampak Sosial', desc: 'Inklusi anggota desa, literasi digital, pemberdayaan UMKM.' },
    { name: 'Governance (G)', score: gScore, color: '#8b5cf6', label: 'Dampak Tata Kelola', desc: 'Transparansi keuangan bursa, voting Rencana Kerja RAT.' }
  ];

  const handleRedeemCarbon = async () => {
    if (!profile) return;
    if (carbonPoints < 100) {
      alert('Poin karbon Anda tidak mencukupi untuk melakukan penukaran.');
      return;
    }
    try {
      const res = await fetch(`${apiBase}/admin/members/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.id,
          balance: Number(profile.balance) + 50000
        })
      });
      const result = await res.json();
      if (result.success) {
        setCarbonPoints(carbonPoints - 100);
        setProfile({
          ...profile,
          balance: Number(profile.balance) + 50000
        });
        alert('Berhasil menukarkan 100 Kredit Karbon menjadi Rp 50.000 saldo Kopdes Pay!');
      } else {
        alert('Gagal menukarkan kredit karbon.');
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>ESG & Sustainability</h2>
        <p style={{ color: 'var(--text-muted)' }}>Matriks pemantauan dampak ekonomi, sosial, dan tata kelola lingkungan terkelola Koperasi Desa Digital.</p>
      </div>

      {/* ESG Circle Progress Gauges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '30px'
      }}>
        {esgMetrics.map((m, idx) => {
          const radius = 50;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (Math.min(100, Math.max(0, m.score)) / 100) * circumference;

          return (
            <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{m.name}</h4>
              
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={m.color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.5s ease-in-out',
                      filter: `drop-shadow(0 0 8px ${m.color}40)`
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)'
                }}>
                  {m.score}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: m.color }}>{m.label}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom stats tables */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column based on role */}
        {profile?.status === 'Admin Koperasi' ? (
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#60a5fa' }}>🛠️ Intervensi Skor ESG (Admin)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Environmental (E) Score</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '80px', height: '28px', fontSize: '0.8rem', background: '#0e1423', textAlign: 'center' }}
                  value={eScore}
                  onChange={(e) => setEScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  max="100"
                  min="0"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Social (S) Score</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '80px', height: '28px', fontSize: '0.8rem', background: '#0e1423', textAlign: 'center' }}
                  value={sScore}
                  onChange={(e) => setSScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  max="100"
                  min="0"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Governance (G) Score</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '80px', height: '28px', fontSize: '0.8rem', background: '#0e1423', textAlign: 'center' }}
                  value={gScore}
                  onChange={(e) => setGScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  max="100"
                  min="0"
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                *Skor di atas akan terupdate langsung pada dashboard sirkular progres koperasi desa.
              </div>
            </div>
          </div>
        ) : profile?.status === 'Mitra Investor' ? (
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#c084fc' }}>🌱 Ringkasan Kelayakan Hijau (Investor)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>ESG Rating Koperasi</span>
                <strong style={{ color: 'var(--primary-green)' }}>AA (Very High)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>Rasio Kepatuhan Pestisida Organik</span>
                <strong>98.5% Lahan Tani</strong>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.4', margin: '4px 0 0 0' }}>
                Investasi Anda pada proyek pertanian di Kopdes AI memenuhi kriteria Tax Amnesty Hijau & Program Carbon Trade PBB.
              </p>
            </div>
          </div>
        ) : (
          /* Member View: Carbon Points redemption */
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--primary-green)' }}>🌳 Celengan Karbon Anggota</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Poin Kredit Karbon Anda</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary-green)' }}>{carbonPoints} Points</strong>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.4', margin: 0 }}>
                Didapatkan dari program penyetoran pupuk organik cair petani, penanaman pohon buah kopi, dan penggunaan kasir digital e-KTA paperless.
              </p>
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: '4px' }}>
                <button
                  className="btn btn-green"
                  style={{ width: '100%', fontSize: '0.8rem', height: '32px', cursor: 'pointer' }}
                  onClick={handleRedeemCarbon}
                  disabled={carbonPoints < 100}
                >
                  Tukarkan 100 Poin (Rp 50.000 Kopdes Pay)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Environmental impact ledger (Constant) */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>Ledger Pengurangan Karbon Desa</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>🌲 Reboisasi Perkebunan Kopi</span>
              <strong style={{ color: 'var(--primary-green)' }}>-4.2 Tons CO2e</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>🚜 Substitusi Pupuk Organik Cair</span>
              <strong style={{ color: 'var(--primary-green)' }}>-2.8 Tons CO2e</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>☀️ Pembangkit Panel Surya Gudang</span>
              <strong style={{ color: 'var(--primary-green)' }}>-1.5 Tons CO2e</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESGScorecardPage;
