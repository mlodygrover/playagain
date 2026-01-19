const express = require('express');
const router = express.Router();
const Prebuilt = require('../models/Prebuilt');
const { Component } = require('../models/Component'); // ✅ POPRAWNIE
// GET - Pobierz wszystkie zestawy (z wypełnionymi danymi komponentów)
router.get('/', async (req, res) => {
    try {
        const prebuilts = await Prebuilt.find()
            .populate('components') // To zamieni same ID na pełne obiekty komponentów
            .sort({ createdAt: -1 });
        res.json(prebuilts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Utwórz nowy zestaw
router.post('/', async (req, res) => {
    try {
        const newPrebuilt = new Prebuilt(req.body);
        const saved = await newPrebuilt.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT - Edytuj zestaw
router.put('/:id', async (req, res) => {
    try {
        const updated = await Prebuilt.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET /:id - Pobierz szczegóły konkretnego zestawu
router.get('/:id', async (req, res) => {
    try {
        const prebuilt = await Prebuilt.findById(req.params.id)
            .populate('components'); // Kluczowe: pobiera pełne dane o CPU, GPU itd.

        if (!prebuilt) {
            return res.status(404).json({ message: "Zestaw nie został znaleziony" });
        }

        res.json(prebuilt);
    } catch (err) {
        // Obsługa błędu nieprawidłowego ID (CastError)
        if (err.name === 'CastError') {
            return res.status(404).json({ message: "Nieprawidłowe ID zestawu" });
        }
        res.status(500).json({ error: err.message });
    }
});
// DELETE - Usuń zestaw
router.delete('/:id', async (req, res) => {
    try {
        await Prebuilt.findByIdAndDelete(req.params.id);
        res.json({ message: "Zestaw usunięty" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /calculate-price - Oblicz cenę zestawu na podstawie listy ID komponentów
router.post('/calculate-price', async (req, res) => {
    try {
        const { componentIds } = req.body;

        if (!componentIds || !Array.isArray(componentIds)) {
            return res.status(400).json({ error: "Brak listy komponentów" });
        }

        // Pobierz komponenty z bazy
        const components = await Component.find({ _id: { $in: componentIds } });

        // Oblicz sumę (używając basePrice lub averagePrice)
        let totalPrice = 0;
        components.forEach(comp => {
            const price = comp.stats?.basePrice > 0
                ? comp.stats.basePrice
                : (comp.stats?.averagePrice || 0);
            totalPrice += price;
        });

        // Możesz dodać tutaj narzut/marżę jeśli chcesz, np. + 200 zł za montaż
        // totalPrice += 200;

        res.json({ totalPrice: Math.ceil(totalPrice) });
    } catch (err) {
        console.error("Błąd obliczania ceny:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;