/**
 * Investor Controller
 * Handles Agricultural & Village Cooperative Project Investments via Supabase Client
 */
const supabase = require('../config/supabaseClient');

// Get all investment projects
const getProjects = async (req, res, next) => {
  try {
    const { data: projects, error } = await supabase
      .from('investment_projects')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// Invest in a project
const investInProject = async (req, res, next) => {
  try {
    const { projectId, memberId, amount } = req.body;

    if (!projectId || !memberId || !amount || Number(amount) <= 0) {
      const error = new Error('Project ID, Member ID, dan nominal investasi yang valid wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    const investAmount = Number(amount);

    // 1. Verify Project
    const { data: pList, error: pErr } = await supabase
      .from('investment_projects')
      .select('*')
      .eq('id', projectId);

    if (pErr || !pList || pList.length === 0) {
      const error = new Error('Proyek investasi tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const project = pList[0];
    if (project.status !== 'funding') {
      const error = new Error('Proyek ini sudah ditutup untuk pendanaan baru');
      error.statusCode = 400;
      throw error;
    }

    // Check if target is exceeded
    const remainingTarget = Number(project.target_amount) - Number(project.raised_amount);
    if (investAmount > remainingTarget) {
      const error = new Error(`Nominal investasi melebihi sisa target pendanaan. Maksimum pendanaan sisa: Rp ${remainingTarget.toLocaleString('id-ID')}`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Verify Member
    const { data: mList, error: mErr } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId);

    if (mErr || !mList || mList.length === 0) {
      const error = new Error('Anggota tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const member = mList[0];
    if (Number(member.balance) < investAmount) {
      const error = new Error(`Saldo Kopdes Pay Anda tidak mencukupi. Dibutuhkan: Rp ${investAmount.toLocaleString('id-ID')}, Saldo Anda: Rp ${Number(member.balance).toLocaleString('id-ID')}`);
      error.statusCode = 400;
      throw error;
    }

    // 3. Insert Investment Record
    const investmentId = `uuid-inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const { error: invErr } = await supabase
      .from('investments')
      .insert({
        id: investmentId,
        project_id: projectId,
        member_id: memberId,
        amount: investAmount,
        status: 'active'
      });

    if (invErr) throw new Error(invErr.message);

    // 4. Deduct Member balance
    const { error: balErr } = await supabase
      .from('members')
      .update({ balance: Number(member.balance) - investAmount })
      .eq('id', memberId);

    if (balErr) throw new Error(balErr.message);

    // 5. Update Project raised_amount
    const newRaisedAmount = Number(project.raised_amount) + investAmount;
    const newStatus = newRaisedAmount >= Number(project.target_amount) ? 'closed' : 'funding';
    
    const { error: projUpdateErr } = await supabase
      .from('investment_projects')
      .update({ 
        raised_amount: newRaisedAmount,
        status: newStatus
      })
      .eq('id', projectId);

    if (projUpdateErr) throw new Error(projUpdateErr.message);

    // 6. Record to Blockchain Ledger
    const blockchain = require('../utils/blockchain');
    if (blockchain.addBlock) {
      blockchain.addBlock({
        type: "PROJECT_INVESTMENT",
        investmentId,
        projectId,
        projectTitle: project.title,
        memberId,
        memberName: member.name,
        amount: investAmount,
        message: `Transaksi Investasi Saham Syariah disalurkan ke proyek ${project.title}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Investasi berhasil disalurkan. Terima kasih atas partisipasi Anda!',
      data: {
        investmentId,
        projectId,
        projectTitle: project.title,
        amount: investAmount,
        roi: project.estimated_roi,
        duration: project.duration_months,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get member's investments
const getMyInvestments = async (req, res, next) => {
  try {
    const { memberId } = req.query;

    if (!memberId) {
      const error = new Error('Member ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    const { data: investments, error } = await supabase
      .from('investments')
      .select('*, investment_projects(*)')
      .eq('member_id', memberId);

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      data: investments || []
    });
  } catch (error) {
    next(error);
  }
};

// Create a new investment project (Admin only)
const createProject = async (req, res, next) => {
  try {
    const { title, description, targetAmount, durationMonths, estimatedRoi, image } = req.body;

    if (!title || !targetAmount || !durationMonths || !estimatedRoi) {
      const error = new Error('Title, targetAmount, durationMonths, and estimatedRoi are required');
      error.statusCode = 400;
      throw error;
    }

    const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const { data: newProject, error } = await supabase
      .from('investment_projects')
      .insert({
        id: projectId,
        title,
        description: description || '',
        target_amount: Number(targetAmount),
        raised_amount: 0,
        duration_months: Number(durationMonths),
        estimated_roi: Number(estimatedRoi),
        image: image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
        status: 'pending'
      });

    if (error) throw new Error(error.message);

    res.status(201).json({
      success: true,
      message: 'Project proposal submitted successfully',
      data: newProject ? newProject[0] : null
    });
  } catch (error) {
    next(error);
  }
};

// Approve a project (Admin only)
const approveProject = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      const error = new Error('Project ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    // 1. Get project details to log to Blockchain
    const { data: pList, error: pErr } = await supabase
      .from('investment_projects')
      .select('*')
      .eq('id', projectId);

    if (pErr || !pList || pList.length === 0) {
      const error = new Error('Proyek investasi tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const project = pList[0];

    // 2. Update status to 'funding'
    const { data, error } = await supabase
      .from('investment_projects')
      .update({ status: 'funding' })
      .eq('id', projectId);

    if (error) throw new Error(error.message);

    // 3. Record project approval/creation to Blockchain Ledger
    const blockchain = require('../utils/blockchain');
    if (blockchain.addBlock) {
      blockchain.addBlock({
        type: "PROJECT_CREATION",
        projectTitle: project.title,
        targetAmount: Number(project.target_amount),
        message: `Kampanye Crowdfunding baru dirilis & disetujui: ${project.title}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proyek berhasil disetujui dan dirilis ke publik',
      data: data ? data[0] : null
    });
  } catch (error) {
    next(error);
  }
};

// Reject a project (Admin only)
const rejectProject = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      const error = new Error('Project ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    // 1. Update status to 'rejected'
    const { data, error } = await supabase
      .from('investment_projects')
      .update({ status: 'rejected' })
      .eq('id', projectId);

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      message: 'Proyek berhasil ditolak',
      data: data ? data[0] : null
    });
  } catch (error) {
    next(error);
  }
};

// Register a member as an investor (enrolling them to the Blockchain Ledger)
const registerInvestor = async (req, res, next) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      const error = new Error('Member ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    // 1. Get member details
    const { data: mList, error: mErr } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId);

    if (mErr || !mList || mList.length === 0) {
      const error = new Error('Anggota tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const member = mList[0];

    // 2. Update Member status to 'Anggota & Investor'
    const { error: updateErr } = await supabase
      .from('members')
      .update({ status: 'Anggota & Investor' })
      .eq('id', memberId);

    if (updateErr) throw new Error(updateErr.message);

    // 3. Record investor registration to Blockchain Ledger
    const blockchain = require('../utils/blockchain');
    let block = null;
    if (blockchain.addBlock) {
      block = blockchain.addBlock({
        type: "INVESTOR_REGISTRATION",
        memberId: member.id,
        memberName: member.name,
        message: `Pakar/Anggota ${member.name} terdaftar sebagai Node Investor Berdaulat`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registrasi Investor berhasil dicatat pada Ledger Blockchain!',
      data: {
        memberId: member.id,
        newStatus: 'Anggota & Investor',
        block
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get the entire blockchain ledger history
const getBlockchainLedger = async (req, res, next) => {
  try {
    const { data: blocks, error } = await supabase
      .from('blockchain')
      .select('*');

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      count: blocks.length,
      data: blocks
    });
  } catch (error) {
    next(error);
  }
};

// Log a generic activity/event to the blockchain ledger
const logActivity = async (req, res, next) => {
  try {
    const { type, memberId, memberName, message, amount, link } = req.body;

    const blockchain = require('../utils/blockchain');
    let block = null;
    if (blockchain.addBlock) {
      block = blockchain.addBlock({
        type,
        memberId,
        memberName,
        message,
        amount: amount ? Number(amount) : undefined,
        link
      });
    }

    res.status(201).json({
      success: true,
      message: 'Aktivitas berhasil dicatat di Blockchain Koperasi Desa',
      data: block
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  investInProject,
  getMyInvestments,
  createProject,
  approveProject,
  rejectProject,
  registerInvestor,
  getBlockchainLedger,
  logActivity
};
