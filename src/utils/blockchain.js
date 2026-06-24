const crypto = require('crypto');
const supabase = require('../config/supabaseClient');

const calculateHash = (index, previousHash, timestamp, data) => {
  return crypto
    .createHash('sha256')
    .update(index + previousHash + timestamp + JSON.stringify(data))
    .digest('hex');
};

const addBlock = async (data) => {
  try {
    // 1. Get the latest block to find index and previousHash
    const { data: latestBlocks, error: fetchErr } = await supabase
      .from('blockchain')
      .select('*')
      .order('index', { ascending: false })
      .limit(1);

    if (fetchErr) {
      console.error('Error fetching latest block:', fetchErr);
      return null;
    }

    const latestBlock = latestBlocks && latestBlocks.length > 0 ? latestBlocks[0] : null;
    const index = latestBlock ? latestBlock.index + 1 : 0;
    const previousHash = latestBlock ? latestBlock.hash : "0".repeat(64);
    
    const timestamp = new Date().toISOString();
    const hash = calculateHash(index, previousHash, timestamp, data);

    const block = {
      index,
      timestamp,
      data,
      previous_hash: previousHash,
      hash
    };

    // 2. Insert new block
    const { data: insertedBlock, error: insertErr } = await supabase
      .from('blockchain')
      .insert(block)
      .select()
      .single();

    if (insertErr) {
      console.error('Error inserting block:', insertErr);
      return null;
    }

    return insertedBlock;
  } catch (error) {
    console.error('Blockchain addBlock failed:', error);
    return null;
  }
};

module.exports = {
  addBlock
};
