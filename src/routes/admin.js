const express = require('express');
const router = express.Router();
const {
  createDelphiSurvey,
  closeRoundAndSummarize,
  advanceRound,
  resetDelphiData,
  getSupplyChain,
  updateSupplyChain,
  updateMemberByAdmin
} = require('../controllers/adminController');

// Delphi Survey Management
router.post('/delphi/create', createDelphiSurvey);
router.post('/delphi/close', closeRoundAndSummarize);
router.post('/delphi/advance', advanceRound);
router.post('/delphi/reset', resetDelphiData);

// Smart Supply Chain Management
router.get('/supply-chain', getSupplyChain);
router.post('/supply-chain/update', updateSupplyChain);

// Member Intervention Management
router.post('/members/update', updateMemberByAdmin);

module.exports = router;
