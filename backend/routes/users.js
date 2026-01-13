const router = require('express').Router();
const User = require('../models/User');
const verify = require('../middleware/auth'); // Import middleware
const bcrypt = require('bcryptjs');

// 1. POBIERZ DANE ZALOGOWANEGO UŻYTKOWNIKA
router.get('/me', verify, async (req, res) => {
  try {
    // Znajdź usera po ID z tokena, ale nie zwracaj hasła (-password)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. AKTUALIZUJ DANE OSOBOWE
router.put('/me', verify, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName },
      { new: true } // Zwróć zaktualizowany obiekt
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. ZMIEŃ HASŁO
router.put('/password', verify, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Pobierz usera (wraz z obecnym hasłem do weryfikacji)
    const user = await User.findById(req.user.id);
    
    // Sprawdź stare hasło
    const validPass = await bcrypt.compare(oldPassword, user.password);
    if (!validPass) return res.status(400).json({ error: "Nieprawidłowe stare hasło." });

    // Zahaszuj nowe hasło
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Zapisz
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Hasło zostało zmienione." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;