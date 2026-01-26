const router = require('express').Router();
const Return = require('../models/Return');
const Order = require('../models/Order');
const verify = require('../middleware/auth'); // Standardowy middleware
const { protectAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken'); // Importujemy do ręcznej weryfikacji

// 1. POBIERANIE POJEDYNCZEGO ZWROTU (Dla Gości i Zalogowanych)
router.get('/:id', async (req, res) => {
  try {
    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) return res.status(404).json({ error: "Nie znaleziono dokumentu zwrotu." });

    // Jeśli zamówienie jest przypisane do konta (userId istnieje)
    if (returnDoc.user) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: "To zamówienie jest przypisane do konta. Zaloguj się." });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Sprawdź czy ID z tokena zgadza się z ID właściciela zwrotu
        if (decoded.id !== returnDoc.user.toString()) {
          return res.status(403).json({ error: "Brak uprawnień do tego zwrotu." });
        }
      } catch (err) {
        return res.status(401).json({ error: "Nieprawidłowy token sesji." });
      }
    }

    // Jeśli to gość (user === null) lub token był poprawny - wysyłamy dane
    res.json(returnDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ZGŁASZANIE ZWROTU (Dla Gości i Zalogowanych)
router.put('/request/:orderId', async (req, res) => {
  try {
    const { reason, requestType, contactEmail, contactPhone, legalAccepted } = req.body;

    if (!legalAccepted) {
      return res.status(400).json({ error: "Musisz zaakceptować warunki zwrotu." });
    }

    const returnDoc = await Return.findOne({ order: req.params.orderId });
    if (!returnDoc) return res.status(404).json({ error: "Nie znaleziono zwrotu." });
    if (returnDoc.status !== 'NONE') return res.status(400).json({ error: "Zwrot już został zgłoszony." });

    // WERYFIKACJA WŁAŚCICIELA:
    if (returnDoc.user) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: "To zamówienie wymaga zalogowania." });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== returnDoc.user.toString()) {
          return res.status(403).json({ error: "Nie możesz zgłosić zwrotu dla cudzego zamówienia." });
        }
      } catch (err) {
        return res.status(401).json({ error: "Błąd autoryzacji." });
      }
    }

    // Aktualizacja danych
    returnDoc.status = 'REQUESTED';
    returnDoc.reason = reason;
    returnDoc.requestType = requestType;
    returnDoc.contactEmail = contactEmail;
    returnDoc.contactPhone = contactPhone;
    returnDoc.legalAccepted = legalAccepted;
    returnDoc.history.requestedAt = new Date();

    await returnDoc.save();
    res.json(returnDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. ADMIN: Pobierz wszystkie aktywne zwroty
router.get('/admin/all', protectAdmin, async (req, res) => {
  try {
    const returns = await Return.find({ status: { $ne: 'NONE' } })
      .populate('user', 'firstName lastName email')
      .sort({ updatedAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. ADMIN: Aktualizacja statusu/notatek
router.put('/admin/:id', protectAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const returnDoc = await Return.findById(req.params.id);

    if (!returnDoc) return res.status(404).json({ error: "Nie znaleziono zwrotu." });

    if (status === 'SHIPPING' && !returnDoc.history.shippingAt) returnDoc.history.shippingAt = new Date();
    if (status === 'COMPLETED' && !returnDoc.history.completedAt) returnDoc.history.completedAt = new Date();
    if (status === 'REJECTED' && !returnDoc.history.rejectedAt) returnDoc.history.rejectedAt = new Date();

    returnDoc.status = status;
    returnDoc.adminNotes = adminNotes || returnDoc.adminNotes;

    await returnDoc.save();
    res.json(returnDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. USER (ZALOGOWANY): Pobieranie po ID zamówienia w panelu konta
router.get('/by-order/:orderId', verify, async (req, res) => {
  try {
    const returnDoc = await Return.findOne({ order: req.params.orderId });
    if (!returnDoc) return res.status(404).json({ error: "Brak dokumentu zwrotu." });

    // Tu używamy 'verify' jako middleware, więc req.user jest dostępne
    if (returnDoc.user && returnDoc.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Brak dostępu." });
    }
    res.json(returnDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;