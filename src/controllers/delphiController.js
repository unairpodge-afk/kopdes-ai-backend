/**
 * Delphi Survey Controller
 * Handles V2.0 structured expert forecasting surveys via Supabase Client
 */
const supabase = require('../config/supabaseClient');

// Get active Delphi surveys
const getActiveSurveys = async (req, res, next) => {
  try {
    const { data: surveys, error } = await supabase
      .from('delphi_surveys')
      .select('*')
      .eq('is_active', true);

    if (error) throw new Error(error.message);

    // Hydrate each survey with its current open round details
    const hydratedSurveys = [];
    for (const survey of surveys) {
      const { data: rounds, error: roundErr } = await supabase
        .from('delphi_rounds')
        .select('*')
        .eq('survey_id', survey.id)
        .eq('round_number', survey.current_round)
        .eq('status', 'open');

      if (!roundErr && rounds.length > 0) {
        hydratedSurveys.push({
          ...survey,
          currentRoundDetails: rounds[0]
        });
      } else {
        hydratedSurveys.push({
          ...survey,
          currentRoundDetails: null
        });
      }
    }

    res.status(200).json({
      success: true,
      data: hydratedSurveys
    });
  } catch (error) {
    next(error);
  }
};

// Get all rounds and summaries for a specific survey
const getSurveyHistory = async (req, res, next) => {
  try {
    const { surveyId } = req.params;

    const { data: rounds, error } = await supabase
      .from('delphi_rounds')
      .select('*')
      .eq('survey_id', surveyId)
      .order('round_number', { ascending: true });

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      data: rounds
    });
  } catch (error) {
    next(error);
  }
};

// Get justifications and results of a closed round
const getRoundResults = async (req, res, next) => {
  try {
    const { roundId } = req.params;

    const { data: responses, error } = await supabase
      .from('delphi_responses')
      .select('*')
      .eq('round_id', roundId);

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      data: responses
    });
  } catch (error) {
    next(error);
  }
};

// Submit response to active round (vote + justification)
const submitRoundResponse = async (req, res, next) => {
  try {
    const { roundId, memberId, memberName, selectedOption, justificationText } = req.body;

    if (!roundId || !memberId || !memberName || !selectedOption || !justificationText) {
      const error = new Error('Round ID, Member ID, Member Name, Selected Option, and Justification are required');
      error.statusCode = 400;
      throw error;
    }

    // Check if the expert is registered
    const { data: expert, error: expErr } = await supabase
      .from('delphi_experts')
      .select('*')
      .eq('member_id', memberId)
      .eq('status', 'active');

    if (expErr || !expert || expert.length === 0) {
      const error = new Error('Hanya anggota panelis ahli terdaftar yang dapat memberikan suara.');
      error.statusCode = 403;
      throw error;
    }

    // Insert response (Supabase unique constraint on round_id + member_id will handle double votes)
    const { data, error } = await supabase
      .from('delphi_responses')
      .insert({
        round_id: roundId,
        member_id: memberId,
        member_name: memberName,
        selected_option: selectedOption,
        justification_text: justificationText
      });

    if (error) {
      const err = new Error(error.message || 'Gagal menyimpan suara.');
      err.statusCode = 400;
      throw err;
    }

    res.status(201).json({
      success: true,
      message: 'Partisipasi Delphi berhasil disimpan.',
      data: data ? data[0] : null
    });
  } catch (error) {
    next(error);
  }
};

// Get all Delphi-ANP expert matrix responses
const getAnpResponses = async (req, res, next) => {
  try {
    const { data: responses, error } = await supabase
      .from('delphi_anp_responses')
      .select('*');

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    next(error);
  }
};

// Submit Saaty matrix response for a specific expert
const submitAnpResponse = async (req, res, next) => {
  try {
    const { memberId, memberName, institution, comparisons } = req.body;

    if (!memberId || !memberName || !comparisons || typeof comparisons !== 'object') {
      const error = new Error('Member ID, Member Name, and comparisons object are required');
      error.statusCode = 400;
      throw error;
    }

    const { data, error } = await supabase
      .from('delphi_anp_responses')
      .insert({
        member_id: memberId,
        member_name: memberName,
        institution: institution || '',
        comparisons: comparisons, // JSON object storing pairwise ratings
        submitted_at: new Date().toISOString()
      });

    if (error) {
      const err = new Error(error.message || 'Gagal menyimpan matriks ANP.');
      err.statusCode = 400;
      throw err;
    }

    // Record Delphi ANP submission to Blockchain Ledger
    const mockDb = require('../models/mockDb');
    if (mockDb.addBlock) {
      mockDb.addBlock({
        type: "DELPHI_ANP_SUBMISSION",
        memberId,
        memberName,
        message: `Pakar/Instansi ${memberName} (${institution || 'Panelis'}) merekam penilaian Saaty ANP`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Matriks keputusan Saaty pakar berhasil direkam pada Blockchain Ledger.',
      data: data ? data[0] : null
    });
  } catch (error) {
    next(error);
  }
};

// Reset/Clear all Delphi-ANP responses
const resetAnpResponses = async (req, res, next) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      const mockDb = require('../models/mockDb');
      mockDb.delphiAnpResponses.length = 0;
    } else {
      await supabase.from('delphi_anp_responses').delete().neq('member_id', '');
    }

    res.status(200).json({
      success: true,
      message: 'Seluruh respons matriks Saaty pakar berhasil dibersihkan.'
    });
  } catch (error) {
    next(error);
  }
};

