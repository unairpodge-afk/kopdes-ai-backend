import React, { useState, useEffect } from 'react';

const DelphiSurveyPage = ({ apiBase, profile, navigateTo }) => {
  const [anpResponses, setAnpResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Active expert selected to fill the survey as
  const [selectedExpertId, setSelectedExpertId] = useState('');
  
  // Saaty Pairwise comparisons state
  // c1: Kesiapan Teknologi, c2: Kepatuhan Regulasi, c3: Dampak Ekonomi, c4: Keamanan Data & IoT
  // Values: positive = left is more important, 1 = equal, negative = right is more important
  const [comparisons, setComparisons] = useState({
    c1_c2: 1,
    c1_c3: 1,
    c1_c4: 1,
    c2_c3: 1,
    c2_c4: 1,
    c3_c4: 1
  });

  const [submitMsg, setSubmitMsg] = useState('');
  const [submitErr, setSubmitErr] = useState('');
  const [simulating, setSimulating] = useState(false);

  // List of the 13 Target Experts representing crucial regulators and stakeholders
  const targetExperts = [
    { id: "EXP-01", name: "Dr. Ir. Mulyadi", institution: "Kemenkop & UKM", role: "Pakar Kelembagaan" },
    { id: "EXP-02", name: "Bambang Prasetyo, M.B.A", institution: "Otoritas Jasa Keuangan (OJK)", role: "Pakar Compliance" },
    { id: "EXP-03", name: "Prof. Dian Lestari", institution: "BRIN / Kemenristek", role: "Pakar AI & Deep Learning" },
    { id: "EXP-04", name: "Dr. Haryono", institution: "Kementerian Pertanian", role: "Kebijakan Pangan" },
    { id: "EXP-05", name: "Prof. Yusuf", institution: "Institut Pertanian Bogor (IPB)", role: "Ekonomi Agro" },
    { id: "EXP-06", name: "Siti Rahma, Ph.D", institution: "Institut Teknologi Bandung (ITB)", role: "Sistem IoT Perdesaan" },
    { id: "EXP-07", name: "Achmad Kalla", institution: "KADIN Indonesia", role: "Pelaku Agribisnis Gayo" },
    { id: "EXP-08", name: "Dr. Sri Mulyani", institution: "Bank Indonesia", role: "Keuangan Inklusif" },
    { id: "EXP-09", name: "Hendro, M.T", institution: "Kemenkominfo", role: "Jaringan & Seluler Desa" },
    { id: "EXP-10", name: "Prof. Hermansyah", institution: "Universitas Syiah Kuala (USK)", role: "Kearifan Lokal Gayo" },
    { id: "EXP-11", name: "Dewi Sartika", institution: "LSM Pemberdayaan Koperasi", role: "Kesejahteraan Petani" },
    { id: "EXP-12", name: "Budi Utomo, M.Sc", institution: "Pakar Keamanan Siber", comp: "Audit IT & Smart Contract" },
    { id: "EXP-13", name: "Indra Wijaya", institution: "OJK Inovasi Keuangan Digital", role: "Sandboxing & Fintech" }
  ];

  const pairwiseItems = [
    { key: 'c1_c2', left: 'c1', right: 'c2', labelLeft: '💻 Kesiapan Teknologi', labelRight: '⚖️ Kepatuhan Regulasi' },
    { key: 'c1_c3', left: 'c1', right: 'c3', labelLeft: '💻 Kesiapan Teknologi', labelRight: '🌾 Dampak Ekonomi' },
    { key: 'c1_c4', left: 'c1', right: 'c4', labelLeft: '💻 Kesiapan Teknologi', labelRight: '🛡️ Keamanan Data & IoT' },
    { key: 'c2_c3', left: 'c2', right: 'c3', labelLeft: '⚖️ Kepatuhan Regulasi', labelRight: '🌾 Dampak Ekonomi' },
    { key: 'c2_c4', left: 'c2', right: 'c4', labelLeft: '⚖️ Kepatuhan Regulasi', labelRight: '🛡️ Keamanan Data & IoT' },
    { key: 'c3_c4', left: 'c3', right: 'c4', labelLeft: '🌾 Dampak Ekonomi', labelRight: '🛡️ Keamanan Data & IoT' }
  ];

  const saatyValues = [
    { val: 9, label: '9 (Mutlak)', desc: 'Mutlak Lebih Penting' },
    { val: 7, label: '7 (Sangat)', desc: 'Sangat Lebih Penting' },
    { val: 5, label: '5 (Lebih)', desc: 'Lebih Penting' },
    { val: 3, label: '3 (Sedikit)', desc: 'Sedikit Lebih Penting' },
    { val: 1, label: '1 (Sama)', desc: 'Sama Penting' },
    { val: -3, label: '3 (Sedikit)', desc: 'Sedikit Lebih Penting' },
    { val: -5, label: '5 (Lebih)', desc: 'Lebih Penting' },
    { val: -7, label: '7 (Sangat)', desc: 'Sangat Lebih Penting' },
    { val: -9, label: '9 (Mutlak)', desc: 'Mutlak Lebih Penting' }
  ];

  const fetchAnpResponses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${apiBase}/delphi/anp/responses`);
      const result = await res.json();
      if (result.success) {
        setAnpResponses(result.data || []);
      } else {
        setError('Gagal memuat matriks ANP.');
      }
    } catch (err) {
      setError('Gagal terhubung dengan server API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnpResponses();
  }, [apiBase]);

  const handleSelectExpert = (e) => {
    const expId = e.target.value;
    setSelectedExpertId(expId);
    setSubmitMsg('');
    setSubmitErr('');

    // Pre-populate if expert has already submitted
    const existing = anpResponses.find(r => r.member_id === expId);
    if (existing) {
      setComparisons(existing.comparisons);
    } else {
      setComparisons({
        c1_c2: 1,
        c1_c3: 1,
        c1_c4: 1,
        c2_c3: 1,
        c2_c4: 1,
        c3_c4: 1
      });
    }
  };

  const handleComparisonChange = (key, val) => {
    setComparisons(prev => ({
      ...prev,
      [key]: Number(val)
    }));
  };

  const handleSubmitMatrix = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    setSubmitErr('');

    if (!selectedExpertId) {
      setSubmitErr('Harap pilih identitas pakar terlebih dahulu.');
      return;
    }

    const expertObj = targetExperts.find(exp => exp.id === selectedExpertId);

    try {
      const res = await fetch(`${apiBase}/delphi/anp/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedExpertId,
          memberName: expertObj.name,
          institution: expertObj.institution,
          comparisons
        })
      });

      const result = await res.json();
      if (result.success) {
        setSubmitMsg(`Matriks perbandingan untuk ${expertObj.name} berhasil disimpan!`);
        fetchAnpResponses();
      } else {
        setSubmitErr(result.error?.message || result.message || 'Gagal mengirim respons.');
      }
    } catch (err) {
      setSubmitErr('Gagal mengirim data ke server.');
    }
  };

  const handleSimulate13 = async () => {
    setSimulating(true);
    setSubmitMsg('');
    setSubmitErr('');
    try {
      const res = await fetch(`${apiBase}/delphi/anp/simulate`, {
        method: 'POST'
      });
      const result = await res.json();
      if (result.success) {
        setSubmitMsg('Simulasi pengisian 13 pakar berhasil diaktifkan!');
        fetchAnpResponses();
      } else {
        setSubmitErr('Gagal mengaktifkan simulasi.');
      }
    } catch (err) {
      setSubmitErr('Gagal terhubung dengan server.');
    } finally {
      setSimulating(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengosongkan seluruh data pengisian ANP pakar?')) {
      return;
    }
    try {
      const res = await fetch(`${apiBase}/delphi/anp/reset`, {
        method: 'POST'
      });
      const result = await res.json();
      if (result.success) {
        setSubmitMsg('Seluruh data Saaty pakar berhasil dibersihkan.');
        setSelectedExpertId('');
        setComparisons({
          c1_c2: 1,
          c1_c3: 1,
          c1_c4: 1,
          c2_c3: 1,
          c2_c4: 1,
          c3_c4: 1
        });
        fetchAnpResponses();
      }
    } catch (err) {
      alert('Gagal membersihkan data.');
    }
  };

  // Export Matrix Data to CSV for Delphi-ANP Software input
  const handleExportCSV = () => {
    if (anpResponses.length === 0) {
      alert('Tidak ada data pakar untuk diekspor.');
      return;
    }

    // Saaty Matrix CSV formatting: Include raw preference integers and standard reciprocal float values for calculations
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Expert ID,Expert Name,Institution,C1_C2 (Raw),C1_C3 (Raw),C1_C4 (Raw),C2_C3 (Raw),C2_C4 (Raw),C3_C4 (Raw),C1_C2 (Saaty),C1_C3 (Saaty),C1_C4 (Saaty),C2_C3 (Saaty),C2_C4 (Saaty),C3_C4 (Saaty)\n";

    anpResponses.forEach(r => {
      const c = r.comparisons;
      
      // Calculate mathematical Saaty values (reciprocal if preference is to the right/negative)
      const toSaaty = (val) => {
        if (val === 1) return 1.0;
        if (val > 1) return val; // Preference to Left
        return (1 / Math.abs(val)).toFixed(4); // Preference to Right (Reciprocal)
      };

      csvContent += `${r.member_id},"${r.member_name}","${r.institution}",${c.c1_c2},${c.c1_c3},${c.c1_c4},${c.c2_c3},${c.c2_c4},${c.c3_c4},${toSaaty(c.c1_c2)},${toSaaty(c.c1_c3)},${toSaaty(c.c1_c4)},${toSaaty(c.c2_c3)},${toSaaty(c.c2_c4)},${toSaaty(c.c3_c4)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Delphi_ANP_Saaty_Matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '12px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--primary-green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Memuat Delphi-ANP Decision Hub...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Delphi-ANP Decision Matrix Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Portal Khusus Pengisian Kuesioner Skala Saaty oleh 13 Pakar Koperasi & Financial Regulator untuk di-run pada Delphi-ANP Software.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
            🏛️ Panelis Ahli Nasional
          </span>
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>}

      <div className="responsive-grid-sidebar">
        {/* MAIN QUESTIONNAIRE AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Identity Selection */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              👤 Pilih Identitas Pakar Pengisi (Target: 13 Pakar)
            </label>
            <select
              className="form-control"
              style={{ background: '#0e1423', color: 'white', height: '40px', fontSize: '0.9rem' }}
              value={selectedExpertId}
              onChange={handleSelectExpert}
            >
              <option value="">-- Pilih Nama Pakar --</option>
              {targetExperts.map(exp => {
                const isFilled = anpResponses.some(r => r.member_id === exp.id);
                return (
                  <option key={exp.id} value={exp.id}>
                    {exp.name} - {exp.institution} ({isFilled ? '🟢 Terisi' : '🔴 Pending'})
                  </option>
                );
              })}
            </select>
            {selectedExpertId && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Peran Pakar: <strong>{targetExperts.find(e => e.id === selectedExpertId)?.role}</strong>
              </div>
            )}
          </div>

          {/* Saaty Matrix Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '8px' }}>
              Matriks Perbandingan Berpasangan (Saaty Pairwise Comparison)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.4', marginBottom: '24px' }}>
              Tentukan bobot prioritas kepentingan kriteria di sebelah KIRI dibandingkan di sebelah KANAN. 
              Skala Saaty (1-9) digunakan: 1 = Sama Penting, 3 = Sedikit Lebih, 5 = Lebih, 7 = Sangat Lebih, 9 = Mutlak Lebih Penting.
            </p>

            <form onSubmit={handleSubmitMatrix}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {pairwiseItems.map((item, idx) => {
                  const currentVal = comparisons[item.key] || 1;
                  return (
                    <div key={item.key} style={{
                      paddingBottom: '24px',
                      borderBottom: idx < pairwiseItems.length - 1 ? '1px dashed rgba(255,255,255,0.06)' : 'none'
                    }}>
                      {/* Left and Right labels comparison title */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '0.88rem', fontWeight: 600 }}>
                        <span style={{ color: currentVal > 1 ? '#60a5fa' : 'white' }}>{item.labelLeft}</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {currentVal === 1 ? 'Sama Penting (1)' : currentVal > 1 ? `KIRI Lebih Penting (${currentVal})` : `KANAN Lebih Penting (${Math.abs(currentVal)})`}
                        </span>
                        <span style={{ color: currentVal < 0 ? '#34d399' : 'white' }}>{item.labelRight}</span>
                      </div>

                      {/* Saaty 1-9 Slider Interface */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '4px', textAlign: 'center' }}>
                          {saatyValues.map(opt => (
                            <div
                              key={opt.val}
                              onClick={() => handleComparisonChange(item.key, opt.val)}
                              style={{
                                padding: '8px 4px',
                                background: currentVal === opt.val 
                                  ? (opt.val > 1 ? 'rgba(37,99,235,0.2)' : opt.val < 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)')
                                  : 'rgba(0,0,0,0.15)',
                                border: currentVal === opt.val 
                                  ? (opt.val > 1 ? '1px solid #3730a3' : opt.val < 0 ? '1px solid #065f46' : '1px solid rgba(255,255,255,0.2)')
                                  : '1px solid rgba(255,255,255,0.02)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '44px'
                              }}
                            >
                              <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: currentVal === opt.val ? 'white' : 'var(--text-muted)'
                              }}>
                                {Math.abs(opt.val)}
                              </span>
                              <span style={{
                                fontSize: '0.55rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginTop: '2px',
                                transform: 'scale(0.9)'
                              }}>
                                {opt.val > 1 ? 'Kiri' : opt.val < 0 ? 'Kanan' : 'Sama'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {submitMsg && <div style={{ color: 'var(--primary-green)', fontSize: '0.85rem', marginTop: '20px', fontWeight: 600 }}>{submitMsg}</div>}
              {submitErr && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '20px', fontWeight: 600 }}>{submitErr}</div>}

              <button
                type="submit"
                disabled={!selectedExpertId}
                className="btn btn-purple"
                style={{ width: '100%', marginTop: '20px', height: '40px', fontWeight: 700, cursor: selectedExpertId ? 'pointer' : 'not-allowed' }}
              >
                🔒 Rekam Matriks Saaty Kriptografis
              </button>
            </form>
          </div>
        </div>

        {/* SIDEBAR: FACILITATOR CONSOLE & CSV EXPORTER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
          {/* Exporter Card */}
          <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary-blue)' }}>
            <h4 style={{ fontSize: '1rem', color: '#60a5fa', marginBottom: '8px' }}>Facilitator Console (ANP)</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px' }}>
              Unduh matriks perbandingan berpasangan Saaty (13 pakar) untuk di-import langsung pada program <strong>Delphi-ANP Software</strong> (Excel/SuperDecisions).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleExportCSV}
                className="btn btn-blue"
                style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, height: '36px', cursor: 'pointer' }}
                disabled={anpResponses.length === 0}
              >
                📥 Ekspor Matriks ANP (CSV)
              </button>

              <button
                onClick={handleSimulate13}
                className="btn"
                style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, height: '36px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#fbbf24', cursor: 'pointer' }}
                disabled={simulating}
              >
                ⚡ Auto-fill Simulasi 13 Pakar
              </button>

              <button
                onClick={handleClearData}
                className="btn"
                style={{ width: '100%', fontSize: '0.85rem', height: '36px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', cursor: 'pointer' }}
              >
                🗑️ Bersihkan Semua Respons
              </button>
            </div>
          </div>

          {/* Expert Progress List Tracker */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
              Progress Pengisian Pakar ({anpResponses.length}/13)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {targetExperts.map(exp => {
                const submission = anpResponses.find(r => r.member_id === exp.id);
                return (
                  <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px dashed rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}>
                      <strong>{exp.name}</strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{exp.institution}</span>
                    </div>
                    {submission ? (
                      <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Terisi</span>
                    ) : (
                      <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DelphiSurveyPage;
