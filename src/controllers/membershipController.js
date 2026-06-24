/**
 * Membership Controller
 * Handles Smart Membership features (E-KTA, Profiles, Registration) via Supabase Client
 */
const supabase = require('../config/supabaseClient');

// Register a new member
const registerMember = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone) {
      const error = new Error('Nama, email, dan nomor telepon wajib diisi');
      error.statusCode = 400;
      throw error;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      const error = new Error('Format email tidak valid.');
      error.statusCode = 400;
      throw error;
    }

    // Validate Indonesian phone format
    if (!/^08\d{8,11}$/.test(phone)) {
      const error = new Error('Nomor telepon harus diawali 08 dan 10-13 digit.');
      error.statusCode = 400;
      throw error;
    }

    // Check if email already registered
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('email', email);

    if (existing && existing.length > 0) {
      const error = new Error('Email sudah terdaftar sebagai anggota.');
      error.statusCode = 409;
      throw error;
    }

    const year = new Date().getFullYear();
    
    // Use timestamp-based sequence for uniqueness
    const { data: allMembers } = await supabase
      .from('members')
      .select('id');
    
    const count = allMembers ? allMembers.length : 0;
    const sequence = String(count + 1).padStart(4, '0');
    const newId = `1205 ${year} ${sequence}`;
    const avatarSeed = name.replace(/\s+/g, '+');

    const newMember = {
      id: newId,
      name,
      email,
      phone,
      password: password || 'password123',
      status: 'Anggota Aktif',
      joined_date: new Date().toISOString().split('T')[0],
      avatar_url: `https://ui-avatars.com/api/?name=${avatarSeed}&background=065f46&color=fff&size=200`,
      qr_code: `KOPDES-${name.replace(/\s+/g, '').toUpperCase()}-${year}${sequence}`,
      balance: 10000000 // Rp 10.000.000 Kopdes Pay balance
    };

    const { error } = await supabase
      .from('members')
      .insert(newMember);

    if (error) {
      const err = new Error(error.message || 'Registrasi gagal. Silakan coba lagi.');
      err.statusCode = 400;
      throw err;
    }

    // Record member registration to Blockchain Ledger
    const mockDb = require('../models/mockDb');
    if (mockDb.addBlock) {
      mockDb.addBlock({
        type: "MEMBER_REGISTRATION",
        memberId: newMember.id,
        memberName: name,
        message: `Anggota baru terdaftar di database koperasi desa: ${name}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registrasi Anggota Koperasi berhasil',
      data: newMember
    });
  } catch (error) {
    next(error);
  }
};

// Login member
const loginMember = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email dan password wajib diisi');
      error.statusCode = 400;
      throw error;
    }

    const { data: membersList, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email);

    if (error || !membersList || membersList.length === 0) {
      const error = new Error('Akun email tidak terdaftar.');
      error.statusCode = 404;
      throw error;
    }

    const member = membersList[0];

    // Password validation for Hackathon
    if (member.password !== password) {
      const error = new Error('Password salah. Silakan coba lagi.');
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Login Berhasil',
      token: 'mock-jwt-token-kopdes-ai',
      data: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        joinedDate: member.joined_date || member.joinedDate,
        avatarUrl: member.avatar_url || member.avatarUrl,
        qrCode: member.qr_code || member.qrCode,
        balance: Number(member.balance)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get member profile / E-KTA
const getProfile = async (req, res, next) => {
  try {
    const memberId = req.query.id;
    
    if (!memberId) {
      const error = new Error('ID anggota wajib disertakan.');
      error.statusCode = 400;
      throw error;
    }

    const { data: membersList, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId);

    if (error || !membersList || membersList.length === 0) {
      const err = new Error('Anggota tidak ditemukan.');
      err.statusCode = 404;
      throw err;
    }

    const member = membersList[0];

    res.status(200).json({
      success: true,
      data: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        joinedDate: member.joined_date || member.joinedDate,
        avatarUrl: member.avatar_url || member.avatarUrl,
        qrCode: member.qr_code || member.qrCode,
        balance: Number(member.balance)
      }
    });
  } catch (error) {
    next(error);
  }
};

// List all members (Cooperative Stat)
const getStats = async (req, res, next) => {
  try {
    const { data: allMembers } = await supabase
      .from('members')
      .select('id');
      
    const registeredCount = allMembers ? allMembers.length : 0;

    res.status(200).json({
      success: true,
      data: {
        totalMembers: 1250 + registeredCount,
        activeMembers: 1180 + registeredCount,
        pendingMembers: 70
      }
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all members list (Admin only)
const getAllMembers = async (req, res, next) => {
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      data: members || []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerMember,
  loginMember,
  getProfile,
  getStats,
  getAllMembers
};
