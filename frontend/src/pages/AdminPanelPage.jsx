import React, { useState, useEffect } from 'react';

const AdminPanelPage = ({ apiBase, profile, logEcosystemActivity, navigateTo }) => {
  const [mainTab, setMainTab] = useState('operations'); // 'operations' | 'web3'
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockchain, setBlockchain] = useState([]);
  const [blockchainLoading, setBlockchainLoading] = useState(false);

  // Delphi creation form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('Sangat Layak, Layak, Cukup Layak, Belum Layak');
  const [newMaxRounds, setNewMaxRounds] = useState(3);

  // Facilitator Summary form state
  const [summaryText, setSummaryText] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [interveneMsg, setInterveneMsg] = useState('');

  /* ─────────────────── DATA FETCHING ─────────────────── */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`${apiBase}/delphi/active`);
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        setSurveys(result.data);
        const survey = result.data[0];
        setSelectedSurvey(survey);
        if (survey.currentRoundDetails) {
          const respRes = await fetch(`${apiBase}/delphi/results/${survey.currentRoundDetails.id}`);
          const respResult = await respRes.json();
          if (respResult.success) {
            setResponses(respResult.data);
          }
        }
      } else {
        setSurveys([]);
        setSelectedSurvey(null);
        setResponses([]);
      }

      const shipRes = await fetch(`${apiBase}/admin/supply-chain`);
      const shipResult = await shipRes.json();
      if (shipResult.success) {
        setShipments(shipResult.data);
      }

      const memRes = await fetch(`${apiBase}/membership/list`);
      const memResult = await memRes.json();
      if (memResult.success) {
        setMembers(memResult.data);
      }
    } catch (err) {
      setError('Gagal memuat data panel admin.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchain = async () => {
    setBlockchainLoading(true);
    try {
      const res = await fetch(`${apiBase}/investor/blockchain`);
      const data = await res.json();
      if (data.success) {
        setBlockchain((data.data || []).sort((a, b) => b.index - a.index));
      }
    } catch (err) {
      console.error('Gagal memuat data blockchain:', err);
    } finally {
      setBlockchainLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBase]);

  useEffect(() => {
    let interval;
    if (mainTab === 'web3') {
      fetchBlockchain();
      if (logEcosystemActivity) {
        logEcosystemActivity('ADMIN_WEB3_EXPLORER', 'Admin membuka Web3 Ledger Explorer', null, 'admin');
      }
      interval = setInterval(() => {
        fetchBlockchain();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mainTab]);

  /* ─────────────────── DELPHI HANDLERS ─────────────────── */

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    setActionMsg('');
    setError('');

    const optionsArray = newOptionsText.split(',').map(o => o.trim()).filter(o => o.length > 0).map((o, idx) => ({
      id: `opt${idx + 1}`,
      text: o
    }));

    if (optionsArray.length === 0) {
      alert('Pilihan jawaban minimal harus diisi satu.');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/admin/delphi/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          maxRounds: Number(newMaxRounds),
          questionText: newQuestion,
          options: optionsArray
        })
      });

      const result = await res.json();
      if (result.success) {
        setActionMsg('Survei Delphi Kelayakan Nasional berhasil diluncurkan!');
        setNewTitle('');
        setNewDescription('');
        setNewQuestion('');
        fetchData();
      } else {
        setError(result.error?.message || 'Gagal membuat survei baru.');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    }
  };

  const handleCloseRound = async (e) => {
    e.preventDefault();
    setActionMsg('');
    if (!summaryText.trim()) return;

    try {
      const res = await fetch(`${apiBase}/admin/delphi/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: selectedSurvey.id,
          roundNumber: selectedSurvey.current_round,
          summaryText: summaryText
        })
      });

      const result = await res.json();
      if (result.success) {
        setActionMsg(`Putaran ${selectedSurvey.current_round} berhasil ditutup. Ringkasan konsensus disimpan.`);
        setSummaryText('');
        fetchData();
      } else {
        setError(result.error?.message || 'Gagal menutup putaran.');
      }
    } catch (err) {
      setError('Gagal mengirim perintah penutupan.');
    }
  };

  const handleAdvanceRound = async () => {
    setActionMsg('');
    try {
      const res = await fetch(`${apiBase}/admin/delphi/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: selectedSurvey.id
        })
      });

      const result = await res.json();
      if (result.success) {
        setActionMsg(`Putaran berikutnya (${result.data.round_number}) berhasil dibuka!`);
        fetchData();
      } else {
        setError(result.error?.message || 'Gagal membuka putaran baru.');
      }
    } catch (err) {
      setError('Gagal membuka putaran baru di server.');
    }
  };

  const handleResetDelphi = async () => {
    if (!window.confirm('Apakah Anda yakin ingin me-reset data Delphi? Seluruh data survei aktif, putaran, dan respons ahli akan dihapus secara permanen.')) {
      return;
    }
    setActionMsg('');
    setError('');

    try {
      const res = await fetch(`${apiBase}/admin/delphi/reset`, {
        method: 'POST'
      });

      const result = await res.json();
      if (result.success) {
        setActionMsg('Konsensus Delphi berhasil dikosongkan.');
        setSurveys([]);
        setSelectedSurvey(null);
        setResponses([]);
        fetchData();
      } else {
        setError(result.error?.message || 'Gagal mengosongkan data Delphi.');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    }
  };

  const handleUpdateSupplyChain = async (id, newStatus) => {
    try {
      const res = await fetch(`${apiBase}/admin/supply-chain/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      alert('Gagal memperbarui status pengiriman.');
    }
  };

  const handleInterveneMember = async (memberId, updates) => {
    setInterveneMsg('');
    try {
      const res = await fetch(`${apiBase}/admin/members/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          ...updates
        })
      });

      const result = await res.json();
      if (result.success) {
        setInterveneMsg(`Berhasil memperbarui data anggota (${memberId})!`);
        
        const memRes = await fetch(`${apiBase}/membership/list`);
        const memResult = await memRes.json();
        if (memResult.success) {
          setMembers(memResult.data);
        }

        setTimeout(() => setInterveneMsg(''), 3000);
      } else {
        alert(result.error?.message || 'Gagal mengintervensi anggota.');
      }
    } catch (err) {
      alert('Gagal mengirim perintah intervensi.');
    }
  };

  /* ─────────────────── WEB3 HELPER FUNCTIONS ─────────────────── */

  const verifyChainIntegrity = () => {
    if (blockchain.length === 0) return false;
    const sorted = [...blockchain].sort((a, b) => a.index - b.index);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].previousHash !== sorted[i - 1].hash) return false;
    }
    return true;
  };

  const getBlockBacklink = (block) => {
    if (block.data?.link) return block.data.link;
    const type = block.data?.type || '';
    const typeMap = {
      'DASHBOARD_ACCESS': 'dashboard',
      'MEMBER_REGISTRATION': 'membership',
      'MEMBERSHIP_PROFILE_LOAD': 'membership',
      'P2P_TRANSFER': 'pay',
      'SHU_CASHOUT': 'pay',
      'QRIS_PAYMENT': 'pay',
      'SHOP_ADD_TO_CART': 'shop',
      'SHOPPING_CHECKOUT': 'shop',
      'SHOP_CLEAR_CART': 'shop',
      'PRODUCT_MANAGEMENT_ACTION': 'products',
      'COMMODITY_EXCHANGE_TRADE': 'exchange',
      'COMMODITY_EXCHANGE_BID': 'exchange',
      'PROJECT_INVESTMENT': 'investor',
      'PROJECT_CREATION': 'investor/crowdfunding',
      'INVESTOR_REGISTRATION': 'daftar',
      'LEDGER_KEY_GENERATION': 'daftar',
      'SAVINGS_DEPOSIT': 'finance',
      'LOAN_APPLICATION': 'finance',
      'GOVERNANCE_VOTE': 'governance',
      'GOVERNANCE_REPORT': 'governance',
      'DELPHI_ANP_SUBMISSION': 'delphi',
      'DELPHI_ANP_SIMULATION': 'delphi',
      'DELPHI_ANP_RESET': 'delphi',
      'ADMIN_WEB3_EXPLORER': 'admin',
    };
    return typeMap[type] || null;
  };

  const getActorDashboardLink = (block) => {
    const type = block.data?.type || '';
    const investorTypes = ['PROJECT_INVESTMENT', 'PROJECT_CREATION', 'INVESTOR_REGISTRATION', 'LEDGER_KEY_GENERATION'];
    if (investorTypes.includes(type)) return 'dashboard/investor';
    return 'dashboard/anggota';
  };

  const getBlockTypeLabel = (type) => {
    const labels = {
      'GENESIS': '🌱 Genesis Block',
      'DASHBOARD_ACCESS': '📊 Akses Dashboard',
      'MEMBER_REGISTRATION': '👤 Registrasi Anggota',
      'MEMBERSHIP_PROFILE_LOAD': '🪪 Muat Profil E-KTA',
      'P2P_TRANSFER': '💸 Transfer P2P',
      'SHU_CASHOUT': '💰 Cairkan SHU',
      'QRIS_PAYMENT': '📱 Bayar QRIS',
      'SHOP_ADD_TO_CART': '🛒 Keranjang Belanja',
      'SHOPPING_CHECKOUT': '🧾 Checkout Toko',
      'PRODUCT_MANAGEMENT_ACTION': '📦 Kelola Produk',
      'COMMODITY_EXCHANGE_TRADE': '📈 Trade Komoditas',
      'COMMODITY_EXCHANGE_BID': '📊 Bid Komoditas',
      'PROJECT_INVESTMENT': '💎 Investasi Proyek',
      'PROJECT_CREATION': '🚀 Rilis Proyek',
      'INVESTOR_REGISTRATION': '🔑 Registrasi Investor',
      'LEDGER_KEY_GENERATION': '🔐 Generate Kunci',
      'SAVINGS_DEPOSIT': '🏦 Setor Simpanan',
      'LOAN_APPLICATION': '📋 Ajukan Pinjaman',
      'GOVERNANCE_VOTE': '🗳️ Voting RAT',
      'GOVERNANCE_REPORT': '📝 Laporan Aspirasi',
      'DELPHI_ANP_SUBMISSION': '🔮 Submit Delphi',
      'DELPHI_ANP_SIMULATION': '⚡ Simulasi ANP',
      'DELPHI_ANP_RESET': '🗑️ Reset Delphi',
      'ADMIN_WEB3_EXPLORER': '⛓️ Web3 Explorer',
    };
    return labels[type] || `📌 ${type}`;
  };

  const getBlockTypeColor = (type) => {
    if (type === 'GENESIS') return '#f59e0b';
    if (type?.includes('INVEST') || type?.includes('PROJECT')) return '#a78bfa';
    if (type?.includes('SHOP') || type?.includes('PRODUCT') || type?.includes('COMMODITY')) return '#34d399';
    if (type?.includes('DELPHI') || type?.includes('GOVERNANCE')) return '#f472b6';
    if (type?.includes('TRANSFER') || type?.includes('PAYMENT') || type?.includes('CASHOUT') || type?.includes('SAVINGS') || type?.includes('LOAN')) return '#60a5fa';
    if (type?.includes('MEMBER') || type?.includes('REGISTRATION')) return '#22d3ee';
    if (type?.includes('DASHBOARD')) return '#fbbf24';
    return '#94a3b8';
  };

  const truncHash = (hash) => hash ? hash.substring(0, 10) + '...' + hash.substring(hash.length - 6) : '—';

  /* ─────────────────── ACCESS CHECK ─────────────────── */

  if (!profile || profile.status !== 'Admin Koperasi') {
    return (
      <div className="glass-card animate-fade" style={{ padding: '40px', maxWidth: '520px', margin: '40px auto', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔒</div>
        <h3 style={{ fontSize: '1.4rem', color: '#f87171', fontWeight: 700, marginBottom: '12px' }}>Akses Khusus Admin Koperasi</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
          Halaman ini berisi data konfidensial peramalan Delphi, log logistik Rantai Pasok, dan Papan Intervensi Saldo Anggota. Silakan gunakan Portal untuk login sebagai Admin.
        </p>
      </div>
    );
  }

  /* ─────────────────── WEB3 EXPLORER RENDERER ─────────────────── */

  const renderWeb3Explorer = () => {
    const chainValid = verifyChainIntegrity();
    const totalBlocks = blockchain.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ── Blockchain Network Metrics ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '14px'
        }}>
          {/* SHA-256 */}
          <div className="glass-card" style={{
            padding: '18px 16px',
            borderTop: '3px solid #60a5fa',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '3.5rem', opacity: 0.04, pointerEvents: 'none' }}>🔐</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Hashing Algorithm</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-heading)' }}>SHA-256</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cryptographic Hash Function</div>
          </div>

          {/* Consensus */}
          <div className="glass-card" style={{
            padding: '18px 16px',
            borderTop: '3px solid #34d399',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '3.5rem', opacity: 0.04, pointerEvents: 'none' }}>🤝</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Consensus Protocol</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>PoGR</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Proof of Gotong Royong</div>
          </div>

          {/* Validator Nodes */}
          <div className="glass-card" style={{
            padding: '18px 16px',
            borderTop: '3px solid #a78bfa',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '3.5rem', opacity: 0.04, pointerEvents: 'none' }}>🖥️</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Validator Nodes</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'var(--font-heading)' }}>2 Aktif</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Gayo G-1 • Cianjur G-2</div>
          </div>

          {/* Gas Fee */}
          <div className="glass-card" style={{
            padding: '18px 16px',
            borderTop: '3px solid #f59e0b',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '3.5rem', opacity: 0.04, pointerEvents: 'none' }}>⛽</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Gas Fee (Biaya Transaksi)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>Rp 0</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Zero-Cost Gotong Royong</div>
          </div>
        </div>

        {/* ── ZKP Integrity Validator ── */}
        <div className="glass-card" style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: `4px solid ${chainValid ? '#10b981' : '#ef4444'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: chainValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${chainValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }} className="pulse-glow">
              {chainValid ? '🛡️' : '⚠️'}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>Zero-Knowledge Proof Validator</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Status: <strong style={{ color: chainValid ? '#34d399' : '#f87171' }}>
                  {chainValid ? 'ZKP-Tuntas ✓ Rantai Tervalidasi' : '⚠ Integritas Rantai Bermasalah'}
                </strong>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>{totalBlocks}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Total Blok</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>{totalBlocks > 0 ? totalBlocks - 1 : 0}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Transaksi</div>
            </div>
            <button
              className="btn btn-green"
              style={{ padding: '8px 16px', fontSize: '0.8rem', height: '36px', cursor: 'pointer' }}
              onClick={() => fetchBlockchain()}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* ── Block Timeline ── */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📜 Rantai Blok SHA-256 Event Log</span>
            <span className="badge badge-blue">{totalBlocks} blocks</span>
          </h3>

          {blockchainLoading ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }} className="animate-float">⛓️</div>
              <div style={{ color: 'var(--text-muted)' }}>Memuat rantai blok dari ledger...</div>
            </div>
          ) : blockchain.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
              <div style={{ color: 'var(--text-muted)' }}>Belum ada blok tercatat di ledger.</div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Vertical chain line */}
              <div style={{
                position: 'absolute',
                left: '22px',
                top: '20px',
                bottom: '20px',
                width: '2px',
                background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.4), rgba(139, 92, 246, 0.2), rgba(37, 99, 235, 0.1))',
                zIndex: 0
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
                {blockchain.map((block, idx) => {
                  const type = block.data?.type || 'UNKNOWN';
                  const typeColor = getBlockTypeColor(type);
                  const backlink = getBlockBacklink(block);
                  const actorLink = getActorDashboardLink(block);
                  const isGenesis = type === 'GENESIS';

                  return (
                    <div key={block.index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {/* Chain node dot */}
                      <div style={{
                        width: '44px',
                        minWidth: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: `${typeColor}18`,
                        border: `2px solid ${typeColor}50`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        color: typeColor,
                        fontFamily: 'var(--font-heading)',
                        flexShrink: 0
                      }}>
                        #{block.index}
                      </div>

                      {/* Block card */}
                      <div className="glass-card" style={{
                        flex: 1,
                        padding: '16px 18px',
                        borderLeft: `3px solid ${typeColor}`,
                        transition: 'all 0.2s ease'
                      }}>
                        {/* Top row: type + timestamp */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: typeColor,
                            fontFamily: 'var(--font-heading)'
                          }}>
                            {getBlockTypeLabel(type)}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {new Date(block.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })}
                          </span>
                        </div>

                        {/* Message */}
                        <div style={{
                          fontSize: '0.82rem',
                          color: '#cbd5e1',
                          marginBottom: '10px',
                          lineHeight: '1.5'
                        }}>
                          {block.data?.message || '—'}
                        </div>

                        {/* Actor info */}
                        {block.data?.memberName && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span>👤 <strong style={{ color: '#f8fafc' }}>{block.data.memberName}</strong></span>
                            {block.data?.memberId && <span style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>ID: {block.data.memberId}</span>}
                            {block.data?.amount && (
                              <span style={{ color: '#34d399', fontWeight: 700 }}>
                                Rp {Number(block.data.amount).toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Hash display */}
                        <div style={{
                          background: 'rgba(0,0,0,0.3)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          marginBottom: '10px',
                          border: '1px solid rgba(255,255,255,0.04)'
                        }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>HASH  </span>
                            <span style={{ color: '#34d399', wordBreak: 'break-all' }}>{truncHash(block.hash)}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>PREV  </span>
                            <span style={{ color: '#60a5fa', wordBreak: 'break-all' }}>{truncHash(block.previousHash)}</span>
                          </div>
                        </div>

                        {/* Action buttons row */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Verification badge */}
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            ✓ SHA-256 Valid
                          </span>

                          {/* Feature backlink */}
                          {backlink && !isGenesis && navigateTo && (
                            <button
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                background: `${typeColor}15`,
                                color: typeColor,
                                border: `1px solid ${typeColor}30`,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => navigateTo(backlink)}
                              onMouseOver={(e) => { e.currentTarget.style.background = `${typeColor}30`; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = `${typeColor}15`; }}
                            >
                              🔗 Buka Fitur
                            </button>
                          )}

                          {/* Actor dashboard backlink */}
                          {!isGenesis && block.data?.memberName && navigateTo && (
                            <button
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                background: 'rgba(251, 191, 36, 0.1)',
                                color: '#fbbf24',
                                border: '1px solid rgba(251, 191, 36, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => navigateTo(actorLink)}
                              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(251, 191, 36, 0.25)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'; }}
                            >
                              👤 Dashboard {actorLink.includes('investor') ? 'Investor' : 'Anggota'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ─────────────────── OPERATIONS TAB RENDERER ─────────────────── */

  const renderOperationsTab = () => (
    <>
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          color: '#fca5a5',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>{error}</div>
      )}

      {actionMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid var(--primary-green)',
          color: '#34d399',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: 600
        }}>{actionMsg}</div>
      )}

      {/* Grid of Main Admin controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Box: Delphi Survey Facilitator Controller */}
        <div className="glass-card" style={{ padding: '24px' }}>
          {selectedSurvey ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Fasilitator Jajak Pendapat Delphi</h3>
                <span className="badge badge-purple">Putaran {selectedSurvey.current_round}</span>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedSurvey.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Status Putaran: <strong>{selectedSurvey.currentRoundDetails?.status || 'Ditutup'}</strong>
                  </div>
                </div>
                <button
                  className="btn"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleResetDelphi}
                >
                  🗑️ Kosongkan Data
                </button>
              </div>

              {/* Responses List from Experts */}
              <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
                Justifikasi Masuk Dari Kementerian &amp; OJK ({responses.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                {responses.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belum ada panelis yang menyetor analisis suara pada round ini.</div>
                ) : (
                  responses.map((resp) => (
                    <div key={resp.id} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary-green)' }}>👤 {resp.member_name}</span>
                        <span style={{ color: '#60a5fa' }}>Pilihan: {
                          selectedSurvey.currentRoundDetails?.options.find(o => o.id === resp.selected_option)?.text || resp.selected_option
                        }</span>
                      </div>
                      <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '4px' }}>"{resp.justification_text}"</div>
                    </div>
                  ))
                )}
              </div>

              {/* Facilitator Action Forms */}
              {selectedSurvey.currentRoundDetails?.status === 'open' ? (
                <form onSubmit={handleCloseRound} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                  <div className="form-group">
                    <label>Form Ringkasan Konsensus Ahli</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Tuliskan simpulan justifikasi hukum/teknologi di atas untuk bahan evaluasi putaran berikutnya.
                    </p>
                    <textarea
                      className="form-control"
                      placeholder="Contoh: Mayoritas kementerian menilai layak dengan uji coba terbatas regulasi..."
                      rows="3"
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-green" style={{ width: '100%', height: '36px', fontWeight: 700, cursor: 'pointer' }}>
                    Tutup Putaran &amp; Ringkas Konsensus
                  </button>
                </form>
              ) : selectedSurvey.current_round < selectedSurvey.max_rounds ? (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Putaran {selectedSurvey.current_round} telah ditutup. Silakan buka putaran evaluasi berikutnya.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', height: '36px', fontWeight: 700, cursor: 'pointer' }}
                    onClick={handleAdvanceRound}
                  >
                    Buka Putaran Selanjutnya (Round {selectedSurvey.current_round + 1})
                  </button>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 700, marginBottom: '10px' }}>
                    ✓ Survei Delphi telah mencapai putaran akhir ({selectedSurvey.max_rounds}/{selectedSurvey.max_rounds}).
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Konsensus kelayakan nasional para pakar berhasil dirangkum.
                  </p>
                  <button
                    type="button"
                    className="btn"
                    style={{ width: '100%', height: '36px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700, cursor: 'pointer' }}
                    onClick={handleResetDelphi}
                  >
                    🗑️ Mulai Survei Baru dari Awal
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Create New Survey Form (Kosongan State) */
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '10px' }}>Buat Delphi Survey Baru</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.4', marginBottom: '16px' }}>
                Belum ada Delphi Survey yang aktif. Silakan buat survei baru di bawah ini untuk memulai konsensus kemitraan pakar (Kemenkop, Kemenristek, OJK).
              </p>
              
              <form onSubmit={handleCreateSurvey} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Judul Jajak Pendapat</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Uji Kelayakan Nasional Platform Kopdes AI"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deskripsi Evaluasi</label>
                  <textarea
                    className="form-control"
                    placeholder="Tuliskan latar belakang uji kelayakan ini..."
                    rows="2"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pertanyaan Putaran 1</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Seberapa layak ekosistem digital Kopdes AI V3.0 diterapkan secara nasional?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pilihan Jawaban (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Sangat Layak, Layak, Cukup Layak, Belum Layak"
                    value={newOptionsText}
                    onChange={(e) => setNewOptionsText(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maksimal Putaran (Rounds)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="2"
                    max="5"
                    value={newMaxRounds}
                    onChange={(e) => setNewMaxRounds(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-purple" style={{ height: '36px', fontWeight: 700, marginTop: '6px', cursor: 'pointer' }}>
                  🚀 Luncurkan Delphi Survey
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Box: Smart Supply Chain Tracking Control */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚚 Smart Supply Chain (V2.0)</span>
            <span className="badge badge-blue">Gudang Koperasi</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shipments.map((ship) => (
              <div key={ship.id} style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ship.id}</span>
                  <select
                    className="form-control"
                    style={{
                      width: '130px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      background: '#0e1423',
                      height: '28px'
                    }}
                    value={ship.status}
                    onChange={(e) => handleUpdateSupplyChain(ship.id, e.target.value)}
                  >
                    <option value="Gudang">📦 Gudang</option>
                    <option value="Pengiriman">🚛 Pengiriman</option>
                    <option value="Distribusi">🏪 Distribusi</option>
                    <option value="Selesai">✓ Selesai</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{ship.productName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Tujuan: {ship.destination}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{ship.quantity}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Status: <span style={{ color: ship.status === 'Selesai' ? 'var(--primary-green)' : '#f59e0b', fontWeight: 700 }}>{ship.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MEMBER INTERVENTION CONTROL BOARD */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '30px', width: '100%' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🛠️ Papan Intervensi Anggota (Control Board)</span>
          <span className="badge badge-purple">Admin Power</span>
        </h3>

        {interveneMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--primary-green)',
            color: '#34d399',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>{interveneMsg}</div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 8px' }}>ID Anggota</th>
                <th style={{ padding: '12px 8px' }}>Nama Lengkap</th>
                <th style={{ padding: '12px 8px' }}>Email</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px' }}>Saldo Kopdes Pay</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Tindakan Intervensi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{m.id}</td>
                  <td style={{ padding: '12px 8px' }}>{m.name}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{m.email}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={`badge ${m.status === 'Anggota Aktif' ? 'badge-green' : m.status === 'Ditangguhkan' ? 'badge-red' : 'badge-blue'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--primary-green)' }}>
                    Rp {Number(m.balance).toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        className="form-control"
                        style={{
                          width: '130px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          background: '#0e1423',
                          height: '28px',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        value={m.status}
                        onChange={(e) => handleInterveneMember(m.id, { status: e.target.value })}
                      >
                        <option value="Anggota Aktif">Anggota Aktif</option>
                        <option value="Calon Anggota">Calon Anggota</option>
                        <option value="Ditangguhkan">Ditangguhkan</option>
                      </select>

                      <button
                        className="btn btn-green"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', height: '28px' }}
                        onClick={() => handleInterveneMember(m.id, { balance: Number(m.balance) + 500000 })}
                      >
                        + bantuan BLT (Rp 500K)
                      </button>

                      <button
                        className="btn"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', height: '28px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        onClick={() => handleInterveneMember(m.id, { balance: Math.max(0, Number(m.balance) - 200000) })}
                      >
                        - denda (Rp 200K)
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  /* ─────────────────── MEMBERS TAB RENDERER ─────────────────── */
  
  const renderMembersTab = () => {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', margin: 0 }}>Daftar Anggota Koperasi (Identity View)</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: '#f9fafb', color: '#4b5563' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid #e5e7eb' }}>ID Anggota</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid #e5e7eb' }}>Nama</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid #e5e7eb' }}>Peran / Role</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid #e5e7eb' }}>Status Verifikasi</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid #e5e7eb' }}>Akses Publik</th>
              </tr>
            </thead>
            <tbody style={{ color: '#0f172a' }}>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>Tidak ada anggota.</td>
                </tr>
              ) : (
                members.map((mem) => (
                  <tr key={mem.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1rem' }}>{mem.id}</td>
                    <td style={{ padding: '1rem' }}>{mem.name}</td>
                    <td style={{ padding: '1rem' }}>{mem.status}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: '#15803d', fontWeight: 600 }}>Terverifikasi</span>
                    </td>
                    <td style={{ padding: '1rem' }}>Terbatas</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ─────────────────── MAIN RENDER ─────────────────── */

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Panel Admin Koperasi (V2.0)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Alat Kontrol Pengurus: Fasilitasi Delphi, Monitoring Rantai Pasok, Intervensi Anggota, &amp; Web3 Ledger Explorer.</p>
      </div>

      {/* ── Tab Selector ── */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'rgba(0,0,0,0.3)',
        padding: '4px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <button
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: mainTab === 'operations' ? 700 : 500,
            fontSize: '0.85rem',
            fontFamily: 'var(--font-heading)',
            background: mainTab === 'operations' ? 'rgba(255,255,255,0.07)' : 'transparent',
            color: mainTab === 'operations' ? '#f8fafc' : 'var(--text-muted)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={() => setMainTab('operations')}
        >
          <span>⚙️</span> Operational Control
        </button>
        <button
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: mainTab === 'web3' ? 700 : 500,
            fontSize: '0.85rem',
            fontFamily: 'var(--font-heading)',
            background: mainTab === 'web3' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(37, 99, 235, 0.12))' : 'transparent',
            color: mainTab === 'web3' ? '#a78bfa' : 'var(--text-muted)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: mainTab === 'web3' ? '0 0 20px rgba(139, 92, 246, 0.1)' : 'none'
          }}
          onClick={() => setMainTab('web3')}
        >
          <span>⛓️</span> Web3 Ledger Explorer
        </button>

        <button
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: mainTab === 'members' ? 700 : 500,
            fontSize: '0.85rem',
            fontFamily: 'var(--font-heading)',
            background: mainTab === 'members' ? 'rgba(255,255,255,0.07)' : 'transparent',
            color: mainTab === 'members' ? '#f8fafc' : 'var(--text-muted)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={() => setMainTab('members')}
        >
          <span>👥</span> Daftar Anggota
        </button>
      </div>

      {/* ── Tab Content ── */}
      {mainTab === 'operations' && renderOperationsTab()}
      {mainTab === 'web3' && renderWeb3Explorer()}
      {mainTab === 'members' && renderMembersTab()}
    </div>
  );
};

export default AdminPanelPage;
