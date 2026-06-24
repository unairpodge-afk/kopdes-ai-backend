/**
 * Mock Database State
 * Centralized in-memory storage for Kopdes AI Backend V1.0
 */

const members = [
  {
    id: '1205 2024 0001',
    name: 'Budi Santoso',
    email: 'budi.santoso@kopdes.id',
    password: 'password123',
    phone: '081234567890',
    status: 'Anggota Aktif',
    joinedDate: '2024-05-12',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    qrCode: 'KOPDES-BUDI-120520240001',
    balance: 10000000
  },
  {
    id: '1205 2026 0002',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@kopdes.id',
    password: 'password123',
    phone: '081298765432',
    status: 'Anggota Aktif',
    joinedDate: '2026-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    qrCode: 'KOPDES-DEWI-120520260002',
    balance: 15000000
  }
];

const products = [
  {
    id: 'p1',
    name: 'Beras Premium Cianjur',
    category: 'Sembako',
    price: 14500,
    unit: 'Kg',
    stock: 120,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300',
    description: 'Beras pandan wangi kualitas premium langsung dari petani Cianjur.'
  },
  {
    id: 'p2',
    name: 'Kopi Arabika Gayo',
    category: 'Minuman',
    price: 70000,
    unit: 'Kg',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300',
    description: 'Biji kopi arabika pilihan dengan aroma dan cita rasa khas tanah Gayo.'
  },
  {
    id: 'p3',
    name: 'Madu Hutan Liar',
    category: 'Kesehatan',
    price: 85000,
    unit: 'Botol',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300',
    description: 'Madu murni alami yang dipanen langsung dari hutan belantara.'
  },
  {
    id: 'p4',
    name: 'Kakao Bubuk Organik',
    category: 'Bahan Kue',
    price: 28500,
    unit: 'Kg',
    stock: 150,
    image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&q=80&w=300',
    description: 'Bubuk cokelat organik hasil olahan perkebunan kakao desa.'
  }
];

const orders = [
  {
    orderId: 'ORD-240515-801',
    items: [
      {
        productId: 'p2',
        name: 'Kopi Arabika Gayo',
        price: 70000,
        quantity: 2,
        total: 140000
      },
      {
        productId: 'p3',
        name: 'Madu Hutan Liar',
        price: 85000,
        quantity: 1,
        total: 85000
      }
    ],
    totalAmount: 225000,
    paymentMethod: 'KOPDES_PAY',
    status: 'Paid',
    createdAt: '2026-06-22T08:15:30Z'
  }
];

const financeSummary = {
  totalAssets: 5200000000,   // Rp 5,20 M
  totalSavings: 5000000000,  // Rp 5,00 M
  totalLoans: 2780000000,    // Rp 2,78 M
  totalSales: 12080000000,   // Rp 12,08 M
  shuThisYear: 1100000000,   // Rp 1,10 M
  savingsBreakdown: {
    pokok: 1000000000,       // Simpanan Pokok
    wajib: 2500000000,       // Simpanan Wajib
    sukarela: 1500000000     // Simpanan Sukarela
  }
};

const announcements = [
  {
    id: 'a1',
    title: 'Rapat Anggota Tahunan (RAT) Buku 2025',
    content: 'Dihimbau kepada seluruh anggota Koperasi Kopdes AI untuk menghadiri RAT yang akan dilaksanakan pada tanggal 10 Juli 2026.',
    date: '2026-06-20',
    author: 'Pengurus Koperasi'
  },
  {
    id: 'a2',
    title: 'Pembagian Sisa Hasil Usaha (SHU) V1.0',
    content: 'Pemberitahuan pencairan dana SHU tahun buku 2025 dapat diambil melalui aplikasi Kopdes Pay mulai tanggal 25 Juni 2026.',
    date: '2026-06-18',
    author: 'Bendahara Koperasi'
  }
];

const votings = [
  {
    id: 'v1',
    title: 'Persetujuan Rencana Anggaran Belanja (RAB) 2026',
    description: 'Pemilihan suara elektronik persetujuan anggaran pengembangan program Koperasi Desa Digital 2026.',
    startDate: '2026-06-10',
    endDate: '2026-06-30',
    options: [
      { id: 'opt1', text: 'Setuju', votes: 840 },
      { id: 'opt2', text: 'Tidak Setuju', votes: 120 },
      { id: 'opt3', text: 'Golput', votes: 10 }
    ],
    votedMembers: ['1205 2024 0001'] // Budi Santoso has voted
  }
];

