import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { kopdesLocations, findNearestKopdes, getKopdesStats } from '../data/kopdesMapData';

// Custom Merah Putih marker icon as SVG data URI
const createKopdesIcon = (isNearest = false) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
    <defs>
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
      </filter>
    </defs>
    <path d="M16 0 C7.2 0 0 7.2 0 16 C0 28 16 44 16 44 C16 44 32 28 32 16 C32 7.2 24.8 0 16 0Z" 
          fill="${isNearest ? '#f59e0b' : '#dc2626'}" filter="url(#shadow)"/>
    <circle cx="16" cy="16" r="10" fill="white"/>
    <circle cx="16" cy="13" r="5" fill="#dc2626"/>
    <rect x="11" y="16" width="10" height="5" rx="0" fill="#dc2626"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'kopdes-marker',
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44]
  });
};

// User location marker
const userIcon = L.divIcon({
  html: `<div style="
    width: 20px; height: 20px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 6px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
    animation: userPulse 2s ease-in-out infinite;
  "></div>`,
  className: 'user-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const KopdesMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const nearestLayerRef = useRef(null);
  const [nearestList, setNearestList] = useState([]);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | success | error
  const [showPanel, setShowPanel] = useState(false);
  const stats = getKopdesStats(kopdesLocations);

  useEffect(() => {
    if (mapInstanceRef.current) return; // Already initialized

    // Initialize map centered on Indonesia
    const map = L.map(mapRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true
    });

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap tile layer with dark style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add all Kopdes markers
    const markersGroup = L.featureGroup();
    
    kopdesLocations.forEach(kopdes => {
      const marker = L.marker([kopdes.lat, kopdes.lng], {
        icon: createKopdesIcon(false)
      });

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 1.4rem;">🇮🇩</span>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem; color: #1e293b; line-height: 1.2;">${kopdes.name}</div>
              <div style="font-size: 0.75rem; color: #64748b;">${kopdes.district}, ${kopdes.province}</div>
            </div>
          </div>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;">
            <div style="font-size: 0.8rem; color: #475569;">${kopdes.description}</div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b;">
            <span>👥 ${kopdes.members} anggota</span>
            <span style="color: #16a34a; font-weight: 700;">● ${kopdes.status}</span>
          </div>
          <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px;">
            Berdiri: ${new Date(kopdes.established).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      `, { maxWidth: 280, className: 'kopdes-popup' });

      marker.addTo(markersGroup);
    });

    markersGroup.addTo(map);
    mapInstanceRef.current = map;

    // Inject animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes userPulse {
        0%, 100% { box-shadow: 0 0 0 6px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3); }
        50% { box-shadow: 0 0 0 14px rgba(59,130,246,0.1), 0 2px 8px rgba(0,0,0,0.3); }
      }
      .kopdes-marker { background: none !important; border: none !important; }
      .user-marker { background: none !important; border: none !important; }
      .kopdes-popup .leaflet-popup-content-wrapper {
        border-radius: 12px !important;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15) !important;
      }
      .kopdes-popup .leaflet-popup-tip {
        box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
      }
      .leaflet-control-zoom a {
        background: rgba(15, 23, 42, 0.85) !important;
        color: #e2e8f0 !important;
        border-color: rgba(255,255,255,0.1) !important;
        backdrop-filter: blur(8px);
      }
      .leaflet-control-zoom a:hover {
        background: rgba(30, 58, 138, 0.9) !important;
      }
      .leaflet-control-attribution {
        background: rgba(15, 23, 42, 0.7) !important;
        color: #94a3b8 !important;
        font-size: 10px !important;
        backdrop-filter: blur(4px);
      }
      .leaflet-control-attribution a { color: #60a5fa !important; }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      document.head.removeChild(style);
    };
  }, []);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }

    setGeoStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        // Remove previous user marker
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }
        // Remove previous nearest highlights
        if (nearestLayerRef.current) {
          map.removeLayer(nearestLayerRef.current);
        }

        // Add user marker
        const userMarker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 4px;">
              <div style="font-size: 1.3rem; margin-bottom: 4px;">📡</div>
              <div style="font-weight: 700; color: #1e293b;">Lokasi Anda</div>
              <div style="font-size: 0.75rem; color: #64748b;">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>
            </div>
          `);
        userMarkerRef.current = userMarker;

        // Find nearest kopdes
        const nearest = findNearestKopdes(latitude, longitude, kopdesLocations, 5);
        setNearestList(nearest);
        setShowPanel(true);

        // Draw lines to nearest and highlight markers
        const nearestGroup = L.featureGroup();
        nearest.forEach((k, idx) => {
          // Draw dashed line from user to kopdes
          const line = L.polyline(
            [[latitude, longitude], [k.lat, k.lng]],
            {
              color: idx === 0 ? '#f59e0b' : '#3b82f6',
              weight: idx === 0 ? 3 : 1.5,
              dashArray: idx === 0 ? '8, 4' : '4, 8',
              opacity: idx === 0 ? 0.9 : 0.5
            }
          );
          line.addTo(nearestGroup);

          // Add highlighted marker for nearest
          if (idx === 0) {
            const nearestMarker = L.marker([k.lat, k.lng], { icon: createKopdesIcon(true) });
            nearestMarker.addTo(nearestGroup);
          }
        });
        nearestGroup.addTo(map);
        nearestLayerRef.current = nearestGroup;

        // Fit bounds to show user + nearest kopdes
        const bounds = L.latLngBounds([[latitude, longitude]]);
        nearest.slice(0, 3).forEach(k => bounds.extend([k.lat, k.lng]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });

        setGeoStatus('success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGeoStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const flyToKopdes = (lat, lng) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([lat, lng], 12, { duration: 1.5 });
    }
  };

  return (
    <div className="glass-card" style={{
      padding: 0,
      borderRadius: '24px',
      overflow: 'hidden',
      border: '2px solid var(--border-light)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(220,38,38,0.1) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🗺️</span>
            <span>Peta Kopdes Merah Putih</span>
            <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>LIVE</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            {stats.totalKopdes} Kopdes • {stats.totalMembers.toLocaleString('id-ID')} Anggota • {stats.totalProvinces} Provinsi
          </p>
        </div>

        <button
          onClick={handleLocateUser}
          disabled={geoStatus === 'loading'}
          style={{
            background: geoStatus === 'success' ? 'linear-gradient(135deg, #16a34a, #059669)' :
                         geoStatus === 'error' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' :
                         'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: geoStatus === 'loading' ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          {geoStatus === 'loading' ? (
            <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Melacak...</>
          ) : geoStatus === 'success' ? (
            <><span>✅</span> Terlacak!</>
          ) : geoStatus === 'error' ? (
            <><span>❌</span> Coba Lagi</>
          ) : (
            <><span>📡</span> Lacak Lokasi Saya</>
          )}
        </button>
      </div>

      {/* Map Container */}
      <div style={{ position: 'relative' }}>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '380px',
            background: '#0a0f1d'
          }}
        />

        {/* Nearest Panel Overlay */}
        {showPanel && nearestList.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: '260px',
            maxHeight: 'calc(100% - 20px)',
            background: 'rgba(10, 15, 29, 0.92)',
            backdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideIn 0.4s ease-out'
          }}>
            <div style={{
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                📍 Kopdes Terdekat
              </span>
              <button
                onClick={() => setShowPanel(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  fontSize: '0.75rem'
                }}
              >✕</button>
            </div>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.15) transparent'
            }}>
              {nearestList.map((k, idx) => (
                <div
                  key={k.id}
                  onClick={() => flyToKopdes(k.lat, k.lng)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: idx === 0 ? 'rgba(245,158,11,0.1)' : 'transparent'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
                  onMouseOut={e => e.currentTarget.style.background = idx === 0 ? 'rgba(245,158,11,0.1)' : 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: idx === 0 ? '#fbbf24' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {idx === 0 && <span style={{ fontSize: '0.7rem' }}>🏆</span>}
                        <span style={{
                          background: idx === 0 ? '#f59e0b' : '#3b82f6',
                          color: 'white',
                          borderRadius: '4px',
                          padding: '1px 5px',
                          fontSize: '0.6rem',
                          fontWeight: 800
                        }}>#{idx + 1}</span>
                        {k.name.replace('Kopdes Merah Putih ', '')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                        {k.province} • 👥 {k.members}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: idx === 0 ? '#34d399' : '#60a5fa',
                      whiteSpace: 'nowrap',
                      marginLeft: '8px'
                    }}>
                      {k.distance < 1 ? `${(k.distance * 1000).toFixed(0)} m` : `${k.distance.toFixed(1)} km`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats bar at bottom of map */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(10,15,29,0.95), transparent)',
          padding: '30px 16px 10px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          zIndex: 999,
          pointerEvents: 'none'
        }}>
          {[
            { icon: '🏘️', label: 'Kopdes Aktif', value: stats.totalKopdes },
            { icon: '👥', label: 'Total Anggota', value: stats.totalMembers.toLocaleString('id-ID') },
            { icon: '🗾', label: 'Provinsi', value: stats.totalProvinces }
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '8px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '0.95rem' }}>{s.icon}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0' }}>{s.value}</div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inject slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default KopdesMap;
