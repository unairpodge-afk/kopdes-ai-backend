import React, { useState, useEffect } from 'react';

const GovernancePage = ({ apiBase, profile, logEcosystemActivity }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [rightTab, setRightTab] = useState('announcements'); // 'announcements' | 'news'

  // Report Form state
  const [category, setCategory] = useState('Aspirasi');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [reportMsg, setReportMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch announcements
      try {
        const announceRes = await fetch(`${apiBase}/governance/announcements`);
        const announceData = await announceRes.json();
        if (announceData.success) {
          setAnnouncements(announceData.data || []);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }

      // Fetch votings
      try {
        const voteRes = await fetch(`${apiBase}/governance/votings`);
        const voteData = await voteRes.json();
        if (voteData.success) {
          setVotings(voteData.data || []);
        }
      } catch (err) {
        console.error('Error fetching votings:', err);
      }

      // Fetch Google News
      setNewsLoading(true);
      try {
        const newsRes = await fetch(`${apiBase}/governance/news`);
        const newsData = await newsRes.json();
        if (newsData.success) {
          setNews(newsData.data || []);
        }
      } catch (err) {
        console.error('Error fetching cooperative news:', err);
      } finally {
        setNewsLoading(false);
      }
    } catch (err) {
      setError('Gagal menghubungi backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBase]);

  const handleVote = async (votingId, optionId) => {
    try {
      const res = await fetch(`${apiBase}/governance/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          votingId,
          optionId,
          memberId: '1205 2024 0001' // Default Budi Santoso
        })
      });

      const result = await res.json();
      if (result.success) {
        // Refresh votings to show updated counts
        fetchData();
        if (logEcosystemActivity) logEcosystemActivity('GOVERNANCE_VOTE', 'Suara berhasil diberikan pada voting RAT', null, 'governance');
      } else {
        alert(result.error?.message || 'Gagal menyimpan suara Anda.');
      }
    } catch (err) {
      alert('Gagal mengirimkan suara ke server.');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportMsg('');
    setError('');

    try {
      const res = await fetch(`${apiBase}/governance/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: '1205 2024 0001',
          category,
          subject,
          content
        })
      });

      const result = await res.json();
      if (result.success) {
        setReportMsg('Laporan pengaduan berhasil terkirim dan sedang diproses.');
        setSubject('');
        setContent('');
        if (logEcosystemActivity) logEcosystemActivity('GOVERNANCE_REPORT', 'Laporan aspirasi warga berhasil dikirim', null, 'governance');
      } else {
        setError(result.error?.message || 'Pengiriman laporan gagal.');
      }
    } catch (err) {
      setError('Gagal mengirim laporan ke server.');
    }
  };

  if (loading && announcements.length === 0) {
    return <div style={{ color: 'var(--text-muted)' }}>Memuat Governance Hub...</div>;
  }

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Governance Hub</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sarana penyampaian aspirasi, transparansi pengumuman pengurus, dan pemilihan suara elektronik.</p>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Side: Votings and Aspirasi Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* E-Voting Polls */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗳️ Pemilihan Suara Elektronik</span>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Aktif</span>
            </h3>

            {votings.map((poll) => {
              const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
              const hasVoted = poll.votedMembers.includes('1205 2024 0001');

              return (
                <div key={poll.id} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>{poll.title}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{poll.description}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {poll.options.map((opt) => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} style={{ position: 'relative', width: '100%' }}>
                          {hasVoted ? (
                            // Show Results Screen
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '12px',
                              overflow: 'hidden',
                              position: 'relative'
                            }}>
                              {/* Percentage bar loader */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: `${pct}%`,
                                background: opt.id === 'opt1' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                zIndex: 0
                              }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', position: 'relative', zIndex: 1, fontWeight: opt.id === 'opt1' ? 700 : 500 }}>
                                <span>{opt.text}</span>
                                <span>{opt.votes} Suara ({pct}%)</span>
                              </div>
                            </div>
                          ) : (
                            // Show Action Buttons to Vote
                            <button
                              className="btn btn-outline"
                              style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.85rem', padding: '12px' }}
                              onClick={() => handleVote(poll.id, opt.id)}
                            >
                              <span>{opt.text}</span>
                              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Pilih →</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span>Total Partisipasi: <strong>{totalVotes} Anggota</strong></span>
                    {hasVoted && <span style={{ color: 'var(--primary-green)', fontWeight: 600 }}>✓ Suara Anda telah tercatat</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aspirasi Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Formulir Aspirasi & Pengaduan</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label>Jenis Laporan</label>
                <select
                  className="form-control"
                  style={{ background: '#0e1423' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Aspirasi">Aspirasi / Usulan Kebijakan</option>
                  <option value="Pengaduan">Pengaduan / Laporan Masalah</option>
                  <option value="Kritik">Kritik & Saran</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subjek Laporan</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Perbaikan irigasi sawah desa"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Detail Laporan</label>
                <textarea
                  className="form-control"
                  placeholder="Jelaskan secara mendetail usulan atau pengaduan Anda..."
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {reportMsg && (
                <div style={{ color: 'var(--primary-green)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                  {reportMsg}
                </div>
              )}

              <button type="submit" className="btn btn-green" style={{ width: '100%' }}>
                Kirim Laporan
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Announcements & News Tabs */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <button
              onClick={() => setRightTab('announcements')}
              className="btn"
              style={{
                flex: 1,
                fontSize: '0.8rem',
                padding: '8px',
                borderRadius: '8px',
                background: rightTab === 'announcements' ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: rightTab === 'announcements' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              📢 Pengumuman
            </button>
            <button
              onClick={() => setRightTab('news')}
              className="btn"
              style={{
                flex: 1,
                fontSize: '0.8rem',
                padding: '8px',
                borderRadius: '8px',
                background: rightTab === 'news' ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: rightTab === 'news' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              📰 Berita Terupdate
            </button>
          </div>

          {rightTab === 'announcements' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {announcements.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>Belum ada pengumuman resmi.</div>
              ) : (
                announcements.map((item) => (
                  <div key={item.id} style={{
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📅 {new Date(item.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: '0.6rem' }}>{item.author}</span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#e2e8f0' }}>{item.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>{item.content}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {newsLoading && news.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }} className="animate-spin">🔄</div>
                  Mengambil berita koperasi terhangat...
                </div>
              ) : news.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>Gagal memuat berita saat ini.</div>
              ) : (
                news.map((item, idx) => (
                  <div key={idx} style={{
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        📅 {item.pubDate ? new Date(item.pubDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Baru saja'}
                      </span>
                      <span className="badge badge-green" style={{ fontSize: '0.62rem', fontWeight: 700 }}>{item.source}</span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: '#f1f5f9', lineHeight: '1.4' }}>{item.title}</h4>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        color: '#60a5fa', 
                        fontSize: '0.78rem', 
                        fontWeight: 600, 
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                    >
                      Baca Selengkapnya <span>↗</span>
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernancePage;
