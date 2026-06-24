const express = require('express');
const router = express.Router();
const {
  getProjects,
  investInProject,
  getMyInvestments,
  createProject,
  registerInvestor,
  getBlockchainLedger,
  logActivity
} = require('../controllers/investorController');

// Project list
router.get('/projects', getProjects);
router.post('/projects', createProject);

// Invest Action
router.post('/invest', investInProject);

// User portfolio
router.get('/my-investments', getMyInvestments);

// Blockchain Ledger and Registration
router.post('/register', registerInvestor);
router.get('/blockchain', getBlockchainLedger);
router.post('/blockchain/log', logActivity);

module.exports = router;
