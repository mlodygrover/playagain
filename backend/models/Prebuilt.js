const mongoose = require('mongoose');

const PrebuiltSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  
  // --- ZMIANA TUTAJ ---
  // Usuwamy 'enum', aby akceptować każdą kategorię z JSON-a
  category: { 
    type: String, 
    default: 'Gaming' 
  },
  // --------------------

  components: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Component' 
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prebuilt', PrebuiltSchema);