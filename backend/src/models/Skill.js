const mongoose = require('mongoose');
const { Schema } = mongoose;

const skillSchema = new Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['offerta', 'richiesta'],
        default: 'offerta'
    },
    price: { 
        type: Number, 
        required: false,
        default: null
    },
    priceXmr: {
        type: Number,
        required: false,
        default: null
    },
    duration: { 
        type: Number, 
        required: false,
        default: 1 // in hours
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'scaduto'],
        default: 'pending'
    },
    // ========== GEOLOCALIZZAZIONE ==========
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: false,
            index: '2dsphere'
        }
    },
    address: { 
        type: String, 
        trim: true,
        default: ''
    },
    distanceKm: { 
        type: Number,
        default: 0
    },
    // ========== ALTRI CAMPI ==========
    moderationNote: { type: String, trim: true },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    collection: 'skills',
    versionKey: false,
    strict: false
});

// Indici per performance
skillSchema.index({ userId: 1, createdAt: -1 });
skillSchema.index({ status: 1, createdAt: -1 });
skillSchema.index({ category: 1 });
skillSchema.index({ location: '2dsphere' });

// Middleware pre-save per aggiornare updatedAt
skillSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.models.Skill || mongoose.model('Skill', skillSchema);