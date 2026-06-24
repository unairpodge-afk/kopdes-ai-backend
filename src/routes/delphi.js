const express = require('express');
const router = express.Router();
const {
  getActiveSurveys,
  getSurveyHistory,
  getRoundResults,
  submitRoundResponse,
  getAnpResponses,
  submitAnpResponse,
  resetAnpResponses,
  simulateAnpResponses
} = require('../controllers/delphiController');

// Delphi Survey Actions
router.get('/active', getActiveSurveys);
router.get('/history/:surveyId', getSurveyHistory);
router.get('/results/:roundId', getRoundResults);
router.post('/response', submitRoundResponse);

// Delphi-ANP Decision Matrix Actions
router.get('/anp/responses', getAnpResponses);
router.post('/anp/submit', submitAnpResponse);
router.post('/anp/reset', resetAnpResponses);
router.post('/anp/simulate', simulateAnpResponses);

module.exports = router;
