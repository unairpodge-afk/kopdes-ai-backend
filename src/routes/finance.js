const express = require('express');
const router = express.Router();
const {
  getFinanceSummary,
  getMemberFinance,
  depositSavings,
  applyLoan
} = require('../controllers/financeController');

// Finance reports and individual checks
router.get('/summary', getFinanceSummary);
router.get('/member', getMemberFinance);

// Transactions
router.post('/deposit', depositSavings);
router.post('/loan-apply', applyLoan);

module.exports = router;
