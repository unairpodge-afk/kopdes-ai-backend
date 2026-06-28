const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  getVotings,
  castVote,
  submitReport,
  getCooperativeNews
} = require('../controllers/governanceController');

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement); // Admin

// Democracy / Voting
router.get('/votings', getVotings);
router.post('/vote', castVote);

// User Reports / Aspirasi
router.post('/report', submitReport);

// Cooperative News
router.get('/news', getCooperativeNews);

module.exports = router;
