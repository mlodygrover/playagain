const router = require('express').Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth'); // Import middleware

// ... (Twoje stare endpointy POST / i POST /webhook zostają bez zmian) ...

// NOWY ENDPOINT: MOJE ZAMÓWIENIA
router.get('/my-orders', auth, async (req, res) => {
  try {
    // Szukamy zamówień gdzie pole 'user' równa się ID z tokena
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;