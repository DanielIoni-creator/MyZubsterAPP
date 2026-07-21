const Token = require('../models/Token');
const TokenHolding = require('../models/TokenHolding');
const mongoose = require('mongoose');

const createToken = async (tokenData) => {
  const contractAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
  const token = new Token({
    ...tokenData,
    contractAddress,
    status: 'active',
  });
  await token.save();
  return token;
};

const purchaseTokens = async (userId, tokenId, amount, moneroTxid) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new Error('Token non trovato');
  if (token.status !== 'active') throw new Error('Token non attivo');

  const holding = new TokenHolding({
    token: tokenId,
    user: userId,
    amount,
    walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
    purchasePrice: token.tokenPrice,
    moneroTxid: moneroTxid || `simulated_${Date.now()}`,
  });
  await holding.save();
  return holding;
};

const getUserHoldings = async (userId) => {
  const holdings = await TokenHolding.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'tokens',
        localField: 'token',
        foreignField: '_id',
        as: 'tokenData',
      },
    },
    { $unwind: { path: '$tokenData', preserveNullAndEmptyArrays: true } },
  ]);
  return holdings;
};

const getActiveTokens = async () => {
  const tokens = await Token.find({ status: 'active' })
    .populate('issuer', 'name');
  return tokens;
};

const getTokenById = async (tokenId) => {
  const token = await Token.findById(tokenId)
    .populate('issuer', 'name email');
  return token;
};

module.exports = {
  createToken,
  purchaseTokens,
  getUserHoldings,
  getActiveTokens,
  getTokenById,
};
