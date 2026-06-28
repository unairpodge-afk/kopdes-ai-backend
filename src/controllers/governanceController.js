/**
 * Governance Controller
 * Handles Governance Hub features (Announcements, Electronic Voting, Cooperative Reports)
 */
const supabase = require('../config/supabaseClient');

const getAnnouncements = async (req, res, next) => {
  try {
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      count: announcements ? announcements.length : 0,
      data: announcements || []
    });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      const error = new Error('Title and content are required');
      error.statusCode = 400;
      throw error;
    }

    const newAnnouncement = {
      id: `a${Date.now()}`,
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      author: author || 'Pengurus Koperasi'
    };

    const { data, error } = await supabase
      .from('announcements')
      .insert(newAnnouncement)
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: data
    });
  } catch (error) {
    next(error);
  }
};

const getVotings = async (req, res, next) => {
  try {
    const { data: votingsData, error: votingsErr } = await supabase.from('votings').select('*');
    if (votingsErr) throw new Error(votingsErr.message);

    const { data: optionsData } = await supabase.from('voting_options').select('*');
    const { data: membersData } = await supabase.from('voting_members').select('*');

    const result = votingsData.map(v => {
      return {
        ...v,
        options: optionsData ? optionsData.filter(o => o.voting_id === v.id) : [],
        votedMembers: membersData ? membersData.filter(m => m.voting_id === v.id).map(m => m.member_id) : []
      };
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Cast a vote in a poll
const castVote = async (req, res, next) => {
  try {
    const { votingId, optionId, memberId } = req.body;

    if (!votingId || !optionId || !memberId) {
      const error = new Error('Voting ID, Option ID, and Member ID are required');
      error.statusCode = 400;
      throw error;
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('voting_members')
      .select('*')
      .eq('voting_id', votingId)
      .eq('member_id', memberId);

    if (existingVote && existingVote.length > 0) {
      const error = new Error('You have already cast a vote for this session');
      error.statusCode = 400;
      throw error;
    }

    // Insert vote record
    await supabase.from('voting_members').insert({ voting_id: votingId, member_id: memberId });

    // Increment vote count
    const { data: optData } = await supabase.from('voting_options').select('votes').eq('id', optionId).single();
    const currentVotes = optData ? optData.votes : 0;
    
    await supabase.from('voting_options').update({ votes: currentVotes + 1 }).eq('id', optionId);

    res.status(200).json({
      success: true,
      message: 'Vote casted successfully'
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

const https = require('https');

const fetchRss = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
};

const parseGoogleNewsRss = (xmlString) => {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlString)) !== null) {
    const itemContent = match[1];
    
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
    
    let title = titleMatch ? titleMatch[1].trim() : 'No Title';
    let link = linkMatch ? linkMatch[1].trim() : '#';
    let pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
    let source = sourceMatch ? sourceMatch[1].trim() : 'Google News';
    
    // Clean CDATA wrappers if present
    title = title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
    link = link.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
    source = source.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
    
    // Clean source from title: Google News title format is usually "Title - Source"
    let cleanTitle = title;
    const sourceDashIndex = title.lastIndexOf(' - ');
    if (sourceDashIndex !== -1) {
      cleanTitle = title.substring(0, sourceDashIndex).trim();
    }
    
    items.push({
      title: cleanTitle,
      link,
      pubDate,
      source
    });
  }
  
  return items;
};

const getCooperativeNews = async (req, res, next) => {
  try {
    const url = 'https://news.google.com/rss/search?q=koperasi+indonesia&hl=id-ID&gl=ID&ceid=ID:id';
    const xmlData = await fetchRss(url);
    const newsItems = parseGoogleNewsRss(xmlData);

    res.status(200).json({
      success: true,
      count: newsItems.length,
      data: newsItems
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
  submitReport,
  getCooperativeNews
};
