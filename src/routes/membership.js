const express = require('express');
const router = express.Router();
const {
  registerMember,
  loginMember,
  getProfile,
  getStats,
  getAllMembers,
  sendOTP
} = require('../controllers/membershipController');

// Authentication / Registration
router.post('/register', registerMember);
router.post('/send-otp', sendOTP);
router.post('/login', loginMember);

// Member profile and stats
router.get('/profile', getProfile);
router.get('/stats', getStats);
router.get('/list', getAllMembers);

module.exports = router;
