import React, { useState } from 'react';

const AITwinPage = () => {
  // Simulator inputs
  const [yieldMultiplier, setYieldMultiplier] = useState(15); // +15% agricultural yield
  const [coopMargin, setCoopMargin] = useState(5.5); // 5.5% cooperative margin
  const [exportPriceIndex, setExportPriceIndex] = useState(110); // 110% export index

  // Calculate projections
  const baseVillageGDP = 45.2; // Rp 45,2 M
  const baseCoopSHU = 1.75; // Rp 1,75 M
  
  const projectedGDP = baseVillageGDP * (1 + yieldMultiplier / 100) * (exportPriceIndex / 100);
  const projectedSHU = baseCoopSHU * (1 + yieldMultiplier / 150) * (coopMargin / 5.5);
  const projectedGrowth = Math.min(100, Math.round(((projectedGDP + projectedSHU) / (baseVillageGDP + baseCoopSHU) - 1) * 100));

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Kopdes AI Twin</h2>
        <p style={{ color: 'var(--text-muted)' }}>Simulasi ekonomi digital dan proyeksi pertumbuhan koperasi desa berbasis kecerdasan buatan.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Side: Simulator Controls */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Parameter Simulasi Desa
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Slider 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600 }}>Hasil Panen Pertanian</span>
                <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>+{yieldMultiplier}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={yieldMultiplier}
                onChange={(e) => setYieldMultiplier(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-green)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meningkatkan volume beras, kopi, dan kakao yang diproduksi.</span>
            </div>

            {/* Slider 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600 }}>Margin Margin Koperasi</span>
                <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{coopMargin}%</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="10.0"
                step="0.5"
                value={coopMargin}
                onChange={(e) => setCoopMargin(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-blue)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mengatur margin keuntungan ritel untuk simpanan/pinjaman & toko.</span>
            </div>

            {/* Slider 3 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600 }}>Indeks Harga Ekspor</span>
                <span style={{ color: 'var(--primary-purple)', fontWeight: 700 }}>{exportPriceIndex}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="150"
                step="5"
                value={exportPriceIndex}
                onChange={(e) => setExportPriceIndex(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-purple)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mengikuti tren pasar komoditas ekspor global.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Projections & Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Output Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div className="glass-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Proyeksi GDP Desa</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Rp {projectedGDP.toFixed(2)} M
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Proyeksi SHU Bersama</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                Rp {projectedSHU.toFixed(2)} M
              </div>
            </div>
          </div>

          {/* Projection Chart */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Simulasi Grafik Pertumbuhan Koperasi</span>
              <span className="badge badge-green">+{projectedGrowth}% Growth</span>
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: '160px',
              paddingTop: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              position: 'relative'
            }}>
              {/* Year 2026 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '60%', height: '50%', background: 'linear-gradient(to top, #1e293b, #475569)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 700 }}>V1.0 (Base)</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>2026</div>
              </div>

              {/* Year 2027 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '60%', height: '68%', background: 'linear-gradient(to top, #0f766e, #14b8a6)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 700 }}>V2.0</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>2027</div>
              </div>

              {/* Year 2028 Projected */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '60%',
                  height: `${Math.min(100, Math.max(20, 68 + projectedGrowth * 0.45))}%`,
                  background: 'linear-gradient(to top, var(--primary-blue), #60a5fa)',
                  borderRadius: '4px 4px 0 0',
                  boxShadow: '0 0 15px rgba(37,99,235,0.3)',
                  position: 'relative',
                  transition: 'height 0.3s ease'
                }}>
                  <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd' }}>V3.0 (Twin)</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>2028</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITwinPage;
