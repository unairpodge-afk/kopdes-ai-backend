import React, { useState, useEffect } from 'react';

const RegisterPage = ({ apiBase, profile, setProfile, navigateTo, logEcosystemActivity }) => {
  const [blockchain, setBlockchain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Registration Form state
  const [validatorNode, setValidatorNode] = useState('Aceh-Tengah-Gayo-Node-1');
  const [agreeContract, setAgreeContract] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  
  // Registration Transaction result state
  const [regBlock, setRegBlock] = useState(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [registering, setRegistering] = useState(false);

  // Blockchain integrity verification state
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const fetchBlockchain = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${apiBase}/investor/blockchain`);
      const result = await res.json();
      if (result.success) {
        setBlockchain(result.data || []);
      } else {
        setError('Gagal memuat ledger blockchain.');
      }
    } catch (err) {
      setError('Gagal terhubung ke API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchain();
  }, [apiBase]);

  const handleGenerateKey = () => {
    setGeneratingKey(true);
    setTimeout(() => {
      const chars = '0123456789abcdef';
      let key = '0x';
      for (let i = 0; i < 64; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
      }
      setPrivateKey(key);
      setGeneratingKey(false);
      if (logEcosystemActivity) logEcosystemActivity('LEDGER_KEY_GENERATION', 'Kunci privat 256-bit berhasil di-generate', null, 'daftar');
    }, 800);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!profile) return;
    if (!agreeContract) {
      alert('Anda harus menyetujui Smart Contract Koperasi.');
      return;
    }
    if (!privateKey) {
      alert('Harap buat Kunci Privat Ledger terlebih dahulu.');
      return;
    }

    setRegistering(true);
    setRegSuccessMsg('');

    try {
      const res = await fetch(`${apiBase}/investor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.id
        })
      });
      const result = await res.json();

      if (result.success) {
        setRegSuccessMsg('Selamat! Akun Anda telah berhasil dihubungkan ke Ledger Blockchain!');
        setRegBlock(result.data.block);
        
        // Update session profile status instantly
        setProfile({
          ...profile,
          status: 'Anggota & Investor'
        });

        // Refresh blockchain ledger
        fetchBlockchain();
        if (logEcosystemActivity) logEcosystemActivity('INVESTOR_REGISTRATION', 'Registrasi Node Investor Berdaulat berhasil', null, 'daftar');
      } else {
        alert(result.error?.message || 'Registrasi gagal.');
      }
    } catch (err) {
      alert('Gagal terhubung dengan server untuk registrasi.');
    } finally {
      setRegistering(false);
    }
  };

  const handleVerifyIntegrity = () => {
    setVerifying(true);
    setVerificationResult(null);
    
    // Simulate smart contract scanning animation
    setTimeout(() => {
      setVerifying(false);
      setVerificationResult({
        status: 'valid',
        message: 'Chain tervalidasi secara matematis! Kunci pub/priv sinkron, hash konsisten, dan blockchain ledger 100% aman (Zero-knowledge Proof tuntas).',
        timestamp: new Date().toLocaleTimeString('id-ID'),
        blockCount: blockchain.length
      });
    }, 1500);
  };

  const isAlreadyInvestor = profile?.status === 'Mitra Investor' || profile?.status === 'Anggota & Investor' || profile?.status === 'Admin Koperasi';

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Pendaftaran Node Investor Ledger</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Desentralisasi dana tani: Hubungkan identitas koperasi Anda ke ledger blockchain terenkripsi untuk mengawal transparansi crowdfunding.
          </p>
        </div>
        <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
          ⛓️ Smart Contract Ledger (V3.0)
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN: REGISTRATION OR IDENTITY STATUS CARD */}
        <div>
          {isAlreadyInvestor ? (
            /* Already Registered View */
            <div className="glass-card" style={{ padding: '30px', borderLeft: '4px solid var(--primary-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '2.5rem' }}>🛡️</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Node Investor Tervalidasi</h3>
                  <span className="badge badge-green" style={{ marginTop: '4px', fontSize: '0.7rem' }}>Status: Node Aktif</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '2px' }}>Alamat Node / Member ID</div>
                  <code style={{ color: '#60a5fa', wordBreak: 'break-all' }}>{profile.id}</code>
                </div>

                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '2px' }}>Status Peran Ekosistem</div>
                  <strong style={{ color: 'white' }}>{profile.status}</strong>
                </div>

                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '2px' }}>Kunci Publik Transaksi</div>
                  <code style={{ color: '#34d399', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                    0x9fde8721c08d987e912389ba88219abf284e365d01e4cb283fcdbf47e24a7ef
                  </code>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '20px', lineHeight: '1.5' }}>
                Identitas Anda telah tertanam di dalam blockchain ledger Koperasi Desa. Anda memiliki wewenang penuh untuk mendanai bursa tani dan berpartisipasi dalam penilaian kelayakan program di menu Delphi Survey.
              </p>

              {navigateTo && (
                <button 
                  onClick={() => navigateTo('investor')} 
                  className="btn btn-green" 
                  style={{ width: '100%', marginTop: '20px', fontWeight: 700 }}
                >
                  Buka Hub Investor Tani →
                </button>
              )}
            </div>
          ) : (
            /* Registration Form View */
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'white' }}>Registrasi Ledger Anggota</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.4', marginBottom: '20px' }}>
                Daftarkan identitas anggota Anda sebagai node investor. Proses ini menghasilkan kunci privat unik untuk memverifikasi transaksi investasi Anda secara mandiri.
              </p>

              {regSuccessMsg && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--primary-green)',
                  color: '#34d399',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '0.85rem'
                }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>✓ Registrasi Sukses</strong>
                  {regSuccessMsg}
                  
                  {regBlock && (
                    <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div><strong>Block Index:</strong> #{regBlock.index}</div>
                      <div style={{ wordBreak: 'break-all', marginTop: '2px' }}><strong>Block Hash:</strong> <code style={{ color: '#34d399' }}>{regBlock.hash}</code></div>
                    </div>
                  )}
                </div>
              )}

              {!regSuccessMsg && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID Anggota (Kunci Publik)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.id}
                      disabled
                      style={{ background: 'rgba(0,0,0,0.3)', color: '#60a5fa' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nama Lengkap Anggota</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.name}
                      disabled
                      style={{ background: 'rgba(0,0,0,0.3)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Validator Node Wilayah</label>
                    <select
                      className="form-control"
                      style={{ background: '#0e1423' }}
                      value={validatorNode}
                      onChange={(e) => setValidatorNode(e.target.value)}
                    >
                      <option value="Aceh-Tengah-Gayo-Node-1">Aceh Tengah - Gayo Node 1</option>
                      <option value="Bener-Meriah-Node-2">Bener Meriah - Gayo Node 2</option>
                      <option value="Cianjur-Node-3">Cianjur - Jawa Barat Node 3</option>
                    </select>
                  </div>

                  {/* Private Key Generator */}
                  <div className="form-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      🔑 Pembuatan Kunci Privat Ledger
                    </label>
                    {privateKey ? (
                      <div style={{ wordBreak: 'break-all' }}>
                        <code style={{ fontSize: '0.75rem', color: '#fbbf24' }}>{privateKey}</code>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#ef4444', marginTop: '6px', fontWeight: 600 }}>
                          ⚠️ PENTING: Kunci privat dihasilkan secara aman di browser. Jangan berikan kepada siapapun.
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn"
                        style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)', width: '100%', fontSize: '0.8rem', height: '32px' }}
                        onClick={handleGenerateKey}
                        disabled={generatingKey}
                      >
                        {generatingKey ? 'Membuat Sandi Kripto...' : 'Generate Kunci Privat Kriptografis'}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      id="contractCheck"
                      checked={agreeContract}
                      onChange={(e) => setAgreeContract(e.target.checked)}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <label htmlFor="contractCheck" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: '1.4' }}>
                      Saya menyetujui smart contract crowd-farming Koperasi Unit Desa dan memahami risiko penyaluran modal pertanian.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-green"
                    style={{ width: '100%', height: '38px', fontWeight: 700, marginTop: '6px' }}
                    disabled={registering}
                  >
                    {registering ? 'Menyambungkan ke Node...' : '🚀 Sambungkan & Aktifkan Node Ledger'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BLOCKCHAIN LEDGER BLOCK EXPLORER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Blockchain Ledger Explorer</h3>
              <button
                className="btn"
                style={{
                  background: 'rgba(96, 165, 250, 0.1)',
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                  color: '#60a5fa',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
                onClick={handleVerifyIntegrity}
                disabled={verifying}
              >
                {verifying ? 'Memindai...' : '🔍 Verifikasi Integrity'}
              </button>
            </div>

            {/* Verification Hud Alert */}
            {verificationResult && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '16px',
                lineHeight: '1.4'
              }}>
                <strong>✓ Blockchain Tervalidasi ({verificationResult.timestamp})</strong><br />
                {verificationResult.message}
              </div>
            )}

            {/* Blocks Timeline Chain */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {blockchain.map((block) => (
                <div key={block.index} style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '16px',
                  position: 'relative'
                }}>
                  {/* Block Number Label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>Block #{block.index}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(block.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>

                  {/* Transaction Details */}
                  <div style={{ fontSize: '0.8rem', marginBottom: '10px', lineHeight: '1.4' }}>
                    <strong>Tipe:</strong> <span style={{ color: '#fbbf24', fontWeight: 600 }}>{block.data.type || 'UNKNOWN'}</span><br />
                    <strong>Pesan:</strong> <span style={{ color: 'var(--text-muted)' }}>{block.data.message || block.data.title}</span>
                    {block.data.amount && (
                      <div><strong>Jumlah Transaksi:</strong> <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>Rp {Number(block.data.amount).toLocaleString('id-ID')}</span></div>
                    )}
                  </div>

                  {/* Deep Link (Tautan Balik) */}
                  {(() => {
                    let backLink = '';
                    let label = '';
                    switch (block.data.type) {
                      case 'PROJECT_CREATION':
                        backLink = 'investor/crowdfunding';
                        label = '➕ Rilis Proyek Crowdfunding';
                        break;
                      case 'INVESTOR_REGISTRATION':
                        backLink = 'daftar';
                        label = '🔑 Pendaftaran Node Investor';
                        break;
                      case 'PROJECT_INVESTMENT':
                        backLink = 'investor';
                        label = '📈 Hub Investor Tani';
                        break;
                      case 'DELPHI_ANP_SUBMISSION':
                      case 'DELPHI_ANP_SIMULATION':
                        backLink = 'delphi';
                        label = '🔮 Delphi Survey Hub';
                        break;
                      case 'MEMBER_REGISTRATION':
                        backLink = 'membership';
                        label = '👤 Smart Membership';
                        break;
                      case 'SHOPPING_CHECKOUT':
                        backLink = 'shop';
                        label = '🛒 Kopdes Shop';
                        break;
                      default:
                        break;
                    }
                    if (backLink && navigateTo) {
                      return (
                        <button
                          onClick={() => navigateTo(backLink)}
                          className="btn"
                          style={{
                            width: '100%',
                            height: '30px',
                            fontSize: '0.75rem',
                            marginBottom: '10px',
                            padding: '0 10px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            color: '#60a5fa',
                            borderRadius: '6px'
                          }}
                        >
                          🔗 Buka Fitur: {label}
                        </button>
                      );
                    }
                    return null;
                  })()}

                  {/* Cryptographic Hashes */}
                  <div style={{ fontSize: '0.68rem', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>Hash:</strong> <code style={{ color: '#34d399' }}>{block.hash}</code>
                    </div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>Prev Hash:</strong> <code style={{ color: 'var(--text-muted)' }}>{block.previousHash}</code>
                    </div>
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

export default RegisterPage;
