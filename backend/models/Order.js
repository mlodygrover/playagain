const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // Jeśli użytkownik zalogowany, przypisujemy ID. Jeśli gość, pole jest null.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  // Dane kontaktowe i wysyłkowe (z formularza Reacta)
  customerDetails: {
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
  },

  // Co kupił?
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      type: { type: String }, // 'single_part' lub 'custom_build'
      components: [String] // Lista części jeśli to PC
    }
  ],

  totalAmount: { type: Number, required: true },
  
  // Statusy
  status: { type: String, default: 'PENDING' }, // PENDING, PAID, SHIPPED, CANCELLED
  paymentId: { type: String }, // ID transakcji z banku
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);