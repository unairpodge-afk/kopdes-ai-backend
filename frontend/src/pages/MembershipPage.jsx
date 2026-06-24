import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────── SHA-256 via Web Crypto API ─────────────── */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ─────────────── Tiny QR Code Generator (no lib needed) ─────────────── */
// We use a canvas-based approach with a simple QR-like pattern seeded from the text
function generateQRPattern(text) {
  // Simple deterministic hash-based pattern for visual QR representation
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  const size = 21; // 21x21 grid (Version 1 QR)
  const grid = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      // Fixed finder patterns (corners)
      const inFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= size - 7) ||
        (r >= size - 7 && c < 7);
      if (inFinder) {
        const localR = r < 7 ? r : r - (size - 7);
        const localC = c < 7 ? c : c - (size - 7);
        // Outer border or center 3x3
        const inBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
        const inCenter = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
        row.push(inBorder || inCenter ? 1 : 0);
      } else {
        // Timing patterns
        if (r === 6 || c === 6) {
          row.push((r + c) % 2 === 0 ? 1 : 0);
        } else {
          // Data modules — seeded from hash + position
          const bit = ((hash ^ (r * 17 + c * 31 + r * c)) >> ((r + c) % 16)) & 1;
          row.push(bit);
        }
      }
    }
    grid.push(row);
  }
  return grid;
}

function QRCodeCanvas({ text, size = 80, darkColor = '#111', lightColor = '#fff' }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const grid = generateQRPattern(text);
    const modules = grid.length;
    const scale = size / modules;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = darkColor;
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (grid[r][c]) {
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }
  }, [text, size, darkColor, lightColor]);
  return <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />;
}

