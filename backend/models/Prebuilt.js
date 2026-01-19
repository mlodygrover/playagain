const mongoose = require('mongoose');

const PrebuiltSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true }, // Cena zestawu (może być inna niż suma części)
  image: { type: String }, // URL do zdjęcia zestawu
  category: { 
    type: String, 
    enum: ['Gaming', 'Office', 'Workstation', 'Creator'], 
    default: 'Gaming' 
  },
  // Tablica referencji do komponentów
  components: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Component' 
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prebuilt', PrebuiltSchema);