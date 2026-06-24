/**
 * Admin Controller
 * Handles administrator functions for V2.0 (Survey management & Smart Supply Chain)
 */
const supabase = require('../config/supabaseClient');

// 1. Create a new Delphi Survey & Round 1
const createDelphiSurvey = async (req, res, next) => {
  try {
    const { title, description, maxRounds, questionText, options } = req.body;

    if (!title || !questionText || !options || !Array.isArray(options)) {
      const error = new Error('Title, Question text, and Options array are required');
      error.statusCode = 400;
      throw error;
    }

    // Insert Survey
    const { data: survey, error: survErr } = await supabase
      .from('delphi_surveys')
      .insert({
        title,
        description: description || '',
        current_round: 1,
        max_rounds: maxRounds || 3,
        is_active: true,
        status: 'active'
      })
      .select()
      .single();

    if (survErr) throw new Error(survErr.message);

    // Insert Round 1
    const { data: round, error: roundErr } = await supabase
      .from('delphi_rounds')
      .insert({
        survey_id: survey.id,
        round_number: 1,
        question_text: questionText,
        options,
        status: 'open'
      })
      .select()
      .single();

    if (roundErr) throw new Error(roundErr.message);

    res.status(201).json({
      success: true,
      message: 'Delphi survey and Round 1 created successfully.',
      data: {
        survey,
        round
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Close active round, calculate votes distribution, and save facilitator summary
const closeRoundAndSummarize = async (req, res, next) => {
  try {
    const { surveyId, roundNumber, summaryText } = req.body;

    if (!surveyId || !roundNumber || !summaryText) {
      const error = new Error('Survey ID, Round number, and Summary text are required');
      error.statusCode = 400;
      throw error;
    }

    // Find the round
    const { data: rounds, error: roundFindErr } = await supabase
      .from('delphi_rounds')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('round_number', roundNumber);

    if (roundFindErr || rounds.length === 0) {
      const error = new Error('Round not found.');
      error.statusCode = 404;
      throw error;
    }

    const round = rounds[0];

    // Update Round status to closed and save the summary
    const { error: updateErr } = await supabase
      .from('delphi_rounds')
      .update({
        status: 'closed',
        summary_from_previous_round: summaryText // Storing the consensus output summary
      })
      .eq('id', round.id);

    if (updateErr) throw new Error(updateErr.message);

    res.status(200).json({
      success: true,
      message: `Putaran ${roundNumber} resmi ditutup. Ringkasan fasilitator disimpan.`
    });
  } catch (error) {
    next(error);
  }
};

// 3. Advance to the next round of a survey, seeding previous summary
const advanceRound = async (req, res, next) => {
  try {
    const { surveyId } = req.body;

    // Get survey details
    const { data: surveys, error: survErr } = await supabase
      .from('delphi_surveys')
      .select('*')
      .eq('id', surveyId);

    if (survErr || surveys.length === 0) {
      const error = new Error('Survey not found.');
      error.statusCode = 404;
      throw error;
    }

    const survey = surveys[0];
    const nextRoundNumber = survey.current_round + 1;

    if (nextRoundNumber > survey.max_rounds) {
      const error = new Error('Delphi survey has already reached its maximum rounds limit.');
      error.statusCode = 400;
      throw error;
    }

    // Get closed round to fetch its summary
    const { data: previousRounds, error: prevErr } = await supabase
      .from('delphi_rounds')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('round_number', survey.current_round);

    if (prevErr || previousRounds.length === 0) {
      const error = new Error('Previous round details not found.');
      error.statusCode = 400;
      throw error;
    }

    const prevRound = previousRounds[0];
    if (prevRound.status !== 'closed') {
      const error = new Error('Mohon tutup putaran saat ini sebelum membuka putaran berikutnya.');
      error.statusCode = 400;
      throw error;
    }

    // Insert Next Round, seeding the summary_from_previous_round
    const { data: nextRound, error: nextRoundErr } = await supabase
      .from('delphi_rounds')
      .insert({
        survey_id: surveyId,
        round_number: nextRoundNumber,
        question_text: prevRound.question_text, // keep same question
        options: prevRound.options, // keep same options (standard Delphi technique)
        summary_from_previous_round: prevRound.summary_from_previous_round, // Propagate consensus summary
        status: 'open'
      })
      .select()
      .single();

    if (nextRoundErr) throw new Error(nextRoundErr.message);

    // Update survey's current round pointer
    const { error: survUpdateErr } = await supabase
      .from('delphi_surveys')
      .update({ current_round: nextRoundNumber })
      .eq('id', surveyId);

    if (survUpdateErr) throw new Error(survUpdateErr.message);

    res.status(201).json({
      success: true,
      message: `Putaran baru (${nextRoundNumber}) berhasil dibuka.`,
      data: nextRound
    });
  } catch (error) {
    next(error);
  }
};

// 3.5. Reset/Clear all Delphi Survey data
const resetDelphiData = async (req, res, next) => {
  try {
    await supabase.from('delphi_responses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('delphi_rounds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('delphi_surveys').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    res.status(200).json({
      success: true,
      message: 'Semua data survei Delphi berhasil di-reset menjadi kosong.'
    });
  } catch (error) {
    next(error);
  }
};

// 4. Smart Supply Chain list (from Supabase)
const getSupplyChain = async (req, res, next) => {
  try {
    const { data: shipments, error } = await supabase
      .from('supply_chain_shipments')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Map to camelCase for frontend compatibility
    const mapped = (shipments || []).map(s => ({
      id: s.id,
      productName: s.product_name,
      quantity: s.quantity,
      destination: s.destination,
      status: s.status,
      updatedAt: s.updated_at
    }));

    res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

// 5. Update Smart Supply Chain status (in Supabase)
const updateSupplyChain = async (req, res, next) => {
  try {
    const { id, status } = req.body; // status: 'Gudang', 'Pengiriman', 'Distribusi', 'Selesai'

    const { data: updated, error } = await supabase
      .from('supply_chain_shipments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const err = new Error(`Shipment with ID ${id} not found or update failed`);
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: `Shipment status updated to ${status} successfully.`,
      data: {
        id: updated.id,
        productName: updated.product_name,
        quantity: updated.quantity,
        destination: updated.destination,
        status: updated.status,
        updatedAt: updated.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin intervention: update member details (balance or status)
const updateMemberByAdmin = async (req, res, next) => {
  try {
    const { memberId, balance, status } = req.body;

    if (!memberId) {
      const error = new Error('Member ID wajib dilampirkan');
      error.statusCode = 400;
      throw error;
    }

    const updates = {};
    if (balance !== undefined) updates.balance = Number(balance);
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', memberId);

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      message: 'Profil anggota berhasil diperbarui oleh Admin'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDelphiSurvey,
  closeRoundAndSummarize,
  advanceRound,
  resetDelphiData,
  getSupplyChain,
  updateSupplyChain,
  updateMemberByAdmin
};
