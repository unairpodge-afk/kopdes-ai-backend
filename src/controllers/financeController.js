/**
 * Finance Controller
 * Handles Digital Finance (Savings/Simpanan, Loans/Pinjaman, SHU, and Financial Statements)
 */
const { financeSummary, members } = require('../models/mockDb');

// Get overview of cooperative finance
const getFinanceSummary = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: financeSummary
    });
  } catch (error) {
    next(error);
  }
};

// Get individual member's finance status
const getMemberFinance = (req, res, next) => {
  try {
    const memberId = req.query.id || '1205 2024 0001';
    const member = members.find(m => m.id === memberId);

    if (!member) {
      const error = new Error('Member not found');
      error.statusCode = 404;
      throw error;
    }

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
const depositSavings = (req, res, next) => {
  try {
    const { memberId, amount, type } = req.body; // type: 'sukarela', 'wajib'

    if (!memberId || !amount || Number(amount) <= 0) {
      const error = new Error('Member ID and a positive amount are required');
      error.statusCode = 400;
      throw error;
    }

    const member = members.find(m => m.id === memberId);
    if (!member) {
      const error = new Error('Member not found');
      error.statusCode = 404;
      throw error;
    }

    const depositAmount = Number(amount);
    const savingType = type || 'sukarela';

    // Update overall cooperative metrics
    financeSummary.totalSavings += depositAmount;
    financeSummary.totalAssets += depositAmount;
    if (financeSummary.savingsBreakdown[savingType] !== undefined) {
      financeSummary.savingsBreakdown[savingType] += depositAmount;
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
const applyLoan = (req, res, next) => {
  try {
    const { memberId, amount, tenorMonths } = req.body; // tenorMonths: e.g. 12, 24

    if (!memberId || !amount || !tenorMonths) {
      const error = new Error('Member ID, amount, and tenor are required');
      error.statusCode = 400;
      throw error;
    }

    const member = members.find(m => m.id === memberId);
    if (!member) {
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
    financeSummary.totalLoans += loanAmount;

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
