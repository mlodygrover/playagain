const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  
  // NOWE POLA
  isVerified: { type: Boolean, default: false }, // Domyślnie niezweryfikowany
  verificationToken: { type: String }, // Token do linku w mailu
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);