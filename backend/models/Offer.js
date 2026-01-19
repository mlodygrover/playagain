const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  // Relacja do Profilu Części (Component)
  componentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Component', required: true },
  
  platform: { type: String, required: true }, // np. 'Allegro', 'eBay'
  externalId: { type: String, required: true }, // ID aukcji na zewnętrznym serwisie
  
  title: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'PLN' },
  url: { type: String, required: true },
  imageUrl: { type: String },

  // --- NOWE POLA ---
  condition: { type: String, default: 'Used' }, // np. 'New', 'Used', 'Refurbished'
  location: { type: String, default: 'PL' },    // np. 'DE', 'FR', 'IT' (Kraj wysyłki)
  deliveryEstimation: { type: String },         // np. '2023-11-15' lub '3-5 dni'
  // -----------------
  
  // Czy oferta jest aktywna
  isActive: { type: Boolean, default: true }, 
  
  foundAt: { type: Date, default: Date.now },
  lastChecked: { type: Date, default: Date.now }
});

// Indeks unikalności
OfferSchema.index({ platform: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model('Offer', OfferSchema);