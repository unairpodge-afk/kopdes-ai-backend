"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KopdesButton,
  KopdesCard,
  KopdesStatCard,
  KopdesBadge,
  KopdesModal,
  KopdesModalHeader,
  KopdesModalTitle,
  KopdesModalContent,
  KopdesModalFooter,
  KopdesInput,
  KopdesTabs,
  StatusBadge,
  CountBadge,
  useToast,
  ToastProvider
} from '../components/kopdes';
import {
  ShoppingCart, Users, TrendingUp, Wallet, Zap, Shield, Globe, Award,
  ChevronRight, Check, X, Mail, Lock, User, Phone, Bell, Sparkles,
  Heart, Eye, EyeOff, Send, ArrowRight, RefreshCw, BarChart2, Leaf,
  Coins, Database, CheckCircle, AlertTriangle, HelpCircle, Activity
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

// --- SUB-COMPONENT: AI TWIN PLAYGROUND ---
function AITwinPlayground() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Halo! Saya Kopdes AI Twin, asisten digital Koperasi Desa Anda. Ada yang bisa saya bantu hari ini terkait tata kelola, analisis keuangan, atau rekomendasi pertanian?',
      time: '12:00'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const presetQuestions = [
    { q: 'Berapa proyeksi SHU Desa tahun ini?', a: 'Berdasarkan volume penjualan Kopdes Shop yang mencapai Rp 12.08 Milyar, proyeksi SHU Bersih untuk anggota adalah Rp 1.100.000 per Kartu Keluarga Anggota aktif.' },
    { q: 'Apakah kepatuhan OJK kita sudah aman?', a: 'Analisis kepatuhan otomatis menunjukkan skor kesehatan koperasi 94.2% (Kategori Sangat Sehat). Semua rasio kecukupan modal dan likuiditas memenuhi standar regulasi OJK.' },
    { q: 'Klaim Kredit Karbon Koperasi?', a: 'Koperasi Desa kita memiliki 2,500 Kredit Karbon aktif dari program Restorasi Hutan Mangrove Desa. Anda dapat mencairkan kredit karbon menjadi saldo Kopdes Pay melalui tab ESG.' }
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setIsTyping(true);

    // Find custom answer or default
    const matchingPreset = presetQuestions.find(p => p.q.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(p.q.toLowerCase()));
    const replyText = matchingPreset 
      ? matchingPreset.a 
      : `Pertanyaan Anda tentang "${text}" telah dicatat. Sebagai AI Twin Koperasi, saya menganalisis bahwa data ledger transaksi desa Anda berada dalam kondisi optimal, dengan tingkat transparansi 100% di blockchain.`;

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: replyText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 1200);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <h4 className="text-lg font-bold text-amber-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Kopdes AI Twin V3.0
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          AI Twin bertindak sebagai konsultan finansial & tata kelola otomatis bagi anggota koperasi dan pengurus desa. Mampu membaca big data transaksi lokal secara real-time.
        </p>
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pertanyaan Rekomendasi:</p>
          {presetQuestions.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.q)}
              className="w-full text-left p-3 text-xs bg-slate-950/40 hover:bg-slate-900 border border-white/5 hover:border-amber-500/30 rounded-xl text-slate-300 transition-all duration-200"
            >
              {p.q}
            </button>
          ))}
        </div>
      </div>
      
      <div className="lg:col-span-2 flex flex-col h-[400px] bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-red-500/20">
              AI
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Kopdes Twin Agent <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-slate-400">Desa Subur Makmur, Indonesia</div>
            </div>
          </div>
          <KopdesBadge variant="gold" size="sm">ONLINE</KopdesBadge>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                m.sender === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-none' 
                  : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none'
              }`}>
                <p className="leading-relaxed">{m.text}</p>
                <span className="block text-[9px] text-right mt-1 opacity-55">{m.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-white/5 text-slate-400 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-slate-900/50 border-t border-white/5 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Tanyakan keuangan, regulasi OJK, atau bibit..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          <KopdesButton 
            size="sm" 
            className="rounded-xl px-3" 
            onClick={() => handleSend(input)}
          >
            <Send className="w-4 h-4" />
          </KopdesButton>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: KOPDES PAY & LEDGER PLAYGROUND ---
function KopdesPayPlayground() {
  const { success, error } = useToast();
  const [balance, setBalance] = useState(9815500);
  const [shuPoints, setShuPoints] = useState(2500);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([
    { id: 'TXN-901', user: 'Ibu Warung Desa', type: 'Belanja Sembako', amount: -150000, hash: '0x7e81...bc01', status: 'Success' },
    { id: 'TXN-902', user: 'Pak Tani Mulyo', type: 'Hasil Panen Padi', amount: 3500000, hash: '0x2a19...fd9a', status: 'Success' },
    { id: 'TXN-903', user: 'Sistem Koperasi', type: 'Klaim Deviden SHU', amount: 1100000, hash: '0x9d4e...3b12', status: 'Success' }
  ]);

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!recipient.trim()) {
      error("Batal", "Silakan masukkan nama penerima!");
      return;
    }
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      error("Gagal", "Nominal transfer tidak valid!");
      return;
    }
    if (parsedAmount > balance) {
      error("Gagal", "Saldo Kopdes Pay tidak mencukupi!");
      return;
    }

    setBalance(prev => prev - parsedAmount);
    const newTxn = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      user: recipient,
      type: 'Transfer Dana',
      amount: -parsedAmount,
      hash: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
      status: 'Success'
    };
    setTransactions(prev => [newTxn, ...prev]);
    setRecipient('');
    setAmount('');
    success("Sukses!", `Berhasil mentransfer Rp ${parsedAmount.toLocaleString('id-ID')} ke ${recipient}`);
  };

  const handleClaimSHU = () => {
    success("Klaim Berhasil!", "Deviden SHU Rp 50.000 telah masuk ke saldo utama Anda.");
    setBalance(prev => prev + 50000);
    setShuPoints(prev => Math.max(0, prev - 100));
    setTransactions(prev => [{
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      user: 'Sistem Koperasi',
      type: 'Pencairan SHU Poin',
      amount: 50000,
      hash: '0x992c...e843',
      status: 'Success'
    }, ...prev]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Wallet Card */}
      <div className="space-y-4">
        <KopdesCard className="bg-gradient-to-r from-slate-900 to-red-950 border-red-500/20 shadow-xl shadow-red-500/5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">Kopdes Pay V3.0 Premium</span>
              <h4 className="text-3xl font-black text-white mt-1">Rp {balance.toLocaleString('id-ID')}</h4>
              <p className="text-xs text-slate-400 mt-1">Nomor Akun: 0822-9901-2038</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
            <div>
              <span className="text-[10px] text-slate-500">Poin Keanggotaan</span>
              <p className="text-sm font-bold text-amber-300 mt-0.5">{shuPoints} Poin</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500">Status Akun</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">Aktif (Verified)</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <KopdesButton 
              variant="gold" 
              size="sm" 
              className="w-full text-xs font-bold" 
              onClick={handleClaimSHU}
              disabled={shuPoints < 100}
            >
              Tukarkan 100 Poin SHU (Rp 50K)
            </KopdesButton>
          </div>
        </KopdesCard>

        {/* Transfer Form */}
        <form onSubmit={handleTransfer} className="bg-slate-950/60 border border-white/10 p-5 rounded-2xl space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kirim Saldo Cepat</h5>
          <div className="grid grid-cols-2 gap-3">
            <KopdesInput
              label="Penerima"
              placeholder="Contoh: Pak Tani"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="text-xs"
            />
            <KopdesInput
              label="Nominal (Rp)"
              type="number"
              placeholder="Jumlah kirim"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-xs"
            />
          </div>
          <KopdesButton type="submit" size="sm" className="w-full text-xs py-2 bg-gradient-to-r from-red-600 to-amber-500">
            Kirim Sekarang <ArrowRight className="w-4 h-4" />
          </KopdesButton>
        </form>
      </div>

      {/* Ledger Audit Trail */}
      <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-500 animate-pulse" /> Decentralized Ledger Audit Trail
            </h5>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Sync
            </span>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {transactions.map((txn, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-xs">
                <div>
                  <div className="font-semibold text-white">{txn.user}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{txn.type}</span>
                    <span className="text-[9px] text-amber-400 font-mono">{txn.hash}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${txn.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[8px] text-slate-500 mt-0.5">{txn.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[9px] text-slate-500 leading-normal mt-4 text-center">
          *Setiap transaksi secara otomatis dicatat ke dalam database Kemenkop pusat melalui audit ledger terenkripsi untuk mencegah fraud/manipulasi laporan.
        </p>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: ESG SCORECARD & CARBON CREDITS ---
function ESGPlayground() {
  const { success } = useToast();
  const [carbonCredits, setCarbonCredits] = useState(2500);
  const [esgScore, setEsgScore] = useState(88);
  const [claiming, setClaiming] = useState(false);

  const handleClaimCarbon = () => {
    setClaiming(true);
    setTimeout(() => {
      setCarbonCredits(prev => prev + 100);
      setEsgScore(prev => Math.min(100, prev + 1));
      setClaiming(false);
      success("Kredit Karbon Disetujui!", "Koperasi Desa Anda berhasil mengklaim +100 Kredit Karbon Hijau dari audit penanaman pohon.");
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ESG Stats */}
      <div className="lg:col-span-1 space-y-4">
        <KopdesCard className="bg-slate-950/60 border-emerald-500/20 text-center flex flex-col items-center p-6">
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Skor ESG Koperasi</span>
          <h4 className="text-6xl font-black text-emerald-300 my-4">{esgScore} <span className="text-lg text-slate-400">/ 100</span></h4>
          <KopdesBadge variant="success" size="md">GRADE A (EXCELLENT)</KopdesBadge>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Skor ESG dinilai dari kelayakan lingkungan (organik), sosial (kesetaraan gender pengurus), dan tata kelola transparan.
          </p>
        </KopdesCard>
      </div>

      {/* Carbon Credits Showcase */}
      <div className="lg:col-span-2 bg-slate-950/80 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" /> Carbon Credits Wallet
            </h5>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Verified by Kemenkop & OJK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Kredit Karbon</span>
              <p className="text-2xl font-black text-white mt-1">{carbonCredits} CO₂e</p>
            </div>
            <div className="bg-slate-900/50 p-4 border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Nilai Konversi</span>
              <p className="text-2xl font-black text-emerald-300 mt-1">Rp {(carbonCredits * 500).toLocaleString('id-ID')}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Klaim kredit karbon dari penanaman mangrove & pengelolaan limbah desa. Kredit karbon yang terverifikasi dapat dikonversi langsung menjadi modal pembangunan atau dibeli oleh investor eksternal.
          </p>
        </div>

        <div className="pt-6">
          <KopdesButton 
            variant="success" 
            className="w-full text-xs font-bold py-3 animate-pulse"
            onClick={handleClaimCarbon}
            disabled={claiming}
          >
            {claiming ? (
              <span className="flex items-center gap-2 justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" /> Sedang Mengaudit Dokumen Lingkungan...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <Coins className="w-4 h-4" /> Klaim Tambahan 100 Kredit Karbon Desa (Pohon Biomassa)
              </span>
            )}
          </KopdesButton>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: COMMODITY EXCHANGE ---
function ExchangePlayground() {
  const { success } = useToast();
  const [commodities, setCommodities] = useState([
    { id: 'c1', name: 'Kopi Gayo Arabika (Grade A)', price: 85000, unit: 'kg', stock: 1200, trend: '+2.4%' },
    { id: 'c2', name: 'Padi Pandanwangi Kering', price: 14500, unit: 'kg', stock: 5000, trend: '-0.8%' },
    { id: 'c3', name: 'Kakao Fermentasi Desa', price: 42000, unit: 'kg', stock: 850, trend: '+1.5%' }
  ]);

  const handleTrade = (name, action) => {
    success(
      "Transaksi Komoditas Berhasil!", 
      `Permintaan ${action === 'buy' ? 'Pembelian' : 'Penjualan'} 10kg ${name} berhasil diverifikasi di Bursa Komoditas Desa.`
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-red-500 animate-pulse" /> Live Bursa Komoditas Tani Desa
        </h5>
        <span className="text-[10px] text-amber-400 font-mono">Server Status: Online & Transparan</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {commodities.map((item) => (
          <div key={item.id} className="bg-slate-950/60 border border-white/10 p-5 rounded-2xl flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-start">
                <h6 className="text-xs font-bold text-white leading-snug">{item.name}</h6>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.trend.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {item.trend}
                </span>
              </div>
              <p className="text-2xl font-black text-amber-300 mt-3">Rp {item.price.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-500">/ {item.unit}</span></p>
              <p className="text-[10px] text-slate-500 mt-1">Stok Gudang Koperasi: {item.stock} kg</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <KopdesButton 
                variant="outline" 
                size="sm" 
                className="text-xs py-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => handleTrade(item.name, 'buy')}
              >
                Beli Koperasi
              </KopdesButton>
              <KopdesButton 
                variant="primary" 
                size="sm" 
                className="text-xs py-2 bg-gradient-to-r from-red-600 to-amber-500"
                onClick={() => handleTrade(item.name, 'sell')}
              >
                Jual Hasil Tani
              </KopdesButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN DEMO PAGE COMPONENT ---
export default function KopdesUIDemo() {
  const [activeMainTab, setActiveMainTab] = useState('control');
  const [activeModuleTab, setActiveModuleTab] = useState('twin');
  const [activeSandboxTab, setActiveSandboxTab] = useState('buttons');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainTabs = [
    { id: 'control', label: '🖥️ Control Tower Kemenkop' },
    { id: 'modules', label: '🚀 Demo Modul Super App' },
    { id: 'components', label: '🎨 Katalog Komponen UI' },
    { id: 'pitch', label: '📜 Pitch Hackathon' }
  ];

  const moduleTabs = [
    { id: 'twin', label: '👥 Kopdes AI Twin V3.0' },
    { id: 'pay', label: '💳 Kopdes Pay & Ledger' },
    { id: 'esg', label: '🌱 ESG & Kredit Karbon' },
    { id: 'exchange', label: '🌾 Bursa Komoditas Tani' }
  ];

  const sandboxTabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'badges', label: 'Badges' },
    { id: 'inputs', label: 'Inputs' }
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0a0f1d] text-white overflow-x-hidden font-sans relative">
        {/* Abstract Glowing Orbs (Hackathon Style) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Hero Pitch Banner */}
        <header className="relative py-16 px-6 text-center max-w-7xl mx-auto border-b border-white/5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" /> Kemenkop UKM Hackathon Project
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            KopDes AI <span className="bg-gradient-to-r from-red-500 via-amber-400 to-red-600 bg-clip-text text-transparent">Super App V3.0</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mt-4 leading-relaxed">
            Akselerasi Koperasi Desa Indonesia melalui digitalisasi keuangan transparan berbasis Web3, Business AI Twin, dan Penilaian Kelayakan ESG Nasional.
          </p>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeMainTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg shadow-red-600/20 border border-red-500/20'
                    : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: CONTROL TOWER KEMENKOP */}
          <AnimatePresence mode="wait">
            {activeMainTab === 'control' && (
              <motion.div
                key="control"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Audit KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KopdesStatCard
                    label="Koperasi Aktif Terkoneksi"
                    value="12,480 Unit"
                    icon={<Users className="w-5 h-5" />}
                    trend={{ value: 14.5, isPositive: true }}
                    color="red"
                  />
                  <KopdesStatCard
                    label="Volume Transaksi Audit"
                    value="Rp 42.8 Milyar"
                    icon={<BarChart2 className="w-5 h-5" />}
                    trend={{ value: 22.1, isPositive: true }}
                    color="gold"
                  />
                  <KopdesStatCard
                    label="Indeks Kelayakan OJK"
                    value="94.2% (Sangat Sehat)"
                    icon={<Shield className="w-5 h-5" />}
                    trend={{ value: 1.5, isPositive: true }}
                    color="green"
                  />
                  <KopdesStatCard
                    label="Rata-rata ESG Nasional"
                    value="Grade A (Excellent)"
                    icon={<Leaf className="w-5 h-5" />}
                    trend={{ value: 5.8, isPositive: true }}
                    color="blue"
                  />
                </div>

                {/* Audit map & Audit trail */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* National Audit Map */}
                  <div className="lg:col-span-2 bg-slate-950/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-amber-400" /> Peta Audit Keuangan Koperasi Nasional
                      </h4>
                      <p className="text-xs text-slate-400 mb-6">
                        Menampilkan pemantauan real-time aktivitas koperasi desa di seluruh provinsi di Indonesia.
                      </p>
                      
                      {/* Fake Interactive Map Area */}
                      <div className="h-[280px] bg-slate-900/40 border border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)]" />
                        <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">[ Peta Satelit Koperasi Indonesia ]</span>
                        
                        {/* Blinking Nodes */}
                        <div className="absolute top-[40%] left-[25%] flex flex-col items-center">
                          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping absolute"></span>
                          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white relative"></span>
                          <span className="text-[8px] bg-slate-950 px-1 py-0.5 rounded text-white mt-1 border border-white/10 font-bold">Sumatera</span>
                        </div>
                        <div className="absolute top-[60%] left-[45%] flex flex-col items-center">
                          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping absolute"></span>
                          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white relative"></span>
                          <span className="text-[8px] bg-slate-950 px-1 py-0.5 rounded text-white mt-1 border border-white/10 font-bold">Jawa Barat</span>
                        </div>
                        <div className="absolute top-[65%] left-[55%] flex flex-col items-center">
                          <span className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping absolute"></span>
                          <span className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white relative"></span>
                          <span className="text-[8px] bg-slate-950 px-1 py-0.5 rounded text-white mt-1 border border-white/10 font-bold">Jawa Timur</span>
                        </div>
                        <div className="absolute top-[50%] left-[70%] flex flex-col items-center">
                          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping absolute"></span>
                          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white relative"></span>
                          <span className="text-[8px] bg-slate-950 px-1 py-0.5 rounded text-white mt-1 border border-white/10 font-bold">Sulawesi</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-4 border-t border-white/5 pt-4">
                      <span>Total Transaksi Audit Hari Ini: <b>429 Txns</b></span>
                      <span>Provinsi Teraktif: <b>Jawa Barat</b></span>
                    </div>
                  </div>

                  {/* Kemenkop Central Audit Logs */}
                  <div className="lg:col-span-1 bg-slate-950/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Database className="w-5 h-5 text-red-500" /> Kemenkop Ledger Logs
                      </h4>
                      <p className="text-xs text-slate-400 mb-4">
                        Pemberitahuan audit sistem mendeteksi semua kepatuhan administrasi daerah.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-emerald-300 font-bold">Audit Laporan Keuangan Desa Subur</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Semua nominal rasio likuiditas sesuai standar OJK.</p>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-amber-300 font-bold">Deteksi Margin Risiko Petani</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Rasio gagal panen di wilayah Sukadamai naik 2.5%.</p>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-emerald-300 font-bold">Penyaluran Kredit Hibah Kemenkop</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Rp 120.000.000 tersalurkan via smart contract ke Koperasi Agro.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal mt-4">
                      *Ledger terpusat ini memungkinkan Kementerian Koperasi memantau kesehatan seluruh koperasi nasional untuk menyalurkan dana bantuan secara tepat sasaran tanpa manipulasi birokrasi.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: MODULES PLAYGROUND */}
            {activeMainTab === 'modules' && (
              <motion.div
                key="modules"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Module selector */}
                <div className="flex flex-wrap justify-center border-b border-white/5 pb-4 gap-2">
                  {moduleTabs.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setActiveModuleTab(mod.id)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                        activeModuleTab === mod.id
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>

                {/* Sub Tab Display */}
                <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                  {activeModuleTab === 'twin' && <AITwinPlayground />}
                  {activeModuleTab === 'pay' && <KopdesPayPlayground />}
                  {activeModuleTab === 'esg' && <ESGPlayground />}
                  {activeModuleTab === 'exchange' && <ExchangePlayground />}
                </div>
              </motion.div>
            )}

            {/* Tab 3: CATALOG SANDBOX */}
            {activeMainTab === 'components' && (
              <motion.div
                key="components"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Showcase categories */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex bg-slate-950/60 backdrop-blur-sm rounded-xl p-1 border border-white/10">
                    {sandboxTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSandboxTab(tab.id)}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                          activeSandboxTab === tab.id
                            ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                  {/* Buttons showcase */}
                  {activeSandboxTab === 'buttons' && (
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Button Variants</h4>
                        <div className="flex flex-wrap gap-3">
                          <KopdesButton variant="primary">Primary Red</KopdesButton>
                          <KopdesButton variant="secondary">Secondary White</KopdesButton>
                          <KopdesButton variant="outline">Outline Red</KopdesButton>
                          <KopdesButton variant="gold">Gold Accent</KopdesButton>
                          <KopdesButton variant="success">Success Emerald</KopdesButton>
                          <KopdesButton variant="danger">Danger Deep Red</KopdesButton>
                          <KopdesButton variant="ghost">Ghost Button</KopdesButton>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Button Sizes</h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <KopdesButton size="sm">Small (sm)</KopdesButton>
                          <KopdesButton size="md">Medium (md)</KopdesButton>
                          <KopdesButton size="lg">Large (lg)</KopdesButton>
                          <KopdesButton size="xl">Extra Large (xl)</KopdesButton>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cards Showcase */}
                  {activeSandboxTab === 'cards' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <KopdesCard hoverable>
                        <h4 className="text-lg font-bold text-white mb-2">Card Standar</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Glassmorphic card premium dengan efek border border-white/10 dan shadow-lg shadow-black/40.
                        </p>
                      </KopdesCard>
                      <KopdesCard variant="slideUp" glow>
                        <h4 className="text-lg font-bold text-white mb-2">Card Glow Aktif</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Card premium dengan bayangan glow merah merona (red brand) untuk menonjolkan fitur utama.
                        </p>
                      </KopdesCard>
                      <KopdesCard variant="bounce" hoverable>
                        <h4 className="text-lg font-bold text-white mb-2">Card Interaktif</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Dilengkapi dengan efek hover scale up & spring animatif dari framer-motion.
                        </p>
                      </KopdesCard>
                    </div>
                  )}

                  {/* Badges Showcase */}
                  {activeSandboxTab === 'badges' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Badge Variants</h4>
                        <div className="flex flex-wrap gap-2">
                          <KopdesBadge variant="default">Default</KopdesBadge>
                          <KopdesBadge variant="primary">Primary</KopdesBadge>
                          <KopdesBadge variant="gold">Gold</KopdesBadge>
                          <KopdesBadge variant="success">Success</KopdesBadge>
                          <KopdesBadge variant="danger">Danger</KopdesBadge>
                          <KopdesBadge variant="outline">Outline</KopdesBadge>
                          <KopdesBadge variant="subtle">Subtle</KopdesBadge>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Status Badges</h4>
                        <div className="flex flex-wrap gap-3">
                          <StatusBadge status="active" pulse>Status Aktif</StatusBadge>
                          <StatusBadge status="pending">Status Diproses</StatusBadge>
                          <StatusBadge status="success">Audit Sukses</StatusBadge>
                          <StatusBadge status="warning">Peringatan</StatusBadge>
                          <StatusBadge status="error">Rasio Kritis</StatusBadge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inputs Showcase */}
                  {activeSandboxTab === 'inputs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      <KopdesInput
                        label="Nama Pengguna"
                        placeholder="Contoh: Budi Santoso"
                        leftIcon={<User className="w-4 h-4 text-slate-500" />}
                      />
                      <KopdesInput
                        label="Email Akun"
                        placeholder="budi@desa.go.id"
                        leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
                        success="Email tervalidasi di database desa"
                      />
                    </div>
                  )}
                </div>

                <div className="text-center pt-4">
                  <KopdesButton onClick={() => setIsModalOpen(true)}>Buka Dialog Modal Demo</KopdesButton>
                </div>

                {/* Modal Demo */}
                <KopdesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
                  <KopdesModalHeader>
                    <KopdesModalTitle>Daftarkan Anggota Baru Koperasi</KopdesModalTitle>
                    <p className="text-xs text-slate-400 mt-1">Lengkapi data warga desa untuk integrasi ledger otomatis.</p>
                  </KopdesModalHeader>
                  <KopdesModalContent>
                    <div className="space-y-4">
                      <KopdesInput
                        label="Nama Lengkap Warga"
                        placeholder="Budi Santoso"
                        leftIcon={<User className="w-4 h-4 text-slate-500" />}
                      />
                      <KopdesInput
                        label="Nomor NIK"
                        placeholder="3273xxxxxxxxxxxx"
                        leftIcon={<Lock className="w-4 h-4 text-slate-500" />}
                      />
                    </div>
                  </KopdesModalContent>
                  <KopdesModalFooter>
                    <KopdesButton variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</KopdesButton>
                    <KopdesButton onClick={() => setIsModalOpen(false)}>Simpan Data</KopdesButton>
                  </KopdesModalFooter>
                </KopdesModal>
              </motion.div>
            )}

            {/* Tab 4: PITCH HACKATHON */}
            {activeMainTab === 'pitch' && (
              <motion.div
                key="pitch"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-slate-950/60 border border-white/10 p-6 rounded-2xl space-y-4">
                  <h4 className="text-lg font-bold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Mengapa Koperasi Tradisional Sulit Maju?
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <span><b>Kerentanan Fraud/Korupsi</b>: Pembukuan manual rentan dimanipulasi oleh pengurus jahat.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <span><b>Ketidakpastian Harga Tani</b>: Petani sering dirugikan oleh tengkulak karena kurangnya akses informasi bursa komoditas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <span><b>Bantuan Salah Sasaran</b>: Kementerian Koperasi sulit memverifikasi secara langsung mana koperasi yang aktif secara sehat versus koperasi fiktif.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950/60 border border-emerald-500/20 p-6 rounded-2xl space-y-4">
                  <h4 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Solusi Kopdes AI Super App V3.0
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <span><b>Web3 Ledger Audit</b>: Semua transaksi diamankan dengan blockchain ledger terdesentralisasi agar transparan 100%.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <span><b>Bursa Tani Terpadu</b>: Memotong rantai tengkulak melalui marketplace komoditas terdesentralisasi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <span><b>Control Tower Pemerintah</b>: Kemenkop dapat memantau rasio kesehatan OJK & ESG secara online secara langsung.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5 text-center mt-12">
          <p className="text-xs text-slate-500">
            Dibuat untuk demo akselerasi Kementerian Koperasi dan UKM RI 🇮🇩
          </p>
        </footer>
      </div>
    </ToastProvider>
  );
}
