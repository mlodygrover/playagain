const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  status: {
    type: String,
    enum: ['NONE', 'REQUESTED', 'SHIPPING', 'COMPLETED', 'REJECTED'],
    default: 'NONE'
  },
  // --- NOWE POLA ---
  requestType: { type: String, enum: ['REFUND', 'REPAIR'], default: 'REFUND' },
  reason: { type: String, default: '' },
  contactEmail: { type: String },
  contactPhone: { type: String },
  legalAccepted: { type: Boolean, default: false },
  // -----------------
  history: {
    requestedAt: Date,
    shippingAt: Date,
    completedAt: Date,
    rejectedAt: Date
  },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Return', ReturnSchema);