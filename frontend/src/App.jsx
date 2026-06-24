import React, { useState, useEffect } from 'react';
import './App.css';

// Import Pages
import DashboardPage from './pages/DashboardPage';
import MembershipPage from './pages/MembershipPage';
import ShopPage from './pages/ShopPage';
import InvestorPage from './pages/InvestorPage';
import ProductsPage from './pages/ProductsPage';
import FinancePage from './pages/FinancePage';
import GovernancePage from './pages/GovernancePage';
import DelphiSurveyPage from './pages/DelphiSurveyPage';
import AdminPanelPage from './pages/AdminPanelPage';
import PortalPage from './pages/PortalPage';
import AITwinPage from './pages/AITwinPage';
import CommandCenterPage from './pages/CommandCenterPage';
import CommodityExchangePage from './pages/CommodityExchangePage';
import KopdesPayPage from './pages/KopdesPayPage';
import ESGScorecardPage from './pages/ESGScorecardPage';
import RegisterPage from './pages/RegisterPage';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/v1'
  : 'https://kopdes-ai-backend.vercel.app/api/v1';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '');
    return path || 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState(null, '', `/${tabId}`);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      setActiveTab(path || 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [viewMode, setViewMode] = useState('portal'); // 'portal', 'desktop', or 'mobile'
  const [serverStatus, setServerStatus] = useState('checking');
  const [profile, setProfile] = useState(null);

  // Verify backend connectivity
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        if (data.success) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (err) {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  const menuCategories = [
    {
      id: 'core',
      label: 'Utama',
      icon: '🌾',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'membership', label: 'Smart Membership', icon: '👤' },
        { id: 'pay', label: 'Kopdes Pay (V3.0)', icon: '💳' },
        { id: 'esg', label: 'ESG & Sustainability (V3.0)', icon: '🌱' }
      ]
    },
    {
      id: 'economy',
      label: 'Ekonomi & Pasar',
      icon: '🛒',
      items: [
        { id: 'shop', label: 'Kopdes Shop', icon: '🛒' },
        { id: 'products', label: 'Manajemen Produk', icon: '📦' },
        { id: 'exchange', label: 'Commodity Exchange (V3.0)', icon: '📈' }
      ]
    },
    {
      id: 'finance_invest',
      label: 'Investasi & Finansial',
      icon: '💰',
      items: [
        { id: 'investor', label: 'Investor Hub (V2.0)', icon: '📈' },
        { id: 'daftar', label: 'Daftar Investor Ledger', icon: '🔑' },
        { id: 'finance', label: 'Digital Finance', icon: '💰' }
      ]
    },
    {
      id: 'governance_ai',
      label: 'Tata Kelola & AI',
      icon: '🔮',
      items: [
        { id: 'governance', label: 'Governance Hub', icon: '🗳️' },
        { id: 'delphi', label: 'Delphi Survey (V2.0)', icon: '🔮' },
        { id: 'twin', label: 'Kopdes AI Twin (V3.0)', icon: '👥' }
      ]
    },
    {
      id: 'system',
      label: 'Sistem',
      icon: '⚙️',
      items: [
        { id: 'admin', label: 'Admin Panel (V2.0)', icon: '⚙️' },
        { id: 'center', label: 'Command Center (V3.0)', icon: '📡' }
      ]
    }
  ];

  const hasAccess = (tabId) => {
    if (!profile) return false;
    const status = profile.status;
    if (tabId === 'admin' || tabId === 'center' || tabId === 'products') {
      return status === 'Admin Koperasi';
    }
    if (tabId === 'governance' || tabId === 'pay') {
      return status === 'Anggota Koperasi' || status === 'Admin Koperasi' || status === 'Anggota & Investor';
    }
    if (tabId === 'delphi') {
      return status === 'Mitra Investor' || status === 'Admin Koperasi' || status === 'Anggota & Investor';
    }
    return true;
  };

  const renderAccessDenied = () => {
    let requiredRoles = "";
    let reason = "";
    if (activeTab === 'governance' || activeTab === 'pay') {
      requiredRoles = "Anggota Koperasi / Admin Koperasi / Anggota & Investor";
      reason = "Halaman voting Rencana Kerja RAT & e-wallet Kopdes Pay hanya terbuka bagi anggota koperasi aktif yang terdaftar di database desa.";
    } else if (activeTab === 'delphi') {
      requiredRoles = "Mitra Investor / Admin Koperasi / Anggota & Investor";
      reason = "Survei Delphi Evaluasi Kelayakan Nasional hanya dapat diakses oleh Panelis Ahli eksternal (Kemenkop, Kemenristek, OJK) dan Pengurus.";
    } else {
      requiredRoles = "Admin Koperasi";
      reason = "Akses terbatas untuk Administrator Koperasi Desa untuk mengelola produk katalog dan memantau command center.";
    }

    return (
      <div className="glass-card animate-fade" style={{
        maxWidth: '550px',
        margin: '60px auto',
        padding: '35px',
        textAlign: 'center',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        background: 'rgba(15, 10, 18, 0.65)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f87171', marginBottom: '12px' }}>Akses Dibatasi (Otoritas Tidak Cukup)</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '20px' }}>
          {reason}
        </p>
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div>Peran Anda Saat Ini: <strong style={{ color: 'var(--primary-green)' }}>{profile?.status || 'Tamu'}</strong></div>
          <div style={{ marginTop: '4px' }}>Peran yang Dibutuhkan: <strong style={{ color: '#60a5fa' }}>{requiredRoles}</strong></div>
        </div>
        <button className="btn btn-blue" style={{ cursor: 'pointer', height: '36px', fontSize: '0.85rem' }} onClick={() => navigateTo('dashboard')}>
          Kembali ke Dashboard Utama
        </button>
      </div>
    );
  };

  const logEcosystemActivity = async (type, message, amount = null, link = null) => {
    try {
      await fetch(`${API_BASE}/investor/blockchain/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          memberId: profile?.id || 'GUEST',
          memberName: profile?.name || 'Tamu Ekosistem',
          message,
          amount,
          link
        })
      });
    } catch (err) {
      console.error('Gagal mencatat log blockchain:', err);
    }
  };

  const renderActivePage = () => {
    const mainTab = activeTab.split('/')[0];
    const subRoute = activeTab.split('/').slice(1).join('/');

    switch (mainTab) {
      case 'dashboard':
        return <DashboardPage apiBase={API_BASE} profile={profile} navigateTo={navigateTo} subRoute={subRoute} logEcosystemActivity={logEcosystemActivity} />;
      case 'membership':
        return <MembershipPage apiBase={API_BASE} profile={profile} setProfile={setProfile} logEcosystemActivity={logEcosystemActivity} />;
      case 'shop':
        return <ShopPage apiBase={API_BASE} profile={profile} setProfile={setProfile} logEcosystemActivity={logEcosystemActivity} navigateTo={navigateTo} />;
      case 'investor':
        return <InvestorPage apiBase={API_BASE} profile={profile} setProfile={setProfile} navigateTo={navigateTo} subRoute={subRoute} logEcosystemActivity={logEcosystemActivity} />;
      case 'products':
        return <ProductsPage apiBase={API_BASE} profile={profile} logEcosystemActivity={logEcosystemActivity} />;
      case 'finance':
        return <FinancePage apiBase={API_BASE} profile={profile} setProfile={setProfile} logEcosystemActivity={logEcosystemActivity} />;
      case 'governance':
        return <GovernancePage apiBase={API_BASE} profile={profile} logEcosystemActivity={logEcosystemActivity} />;
      case 'delphi':
        return <DelphiSurveyPage apiBase={API_BASE} profile={profile} navigateTo={navigateTo} logEcosystemActivity={logEcosystemActivity} />;
      case 'daftar':
        return <RegisterPage apiBase={API_BASE} profile={profile} setProfile={setProfile} navigateTo={navigateTo} logEcosystemActivity={logEcosystemActivity} />;
      case 'admin':
        return <AdminPanelPage apiBase={API_BASE} profile={profile} logEcosystemActivity={logEcosystemActivity} navigateTo={navigateTo} />;
      case 'twin':
        return <AITwinPage profile={profile} logEcosystemActivity={logEcosystemActivity} />;
      case 'center':
        return <CommandCenterPage profile={profile} logEcosystemActivity={logEcosystemActivity} />;
      case 'exchange':
        return <CommodityExchangePage profile={profile} logEcosystemActivity={logEcosystemActivity} />;
      case 'pay':
        return <KopdesPayPage profile={profile} setProfile={setProfile} apiBase={API_BASE} logEcosystemActivity={logEcosystemActivity} />;
      case 'esg':
        return <ESGScorecardPage profile={profile} setProfile={setProfile} apiBase={API_BASE} logEcosystemActivity={logEcosystemActivity} />;
      default:
        return <DashboardPage apiBase={API_BASE} profile={profile} navigateTo={navigateTo} subRoute={subRoute} logEcosystemActivity={logEcosystemActivity} />;
    }
  };

  if (viewMode === 'portal') {
    return <PortalPage setViewMode={setViewMode} apiBase={API_BASE} setProfile={setProfile} profile={profile} />;
  }

  return (
    <div className={`app-container ${viewMode}-mode`}>
      {/* Main Container */}
      <main className="main-content">
        {/* Top Dropdown Navbar */}
        <header className="top-navbar">
          {/* Brand Logo & Connection Indicator */}
          <div className="navbar-brand" onClick={() => navigateTo('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="navbar-logo-icon">🌾</div>
            <div className="navbar-brand-info">
              <span className="navbar-logo-title">KOPDES AI</span>
              <span className="navbar-logo-tag">SUPER APP V3.0</span>
            </div>
            <div className="connection-pill" style={{ marginLeft: '10px' }}>
              <span className={`status-dot ${serverStatus}`}></span>
              <span style={{ fontSize: '0.7rem' }}>
                {serverStatus === 'online' ? 'Online' : serverStatus === 'checking' ? 'Checking' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Categorized Navigation Dropdowns (Desktop only) */}
          {viewMode === 'desktop' && (
            <nav className="navbar-categories">
              {menuCategories.map((cat) => {
                const visibleItems = cat.items.filter((item) => hasAccess(item.id));

                if (visibleItems.length === 0) return null;

                return (
                  <div key={cat.id} className="nav-dropdown-wrapper">
                    <button className="nav-dropdown-trigger">
                      <span>{cat.icon} {cat.label}</span>
                      <span className="chevron">▼</span>
                    </button>
                    <div className="nav-dropdown-menu">
                      {visibleItems.map((item) => (
                        <button
                          key={item.id}
                          className={`nav-dropdown-item ${activeTab === item.id ? 'active' : ''}`}
                          onClick={() => navigateTo(item.id)}
                        >
                          <span className="item-icon">{item.icon}</span>
                          <span className="item-label">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          )}

          {/* Right-aligned actions (switcher, profile info, logout) */}
          <div className="navbar-actions">
            {/* Mobile Menu Dropdown (Visible on small screens/Android) */}
            {viewMode === 'desktop' && (
              <div className="mobile-nav-wrapper">
                <button 
                  className="mobile-nav-trigger"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span>{mobileMenuOpen ? '✕' : '☰'}</span>
                  <span className="mobile-nav-trigger-text">Menu</span>
                </button>
                
                {mobileMenuOpen && (
                  <div className="mobile-nav-dropdown-menu">
                    {menuCategories.map((cat) => {
                      const visibleItems = cat.items.filter((item) => hasAccess(item.id));
                      if (visibleItems.length === 0) return null;
                      return (
                        <div key={cat.id} className="mobile-nav-category-group">
                          <div className="mobile-nav-category-header">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </div>
                          <div className="mobile-nav-category-items">
                            {visibleItems.map((item) => (
                              <button
                                key={item.id}
                                className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => navigateTo(item.id)}
                              >
                                <span className="item-icon">{item.icon}</span>
                                <span className="item-label">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}


            {/* Profile Brief */}
            {profile && (
              <div className="profile-widget" style={{ cursor: 'pointer' }} onClick={() => navigateTo('membership')}>
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                  alt="Profile"
                  className="profile-img"
                />
                <div className="profile-details">
                  <span className="profile-name">{profile.name}</span>
                  <span className="profile-role" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>{profile.status}</span>
                    <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>
                      Rp {Number(profile.balance || 0).toLocaleString('id-ID')}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Logout button */}
            <button
              className="btn logout-btn"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px'
              }}
              onClick={() => {
                setProfile(null);
                setViewMode('portal');
              }}
            >
              <span>🚪</span>
              <span className="logout-text">Keluar</span>
            </button>
          </div>
        </header>

        {/* Server offline banner warning */}
        {serverStatus === 'offline' && (
          <div className="connection-warning">
            ⚠️ <strong>Backend Offline:</strong> Mohon jalankan server backend dengan <code>npm start</code> pada port 5000.
          </div>
        )}

        {/* Page Render */}
        <div className="workspace-area">
          <div className="page-container">
            {hasAccess(activeTab) ? renderActivePage() : renderAccessDenied()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
