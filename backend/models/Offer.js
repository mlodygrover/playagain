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
  
  // Czy oferta jest aktywna (czy scraper ją znalazł przy ostatnim przebiegu)
  isActive: { type: Boolean, default: true }, 
  
  foundAt: { type: Date, default: Date.now },
  lastChecked: { type: Date, default: Date.now }
});

// Indeks, żebyśmy nie dodawali dubli (ta sama platforma + to samo ID oferty = duplikat)
OfferSchema.index({ platform: 1, externalId: 1 }, { unique: true });

module.exports = mongoose.model('Offer', OfferSchema);