// Simulate auto-filling the remaining experts for presentation / demo convenience
const simulateAnpResponses = async (req, res, next) => {
  try {
    const mockDb = require('../models/mockDb');
    
    // Preset list of 13 experts with realistic comparisons
    const presetExperts = [
      { id: "EXP-01", name: "Dr. Ir. Mulyadi", inst: "Kemenkop & UKM", comp: { c1_c2: 3, c1_c3: 5, c1_c4: 1, c2_c3: 2, c2_c4: -3, c3_c4: -5 } },
      { id: "EXP-02", name: "Bambang Prasetyo, M.B.A", inst: "Otoritas Jasa Keuangan", comp: { c1_c2: -3, c1_c3: 3, c1_c4: -5, c2_c3: 5, c2_c4: 2, c3_c4: -3 } },
      { id: "EXP-03", name: "Prof. Dian Lestari", inst: "BRIN / Kemenristek", comp: { c1_c2: 7, c1_c3: 9, c1_c4: 5, c2_c3: 3, c2_c4: -3, c3_c4: -5 } },
      { id: "EXP-04", name: "Dr. Haryono", inst: "Kementerian Pertanian", comp: { c1_c2: 1, c1_c3: 3, c1_c4: 2, c2_c3: 2, c2_c4: 1, c3_c4: -2 } },
      { id: "EXP-05", name: "Prof. Yusuf", inst: "Institut Pertanian Bogor", comp: { c1_c2: 2, c1_c3: 4, c1_c4: 3, c2_c3: 3, c2_c4: 2, c3_c4: -1 } },
      { id: "EXP-06", name: "Siti Rahma, Ph.D", inst: "Institut Teknologi Bandung", comp: { c1_c2: 5, c1_c3: 7, c1_c4: 3, c2_c3: 2, c2_c4: -2, c3_c4: -4 } },
      { id: "EXP-07", name: "Achmad Kalla", inst: "KADIN Indonesia", comp: { c1_c2: 3, c1_c3: 5, c1_c4: 2, c2_c3: 2, c2_c4: -2, c3_c4: -3 } },
      { id: "EXP-08", name: "Dr. Sri Mulyani", inst: "Bank Indonesia", comp: { c1_c2: -2, c1_c3: 3, c1_c4: -3, c2_c3: 4, c2_c4: 3, c3_c4: -2 } },
      { id: "EXP-09", name: "Hendro, M.T", inst: "Kemenkominfo", comp: { c1_c2: 6, c1_c3: 8, c1_c4: 4, c2_c3: 3, c2_c4: -3, c3_c4: -5 } },
      { id: "EXP-10", name: "Prof. Hermansyah", inst: "Universitas Syiah Kuala", comp: { c1_c2: 2, c1_c3: 5, c1_c4: 3, c2_c3: 3, c2_c4: 1, c3_c4: -2 } },
      { id: "EXP-11", name: "Dewi Sartika", inst: "Pegiat Koperasi Perdesaan", comp: { c1_c2: -3, c1_c3: 2, c1_c4: -4, c2_c3: 4, c2_c4: 2, c3_c4: -2 } },
      { id: "EXP-12", name: "Budi Utomo, M.Sc", inst: "Pakar Keamanan Siber", comp: { c1_c2: 1, c1_c3: 3, c1_c4: -5, c2_c3: 2, c2_c4: -3, c3_c4: -6 } },
      { id: "EXP-13", name: "Indra Wijaya", inst: "OJK IKD Sandboxing", comp: { c1_c2: -2, c1_c3: 4, c1_c4: -3, c2_c3: 5, c2_c4: 3, c3_c4: -2 } }
    ];

    // Clear existing
    mockDb.delphiAnpResponses.length = 0;
    
    // Push all preset
    for (const exp of presetExperts) {
      mockDb.delphiAnpResponses.push({
        id: `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        created_at: new Date().toISOString(),
        member_id: exp.id,
        member_name: exp.name,
        institution: exp.inst,
        comparisons: exp.comp,
        submitted_at: new Date().toISOString()
      });
    }

    // Record Delphi ANP simulation to Blockchain Ledger
    if (mockDb.addBlock) {
      mockDb.addBlock({
        type: "DELPHI_ANP_SIMULATION",
        message: `Simulasi otomatis dijalankan: 13 matriks keputusan Saaty pakar terisi penuh`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Simulasi auto-fill 13 pakar berhasil diaktifkan. Matriks Saaty terisi penuh.',
      data: mockDb.delphiAnpResponses
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveSurveys,
  getSurveyHistory,
  getRoundResults,
  submitRoundResponse,
  getAnpResponses,
  submitAnpResponse,
  resetAnpResponses,
  simulateAnpResponses
};
