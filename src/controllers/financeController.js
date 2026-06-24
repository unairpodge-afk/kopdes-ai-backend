/**
 * Finance Controller
 * Handles Digital Finance (Savings/Simpanan, Loans/Pinjaman, SHU, and Financial Statements)
 */
const supabase = require('../config/supabaseClient');

// Get overview of cooperative finance
const getFinanceSummary = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('finance_summary').select('*').limit(1);
    if (error) throw new Error(error.message);

    // Provide robust defaults for presentation/hackathon in case of empty table
    let summary = {
      totalAssets: 15000000000,   // Rp 15 Milyar
      totalSavings: 8000000000,   // Rp 8 Milyar
      totalLoans: 5000000000,     // Rp 5 Milyar
      totalSales: 12080000000,    // Rp 12.08 Milyar
      shuThisYear: 1100000000,    // Rp 1.1 Milyar
      savingsBreakdown: {
        pokok: 1500000000,
        wajib: 4500000000,
        sukarela: 2000000000
      }
    };

    if (data && data.length > 0) {
      summary = {
        totalAssets: Number(data[0].total_assets),
        totalSavings: Number(data[0].total_savings),
        totalLoans: Number(data[0].total_loans),
        totalSales: Number(data[0].total_sales),
        shuThisYear: Number(data[0].shu_this_year),
        savingsBreakdown: {
          pokok: Number(data[0].savings_pokok),
          wajib: Number(data[0].savings_wajib),
          sukarela: Number(data[0].savings_sukarela)
        }
      };
    }

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// Get individual member's finance status
const getMemberFinance = async (req, res, next) => {
  try {
    const memberId = req.query.id || '1205 2024 0001';
    const { data: members, error } = await supabase.from('members').select('*').eq('id', memberId);

    if (error || !members || members.length === 0) {
      const err = new Error('Member not found');
      err.statusCode = 404;
      throw err;
    }
    const member = members[0];

    // Mock individual finance data for Budi Santoso
    res.status(200).json({
      success: true,
      data: {
        memberId: member.id,
        memberName: member.name,
        savings: {
          pokok: 1000000,      // Rp 1.000.000
          wajib: 5000000,       // Rp 5.000.000
          sukarela: 3000000,    // Rp 3.000.000
          total: 9000000        // Rp 9.000.000
        },
        loans: {
          limit: 15000000,      // Rp 15.000.000 limit
          outstanding: 4500000, // Rp 4.500.000 active loan
          remaining: 10500000,  // Rp 10.500.000
          dueDate: '2026-07-15'
        },
        shuEarned: {
          lastYear: 850000,     // Rp 850.000
          currentEstimate: 1100000 // Rp 1.100.000 (estimation)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Deposit savings (Simpanan Sukarela)
const depositSavings = async (req, res, next) => {
  try {
    const { memberId, amount, type } = req.body; // type: 'sukarela', 'wajib'

    if (!memberId || !amount || Number(amount) <= 0) {
      const error = new Error('Member ID and a positive amount are required');
      error.statusCode = 400;
      throw error;
    }

    const { data: members, error: memErr } = await supabase.from('members').select('*').eq('id', memberId);
    if (memErr || !members || members.length === 0) {
      const error = new Error('Member not found');
      error.statusCode = 404;
      throw error;
    }

    const depositAmount = Number(amount);
    const savingType = type || 'sukarela';

    // Get current finance summary
    const { data: summaries } = await supabase.from('finance_summary').select('*').limit(1);
    if (summaries && summaries.length > 0) {
      const current = summaries[0];
      const updates = {
        total_savings: Number(current.total_savings) + depositAmount,
        total_assets: Number(current.total_assets) + depositAmount
      };
      if (savingType === 'sukarela') updates.savings_sukarela = Number(current.savings_sukarela) + depositAmount;
      if (savingType === 'wajib') updates.savings_wajib = Number(current.savings_wajib) + depositAmount;
      if (savingType === 'pokok') updates.savings_pokok = Number(current.savings_pokok) + depositAmount;

      await supabase.from('finance_summary').update(updates).eq('id', current.id);
    }

    res.status(200).json({
      success: true,
      message: `Successfully deposited Rp ${depositAmount.toLocaleString('id-ID')} into Simpanan ${savingType.toUpperCase()}`,
      data: {
        memberId,
        amount: depositAmount,
        type: savingType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Apply for a loan (Pinjaman)
const applyLoan = async (req, res, next) => {
  try {
    const { memberId, amount, tenorMonths } = req.body; // tenorMonths: e.g. 12, 24

    if (!memberId || !amount || !tenorMonths) {
      const error = new Error('Member ID, amount, and tenor are required');
      error.statusCode = 400;
      throw error;
    }

    const { data: members, error: memErr } = await supabase.from('members').select('*').eq('id', memberId);
    if (memErr || !members || members.length === 0) {
      const error = new Error('Member not found');
      error.statusCode = 404;
      throw error;
    }

    const loanAmount = Number(amount);

    if (loanAmount > 15000000) {
      const error = new Error('Loan request exceeds maximum limit of Rp 15.000.000');
      error.statusCode = 400;
      throw error;
    }

    // Update overall cooperative metrics (loans outstanding)
    const { data: summaries } = await supabase.from('finance_summary').select('*').limit(1);
    if (summaries && summaries.length > 0) {
      const current = summaries[0];
      await supabase.from('finance_summary').update({
        total_loans: Number(current.total_loans) + loanAmount
      }).eq('id', current.id);
    }

    res.status(201).json({
      success: true,
      message: 'Loan application submitted and approved automatically (V1.0 MVP Auto-Approve)',
      data: {
        loanId: `LN-${Date.now()}`,
        memberId,
        amount: loanAmount,
        tenor: `${tenorMonths} Months`,
        monthlyInstallment: Math.round((loanAmount / tenorMonths) * 1.02), // 2% flat interest rate simulation
        status: 'Approved',
        disbursedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinanceSummary,
  getMemberFinance,
  depositSavings,
  applyLoan
};
