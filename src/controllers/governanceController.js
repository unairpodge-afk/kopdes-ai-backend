/**
 * Governance Controller
 * Handles Governance Hub features (Announcements, Electronic Voting, Cooperative Reports)
 */
const { announcements, votings } = require('../models/mockDb');

// Get all announcements
const getAnnouncements = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};

// Create a new announcement (admin function)
const createAnnouncement = (req, res, next) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      const error = new Error('Title and content are required');
      error.statusCode = 400;
      throw error;
    }

    const newAnnouncement = {
      id: `a${announcements.length + 1}`,
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      author: author || 'Pengurus Koperasi'
    };

    announcements.unshift(newAnnouncement); // Newest first

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: newAnnouncement
    });
  } catch (error) {
    next(error);
  }
};

// Get list of active votings
const getVotings = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: votings
    });
  } catch (error) {
    next(error);
  }
};

// Cast a vote in a poll
const castVote = (req, res, next) => {
  try {
    const { votingId, optionId, memberId } = req.body;

    if (!votingId || !optionId || !memberId) {
      const error = new Error('Voting ID, Option ID, and Member ID are required');
      error.statusCode = 400;
      throw error;
    }

    const poll = votings.find(v => v.id === votingId);
    if (!poll) {
      const error = new Error(`Voting session with ID ${votingId} not found`);
      error.statusCode = 404;
      throw error;
    }

    // Check if member already voted
    if (poll.votedMembers.includes(memberId)) {
      const error = new Error('You have already cast a vote for this session');
      error.statusCode = 400;
      throw error;
    }

    const option = poll.options.find(o => o.id === optionId);
    if (!option) {
      const error = new Error(`Option with ID ${optionId} not found`);
      error.statusCode = 404;
      throw error;
    }

    // Increment vote count and record voter
    option.votes += 1;
    poll.votedMembers.push(memberId);

    res.status(200).json({
      success: true,
      message: 'Vote casted successfully',
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

// Submit a cooperative report (Aspirasi / Pengaduan)
const submitReport = (req, res, next) => {
  try {
    const { memberId, category, subject, content } = req.body;

    if (!memberId || !category || !subject || !content) {
      const error = new Error('Member ID, category, subject, and content are required');
      error.statusCode = 400;
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Report/Aspirasi submitted successfully to Governance Hub',
      data: {
        reportId: `REP-${Date.now()}`,
        memberId,
        category,
        subject,
        content,
        status: 'Diproses', // Processed
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  getVotings,
  castVote,
  submitReport
};