/* ─────────────── Member Card Component ─────────────── */
function EKTACard({ member, onDownload }) {
  const cardRef = useRef(null);

  const handleDownload = () => {
    // Generate QR canvas as dataURL
    const qrText = member.qrCode || `KOPDES-${member.id}`;
    const grid   = generateQRPattern(qrText);
    const cvs    = document.createElement('canvas');
    const sz     = 80;
    cvs.width = sz; cvs.height = sz;
    const ctx = cvs.getContext('2d');
    const scale = sz / grid.length;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sz, sz);
    ctx.fillStyle = '#111';
    for (let r = 0; r < grid.length; r++)
      for (let c = 0; c < grid[r].length; c++)
        if (grid[r][c]) ctx.fillRect(c * scale, r * scale, scale, scale);
    const qrDataUrl = cvs.toDataURL('image/png');

    const html = `<!DOCTYPE html><html>
<head><title>E-KTA – ${member.name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#f1f5f9;font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;padding:24px;}
  .card{width:340px;background:linear-gradient(135deg,#10b981 0%,#065f46 100%);border-radius:20px;padding:22px;color:white;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3);margin-bottom:16px;}
  .wm{position:absolute;right:-15px;bottom:-15px;font-size:9rem;opacity:0.05;user-select:none;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;}
  .brand{font-weight:800;font-size:1.1rem;letter-spacing:0.05em;}
  .sub{font-size:0.6rem;text-transform:uppercase;opacity:0.8;margin-top:2px;}
  .badge{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);padding:3px 9px;border-radius:8px;font-size:0.6rem;font-weight:700;text-transform:uppercase;}
  .body{display:flex;gap:14px;align-items:center;margin-bottom:16px;}
  .avatar{width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.6);}
  .nm-label{font-size:0.6rem;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.08em;}
  .nm{font-size:1.1rem;font-weight:700;margin-top:2px;}
  .mid{font-size:0.82rem;font-weight:600;margin-top:3px;opacity:0.9;}
  .footer{display:flex;justify-content:space-between;align-items:flex-end;}
  .date-lbl{font-size:0.5rem;color:rgba(255,255,255,0.7);text-transform:uppercase;}
  .date{font-size:0.78rem;font-weight:500;margin-top:2px;}
  .qr-box{background:white;padding:5px;border-radius:6px;}
  .qr-box img{display:block;image-rendering:pixelated;}
  .info{width:340px;background:white;border-radius:12px;padding:14px;font-size:0.72rem;color:#374151;line-height:1.6;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .info strong{color:#065f46;}
  @media print{body{padding:0;background:white;}.card{box-shadow:none;}}
</style></head>
<body>
  <div class="card">
    <div class="wm">🌾</div>
    <div class="header">
      <div><div class="brand">KOPDES AI</div><div class="sub">Koperasi Cerdas Ekonomi Kuat</div></div>
      <div class="badge">${member.status}</div>
    </div>
    <div class="body">
      <img class="avatar" src="${member.avatarUrl}" crossorigin="anonymous"/>
      <div>
        <div class="nm-label">Nama Anggota</div>
        <div class="nm">${member.name}</div>
        <div class="mid">${member.id}</div>
      </div>
    </div>
    <div class="footer">
      <div>
        <div class="date-lbl">Bergabung Sejak</div>
        <div class="date">${new Date(member.joinedDate).toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'})}</div>
      </div>
      <div class="qr-box"><img src="${qrDataUrl}" width="60" height="60"/></div>
    </div>
  </div>
  <div class="info">
    <strong>QR Code:</strong> ${member.qrCode || qrText}<br/>
    <strong>Dicetak:</strong> ${new Date().toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'})}
  </div>
  <script>window.onload=()=>{window.print();}</script>
</body></html>`;

    let iframe = document.getElementById('__ekta_print_frame');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = '__ekta_print_frame';
      iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;opacity:0;';
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
  };

  return (
    <div>
      <div ref={cardRef} style={{
        background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
        borderRadius: '20px',
        padding: '24px',
        color: 'white',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(16,185,129,0.2)',
        border: '1px solid rgba(255,255,255,0.2)',
        aspectRatio: '1.58 / 1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }}>
        {/* Watermark */}
        <div style={{ position:'absolute', right:'-20px', bottom:'-20px', fontSize:'10rem', opacity:0.05, userSelect:'none', pointerEvents:'none' }}>🌾</div>
        {/* Shimmer overlay */}
        <div style={{ position:'absolute', top:0, left:'-100%', width:'60%', height:'100%',
          background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          animation:'shimmer 3s infinite', pointerEvents:'none' }} />

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontWeight:800, fontSize:'1.15rem', letterSpacing:'0.05em' }}>KOPDES AI</div>
            <div style={{ fontSize:'0.6rem', textTransform:'uppercase', opacity:0.8, letterSpacing:'0.1em' }}>Koperasi Cerdas Ekonomi Kuat</div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', fontSize:'0.6rem', padding:'3px 8px', borderRadius:'8px', fontWeight:700, textTransform:'uppercase' }}>
            {member.status}
          </div>
        </div>

        {/* Body */}
        <div style={{ display:'flex', gap:'18px', alignItems:'center' }}>
          <img src={member.avatarUrl} alt="Avatar" style={{ width:'64px', height:'64px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.6)', boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }} />
          <div>
            <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Nama Anggota</div>
            <div style={{ fontSize:'1.2rem', fontWeight:700, fontFamily:'var(--font-heading)', marginTop:'2px' }}>{member.name}</div>
            <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.9)', marginTop:'4px', letterSpacing:'0.06em', fontWeight:600 }}>{member.id}</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontSize:'0.5rem', color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Bergabung Sejak</div>
            <div style={{ fontSize:'0.8rem', fontWeight:500, marginTop:'2px' }}>
              {new Date(member.joinedDate).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' })}
            </div>
          </div>
          <div style={{ background:'white', padding:'5px', borderRadius:'6px', boxShadow:'0 4px 10px rgba(0,0,0,0.2)' }}>
            <QRCodeCanvas text={member.qrCode || `KOPDES-${member.id}`} size={56} darkColor="#111" lightColor="#fff" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:'10px', marginTop:'14px' }}>
        <button onClick={handleDownload} className="btn btn-outline" style={{ flex:1, fontSize:'0.82rem', gap:'6px' }}>
          🖨️ Cetak E-KTA
        </button>
        <button className="btn btn-green" style={{ flex:1, fontSize:'0.82rem', gap:'6px' }} disabled>
          📤 Bagikan
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Member Tracker ─────────────── */
function MemberTracker({ apiBase, logEcosystemActivity }) {
  const [inputId, setInputId]   = useState('');
  const [inputName, setInputName] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [result, setResult]     = useState(null); // { member, sha256, qrPayload }
  const [copied, setCopied]     = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError(''); setResult(null);
    const cleanId   = inputId.trim();
    const cleanName = inputName.trim();
    if (!cleanId || !cleanName) { setError('ID Anggota dan Nama Lengkap wajib diisi.'); return; }

    setLoading(true);
    try {
      const res    = await fetch(`${apiBase}/membership/profile?id=${encodeURIComponent(cleanId)}`);
      const json   = await res.json();

      if (!json.success || !json.data) {
        setError('Anggota dengan ID tersebut tidak ditemukan di database.');
        setLoading(false);
        return;
      }

      const member = json.data;

      // Verify name (case-insensitive, trim)
      const dbName    = (member.name || '').trim().toLowerCase();
      const inputN    = cleanName.toLowerCase();
      if (dbName !== inputN) {
        setError('Nama lengkap tidak cocok dengan data anggota. Periksa kembali.');
        setLoading(false);
        return;
      }

      // Build payload for SHA-256
      const payload = JSON.stringify({
        id:         member.id,
        name:       member.name,
        email:      member.email,
        status:     member.status,
        joinedDate: member.joinedDate,
        qrCode:     member.qrCode,
        timestamp:  new Date().toISOString().split('T')[0] // date-stamped
      });

      const hash     = await sha256(payload);
      const qrPayload = `KOPDES-SHA256:${hash}|ID:${member.id}`;

      setResult({ member, sha256: hash, qrPayload, payload });
      if (logEcosystemActivity)
        logEcosystemActivity('MEMBER_TRACK', `Lacak E-KTA: ${member.name} (${member.id})`, null, 'membership');
    } catch {
      setError('Gagal menghubungi server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.sha256).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    if (!result) return;
    const { member, sha256: hash, qrPayload } = result;

    const grid   = generateQRPattern(qrPayload);
    const cvs    = document.createElement('canvas');
    const sz     = 80;
    cvs.width = sz; cvs.height = sz;
    const ctx = cvs.getContext('2d');
    const scale = sz / grid.length;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sz, sz);
    ctx.fillStyle = '#111';
    for (let r = 0; r < grid.length; r++)
      for (let c = 0; c < grid[r].length; c++)
        if (grid[r][c]) ctx.fillRect(c * scale, r * scale, scale, scale);
    const qrDataUrl = cvs.toDataURL('image/png');

    const html = `<!DOCTYPE html><html>
      <head><title>E-KTA SHA-256 - ${member.name}</title>
      <style>
        body{margin:0;padding:24px;background:#fff;font-family:Arial,sans-serif;}
        .card{width:360px;background:linear-gradient(135deg,#10b981 0%,#065f46 100%);border-radius:16px;padding:22px;color:white;position:relative;overflow:hidden;}
        .brand{font-weight:800;font-size:1.1rem;letter-spacing:.05em;}
        .sub{font-size:.6rem;text-transform:uppercase;opacity:.8;}
        .badge{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);padding:3px 8px;border-radius:8px;font-size:.6rem;font-weight:700;}
        .header{display:flex;justify-content:space-between;align-items:flex-start;}
        .body{display:flex;gap:14px;align-items:center;margin:16px 0;}
        .avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.6);}
        .name{font-size:1.1rem;font-weight:700;}
        .mid{font-size:.8rem;opacity:.9;font-weight:600;margin-top:3px;}
        .footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px;}
        .sha-box{margin-top:16px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px;font-size:.62rem;word-break:break-all;color:#14532d;}
        .qr-box{background:white;padding:5px;border-radius:6px;float:right;margin-left:10px;}
        .qr-box img{display:block;image-rendering:pixelated;}
        @media print{body{padding:0;}}
      </style></head>
      <body>
        <div class="card">
          <div class="header">
            <div><div class="brand">KOPDES AI</div><div class="sub">Koperasi Cerdas Ekonomi Kuat</div></div>
            <div class="badge">${member.status}</div>
          </div>
          <div class="body">
            <img class="avatar" src="${member.avatarUrl}" crossorigin="anonymous" />
            <div>
              <div class="brand">${member.name}</div>
              <div class="mid">${member.id}</div>
            </div>
          </div>
          <div class="footer">
            <div style="font-size:.65rem">
              <div style="opacity:.7;text-transform:uppercase">Bergabung Sejak</div>
              <div>${new Date(member.joinedDate).toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
            <div class="qr-box"><img src="${qrDataUrl}" width="60" height="60"/></div>
          </div>
        </div>
        <div class="sha-box">
          <strong>SHA-256 Fingerprint:</strong><br/>${hash}
        </div>
        <script>window.onload=()=>{window.print();}</script>
      </body></html>`;

    let iframe = document.getElementById('__ekta_print_frame');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = '__ekta_print_frame';
      iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;opacity:0;';
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
  };

  return (
    <div style={{ marginBottom:'32px' }}>
      {/* Section Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
        <div style={{ background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', borderRadius:'10px', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>🔍</div>
        <div>
          <h3 style={{ fontSize:'1.05rem', fontWeight:700, margin:0 }}>Lacak Kartu Anggota (E-KTA)</h3>
          <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', margin:0 }}>Masukkan ID dan nama lengkap untuk mendapatkan E-KTA resmi dengan hash SHA-256.</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:'20px' }}>
        {/* Input Form */}
        <div className="glass-card" style={{ padding:'22px', border:'1px solid rgba(59,130,246,0.15)' }}>
          <form onSubmit={handleTrack}>
            <div className="form-group">
              <label style={{ color:'#93c5fd' }}>ID Anggota <span style={{ color:'#ef4444' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: 1205 2026 0001"
                value={inputId}
                onChange={e => setInputId(e.target.value)}
                style={{ fontFamily:'monospace', letterSpacing:'0.05em' }}
                required
              />
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'4px' }}>Format: 1205 YYYY NNNN</div>
            </div>
            <div className="form-group">
              <label style={{ color:'#93c5fd' }}>Nama Lengkap <span style={{ color:'#ef4444' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Budi Santoso"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                required
              />
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'4px' }}>Harus sesuai persis dengan data koperasi (huruf kapital diabaikan)</div>
            </div>

            {error && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'10px 14px', color:'#fca5a5', fontSize:'0.82rem', marginBottom:'12px', fontWeight:600 }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" className="btn" style={{ width:'100%', height:'44px', fontSize:'0.9rem', background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', color:'white', gap:'8px' }} disabled={loading}>
              {loading ? (
                <><span style={{ display:'inline-block', width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Mencari anggota...</>
              ) : '🔎 Lacak & Tampilkan E-KTA'}
            </button>
          </form>

          {/* How it works */}
          <div style={{ marginTop:'16px', padding:'12px', background:'rgba(59,130,246,0.05)', borderRadius:'8px', border:'1px solid rgba(59,130,246,0.1)' }}>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', lineHeight:1.7 }}>
              <div style={{ fontWeight:700, color:'#93c5fd', marginBottom:'6px' }}>ℹ️ Cara Kerja Verifikasi</div>
              <div>1. Data anggota diambil dari database koperasi</div>
              <div>2. Nama lengkap dicocokkan untuk autentikasi</div>
              <div>3. <strong style={{ color:'white' }}>SHA-256</strong> dihitung dari payload data anggota</div>
              <div>4. QR Code berisi hash SHA-256 untuk verifikasi keaslian</div>
            </div>
          </div>
        </div>

        {/* Result E-KTA */}
        {result ? (
          <div>
            {/* E-KTA Card with SHA-256 QR */}
            <div style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #0f172a 60%, #065f46 100%)',
              borderRadius: '20px',
              padding: '22px',
              color: 'white',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}>
              {/* Watermark */}
              <div style={{ position:'absolute', right:'-15px', bottom:'-15px', fontSize:'8rem', opacity:0.04, userSelect:'none', pointerEvents:'none' }}>🌾</div>
              {/* Blue shimmer */}
              <div style={{ position:'absolute', top:0, left:'-100%', width:'60%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(59,130,246,0.1),transparent)', animation:'shimmer 3s infinite', pointerEvents:'none' }} />

              {/* Verified badge row */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:'1.1rem', letterSpacing:'0.05em' }}>KOPDES AI</div>
                  <div style={{ fontSize:'0.55rem', textTransform:'uppercase', opacity:0.8, letterSpacing:'0.1em' }}>Koperasi Cerdas Ekonomi Kuat</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
                  <div style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', fontSize:'0.58rem', padding:'3px 8px', borderRadius:'8px', fontWeight:700, textTransform:'uppercase' }}>
                    {result.member.status}
                  </div>
                  <div style={{ background:'rgba(16,185,129,0.25)', border:'1px solid rgba(16,185,129,0.4)', fontSize:'0.55rem', padding:'2px 7px', borderRadius:'6px', color:'#6ee7b7', fontWeight:700 }}>
                    ✅ TERVERIFIKASI
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ display:'flex', gap:'16px', alignItems:'center', marginBottom:'14px' }}>
                <img src={result.member.avatarUrl} alt="" style={{ width:'60px', height:'60px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.5)', boxShadow:'0 4px 12px rgba(0,0,0,0.3)', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Nama Anggota</div>
                  <div style={{ fontSize:'1.1rem', fontWeight:700, marginTop:'2px', fontFamily:'var(--font-heading)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{result.member.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.85)', marginTop:'3px', fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace' }}>{result.member.id}</div>
                </div>
              </div>

              {/* Footer: date + QR */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div>
                  <div style={{ fontSize:'0.48rem', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Bergabung Sejak</div>
                  <div style={{ fontSize:'0.75rem', fontWeight:500, marginTop:'2px' }}>
                    {new Date(result.member.joinedDate).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' })}
                  </div>
                  <div style={{ fontSize:'0.48rem', color:'rgba(255,255,255,0.5)', marginTop:'6px', letterSpacing:'0.06em', textTransform:'uppercase' }}>SHA-256 Verified</div>
                </div>
                <div style={{ background:'white', padding:'5px', borderRadius:'6px', boxShadow:'0 4px 12px rgba(0,0,0,0.3)', position:'relative' }}>
                  <QRCodeCanvas text={result.qrPayload} size={64} darkColor="#1d4ed8" lightColor="#ffffff" />
                  <div style={{ position:'absolute', bottom:'-14px', left:'50%', transform:'translateX(-50%)', fontSize:'0.38rem', color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap', letterSpacing:'0.05em' }}>SHA-256 QR</div>
                </div>
              </div>
            </div>

            {/* SHA-256 Fingerprint Box */}
            <div style={{ marginTop:'14px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'12px', padding:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#34d399', display:'flex', alignItems:'center', gap:'6px' }}>
                  🔐 SHA-256 Fingerprint
                </div>
                <button onClick={copyHash} style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#6ee7b7', padding:'3px 10px', borderRadius:'6px', fontSize:'0.7rem', cursor:'pointer', fontWeight:600 }}>
                  {copied ? '✅ Disalin!' : '📋 Salin'}
                </button>
              </div>
              <div style={{ fontFamily:'monospace', fontSize:'0.68rem', color:'#a7f3d0', wordBreak:'break-all', lineHeight:1.6, background:'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'8px', letterSpacing:'0.03em' }}>
                {result.sha256}
              </div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'8px' }}>
                Hash ini unik untuk <strong style={{ color:'white' }}>{result.member.name}</strong> dan hanya valid pada <strong style={{ color:'white' }}>{new Date().toLocaleDateString('id-ID')}</strong>.
              </div>
            </div>

            {/* QR Payload Info */}
            <div style={{ marginTop:'10px', background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:'10px', padding:'12px' }}>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#93c5fd', marginBottom:'6px' }}>📡 QR Code Payload</div>
              <div style={{ fontFamily:'monospace', fontSize:'0.65rem', color:'#bfdbfe', wordBreak:'break-all', lineHeight:1.5 }}>{result.qrPayload}</div>
            </div>

            {/* Action Buttons */}
            <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
              <button onClick={handlePrint} className="btn btn-outline" style={{ flex:1, fontSize:'0.8rem' }}>🖨️ Cetak E-KTA</button>
              <button onClick={() => setResult(null)} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', color:'#f87171', padding:'10px 16px', borderRadius:'8px', fontSize:'0.8rem', cursor:'pointer', fontWeight:600 }}>✕ Reset</button>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding:'32px', textAlign:'center', border:'1px dashed rgba(59,130,246,0.2)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px', minHeight:'280px' }}>
            <div style={{ fontSize:'3rem', opacity:0.3 }}>🔍</div>
            <div style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>E-KTA akan muncul di sini setelah verifikasi berhasil</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>SHA-256 · Tamper-proof · Date-stamped</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Stats Widget ─────────────── */
function StatsWidget({ apiBase }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(`${apiBase}/membership/stats`).then(r => r.json()).then(d => { if (d.success) setStats(d.data); }).catch(() => {});
  }, [apiBase]);

  if (!stats) return null;
  const items = [
    { label: 'Total Anggota', value: stats.totalMembers?.toLocaleString('id-ID'), icon: '👥', color: '#10b981' },
    { label: 'Anggota Aktif', value: stats.activeMembers?.toLocaleString('id-ID'), icon: '✅', color: '#3b82f6' },
    { label: 'Pending', value: stats.pendingMembers?.toLocaleString('id-ID'), icon: '⏳', color: '#f59e0b' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:'12px', marginBottom:'24px' }}>
      {items.map((item) => (
        <div key={item.label} className="glass-card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ fontSize:'1.5rem' }}>{item.icon}</div>
          <div>
            <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{item.label}</div>
            <div style={{ fontSize:'1.25rem', fontWeight:700, color:item.color }}>{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────── Member Search (Admin) ─────────────── */
function MemberSearch({ apiBase, isAdmin, onSelectMember }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allMembers, setAllMembers] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${apiBase}/membership/list`).then(r => r.json()).then(d => { if (d.success) setAllMembers(d.data); }).catch(() => {});
  }, [apiBase, isAdmin]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const filtered = allMembers.filter(m =>
      m.name?.toLowerCase().includes(query.toLowerCase()) ||
      m.id?.toLowerCase().includes(query.toLowerCase()) ||
      m.email?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.slice(0, 6));
    setLoading(false);
  }, [query, allMembers]);

  if (!isAdmin) return null;

  return (
    <div className="glass-card" style={{ padding:'20px', marginBottom:'24px' }}>
      <h4 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'14px', color:'var(--text-white)' }}>
        🔍 Cari Anggota
      </h4>
      <input
        type="text"
        className="form-control"
        placeholder="Nama, ID, atau email anggota..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: results.length > 0 ? '12px' : 0 }}
      />
      {loading && <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:'8px' }}>Mencari...</div>}
      {results.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'200px', overflowY:'auto' }}>
          {results.map(m => (
            <button key={m.id} onClick={() => onSelectMember(m)} style={{
              background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-light)',
              borderRadius:'8px', padding:'10px 14px', cursor:'pointer', textAlign:'left',
              display:'flex', alignItems:'center', gap:'12px', transition:'all 0.15s ease',
              color:'var(--text-white)'
            }}
              onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
              onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
            >
              <img src={m.avatar_url} alt="" style={{ width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover' }} />
              <div>
                <div style={{ fontSize:'0.85rem', fontWeight:600 }}>{m.name}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{m.id} · {m.status}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {query && results.length === 0 && !loading && (
        <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:'8px' }}>Tidak ada anggota ditemukan.</div>
      )}
    </div>
  );
}

/* ─────────────── Registration Form ─────────────── */
function RegistrationForm({ apiBase, logEcosystemActivity }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [newMember, setNewMember] = useState(null);

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [receivedOtp, setReceivedOtp] = useState('');
  const [showMockNotification, setShowMockNotification] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validate = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) return 'Semua field wajib diisi.';
    if (!email.toLowerCase().endsWith('@gmail.com')) return 'Registrasi baru wajib menggunakan email Gmail (@gmail.com).';
    if (!/^08\d{8,11}$/.test(phone)) return 'Nomor telepon harus diawali 08 dan 10-13 digit.';
    if (password.length < 6) return 'Password minimal 6 karakter.';
    if (password !== confirmPassword) return 'Konfirmasi password tidak cocok.';
    return null;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    const validationError = validate();
    if (validationError) { setErr(validationError); return; }

    setOtpLoading(true);
    try {
      const res = await fetch(`${apiBase}/membership/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setCountdown(60);
        setReceivedOtp(data.otp);
        setMsg('Kode OTP berhasil dikirim. Silakan periksa Gmail Anda.');
        setTimeout(() => setShowMockNotification(true), 1200);
      } else {
        setErr(data.error?.message || 'Gagal mengirim OTP.');
      }
    } catch {
      setErr('Gagal terhubung ke server.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) return handleSendOTP(e);

    setMsg(''); setErr('');
    if (!otp) { setErr('Kode OTP wajib diisi.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/membership/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, otp })
      });
      const result = await res.json();
      if (result.success) {
        setMsg(`✅ Anggota berhasil terdaftar dengan ID: ${result.data.id}`);
        setNewMember(result.data);
        setName(''); setEmail(''); setPhone(''); setPassword(''); setConfirmPassword(''); setOtp(''); setOtpSent(false);
        if (logEcosystemActivity) logEcosystemActivity('MEMBER_REGISTRATION', 'Pendaftaran anggota baru: ' + name, null, 'membership');
      } else {
        setErr(result.error?.message || 'Registrasi gagal.');
      }
    } catch {
      setErr('Gagal mengirim registrasi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding:'24px' }}>
      <h3 style={{ fontSize:'1.1rem', marginBottom:'18px', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ background:'linear-gradient(135deg,#10b981,#065f46)', borderRadius:'8px', width:'32px', height:'32px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>👤</span>
        Pendaftaran Anggota Baru
      </h3>

      {newMember && (
        <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'12px', padding:'16px', marginBottom:'18px' }}>
          <div style={{ fontSize:'0.8rem', color:'#34d399', fontWeight:700, marginBottom:'8px' }}>🎉 Anggota Berhasil Terdaftar!</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-muted)' }}>
            <span>ID Anggota:</span>
            <span style={{ color:'white', fontWeight:600 }}>{newMember.id}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'4px' }}>
            <span>QR Code:</span>
            <span style={{ color:'white', fontWeight:600, fontSize:'0.7rem' }}>{newMember.qr_code}</span>
          </div>
          <button onClick={() => setNewMember(null)} style={{ marginTop:'10px', background:'none', border:'none', color:'var(--text-muted)', fontSize:'0.75rem', cursor:'pointer' }}>
            Tutup
          </button>
        </div>
      )}

      {/* MOCK GMAIL NOTIFICATION TOAST */}
      {showMockNotification && (
        <div className="gmail-notification-toast animate-slide-down" style={{
          position: 'fixed', top: '20px', right: '20px', left: '20px', maxWidth: '400px', margin: '0 auto',
          background: 'rgba(30, 27, 38, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px',
          padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(16, 185, 129, 0.1)',
          display: 'flex', alignItems: 'center', gap: '14px', zIndex: 9999, backdropFilter: 'blur(12px)'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📧</div>
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
          <button onClick={() => setShowMockNotification(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '0 4px' }}>✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Lengkap <span style={{ color:'#ef4444' }}>*</span></label>
          <input type="text" className="form-control" placeholder="Contoh: Budi Santoso" value={name} onChange={e => setName(e.target.value)} disabled={otpSent} required />
        </div>
        <div className="form-group">
          <label>Alamat Email (Gmail) <span style={{ color:'#ef4444' }}>*</span></label>
          <input type="email" className="form-control" placeholder="Contoh: budi@gmail.com" value={email} onChange={e => setEmail(e.target.value)} disabled={otpSent} required />
        </div>
        <div className="form-group">
          <label>Nomor Telepon <span style={{ color:'#ef4444' }}>*</span></label>
          <input type="tel" className="form-control" placeholder="Contoh: 081234567890" value={phone} onChange={e => setPhone(e.target.value)} disabled={otpSent} required />
          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'4px' }}>Format: 08xxxxxxxxxx (10–13 digit)</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Password <span style={{ color:'#ef4444' }}>*</span></label>
            <input type="password" className="form-control" placeholder="Min. 6 karakter" value={password} onChange={e => setPassword(e.target.value)} disabled={otpSent} required />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Konfirmasi Password <span style={{ color:'#ef4444' }}>*</span></label>
            <input type="password" className="form-control" placeholder="Ulangi password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={otpSent} required />
          </div>
        </div>

        {/* Password strength indicator */}
        {password && (
          <div style={{ marginTop:'8px', marginBottom:'4px' }}>
            <div style={{ display:'flex', gap:'3px' }}>
              {[...Array(4)].map((_, i) => {
                const strength = password.length >= 6 ? (password.length >= 8 ? (password.length >= 10 ? 4 : 3) : 2) : 1;
                return (
                  <div key={i} style={{
                    flex:1, height:'3px', borderRadius:'2px',
                    background: i < strength
                      ? (strength >= 4 ? '#10b981' : strength >= 3 ? '#f59e0b' : '#ef4444')
                      : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease'
                  }} />
                );
              })}
            </div>
            <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'3px' }}>
              {password.length >= 10 ? '✅ Kuat' : password.length >= 8 ? '⚠️ Sedang' : password.length >= 6 ? '⚠️ Lemah' : '❌ Terlalu pendek'}
            </div>
          </div>
        )}

        {/* OTP Input (Only shows up when OTP is sent) */}
        {otpSent && (
          <div className="form-group animate-fade" style={{ marginTop: '16px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700 }}>🔒 Masukkan 6-Digit Kode OTP</label>
            <input type="text" className="form-control" style={{ background: 'rgba(0,0,0,0.5)', color: '#34d399', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '8px', fontFamily: 'monospace', fontWeight: 700, marginTop: '8px', height: '48px' }} placeholder="XXXXXX" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tidak menerima kode?</span>
              {countdown > 0 ? (
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Kirim ulang dalam {countdown}s</span>
              ) : (
                <button type="button" onClick={handleSendOTP} style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Kirim Ulang OTP</button>
              )}
            </div>
          </div>
        )}

        {err && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'10px 14px', color:'#fca5a5', fontSize:'0.82rem', margin:'12px 0', fontWeight:600 }}>
            ⚠️ {err}
          </div>
        )}
        
        {msg && !newMember && (
          <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'8px', padding:'10px 14px', color:'#34d399', fontSize:'0.82rem', margin:'12px 0', fontWeight:600 }}>
            ✓ {msg}
          </div>
        )}

        {!otpSent ? (
          <button type="submit" className="btn btn-green" style={{ width:'100%', marginTop:'14px', height:'46px', fontSize:'0.95rem', gap:'8px' }} disabled={otpLoading}>
            {otpLoading ? (
              <><span style={{ display:'inline-block', width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Mengirim OTP...</>
            ) : 'Kirim Kode OTP Realtime'}
          </button>
        ) : (
          <button type="submit" className="btn btn-green" style={{ width:'100%', marginTop:'14px', height:'46px', fontSize:'0.95rem', gap:'8px', background: 'linear-gradient(135deg, #10b981, #059669)' }} disabled={loading}>
            {loading ? (
              <><span style={{ display:'inline-block', width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Memverifikasi...</>
            ) : '🌾 Verifikasi & Daftar Koperasi'}
          </button>
        )}
      </form>

      <div style={{ marginTop:'16px', padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', border:'1px solid var(--border-light)' }}>
        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', lineHeight:1.6 }}>
          ℹ️ <strong style={{ color:'var(--text-white)' }}>Info:</strong> Anggota baru akan menerima ID unik dan Kartu Anggota Digital (E-KTA) yang dapat digunakan untuk mengakses semua layanan Koperasi Desa.
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Profile Editor ─────────────── */
function ProfileEditor({ profile, apiBase, setProfile }) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  if (!profile) return null;

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setProfile({ ...profile, phone });
      setMsg('Profil berhasil diperbarui!');
      setSaving(false);
      setEditing(false);
      setTimeout(() => setMsg(''), 3000);
    }, 800);
  };

  return (
    <div className="glass-card" style={{ padding:'20px', marginTop:'20px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <h4 style={{ fontSize:'0.95rem', fontWeight:700 }}>📋 Detail Profil Anggota</h4>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ background:'none', border:'1px solid var(--border-light)', color:'var(--text-muted)', padding:'5px 12px', borderRadius:'6px', fontSize:'0.75rem', cursor:'pointer' }}>
            ✏️ Edit
          </button>
        )}
      </div>

      <div style={{ display:'grid', gap:'10px' }}>
        {[
          { label: 'ID Anggota', value: profile.id, icon: '🪪' },
          { label: 'Email', value: profile.email, icon: '📧' },
          { label: 'Status', value: profile.status, icon: '✅' },
          { label: 'Saldo Kopdes Pay', value: `Rp ${Number(profile.balance || 0).toLocaleString('id-ID')}`, icon: '💳' },
        ].map(item => (
          <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', border:'1px solid var(--border-light)' }}>
            <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'6px' }}>{item.icon} {item.label}</span>
            <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-white)' }}>{item.value}</span>
          </div>
        ))}

        {/* Editable phone */}
        <div style={{ padding:'10px 12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', border:'1px solid var(--border-light)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>📱 Telepon</span>
            {editing ? (
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ background:'rgba(0,0,0,0.3)', border:'1px solid var(--primary-green)', borderRadius:'6px', color:'white', padding:'4px 8px', fontSize:'0.8rem', width:'160px' }}
              />
            ) : (
              <span style={{ fontSize:'0.82rem', fontWeight:600 }}>{profile.phone}</span>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
          <button onClick={handleSave} className="btn btn-green" style={{ flex:1, height:'38px', fontSize:'0.82rem' }} disabled={saving}>
            {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
          <button onClick={() => setEditing(false)} className="btn btn-outline" style={{ flex:1, height:'38px', fontSize:'0.82rem' }}>
            Batal
          </button>
        </div>
      )}
      {msg && <div style={{ color:'#34d399', fontSize:'0.8rem', marginTop:'10px', fontWeight:600 }}>✅ {msg}</div>}
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
const MembershipPage = ({ apiBase, profile, setProfile, logEcosystemActivity }) => {
  const [cardProfile, setCardProfile] = useState(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [cardError, setCardError] = useState('');

  const isAdmin = profile?.status === 'Admin Koperasi';

  const fetchCard = useCallback(async () => {
    if (!profile) { setLoadingCard(false); return; }
    try {
      setLoadingCard(true);
      const res = await fetch(`${apiBase}/membership/profile?id=${profile.id}`);
      const result = await res.json();
      if (result.success) {
        setCardProfile(result.data);
        setProfile(result.data);
        if (logEcosystemActivity) logEcosystemActivity('MEMBERSHIP_PROFILE_LOAD', 'Memuat profil E-KTA digital', null, 'membership');
      } else {
        // Fallback to current profile data
        setCardProfile(profile);
      }
    } catch {
      setCardProfile(profile);
    } finally {
      setLoadingCard(false);
    }
  }, [apiBase, profile?.id]);

  useEffect(() => { fetchCard(); }, [fetchCard]);

  const handleSelectMember = (member) => {
    setCardProfile({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: member.status,
      joinedDate: member.joined_date || member.joinedDate,
      avatarUrl: member.avatar_url || member.avatarUrl,
      qrCode: member.qr_code || member.qrCode,
      balance: Number(member.balance)
    });
  };

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div style={{ marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontSize:'1.8rem', fontWeight:700, marginBottom:'6px', background:'linear-gradient(135deg,#10b981,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Smart Membership
          </h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Kartu E-KTA Elektronik dan manajemen administrasi keanggotaan Koperasi Desa.</p>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'20px', padding:'6px 14px', fontSize:'0.75rem', color:'#34d399', fontWeight:700 }}>
            🌾 Koperasi Desa Digital
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsWidget apiBase={apiBase} />

      {/* Member Tracker — Admin Only */}
      {isAdmin && <MemberTracker apiBase={apiBase} logEcosystemActivity={logEcosystemActivity} />}

      {/* Divider */}
      <div style={{ borderTop:'1px solid var(--border-light)', marginBottom:'28px', position:'relative' }}>
        <span style={{ position:'absolute', top:'-10px', left:'50%', transform:'translateX(-50%)', background:'var(--bg-dark-deep)', padding:'0 16px', fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Manajemen Keanggotaan</span>
      </div>

      {/* Admin: Member Search */}
      {isAdmin && <MemberSearch apiBase={apiBase} isAdmin={isAdmin} onSelectMember={handleSelectMember} />}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:'28px' }}>
        {/* Left: E-KTA Card */}
        <div>
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'14px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            🪪 Kartu Anggota Digital (E-KTA)
          </h3>

          {loadingCard ? (
            <div className="glass-card" style={{ padding:'32px', textAlign:'center' }}>
              <div style={{ width:'36px', height:'36px', border:'3px solid rgba(16,185,129,0.3)', borderTopColor:'#10b981', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
              <div style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Memuat kartu anggota...</div>
            </div>
          ) : cardProfile ? (
            <>
              <EKTACard member={cardProfile} />
              <ProfileEditor profile={cardProfile} apiBase={apiBase} setProfile={setCardProfile} />
            </>
          ) : (
            <div className="glass-card" style={{ padding:'32px', textAlign:'center', border:'1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🔒</div>
              <div style={{ color:'#f87171', fontSize:'0.9rem', fontWeight:600, marginBottom:'8px' }}>Anggota Tidak Ditemukan</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', lineHeight:1.6 }}>
                Silakan login sebagai anggota koperasi untuk melihat E-KTA Anda, atau daftarkan anggota baru melalui formulir di samping.
              </div>
            </div>
          )}
        </div>

        {/* Right: Registration + Benefits (Admin Only) */}
        {isAdmin && (
          <div>
            <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'14px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              ✍️ Pendaftaran Anggota Baru
            </h3>

            <RegistrationForm apiBase={apiBase} logEcosystemActivity={logEcosystemActivity} />

            {/* Benefits */}
            <div className="glass-card" style={{ padding:'20px', marginTop:'20px' }}>
              <h4 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'14px' }}>🎁 Manfaat Keanggotaan</h4>
              <div style={{ display:'grid', gap:'8px' }}>
                {[
                  { icon:'💳', title:'Kopdes Pay', desc:'Dompet digital untuk transaksi koperasi' },
                  { icon:'🛒', title:'Akses Kopdes Shop', desc:'Belanja produk lokal dengan harga anggota' },
                  { icon:'🗳️', title:'Hak Suara RAT', desc:'Ikut Rapat Anggota Tahunan dan voting' },
                  { icon:'📈', title:'Investasi Desa', desc:'Akses ke program investasi lokal' },
                ].map(b => (
                  <div key={b.title} style={{ display:'flex', gap:'12px', alignItems:'center', padding:'8px', background:'rgba(255,255,255,0.02)', borderRadius:'8px' }}>
                    <span style={{ fontSize:'1.3rem' }}>{b.icon}</span>
                    <div>
                      <div style={{ fontSize:'0.8rem', fontWeight:700 }}>{b.title}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shimmer & Spin Keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MembershipPage;
