const router = require('express').Router();
const { Component, Motherboard } = require('../models/Component');
const Offer = require('../models/Offer');
// Importujemy funkcje serwisu Perplexity
const {
  fetchOffersFromAI,
  fetchMotherboardOffers,
  fetchRamOffers,
  fetchDiskOffers // <--- WAŻNE: Dodany import
} = require('../services/perplexityService');

const { updateComponentStats } = require('../utils/statsCalculator');
const { protectAdmin } = require('../middleware/authMiddleware');

// ==========================================
// ROUTE 1: GENEROWANIE OFERT PRZEZ AI
// ==========================================
router.post('/generate-ai-offers', protectAdmin, async (req, res) => {
  try {
    const { componentIds } = req.body;

    if (!componentIds || !Array.isArray(componentIds)) {
      return res.status(400).json({ error: "Wymagana tablica componentIds" });
    }

    const results = {
      processed: 0,
      offersCreated: 0,
      errors: []
    };

    // Iterujemy po komponentach
    for (const id of componentIds) {
      const component = await Component.findById(id);
      if (!component) continue;

      try {
        console.log(`🤖 AI przetwarza: ${component.name} (${component.type})...`);

        let aiOffers = [];

        // ==================================================
        // LOGIKA WYBORU METODY SZUKANIA
        // ==================================================

        if (component.type === 'Motherboard') {
          // --- 1. PŁYTY GŁÓWNE ---
          if (component.socket && component.formFactor) {
            console.log(`   -> Tryb generyczny dla MOBO: ${component.socket} / ${component.formFactor}`);
            aiOffers = await fetchMotherboardOffers(component.socket, component.formFactor);
          } else {
            console.log(`   -> Tryb standardowy (brak parametrów socket/format)`);
            aiOffers = await fetchOffersFromAI(component.searchQuery || component.name);
          }

        } else if (component.type === 'RAM') {
          // --- 2. PAMIĘĆ RAM ---
          const capacityParam = component.capacity ? `${component.capacity}GB` : null;
          console.log(`   -> Tryb dedykowany dla RAM. Pojemność: ${capacityParam || 'MIX'}`);
          aiOffers = await fetchRamOffers(capacityParam);

        } else if (component.type === 'Disk') {
          // --- 3. DYSKI (NOWOŚĆ) ---
          // Pobieramy parametry: diskType (SSD/HDD), interface (M.2/SATA), capacity (np. 1000)
          // Uwaga: 'interface' jest słowem kluczowym w JS, więc bezpiecznie pobieramy je z obiektu
          const diskType = component.diskType;
          const interfaceType = component.interface;
          const capacity = component.capacity;
          
          console.log(`   -> Tryb dedykowany dla DYSKU: ${diskType || 'SSD'} / ${interfaceType || 'Any'} / ${capacity || 'Any'}GB`);
          
          // Wywołanie nowej funkcji
          aiOffers = await fetchDiskOffers(diskType, interfaceType, capacity);

        } else {
          // --- 4. FALLBACK (GPU, CPU, PSU, Case, Cooling...) ---
          // Używa standardowego zapytania na podstawie nazwy lub searchQuery
          aiOffers = await fetchOffersFromAI(component.searchQuery || component.name);
        }

        // ==================================================
        // ZAPISYWANIE OFERT DO BAZY
        // ==================================================

        let addedCount = 0;

        for (const offerData of aiOffers) {
          // Podstawowa walidacja
          if (!offerData.price || !offerData.url) continue;

          // Sprawdzenie duplikatów po URL
          const exists = await Offer.findOne({ url: offerData.url });
          if (exists) continue;

          // Tworzenie oferty
          await Offer.create({
            componentId: component._id,
            // Jeśli AI zwróciło "title" (np. dla RAMu, Dysku lub Mobo), użyj go.
            // W przeciwnym razie użyj nazwy komponentu z naszej bazy.
            title: offerData.title || component.name,
            price: offerData.price,
            url: offerData.url,
            platform: offerData.platform || "Web",
            // Zapisujemy specyfikację techniczną (np. prędkość dysku, CL ramu) w opisie
            description: offerData.specs || null, 
            externalId: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            isActive: true
          });
          addedCount++;
        }

        // ==================================================
        // AKTUALIZACJA STATYSTYK
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

    res.json({
      message: "Proces generowania ofert zakończony",
      details: results
    });

  } catch (err) {
    console.error("Critical Admin Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE 2: TWORZENIE SZABLONÓW PŁYT GŁÓWNYCH
// ==========================================
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