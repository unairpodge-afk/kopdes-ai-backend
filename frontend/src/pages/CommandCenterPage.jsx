import React, { useState } from 'react';

const CommandCenterPage = () => {
  const kopdesNodes = [
    {
      id: 'kp1',
      name: 'Kopdes Desa Mandiri (Takengon)',
      lat: 4.6291,
      lng: 96.8452,
      status: 'Optimal',
      statusColor: '#10b981',
      protocol: 'LoRaWAN V1.3',
      signal: 'Perfect (-72dBm)',
      elevation: '1,250m',
      sensors: [
        { name: 'Kelembapan Tanah (Kopi)', value: '68%', status: 'Optimal', icon: '🌱' },
        { name: 'Ketinggian Waduk Desa', value: '82%', status: 'Normal', icon: '💧' },
        { name: 'Sensor Suhu Perkebunan', value: '24°C', status: 'Stabil', icon: '🌡️' },
        { name: 'Daya Listrik Tenaga Surya', value: '14.5 kW', status: 'Online', icon: '⚡' }
      ],
      alerts: [
        { title: 'Hujan Lebat & Angin Kencang', area: 'Area Perkebunan Gayo Selatan', content: 'Proyeksi cuaca ekstrem dapat mengganggu proses penjemuran biji kopi luar ruangan. Pindahkan ke kubah pengering.', severity: 'warning', time: '1 jam yang lalu' }
      ]
    },
    {
      id: 'kp2',
      name: 'Kopdes Bener Meriah (Sub-Hub)',
      lat: 4.7431,
      lng: 96.8569,
      status: 'Optimal',
      statusColor: '#10b981',
      protocol: 'Cellular LTE-M',
      signal: 'Good (-84dBm)',
      elevation: '1,380m',
      sensors: [
        { name: 'Kelembapan Tanah (Kopi)', value: '72%', status: 'Optimal', icon: '🌱' },
        { name: 'Ketinggian Waduk Desa', value: '75%', status: 'Normal', icon: '💧' },
        { name: 'Sensor Suhu Perkebunan', value: '22°C', status: 'Stabil', icon: '🌡️' },
        { name: 'Daya Listrik Tenaga Surya', value: '11.2 kW', status: 'Online', icon: '⚡' }
      ],
      alerts: [
        { title: 'Jalur Logistik Lancar', area: 'Rute Distribusi Regional Gayo-Medan', content: 'Truk logistik TRK-2026-001 Kopi Arabika terdeteksi melintasi gerbang pos regional. Estimasi tiba di Medan dalam 4 jam.', severity: 'info', time: '3 jam yang lalu' }
      ]
    },
    {
      id: 'kp3',
      name: 'Kopdes Jagong Jeget (Pertanian)',
      lat: 4.5204,
      lng: 96.7641,
      status: 'Warning',
      statusColor: '#f59e0b',
      protocol: 'LoRaWAN V1.3',
      signal: 'Weak (-102dBm)',
      elevation: '1,120m',
      sensors: [
        { name: 'Kelembapan Tanah (Kopi)', value: '54%', status: 'Rendah', icon: '🌱' },
        { name: 'Ketinggian Waduk Desa', value: '45%', status: 'Waspada', icon: '💧' },
        { name: 'Sensor Suhu Perkebunan', value: '26°C', status: 'Hangat', icon: '🌡️' },
        { name: 'Daya Listrik Tenaga Surya', value: '8.0 kW', status: 'Online', icon: '⚡' }
      ],
      alerts: [
        { title: 'Indikator Kelembapan Menurun', area: 'Sektor Jagong Utara', content: 'Kondisi tanah terdeteksi kering di petak 4B. Diperlukan irigasi tambahan untuk menjaga kualitas pembuahan kopi.', severity: 'warning', time: '30 menit yang lalu' }
      ]
    },
    {
      id: 'kp4',
      name: 'Kopdes Bukit Coffee Roastery',
      lat: 4.7123,
      lng: 96.8790,
      status: 'Maintenance',
      statusColor: '#ef4444',
      protocol: 'LoRaWAN V1.3',
      signal: 'Offline (-)',
      elevation: '1,210m',
      sensors: [
        { name: 'Kelembapan Tanah (Kopi)', value: '45%', status: 'Kering', icon: '🌱' },
        { name: 'Ketinggian Waduk Desa', value: '60%', status: 'Normal', icon: '💧' },
        { name: 'Sensor Suhu Perkebunan', value: '25°C', status: 'Stabil', icon: '🌡️' },
        { name: 'Daya Listrik Tenaga Surya', value: '0.0 kW', status: 'Offline', icon: '⚡' }
      ],
      alerts: [
        { title: 'Pemeliharaan Panel Surya', area: 'Roastery Bukit', content: 'Inverter surya sedang dalam perawatan rutin oleh tim teknisi Kopdes. Daya listrik dialihkan sementara ke generator diesel cadangan.', severity: 'warning', time: '2 jam yang lalu' }
      ]
    }
  ];

  const [selectedNode, setSelectedNode] = useState(kopdesNodes[0]);

  // Google Maps embed template (satellite style + Gayo region coordinates)
  const getEmbedUrl = (lat, lng) => {
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=15&t=k&output=embed`;
  };

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>Village Command Center (GIS)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pusat kendali spasial satelit untuk memantau konektivitas LoRaWAN, telemetri tanah, dan peta logistik antar Kopdes Gayo Highlands.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '6px 12px' }}>
            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span> Gateway Active
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '6px 12px' }}>
            🛰️ Sentinel Sat-2
          </span>
        </div>
      </div>

      {/* Grid Layout: Left Panel Node List, Center Map, Right Telemetry */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        gap: '20px',
        alignItems: 'stretch',
        minHeight: '600px'
      }} className="command-center-layout">
        
        {/* PANEL 1: Kopdes Nodes Directory */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏢</span> Daftar Node Kopdes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flexGrow: 1 }}>
            {kopdesNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: selectedNode.id === node.id ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255,255,255,0.02)',
                  border: selectedNode.id === node.id ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseOver={(e) => {
                  if (selectedNode.id !== node.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseOut={(e) => {
                  if (selectedNode.id !== node.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.8rem', color: selectedNode.id === node.id ? '#60a5fa' : 'white', display: 'block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {node.name}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: node.statusColor, background: `${node.statusColor}15`, padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {node.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>📍 {node.lat.toFixed(4)}, {node.lng.toFixed(4)}</span>
                  <span>📶 {node.signal}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            💡 Klik pada nama Kopdes untuk memfokuskan satelit Google Maps ke wilayah tersebut.
          </div>
        </div>

        {/* PANEL 2: Satellite Map Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ flexGrow: 1, padding: '12px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Satellite View HUD Overlay Header */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              zIndex: 10,
              background: 'rgba(9, 14, 26, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Tracking Target</span>
                <strong style={{ fontSize: '0.85rem', color: '#60a5fa' }}>{selectedNode.name}</strong>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>GPS Coordinates</span>
                  <strong>{selectedNode.lat.toFixed(6)}, {selectedNode.lng.toFixed(6)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Elevation</span>
                  <strong>{selectedNode.elevation}</strong>
                </div>
              </div>
            </div>

            {/* Google Maps Iframe */}
            <div style={{ width: '100%', height: '100%', minHeight: '480px', background: '#090e1a', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <iframe
                title="Google Maps Satelite Fork"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={getEmbedUrl(selectedNode.lat, selectedNode.lng)}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            {/* Satellite view bottom status HUD */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              zIndex: 10,
              background: 'rgba(9, 14, 26, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem' }}>
                <span>📡 Protokol: <strong>{selectedNode.protocol}</strong></span>
                <span>📶 Sinyal Gateway: <strong style={{ color: selectedNode.statusColor }}>{selectedNode.signal}</strong></span>
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }}></span> Sentra Kopi Gayo GIS Tracker
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 3: Telemetry Sensor Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Telemetry metrics box */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📡</span> Telemetri Sensor IoT
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {selectedNode.sensors.map((sensor, i) => (
                <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>{sensor.icon}</span>
                    <span style={{ fontSize: '0.65rem', color: sensor.status === 'Optimal' || sensor.status === 'Normal' || sensor.status === 'Online' ? '#10b981' : '#fbbf24', background: sensor.status === 'Optimal' || sensor.status === 'Normal' || sensor.status === 'Online' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {sensor.status}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0' }}>{sensor.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{sensor.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active warnings and geo-fenced logs for the selected node */}
          <div className="glass-card" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> Mitigasi & Peringatan Cuaca
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flexGrow: 1 }}>
              {selectedNode.alerts.map((alert, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: alert.severity === 'warning' ? 'rgba(245, 158, 11, 0.04)' : 'rgba(37, 99, 235, 0.04)',
                  border: alert.severity === 'warning' ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(37, 99, 235, 0.15)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: alert.severity === 'warning' ? '#fbbf24' : '#60a5fa' }}>
                      {alert.title}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>{alert.area}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3', margin: 0 }}>{alert.content}</p>
                </div>
              ))}
              {selectedNode.alerts.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Tidak ada peringatan aktif di area ini.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CommandCenterPage;
