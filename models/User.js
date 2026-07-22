const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  zone: { type: String, trim: true },
  moneroAddress: { type: String, trim: true },
  moneroViewKey: { type: String, trim: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'issuer'],
    default: 'user'
  },
  isVerified: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  // === CAMPI PER REPUTAZIONE E VALORE ===
  reputationScore: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  nftCount: { type: Number, default: 0 },
  completedTrades: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indici
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ zone: 1 });

// Hash password prima del salvataggio
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Metodo per confrontare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
