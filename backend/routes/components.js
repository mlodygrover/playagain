const router = require('express').Router();
const { Component, GPU, CPU, Motherboard, RAM, Disk, Case, PSU, Cooling } = require('../models/Component');
const Offer = require('../models/Offer');
const { updateComponentStats } = require('../utils/statsCalculator');
// IMPORT MIDDLEWARE OCHRONNEGO
const { protectAdmin } = require('../middleware/authMiddleware');

// ==========================================
// SEKCJA 1: STREFA PUBLICZNA (Dostępna dla każdego)
// ==========================================

// GET: Pobierz komponenty z filtrowaniem (Search, Type, Price Range)
// backend/routes/components.js

// GET: Pobierz komponenty z filtrowaniem
router.get('/', async (req, res) => {
    try {
        const { type, search, minPrice, maxPrice, user, socket } = req.query;

        let filter = {};

        // 1. Filtr podstawowy: Ukrywanie niedostępnych (tylko dla klienta)
        // Inicjalizujemy obiekt dla 'stats.lowestPrice', żeby móc do niego dopisywać
        if (user === 'true') {
            filter['stats.lowestPrice'] = { $gt: 0 };
        }

        // 2. Filtr Typu
        if (type && type !== 'ALL') {
            filter.type = type;
        }

        // 3. Filtr Socketu
        if (socket) {
            filter.socket = socket;
        }

        // 4. Wyszukiwanie (Nazwa lub Fraza Allegro)
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { name: regex },
                { searchQuery: regex }
            ];
        }

        // --- 5. FILTROWANIE PO CENIE (NAPRAWIONE) ---
        if (minPrice || maxPrice) {
            // Upewniamy się, że obiekt filtru ceny istnieje (jeśli user=true go nie stworzył)
            if (!filter['stats.lowestPrice']) {
                filter['stats.lowestPrice'] = {};
            }

            // Dopisywanie warunków (MongoDB łączy je automatycznie jako AND)
            if (minPrice) {
                filter['stats.lowestPrice'].$gte = Number(minPrice);
            }
            if (maxPrice) {
                filter['stats.lowestPrice'].$lte = Number(maxPrice);
            }
        }

        const components = await Component.find(filter)
            .sort({ 'stats.lowestPrice': 1 }); // Sortuj od najtańszych

        res.json(components);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// GET: Pobierz jeden komponent + jego oferty
router.get('/:id', async (req, res) => {
    try {
        const component = await Component.findById(req.params.id);
        if (!component) return res.status(404).json({ error: "Nie znaleziono komponentu" });

        const offers = await Offer.find({ componentId: req.params.id }).sort({ price: 1 });
        res.json({ component, offers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// SEKCJA 2: STREFA ADMINA (Wymaga Tokena i ID Admina)
// ==========================================

// --- ZARZĄDZANIE KOMPONENTAMI ---

// POST: Dodaj nowy komponent (Polimorfizm)
router.post('/', protectAdmin, async (req, res) => {
    try {
        const { type, ...data } = req.body;

        let newComponent;
        switch (type) {
            case 'GPU': newComponent = new GPU(data); break;
            case 'CPU': newComponent = new CPU(data); break;
            case 'Motherboard': newComponent = new Motherboard(data); break;
            case 'RAM': newComponent = new RAM(data); break;
            case 'Disk': newComponent = new Disk(data); break;
            case 'Case': newComponent = new Case(data); break;
            case 'PSU': newComponent = new PSU(data); break;
            case 'Cooling': newComponent = new Cooling(data); break;
            default: return res.status(400).json({ error: "Nieznany typ podzespołu" });
        }

        await newComponent.save();
        res.status(201).json(newComponent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT: Edytuj dane komponentu
router.put('/:id', protectAdmin, async (req, res) => {
    try {
        const updated = await Component.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE: Usuń komponent (Oraz kaskadowo wszystkie jego oferty!)
router.delete('/:id', protectAdmin, async (req, res) => {
    try {
        const component = await Component.findById(req.params.id);
        if (!component) return res.status(404).json({ error: "Komponent nie istnieje" });

        // 1. Usuwamy wszystkie oferty powiązane z tym komponentem
        await Offer.deleteMany({ componentId: req.params.id });

        // 2. Usuwamy sam komponent
        await Component.findByIdAndDelete(req.params.id);

        res.json({ message: "Komponent i jego oferty zostały usunięte." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ZARZĄDZANIE OFERTAMI (Z Przeliczaniem Statystyk) ---

// POST: Dodanie nowej oferty -> Przelicz statystyki
router.post('/:id/offers', protectAdmin, async (req, res) => {
    try {
        const componentId = req.params.id;
        const exists = await Component.exists({ _id: componentId });
        if (!exists) return res.status(404).json({ error: "Komponent nie istnieje" });

        const newOffer = new Offer({
            ...req.body,
            componentId: componentId
        });

        await newOffer.save();

        // 🔥 AKTUALIZACJA STATYSTYK
        await updateComponentStats(componentId);

        res.status(201).json(newOffer);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "Taka oferta już istnieje." });
        }
        res.status(400).json({ error: err.message });
    }
});

// PUT: Edycja oferty (np. zmiana ceny lub statusu isActive) -> Przelicz statystyki
router.put('/offer/:offerId', protectAdmin, async (req, res) => {
    try {
        const updatedOffer = await Offer.findByIdAndUpdate(
            req.params.offerId,
            req.body,
            { new: true }
        );

        if (!updatedOffer) return res.status(404).json({ error: "Nie znaleziono oferty" });

        // 🔥 AKTUALIZACJA STATYSTYK
        await updateComponentStats(updatedOffer.componentId);

        res.json(updatedOffer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE: Usunięcie oferty -> Przelicz statystyki
router.delete('/offer/:offerId', protectAdmin, async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.offerId);
        if (!offer) return res.status(404).json({ error: "Nie znaleziono oferty" });

        const componentId = offer.componentId;

        // Usuwamy ofertę
        await Offer.findByIdAndDelete(req.params.offerId);

        // 🔥 AKTUALIZACJA STATYSTYK
        await updateComponentStats(componentId);

        res.json({ message: "Oferta usunięta, statystyki przeliczone." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// backend/routes/components.js

// ... (Inne importy i kod sekcji publicznej)

// ==========================================
// SEKCJA 2: STREFA ADMINA (Wymaga Tokena i ID Admina)
// ==========================================

// --- NOWY ENDPOINT: IMPORT JSON (BULK) ---
router.post('/import', protectAdmin, async (req, res) => {
    try {
        const items = req.body;

        // Walidacja czy to tablica
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: "Dane muszą być tablicą obiektów JSON" });
        }

        let createdCount = 0;
        let updatedCount = 0;

        for (const item of items) {
            const { type, ...data } = item;

            // Dobieramy odpowiedni Model Mongoose
            let Model;
            switch (type) {
                case 'GPU': Model = GPU; break;
                case 'CPU': Model = CPU; break;
                case 'Motherboard': Model = Motherboard; break;
                case 'RAM': Model = RAM; break;
                case 'Disk': Model = Disk; break;
                case 'Case': Model = Case; break;
                case 'PSU': Model = PSU; break;
                case 'Cooling': Model = Cooling; break;
                default:
                    console.warn(`Pominięto nieznany typ: ${type}`);
                    continue;
            }

            // Używamy updateOne z upsert: true
            // Szukamy po nazwie (name). Jeśli znajdzie -> aktualizuje. Jeśli nie -> tworzy.
            const result = await Model.updateOne(
                { name: data.name },
                { $set: { ...data, type } }, // Nadpisujemy dane
                { upsert: true, runValidators: true }
            );

            if (result.upsertedCount > 0) createdCount++;
            else if (result.modifiedCount > 0) updatedCount++;
        }

        res.json({
            message: "Import zakończony",
            createdCount,
            updatedCount
        });

    } catch (err) {
        console.error("Błąd importu:", err);
        res.status(500).json({ error: "Błąd podczas importu danych: " + err.message });
    }
});

// --- ZARZĄDZANIE KOMPONENTAMI (POJEDYNCZE) ---
// ... (Reszta Twojego kodu: router.post('/', ...), router.put ...)

module.exports = router;