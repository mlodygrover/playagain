const router = require('express').Router();
const { Component } = require('../models/Component');
const Offer = require('../models/Offer');
// Importujemy obie funkcje serwisu
const { fetchOffersFromAI, fetchMotherboardOffers } = require('../services/perplexityService');
const { updateComponentStats } = require('../utils/statsCalculator');
const { protectAdmin } = require('../middleware/authMiddleware');

// POST /api/admin/generate-ai-offers
router.post('/generate-ai-offers', protectAdmin, async (req, res) => {
  try {
    const { componentIds } = req.body; // Oczekujemy tablicy ID: ["id1", "id2"...]

    if (!componentIds || !Array.isArray(componentIds)) {
      return res.status(400).json({ error: "Wymagana tablica componentIds" });
    }

    const results = {
      processed: 0,
      offersCreated: 0,
      errors: []
    };

    // Iterujemy po komponentach sekwencyjnie
    for (const id of componentIds) {
      const component = await Component.findById(id);
      if (!component) continue;

      try {
        console.log(`🤖 AI przetwarza: ${component.name} (${component.type})...`);

        let aiOffers = [];

        // ==================================================
        // LOGIKA WYBORU METODY SZUKANIA (MOBO vs RESZTA)
        // ==================================================

        if (component.type === 'Motherboard') {
          // Jeśli to Płyta Główna i ma zdefiniowane parametry Socket/Format
          if (component.socket && component.formFactor) {
            console.log(`   -> Tryb generyczny dla MOBO: ${component.socket} / ${component.formFactor}`);
            aiOffers = await fetchMotherboardOffers(component.socket, component.formFactor);
          } else {
            // Fallback: Jeśli brakuje danych, szukaj po prostu po nazwie
            console.log(`   -> Tryb standardowy (brak parametrów socket/format)`);
            aiOffers = await fetchOffersFromAI(component.searchQuery || component.name);
          }
        } else {
          // DLA WSZYSTKICH INNYCH TYPÓW (GPU, CPU, RAM...)
          aiOffers = await fetchOffersFromAI(component.searchQuery || component.name);
        }

        // ==================================================
        // ZAPISYWANIE OFERT DO BAZY
        // ==================================================

        let addedCount = 0;

        for (const offerData of aiOffers) {
          // 1. Walidacja danych z AI
          if (!offerData.price || !offerData.url) continue;

          // 2. Sprawdzenie duplikatów (po URL) - żeby nie dublować ofert
          const exists = await Offer.findOne({ url: offerData.url });
          if (exists) continue;

          // 3. Tworzenie oferty
          await Offer.create({
            componentId: component._id,
            title: offerData.title || component.name, // Dla generycznych płyt tytuł z AI jest ważny!
            price: offerData.price,
            url: offerData.url,
            platform: offerData.platform || "Web",
            externalId: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            isActive: true
          });
          addedCount++;
        }

        // ==================================================
        // AKTUALIZACJA STATYSTYK KOMPONENTU
        // ==================================================

        if (addedCount > 0) {
          await updateComponentStats(component._id);
          console.log(`   ✅ Dodano ${addedCount} nowych ofert.`);
        } else {
          console.log(`   ⚠️ Nie znaleziono nowych ofert (lub duplikaty).`);
        }

        results.processed++;
        results.offersCreated += addedCount;

      } catch (err) {
        console.error(`❌ Błąd przy ${component.name}:`, err.message);
        results.errors.push({ name: component.name, error: err.message });
      }
    }

    // Raport końcowy dla Frontendu
    res.json({
      message: "Proces generowania ofert zakończony",
      details: results
    });

  } catch (err) {
    console.error("Critical Admin Error:", err);
    res.status(500).json({ error: err.message });
  }
});
// backend/routes/admin.js

// ... (inne importy)
const { Motherboard } = require('../models/Component'); // Upewnij się, że masz import Motherboard

// POST: Utwórz szablony płyt głównych dla danego socketu
router.post('/create-mobo-templates', protectAdmin, async (req, res) => {
  try {
    const { socket } = req.body;

    if (!socket) {
      return res.status(400).json({ error: "Brak podanego socketu." });
    }

    const standards = ["ATX", "Micro-ATX", "Mini-ITX"];
    const created = [];

    for (const standard of standards) {
      // Sprawdź czy już istnieje taki szablon
      const exists = await Component.findOne({
        type: 'Motherboard',
        socket: socket,
        formFactor: standard
      });

      if (!exists) {
        const newMobo = new Motherboard({
          name: `${socket} ${standard}`, // np. "AM4 ATX"
          searchQuery: `Płyta główna ${socket} ${standard}`,
          type: "Motherboard",
          socket: socket,
          formFactor: standard,
          image: "", // Brak zdjęcia na start
          blacklistedKeywords: ["Uszkodzona", "Zestaw"]
        });
        await newMobo.save();
        created.push(newMobo);
      }
    }

    res.json({ message: `Utworzono ${created.length} szablonów.`, created });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports = router;