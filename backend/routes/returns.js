const router = require('express').Router();
const Return = require('../models/Return');
const Order = require('../models/Order');
const verify = require('../middleware/auth');
const { protectAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// 1. PUBLICZNY ENDPOINT POBIERANIA (Używany przez Frontend)
router.get('/by-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const returnDoc = await Return.findOne({ order: orderId });

    if (!returnDoc) {
      return res.status(404).json({ error: "Nie znaleziono dokumentu zwrotu." });
    }

    // SPRAWDZENIE: Czy user to faktycznie obiekt/ID (nie null i nie undefined)
    const hasOwner = returnDoc.user !== null && returnDoc.user !== undefined;

    if (hasOwner) {
      const authHeader = req.header('Authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        // Zwracamy 401 tylko gdy zamówienie NALEŻY do kogoś, a my nie mamy tokena
        return res.status(401).json({ error: "To zamówienie jest przypisane do konta. Zaloguj się." });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== returnDoc.user.toString()) {
          return res.status(403).json({ error: "Brak uprawnień do tego zwrotu." });
        }
      } catch (err) {
        return res.status(401).json({ error: "Sesja wygasła. Zaloguj się ponownie." });
      }
    }

    // Jeśli hasOwner === false (Gość), przeskakuje powyższy blok i zwraca JSON
    res.json(returnDoc);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

// 2. USER: Zgłoszenie zwrotu (Również z logiką dla gości)
router.put('/request/:orderId', async (req, res) => {
  try {
    const { reason, requestType, contactEmail, contactPhone, legalAccepted } = req.body;

    if (!legalAccepted) {
      return res.status(400).json({ error: "Musisz zaakceptować warunki zwrotu." });
    }

    const returnDoc = await Return.findOne({ order: req.params.orderId });
    if (!returnDoc) return res.status(404).json({ error: "Nie znaleziono zwrotu." });
    if (returnDoc.status !== 'NONE') return res.status(400).json({ error: "Zwrot został już zgłoszony." });

    // WERYFIKACJA WŁAŚCICIELA (jeśli przypisany):
    if (returnDoc.user) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: "Wymagane logowanie." });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== returnDoc.user.toString()) {
          return res.status(403).json({ error: "Brak uprawnień." });
        }
      } catch (err) {
        return res.status(401).json({ error: "Błąd autoryzacji." });
      }
    }

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

// 4. ADMIN: Aktualizacja
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

module.exports = router;