const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  getVotings,
  castVote,
  submitReport
} = require('../controllers/governanceController');

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement); // Admin

// Democracy / Voting
router.get('/votings', getVotings);
router.post('/vote', castVote);

// User Reports / Aspirasi
router.post('/report', submitReport);

module.exports = router;