const delphiSurveys = [];

const delphiRounds = [];

const delphiResponses = [];

const delphiAnpResponses = [];

const delphiExperts = [
  { member_id: '1205 2024 0001', expertise_area: 'Pertanian Kopi', status: 'active' },
  { member_id: '1205 2026 0002', expertise_area: 'Perdagangan Komoditas', status: 'active' },
  { member_id: '1205 2026 0003', expertise_area: 'Ekonomi Pedesaan', status: 'active' },
  { member_id: 'ADM-KOPDES-001', expertise_area: 'Kebijakan Koperasi', status: 'active' }
];

const cartItems = [];

const investmentProjects = [
  {
    id: 'inv-1',
    title: 'Ekspansi Perkebunan Kopi Arabika Gayo',
    description: 'Pendanaan perluasan lahan perkebunan kopi arabika di tanah Gayo, mencakup pembelian pupuk organik, pembibitan varietas unggul, dan sertifikasi fair-trade ekspor.',
    targetAmount: 150000000,
    raisedAmount: 95000000,
    durationMonths: 12,
    estimatedRoi: 15.5,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
    status: 'funding'
  },
  {
    id: 'inv-2',
    title: 'Pengadaan Mesin Giling Padi Modern Cianjur',
    description: 'Penyediaan mesin rice milling modern di sentra beras Cianjur untuk meningkatkan rendemen hasil panen beras petani lokal dari 55% menjadi 65%.',
    targetAmount: 200000000,
    raisedAmount: 180000000,
    durationMonths: 8,
    estimatedRoi: 12.0,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    status: 'funding'
  },
  {
    id: 'inv-3',
    title: 'Budidaya Madu Hutan Lestari',
    description: 'Kemitraan penangkaran lebah hutan liar terkelola bersama kelompok tani hutan pedesaan untuk memproduksi madu murni berkualitas tinggi secara berkelanjutan.',
    targetAmount: 80000000,
    raisedAmount: 25000000,
    durationMonths: 6,
    estimatedRoi: 18.0,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    status: 'funding'
  }
];

const investments = [
  {
    id: 'invest-1',
    projectId: 'inv-1',
    memberId: '1205 2024 0001',
    amount: 15000000,
    status: 'active',
    createdAt: '2026-06-22T09:00:00Z'
  }
];

const crypto = require('crypto');

const blockchain = [];

const calculateHash = (index, previousHash, timestamp, data) => {
  return crypto
    .createHash('sha256')
    .update(index + previousHash + timestamp + JSON.stringify(data))
    .digest('hex');
};

const addBlock = (data) => {
  const index = blockchain.length;
  const previousHash = index === 0 ? "0".repeat(64) : blockchain[index - 1].hash;
  const timestamp = new Date().toISOString();
  const hash = calculateHash(index, previousHash, timestamp, data);
  const block = {
    index,
    timestamp,
    data,
    previousHash,
    hash
  };
  blockchain.push(block);
  return block;
};

// Seed initial ledger data
addBlock({ type: "GENESIS", message: "Genesis Block - Kopdes AI Blockchain Ledger Initialized" });
addBlock({
  type: "INVESTOR_REGISTRATION",
  memberId: "1205 2024 0001",
  memberName: "Budi Santoso",
  message: "Pakar/Anggota Budi Santoso terdaftar sebagai Node Investor Berdaulat"
});
addBlock({
  type: "PROJECT_INVESTMENT",
  investmentId: "invest-1",
  projectId: "inv-1",
  projectTitle: "Ekspansi Perkebunan Kopi Arabika Gayo",
  memberId: "1205 2024 0001",
  memberName: "Budi Santoso",
  amount: 15000000,
  message: "Transaksi Investasi Saham Syariah disalurkan ke proyek perkebunan kopi"
});

module.exports = {
  members,
  products,
  orders,
  financeSummary,
  announcements,
  votings,
  delphiSurveys,
  delphiRounds,
  delphiResponses,
  delphiExperts,
  cartItems,
  investmentProjects,
  investments,
  blockchain,
  addBlock,
  delphiAnpResponses
};
